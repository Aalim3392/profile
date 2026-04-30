import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { Field } from '@/components/ui/field.jsx';
import { Modal } from '@/components/ui/modal.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-indigo-400';

const baseForm = {
  title: '',
  department: '',
  description: '',
  requirements: '',
  location: '',
  type: 'full-time',
  status: 'open',
  closing_date: '',
};

export function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(baseForm);

  const fetchJobs = async () => {
    const response = await api.get('/admin/jobs');
    setJobs(response.data.data);
    if (!selectedJob && response.data.data.length) {
      setSelectedJob(response.data.data[0]);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!selectedJob) {
      return;
    }

    const fetchApplications = async () => {
      const response = await api.get(`/admin/jobs/${selectedJob.id}/applications`);
      setApplications(response.data.data);
    };

    fetchApplications();
  }, [selectedJob]);

  const submitJob = async (event) => {
    event.preventDefault();
    if (editing) {
      await api.put(`/admin/jobs/${editing.id}`, form);
      toast.success('Job updated.');
    } else {
      await api.post('/admin/jobs', form);
      toast.success('Job posted.');
    }
    setOpen(false);
    setEditing(null);
    setForm(baseForm);
    fetchJobs();
  };

  const updateApplicationStage = async (application, status) => {
    await api.put(`/admin/applications/${application.id}`, { status });
    toast.success('Applicant stage updated.');
    const response = await api.get(`/admin/jobs/${selectedJob.id}/applications`);
    setApplications(response.data.data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Job postings"
        description="Manage openings, inspect applicant pipelines, and keep hiring momentum visible."
        actions={
          <button type="button" onClick={() => setOpen(true)} className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
            Post new job
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <SectionPanel title="Openings">
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`rounded-[22px] border p-5 transition ${selectedJob?.id === job.id ? 'border-indigo-400/40 bg-indigo-500/10' : 'border-white/8 bg-white/5 hover:bg-white/8'}`}
              >
                <button type="button" onClick={() => setSelectedJob(job)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{job.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{job.department}</p>
                  </div>
                  <StatusBadge value={job.status} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{job.location} • {job.type}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{job.applicant_count} applicants • closes {formatDate(job.closing_date)}</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(job);
                    setForm(job);
                    setOpen(true);
                  }}
                  className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10"
                >
                  Edit job
                </button>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title={selectedJob ? `Applicants for ${selectedJob.title}` : 'Applicants'}>
          {selectedJob ? (
            applications.length ? (
              <div className="space-y-3">
                {applications.map((application) => (
                  <div key={application.id} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-white">{application.applicant_name}</p>
                        <p className="text-sm text-slate-400">{application.applicant_email}</p>
                        <p className="mt-2 text-sm text-slate-300">{application.cover_letter}</p>
                      </div>
                      <StatusBadge value={application.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'].map((stage) => (
                        <button key={stage} type="button" onClick={() => updateApplicationStage(application, stage)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No applicants yet" description="Applications will appear here as candidates apply for this opening." />
            )
          ) : (
            <EmptyState title="Pick a job" description="Select a role on the left to inspect its applicant pipeline." />
          )}
        </SectionPanel>
      </div>

      <Modal open={open} onClose={() => { setOpen(false); setEditing(null); setForm(baseForm); }} title={editing ? 'Edit job' : 'Post new job'}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submitJob}>
          {['title', 'department', 'location', 'closing_date'].map((key) => (
            <Field key={key} label={key.replace('_', ' ')}>
              <input className={inputClass} type={key === 'closing_date' ? 'date' : 'text'} value={form[key] || ''} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} />
            </Field>
          ))}
          <Field label="Type">
            <select className={inputClass} value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}>
              <option value="full-time">Full time</option>
              <option value="part-time">Part time</option>
              <option value="contract">Contract</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description"><textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Requirements"><textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400" value={form.requirements} onChange={(e) => setForm((current) => ({ ...current, requirements: e.target.value }))} /></Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">{editing ? 'Save job' : 'Publish job'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
