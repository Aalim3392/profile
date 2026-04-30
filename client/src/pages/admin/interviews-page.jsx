import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { Field } from '@/components/ui/field.jsx';
import { Modal } from '@/components/ui/modal.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-indigo-400';

const blankForm = {
  application_id: '',
  job_id: '',
  candidate_name: '',
  candidate_email: '',
  interviewer_id: '',
  scheduled_at: '',
  duration_minutes: 60,
  mode: 'video',
  status: 'scheduled',
  feedback: '',
  rating: '',
  notes: '',
};

export function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);

  const fetchData = async () => {
    const [interviewsResponse, jobsResponse, employeesResponse] = await Promise.all([
      api.get('/admin/interviews'),
      api.get('/admin/jobs'),
      api.get('/admin/employees'),
    ]);
    setInterviews(interviewsResponse.data.data);
    setJobs(jobsResponse.data.data);
    setEmployees(employeesResponse.data.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitInterview = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      duration_minutes: Number(form.duration_minutes || 60),
      rating: form.rating ? Number(form.rating) : null,
    };

    if (editing) {
      await api.put(`/admin/interviews/${editing.id}`, payload);
      toast.success('Interview updated.');
    } else {
      await api.post('/admin/interviews', payload);
      toast.success('Interview scheduled.');
    }

    setOpen(false);
    setEditing(null);
    setForm(blankForm);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Interview scheduler"
        description="Schedule conversations, capture feedback, and track hiring progress by candidate."
        actions={
          <button type="button" onClick={() => setOpen(true)} className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
            Schedule interview
          </button>
        }
      />

      <SectionPanel title="Scheduled interviews">
        <div className="space-y-3">
          {interviews.map((interview) => (
            <div key={interview.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-medium text-white">{interview.candidate_name}</p>
                  <p className="text-sm text-slate-400">{interview.job_title}</p>
                  <p className="mt-2 text-sm text-slate-300">{formatDate(interview.scheduled_at, 'dd MMM yyyy, hh:mm a')} • {interview.mode}</p>
                  <p className="mt-1 text-sm text-slate-400">Interviewer: {interview.interviewer_name || 'TBD'}</p>
                  {interview.feedback ? <p className="mt-2 text-sm text-slate-300">Feedback: {interview.feedback}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={interview.status} />
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(interview);
                      setForm({ ...blankForm, ...interview, scheduled_at: interview.scheduled_at.slice(0, 16), rating: interview.rating || '' });
                      setOpen(true);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionPanel>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); setForm(blankForm); }} title={editing ? 'Update interview' : 'Schedule interview'} width="max-w-3xl">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitInterview}>
          <Field label="Candidate name"><input className={inputClass} value={form.candidate_name} onChange={(e) => setForm((current) => ({ ...current, candidate_name: e.target.value }))} /></Field>
          <Field label="Candidate email"><input className={inputClass} value={form.candidate_email} onChange={(e) => setForm((current) => ({ ...current, candidate_email: e.target.value }))} /></Field>
          <Field label="Job">
            <select className={inputClass} value={form.job_id} onChange={(e) => setForm((current) => ({ ...current, job_id: e.target.value }))}>
              <option value="">Select job</option>
              {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
            </select>
          </Field>
          <Field label="Interviewer">
            <select className={inputClass} value={form.interviewer_id} onChange={(e) => setForm((current) => ({ ...current, interviewer_id: e.target.value }))}>
              <option value="">Select interviewer</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </select>
          </Field>
          <Field label="Scheduled at"><input className={inputClass} type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm((current) => ({ ...current, scheduled_at: e.target.value }))} /></Field>
          <Field label="Duration (minutes)"><input className={inputClass} type="number" value={form.duration_minutes} onChange={(e) => setForm((current) => ({ ...current, duration_minutes: e.target.value }))} /></Field>
          <Field label="Mode">
            <select className={inputClass} value={form.mode} onChange={(e) => setForm((current) => ({ ...current, mode: e.target.value }))}>
              <option value="video">Video</option>
              <option value="in-person">In person</option>
              <option value="phone">Phone</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Feedback"><textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400" value={form.feedback} onChange={(e) => setForm((current) => ({ ...current, feedback: e.target.value }))} /></Field>
          </div>
          <Field label="Rating"><input className={inputClass} type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm((current) => ({ ...current, rating: e.target.value }))} /></Field>
          <div className="md:col-span-2">
            <Field label="Notes"><textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} /></Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">{editing ? 'Save interview' : 'Schedule interview'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
