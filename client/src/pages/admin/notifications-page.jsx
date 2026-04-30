import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

export function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const response = await api.get('/notifications');
    setNotifications(response.data.data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    toast.success('Notification marked as read.');
    fetchNotifications();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin workspace" title="Notifications" description="A live feed of reminders, hiring updates, and employee activity that needs attention." />

      <SectionPanel title="Latest notifications">
        {notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-white">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{notification.message}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(notification.created_at, 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={notification.type} />
                    {!notification.is_read ? (
                      <button type="button" onClick={() => markRead(notification.id)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No notifications" description="New alerts will land here as activity happens across the system." />
        )}
      </SectionPanel>
    </div>
  );
}
