import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

export function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    const response = await api.get('/admin/tickets');
    setTickets(response.data.data);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (ticket, status) => {
    await api.put(`/admin/tickets/${ticket.id}`, { status });
    toast.success('Ticket updated.');
    fetchTickets();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin workspace" title="Support tickets" description="Review employee requests, move them forward, and resolve blockers quickly." />

      <SectionPanel title="Ticket queue">
        {tickets.length ? (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-white">{ticket.subject}</p>
                    <p className="text-sm text-slate-400">{ticket.name} • {ticket.category}</p>
                    <p className="mt-2 text-sm text-slate-300">{ticket.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Created {formatDate(ticket.created_at, 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge value={ticket.status} />
                      <StatusBadge value={ticket.priority} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['open', 'in-progress', 'resolved', 'closed'].map((status) => (
                        <button key={status} type="button" onClick={() => updateStatus(ticket, status)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No support tickets" description="The queue is clear for now." />
        )}
      </SectionPanel>
    </div>
  );
}
