import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { getInitials } from '@/lib/format.js';
import { Field } from '@/components/ui/field.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none';

export function EmployeeProfilePage() {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await api.get('/employee/profile');
      const profile = response.data.data;
      setForm({ ...profile, skills: (profile.skills || []).join(', '), new_password: '' });
    };

    fetchProfile();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    };
    await api.put('/employee/profile', payload);
    toast.success('Profile updated.');
  };

  if (!form) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employee workspace" title="My profile" description="Keep your contact details, bio, and skills current for the rest of the team." />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionPanel title="Profile card">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-indigo-500/15 text-xl font-semibold text-indigo-100">
              {getInitials(form.name)}
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{form.name}</p>
              <p className="text-sm text-slate-400">{form.position}</p>
              <p className="text-sm text-slate-400">{form.department}</p>
            </div>
          </div>
        </SectionPanel>

        <SectionPanel title="Edit details">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <Field label="Phone"><input className={inputClass} value={form.phone || ''} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} /></Field>
            <Field label="Location"><input className={inputClass} value={form.location || ''} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} /></Field>
            <div className="md:col-span-2">
              <Field label="Skills"><input className={inputClass} value={form.skills} onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value }))} /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Bio"><textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none" value={form.bio || ''} onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))} /></Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Change password"><input className={inputClass} type="password" value={form.new_password} onChange={(e) => setForm((current) => ({ ...current, new_password: e.target.value }))} /></Field>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">Save profile</button>
            </div>
          </form>
        </SectionPanel>
      </div>
    </div>
  );
}
