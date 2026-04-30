import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BriefcaseBusiness, CalendarClock, CheckCircle2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api.js';
import { formatDate, formatMonthLabel } from '@/lib/format.js';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { StatCard } from '@/components/ui/stat-card.jsx';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

export function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get('/admin/dashboard');
      setData(response.data.data);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin overview"
        title="Dashboard"
        description="A live snapshot of your team, hiring pipeline, work queue, and upcoming interviews."
        actions={
          <>
            <Link className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10" to="/admin/employees">
              Add employee
            </Link>
            <Link className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400" to="/admin/jobs">
              Post job
            </Link>
          </>
        }
      />

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Total employees" value={data.kpis.totalEmployees} hint="Active employee records" />
            <StatCard icon={BriefcaseBusiness} label="Open positions" value={data.kpis.openPositions} hint="Jobs actively hiring" />
            <StatCard icon={CalendarClock} label="Pending leaves" value={data.kpis.pendingLeaves} hint="Requests needing approval" />
            <StatCard icon={CheckCircle2} label="Tasks due today" value={data.kpis.tasksDueToday} hint="Still open in the queue" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
            <SectionPanel title="Headcount trend" description="Employee growth across the last six months.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.headcountTrend.map((item) => ({ ...item, label: formatMonthLabel(item.month) }))}>
                    <defs>
                      <linearGradient id="headcountFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#818cf8" fill="url(#headcountFill)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>

            <SectionPanel title="Leave distribution" description="Approved and pending leave mix by type.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.leaveDistribution}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={88}
                      innerRadius={50}
                      paddingAngle={4}
                      fill="#60a5fa"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
            <SectionPanel title="Department attendance" description="Attendance rate across the current week.">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentAttendance}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="department" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="attendance_rate" fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>

            <SectionPanel title="Upcoming interviews" description="Next five interviews in the hiring pipeline.">
              <div className="space-y-3">
                {data.upcomingInterviews.length ? (
                  data.upcomingInterviews.map((item) => (
                    <div key={item.id} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{item.candidate_name}</p>
                          <p className="text-sm text-slate-400">{item.job_title}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{formatDate(item.scheduled_at, 'dd MMM yyyy, hh:mm a')}</p>
                        </div>
                        <StatusBadge value={item.status} />
                      </div>
                      <p className="mt-3 text-sm text-slate-400">Interviewer: {item.interviewer_name || 'TBD'}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState title="No interviews lined up" description="Schedule interviews from the hiring section to see them here." />
                )}
              </div>
            </SectionPanel>
          </div>

          <SectionPanel title="Recent activity" description="Latest workflow changes across leave requests, tasks, and support tickets.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.recentActivity.map((activity, index) => (
                <div key={`${activity.type}-${index}`} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{activity.type}</p>
                  <p className="mt-2 font-medium text-white">{activity.actor}</p>
                  <p className="mt-2 text-sm text-slate-300">{activity.title}</p>
                  <p className="mt-3 text-xs text-slate-500">{formatDate(activity.created_at, 'dd MMM yyyy, hh:mm a')}</p>
                </div>
              ))}
            </div>
          </SectionPanel>
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
