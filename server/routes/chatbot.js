import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import {
  getAttendanceSummaryForUser,
  getChatHistory,
  getLeaveBalanceSummary,
  storeChatMessage,
} from '../db/queries.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const proxyFaqPath = path.join(__dirname, '../data/hr-faq-proxy.json');
const proxyFaq = JSON.parse(fs.readFileSync(proxyFaqPath, 'utf-8'));

const baseSystemPrompt = `You are an intelligent HR Assistant for HRMS Pro, a modern employee management platform.
You help employees and HR admins with:
- HR policy questions (leave policy, attendance rules, work hours)
- Leave balance queries (fetch from DB and include in context)
- Interview preparation guidance (tips, common questions by role)
- Onboarding assistance for new employees
- Support ticket creation guidance
- Payroll and salary FAQs
- General workplace queries
Always be professional, warm, concise, and helpful.
If you don't know something, ask the user to raise a support ticket.
Format responses using clean markdown with bullet points where helpful.`;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scorePattern(pattern, normalizedMessage, tokenSet) {
  const normalizedPattern = normalize(pattern);
  let score = 0;

  if (normalizedMessage.includes(normalizedPattern)) {
    score += normalizedPattern.split(' ').length + 3;
  }

  normalizedPattern.split(' ').forEach((token) => {
    if (token.length > 2 && tokenSet.has(token)) {
      score += 1;
    }
  });

  return score;
}

function buildDynamicAnswer(id, user, leaveBalance, attendanceSummary) {
  if (id === 'leave_balance') {
    return [
      `Here is your current leave balance, ${user.name.split(' ')[0]}:`,
      `- Sick leave: ${leaveBalance.sick}`,
      `- Casual leave: ${leaveBalance.casual}`,
      `- Earned leave: ${leaveBalance.earned}`,
      `- Unpaid leave used: ${leaveBalance.unpaid_used}`,
      '',
      'You can apply for leave from the Leave Management page.'
    ].join('\n');
  }

  if (id === 'attendance_hours') {
    return [
      `Here is your attendance summary, ${user.name.split(' ')[0]}:`,
      `- Present days: ${attendanceSummary.present_days}`,
      `- Absent days: ${attendanceSummary.absent_days}`,
      `- Leave days: ${attendanceSummary.leave_days}`,
      `- Half days: ${attendanceSummary.half_days}`,
      `- Average hours worked: ${attendanceSummary.average_hours}`
    ].join('\n');
  }

  return null;
}

function getProxyReply(message, user, leaveBalance, attendanceSummary) {
  const normalizedMessage = normalize(message);
  const tokens = normalizedMessage.split(' ').filter((token) => token.length > 2);
  const tokenSet = new Set(tokens);

  let bestEntry = null;
  let bestScore = 0;

  for (const entry of proxyFaq) {
    let score = 0;
    for (const pattern of entry.patterns) {
      score = Math.max(score, scorePattern(pattern, normalizedMessage, tokenSet));
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (!bestEntry || bestScore < 3) {
    return null;
  }

  return buildDynamicAnswer(bestEntry.id, user, leaveBalance, attendanceSummary) || bestEntry.answer;
}

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

async function generateWithFallback(systemInstruction, contents) {
  const client = getGeminiClient();
  if (!client) {
    const error = new Error('GEMINI_API_KEY is missing. Add it to server/.env before using the chatbot.');
    error.status = 503;
    throw error;
  }

  const models = ['gemini-2.5-flash-preview-04-17', 'gemini-2.0-flash'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemInstruction }],
        },
      });
      const result = await model.generateContent({ contents });
      const text = result.response.text();
      if (text) {
        return text;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to generate chatbot response.');
}

router.use(verifyToken);

router.post('/message', async (req, res, next) => {
  try {
    const { message, session_id: sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ success: false, message: 'message and session_id are required.' });
    }

    const leaveBalance = getLeaveBalanceSummary(req.user.id);
    const attendanceSummary = getAttendanceSummaryForUser(req.user.id);
    const history = getChatHistory(sessionId, req.user.id, 20);

    const contextPrompt = `
Current user:
- Name: ${req.user.name}
- Role: ${req.user.role}
- Department: ${req.user.department || 'Not set'}
- Position: ${req.user.position || 'Not set'}

Leave balance:
- Sick: ${leaveBalance.sick}
- Casual: ${leaveBalance.casual}
- Earned: ${leaveBalance.earned}
- Unpaid used: ${leaveBalance.unpaid_used}

Attendance summary:
- Present days: ${attendanceSummary.present_days}
- Absent days: ${attendanceSummary.absent_days}
- Leave days: ${attendanceSummary.leave_days}
- Half days: ${attendanceSummary.half_days}
- Average hours worked: ${attendanceSummary.average_hours}
`.trim();

    const contents = [
      ...history.map((entry) => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    storeChatMessage({ userId: req.user.id, role: 'user', content: message, sessionId });

    const proxyReply = getProxyReply(message, req.user, leaveBalance, attendanceSummary);
    let reply = proxyReply;

    if (!reply) {
      try {
        reply = await generateWithFallback(`${baseSystemPrompt}\n\n${contextPrompt}`, contents);
      } catch (_error) {
        reply = 'I could not find a confident answer from the local HR knowledge base, and the AI service is unavailable right now. Please raise a support ticket if this needs an official response.';
      }
    }

    const storedReply = storeChatMessage({ userId: req.user.id, role: 'assistant', content: reply, sessionId });

    return res.json({
      success: true,
      data: {
        message: storedReply,
        leave_balance: leaveBalance,
        attendance_summary: attendanceSummary,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/history/:sessionId', (req, res) => {
  res.json({ success: true, data: getChatHistory(req.params.sessionId, req.user.id, 20) });
});

export default router;
