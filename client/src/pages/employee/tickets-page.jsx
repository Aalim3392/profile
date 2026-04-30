import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { Field } from '@/components/ui/field.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none';

export function EmployeeTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: '', category: 'general', description: '', priority: 'medium' });

  const fetchTickets = async () => {
    const response = await api.get('/employee/tickets');
    setTickets(response.data.data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/employee/tickets', form);
    toast.success('Ticket created.');
    setForm({ subject: '', category: 'general', description: '', priority: 'medium' });
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employee workspace" title="Support tickets" description="Raise questions for HR, payroll, IT, or general support and track their status." />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionPanel title="Create ticket">
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Subject"><input className={inputClass} value={form.subject} onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))} /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Category">
                <select className={inputClass} value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}>
                  <option value="general">General</option>
                  <option value="hr-policy">HR policy</option>
                  <option value="payroll">Payroll</option>
                  <option value="it">IT</option>
                </select>
              </Field>
              <Field label="Priority">
                <select className={inputClass} value={form.priority} onChange={(e) => setForm((current) => ({ ...current, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
            </Field>
            <button type="submit" className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">Raise ticket</button>
          </form>
        </SectionPanel>

        <SectionPanel title="My ticket history">
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{ticket.subject}</p>
                    <p className="text-sm text-slate-400">{ticket.category}</p>
                  </div>
                  <StatusBadge value={ticket.status} />
                </div>
                <p className="mt-3 text-sm text-slate-300">{ticket.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">{formatDate(ticket.created_at, 'dd MMM yyyy, hh:mm a')}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
