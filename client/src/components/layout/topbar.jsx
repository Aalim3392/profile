import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, LogOut, Menu, MoonStar, ShieldCheck, SunMedium } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { getNotificationTarget } from '@/lib/notifications.js';
import { useAuthStore } from '@/stores/auth-store.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';

export function Topbar({ onToggleSidebar, theme, onToggleTheme }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) {
      return;
    }

    setLoadingNotifications(true);
    try {
      const response = await api.get('/notifications');
      const items = response.data.data;
      setNotifications(items);
      setUnreadCount(items.filter((item) => !item.is_read).length);
    } catch (_error) {
      setUnreadCount(0);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    fetchNotifications();
    const timer = window.setInterval(fetchNotifications, 30000);
    return () => window.clearInterval(timer);
  }, [user?.role]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const latestNotifications = useMemo(() => notifications.slice(0, 10), [notifications]);

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (_error) {
      toast.error('Unable to mark that notification as read.');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (_error) {
      toast.error('Unable to mark notifications as read.');
    }
  };

  return (
    <header className="glass-panel relative z-30 flex items-center justify-between rounded-[28px] border border-white/10 px-5 py-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Secure workspace</p>
          <h2 className="text-lg font-semibold text-white">Welcome back, {user?.name?.split(' ')[0]}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-100 md:flex">
          <ShieldCheck className="h-4 w-4" />
          {user?.role === 'admin' ? 'Admin access' : 'Employee access'}
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
        >
          {theme === 'light' ? <MoonStar className="h-5 w-5" /> : <SunMedium className="h-5 w-5" />}
        </button>

        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
            {unreadCount ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            ) : null}
          </button>

          {open ? (
            <div className="absolute right-0 top-14 z-50 w-[340px] rounded-[24px] border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Notifications</p>
                  <p className="text-xs text-slate-400">{unreadCount} unread</p>
                </div>
                <button type="button" onClick={markAllRead} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10">
                  Mark all read
                </button>
              </div>
              <div className="space-y-3">
                {loadingNotifications ? <p className="py-6 text-center text-sm text-slate-400">Loading notifications...</p> : null}

                {!loadingNotifications && !latestNotifications.length ? (
                  <EmptyState title="No notifications yet" description="New leave updates, task assignments, and ticket changes will appear here." />
                ) : null}

                {!loadingNotifications
                  ? latestNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={async () => {
                          if (!notification.is_read) {
                            await markRead(notification.id);
                          }
                          navigate(getNotificationTarget(notification, user?.role));
                          setOpen(false);
                        }}
                        className="block w-full rounded-[18px] border border-white/8 bg-white/5 p-3 text-left transition hover:bg-white/10"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-400">{notification.message}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                              {formatDate(notification.created_at, 'dd MMM, hh:mm a')}
                            </p>
                          </div>
                          {!notification.is_read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-400" /> : null}
                        </div>
                      </button>
                    ))
                  : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 font-semibold text-white">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-rose-500/15 hover:text-rose-100"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
