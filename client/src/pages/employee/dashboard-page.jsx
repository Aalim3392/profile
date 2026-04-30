import { useEffect, useState } from 'react';
import { CalendarDays, ClipboardList, Ticket, TimerReset } from 'lucide-react';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { StatCard } from '@/components/ui/stat-card.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';
import { useAuthStore } from '@/stores/auth-store.js';

export function EmployeeDashboardPage() {
  const [data, setData] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get('/employee/dashboard');
      setData(response.data.data);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee workspace"
        title={`Good morning, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Your tasks, attendance, leave balance, and support updates all live here."
      />

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={ClipboardList} label="Tasks due" value={data.stats.tasksDue} />
            <StatCard
              icon={CalendarDays}
              label="Leave balance"
              value={`${data.stats.leaveBalance.sick + data.stats.leaveBalance.casual + data.stats.leaveBalance.earned} days`}
              hint="Sick, casual, and earned combined"
            />
            <StatCard icon={TimerReset} label="Attendance" value={`${data.stats.attendancePercentage}%`} />
            <StatCard icon={Ticket} label="Open tickets" value={data.stats.openTickets} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionPanel title="My tasks" description="Upcoming deadlines and active work.">
              {data.tasks.length ? (
                <div className="space-y-3">
                  {data.tasks.map((task) => (
                    <div key={task.id} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{task.title}</p>
                          <p className="mt-2 text-sm text-slate-300">{task.description}</p>
                        </div>
                        <StatusBadge value={task.status} />
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Due {formatDate(task.due_date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No tasks assigned" description="Your task list is clear right now." />
              )}
            </SectionPanel>

            <div className="space-y-4">
              <SectionPanel title="This week's attendance">
                <div className="grid grid-cols-2 gap-3">
                  {data.attendanceWeek.map((item) => (
                    <div key={item.date} className="rounded-[18px] border border-white/8 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(item.date, 'dd MMM')}</p>
                      <div className="mt-3"><StatusBadge value={item.status} /></div>
                    </div>
                  ))}
                </div>
              </SectionPanel>

              <SectionPanel title="Recent notifications">
                {data.notifications.length ? (
                  <div className="space-y-3">
                    {data.notifications.map((notification) => (
                      <div key={notification.id} className="rounded-[18px] border border-white/8 bg-white/5 p-4">
                        <p className="font-medium text-white">{notification.title}</p>
                        <p className="mt-2 text-sm text-slate-300">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No notifications" description="Your latest updates will show up here." />
                )}
              </SectionPanel>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </>
      )}
    </div>
  );
}
