import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { Field } from '@/components/ui/field.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none';

export function EmployeeLeavesPage() {
  const [data, setData] = useState({ balances: {}, leaves: [] });
  const [form, setForm] = useState({ leave_type: 'sick', from_date: '', to_date: '', reason: '' });

  const fetchData = async () => {
    const response = await api.get('/employee/leaves');
    setData(response.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/employee/leaves', form);
    toast.success('Leave request submitted.');
    setForm({ leave_type: 'sick', from_date: '', to_date: '', reason: '' });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employee workspace" title="Leave management" description="Check your balances, apply for time off, and track request history." />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionPanel title="Sick leave"><p className="text-3xl font-semibold text-white">{data.balances.sick ?? 0}<span className="ml-2 text-sm text-slate-400">/ 12</span></p></SectionPanel>
        <SectionPanel title="Casual leave"><p className="text-3xl font-semibold text-white">{data.balances.casual ?? 0}<span className="ml-2 text-sm text-slate-400">/ 12</span></p></SectionPanel>
        <SectionPanel title="Earned leave"><p className="text-3xl font-semibold text-white">{data.balances.earned ?? 0}<span className="ml-2 text-sm text-slate-400">/ 15</span></p></SectionPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionPanel title="Apply for leave">
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Leave type">
              <select className={inputClass} value={form.leave_type} onChange={(e) => setForm((current) => ({ ...current, leave_type: e.target.value }))}>
                <option value="sick">Sick</option>
                <option value="casual">Casual</option>
                <option value="earned">Earned</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="From date"><input className={inputClass} type="date" value={form.from_date} onChange={(e) => setForm((current) => ({ ...current, from_date: e.target.value }))} /></Field>
              <Field label="To date"><input className={inputClass} type="date" value={form.to_date} onChange={(e) => setForm((current) => ({ ...current, to_date: e.target.value }))} /></Field>
            </div>
            <Field label="Reason">
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" value={form.reason} onChange={(e) => setForm((current) => ({ ...current, reason: e.target.value }))} />
            </Field>
            <button type="submit" className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">Submit request</button>
          </form>
        </SectionPanel>

        <SectionPanel title="Leave history">
          <div className="space-y-3">
            {data.leaves.map((leave) => (
              <div key={leave.id} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{leave.leave_type}</p>
                    <p className="text-sm text-slate-400">{formatDate(leave.from_date)} to {formatDate(leave.to_date)}</p>
                  </div>
                  <StatusBadge value={leave.status} />
                </div>
                <p className="mt-3 text-sm text-slate-300">{leave.reason}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
