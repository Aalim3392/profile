import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { Bot, LoaderCircle, MessageSquarePlus, Minimize2, Send, Sparkles, Trash2 } from 'lucide-react';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { useAuthStore } from '@/stores/auth-store.js';

const suggestions = [
  "What's my leave balance?",
  'Prepare me for interview',
  'Explain attendance policy',
  'How to raise a support ticket?',
];

function getSessionKey(userId) {
  return `hrms-pro-chat-session-${userId}`;
}

function createSessionId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

export function ChatWidget() {
  const user = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user?.id) {
      setSessionId(null);
      return;
    }

    const key = getSessionKey(user.id);
    const existing = localStorage.getItem(key);
    if (existing) {
      setSessionId(existing);
      return;
    }

    const next = createSessionId();
    localStorage.setItem(key, next);
    setSessionId(next);
  }, [user?.id]);

  useEffect(() => {
    if (!open || !sessionId) {
      return;
    }

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const response = await api.get(`/chatbot/history/${sessionId}`);
        setMessages(response.data.data);
      } catch (_error) {
        toast.error('Unable to load chat history.');
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [open, sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, pending]);

  useEffect(() => {
    const handler = (event) => {
      const prompt = event.detail?.prompt;
      if (!prompt) {
        return;
      }

      setOpen(true);
      setInput(prompt);
    };

    window.addEventListener('hrms-chat-prefill', handler);
    return () => window.removeEventListener('hrms-chat-prefill', handler);
  }, []);

  const sendMessage = async (text) => {
    const message = text.trim();
    if (!message || !sessionId) {
      return;
    }

    setPending(true);
    setInput('');
    const optimistic = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, optimistic]);

    try {
      const response = await api.post('/chatbot/message', {
        message,
        session_id: sessionId,
        user_id: user.id,
      });

      const assistantMessage = response.data.data.message;
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      setMessages((current) => current.filter((item) => item.id !== optimistic.id));
      toast.error(error.response?.data?.message || 'Chatbot is unavailable right now.');
    } finally {
      setPending(false);
    }
  };

  const clearChat = () => {
    if (!user?.id) {
      return;
    }

    const nextSession = createSessionId();
    localStorage.setItem(getSessionKey(user.id), nextSession);
    setSessionId(nextSession);
    setMessages([]);
    setInput('');
    toast.success('Started a fresh chat session.');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-40 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-500 text-white shadow-[0_18px_45px_rgba(79,70,229,0.38)] transition hover:scale-105"
      >
        <Bot className="h-7 w-7" />
        {pending ? <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-amber-300" /> : null}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-6 z-40 flex h-[520px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/60 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-violet-500/20 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-white">HRMS AI Assistant</p>
                <p className="text-xs text-slate-300">HR guidance, leave help, and interview prep</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={clearChat} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
                <Trash2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {!messages.length && !loadingHistory ? (
              <div className="space-y-4">
                <div className="rounded-[22px] border border-white/8 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  Ask about leave balance, attendance rules, onboarding, interview prep, or support ticket guidance.
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendMessage(suggestion)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {loadingHistory ? (
              <div className="flex justify-center py-10 text-slate-400">
                <LoaderCircle className="h-5 w-5 animate-spin" />
              </div>
            ) : null}

            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`} title={formatDate(message.created_at, 'dd MMM yyyy, hh:mm a')}>
                {message.role === 'assistant' ? (
                  <div className="max-w-[85%] rounded-[22px] border border-white/8 bg-slate-800/80 px-4 py-3 text-sm text-slate-100">
                    <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/25 text-[10px] font-semibold text-indigo-100">AI</span>
                      Assistant
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-strong:text-white">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-[22px] bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm text-white shadow-lg shadow-indigo-950/25">
                    {message.content}
                  </div>
                )}
              </div>
            ))}

            {pending ? (
              <div className="flex justify-start">
                <div className="rounded-[22px] border border-white/8 bg-slate-800/80 px-4 py-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-white/10 px-4 py-4"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <div className="flex items-end gap-2">
              <div className="flex-1 rounded-[22px] border border-white/10 bg-white/5 px-3 py-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  placeholder="Ask the HR assistant..."
                  className="max-h-28 min-h-[36px] w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <button type="submit" disabled={pending} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:opacity-60">
                {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <button type="button" onClick={() => sendMessage(suggestions[0])} className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400 transition hover:text-slate-200">
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Quick start with leave balance
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
