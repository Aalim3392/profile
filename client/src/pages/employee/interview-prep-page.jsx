import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

export function EmployeeInterviewPrepPage() {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get('/employee/interview-prep');
      setInterviews(response.data.data);
    };

    fetchData();
  }, []);

  const handlePrepare = (interview) => {
    const prompt = `Help me prepare for a ${interview.job_title} interview scheduled on ${formatDate(interview.scheduled_at, 'dd MMM yyyy, hh:mm a')}. Give me common questions and tips.`;
    window.dispatchEvent(new CustomEvent('hrms-chat-prefill', { detail: { prompt } }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee workspace"
        title="Interview prep"
        description="Prepare for upcoming interviews assigned to you and jump directly into AI coaching."
      />

      <SectionPanel title="Upcoming interviews">
        {interviews.length ? (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div key={interview.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-white">{interview.job_title}</p>
                    <p className="text-sm text-slate-400">{interview.department || 'Department not set'}</p>
                    <p className="mt-2 text-sm text-slate-300">{formatDate(interview.scheduled_at, 'dd MMM yyyy, hh:mm a')} • {interview.mode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={interview.status} />
                    <button
                      type="button"
                      onClick={() => handlePrepare(interview)}
                      className="rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
                    >
                      <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" />Prepare with AI</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No upcoming interviews" description="When interviews are assigned to you, they will show up here with a direct AI prep shortcut." />
        )}
      </SectionPanel>
    </div>
  );
}
