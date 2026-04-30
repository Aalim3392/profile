import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

export function AdminLeavesPage() {
  const [data, setData] = useState({ leaves: [], balances: [] });
  const [status, setStatus] = useState('');

  const fetchData = async () => {
    const response = await api.get('/admin/leaves', { params: { status } });
    setData(response.data.data);
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const updateStatus = async (id, nextStatus) => {
    await api.put(`/admin/leaves/${id}`, { status: nextStatus });
    toast.success(`Leave ${nextStatus}.`);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin workspace" title="Leave management" description="Review requests, approve or reject them, and keep an eye on employee balances." />

      <SectionPanel
        title="Requests"
        actions={
          <select className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      >
        {data.leaves.length ? (
          <div className="space-y-3">
            {data.leaves.map((leave) => (
              <div key={leave.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-white">{leave.name}</p>
                    <p className="text-sm text-slate-400">{leave.department}</p>
                    <p className="mt-3 text-sm text-slate-200">{leave.reason}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {leave.leave_type} • {formatDate(leave.from_date)} to {formatDate(leave.to_date)} • {leave.total_days} day(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={leave.status} />
                    {leave.status === 'pending' ? (
                      <>
                        <button type="button" onClick={() => updateStatus(leave.id, 'approved')} className="rounded-2xl bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/20">
                          Approve
                        </button>
                        <button type="button" onClick={() => updateStatus(leave.id, 'rejected')} className="rounded-2xl bg-rose-500/15 px-3 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20">
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No leave requests" description="New requests will appear here when employees submit them." />
        )}
      </SectionPanel>

      <SectionPanel title="Leave balances" description="Remaining allowance snapshot for each employee.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.balances.map((balance) => (
            <div key={balance.user_id} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
              <p className="font-medium text-white">{balance.name}</p>
              <p className="mt-3 text-sm text-slate-300">Sick: {balance.sick}/12</p>
              <p className="text-sm text-slate-300">Casual: {balance.casual}/12</p>
              <p className="text-sm text-slate-300">Earned: {balance.earned}/15</p>
            </div>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}
