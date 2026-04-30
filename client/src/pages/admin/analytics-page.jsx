import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api.js';
import { formatMonthLabel } from '@/lib/format.js';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatCard } from '@/components/ui/stat-card.jsx';

export function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get('/admin/analytics/summary');
      setData(response.data.data);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin workspace" title="Analytics" description="Track hiring, leave patterns, delivery health, and the strongest performers." />

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Task completion rate" value={`${data.taskCompletionRate}%`} hint="Across the full task board" />
            <StatCard label="Top performer" value={data.topPerformers[0]?.name || '-'} hint={`${data.topPerformers[0]?.completed_tasks || 0} completed tasks`} />
            <StatCard label="Funnel stages" value={data.hiringFunnel.length} hint="Distinct application stages in use" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <SectionPanel title="Hiring funnel">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hiringFunnel}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#818cf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>

            <SectionPanel title="Monthly leave trend">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyLeaves.map((item) => ({ ...item, label: formatMonthLabel(item.month) }))}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionPanel title="Top performers">
              <div className="space-y-3">
                {data.topPerformers.map((performer) => (
                  <div key={performer.name} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">{performer.name}</p>
                      <p className="text-sm text-slate-300">{performer.completed_tasks} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionPanel>

            <SectionPanel title="Department productivity">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentProductivity}>
                    <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="productivity" fill="#34d399" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>
          </div>
        </>
      ) : null}
    </div>
  );
}
