import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Plus, Search, SquarePen, Trash2 } from 'lucide-react';
import { api } from '@/lib/api.js';
import { getInitials } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { Field } from '@/components/ui/field.jsx';
import { Modal } from '@/components/ui/modal.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-indigo-400';
const textareaClass = 'min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  joining_date: '',
  status: 'active',
  employee_code: '',
  salary: '',
  location: '',
  skills: '',
  bio: '',
  password: 'Employee@123',
};

export function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ search: '', department: '', status: '' });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchEmployees = async () => {
    const response = await api.get('/admin/employees', { params: filters });
    setEmployees(response.data.data);
  };

  useEffect(() => {
    fetchEmployees();
  }, [filters.search, filters.department, filters.status]);

  const departments = useMemo(() => [...new Set(employees.map((employee) => employee.department).filter(Boolean))], [employees]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (employee) => {
    setEditing(employee);
    setForm({
      ...initialForm,
      ...employee,
      skills: (employee.skills || []).join(', '),
      salary: employee.salary || '',
      password: '',
    });
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      salary: Number(form.salary || 0),
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    };

    if (editing) {
      await api.put(`/admin/employees/${editing.id}`, payload);
      toast.success('Employee updated.');
    } else {
      await api.post('/admin/employees', payload);
      toast.success('Employee created.');
    }

    setOpen(false);
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee record?')) {
      return;
    }

    await api.delete(`/admin/employees/${id}`);
    toast.success('Employee deleted.');
    fetchEmployees();
  };

  const exportCsv = () => {
    const rows = [['Name', 'Email', 'Department', 'Position', 'Status', 'Employee Code', 'Salary']];
    employees.forEach((employee) => {
      rows.push([employee.name, employee.email, employee.department, employee.position, employee.status, employee.employee_code, employee.salary]);
    });
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Employee management"
        description="Search, edit, export, and maintain the core employee directory."
        actions={
          <>
            <button type="button" onClick={exportCsv} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
              <span className="inline-flex items-center gap-2"><Download className="h-4 w-4" />Export CSV</span>
            </button>
            <button type="button" onClick={openCreate} className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
              <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Add employee</span>
            </button>
          </>
        }
      />

      <SectionPanel
        title="Directory"
        actions={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input className={`${inputClass} pl-10`} placeholder="Search employee" value={filters.search} onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))} />
            </div>
            <select className={inputClass} value={filters.department} onChange={(e) => setFilters((current) => ({ ...current, department: e.target.value }))}>
              <option value="">All departments</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
            <select className={inputClass} value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </>
        }
      >
        {employees.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3 font-medium">Employee</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 font-semibold text-indigo-100">
                          {getInitials(employee.name)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{employee.name}</p>
                          <p className="text-slate-400">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">{employee.position}</td>
                    <td className="py-4 text-slate-300">{employee.department}</td>
                    <td className="py-4"><StatusBadge value={employee.status} /></td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEdit(employee)} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 transition hover:bg-white/10">
                          <SquarePen className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(employee.id)} className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-2 text-rose-100 transition hover:bg-rose-500/15">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No employees found" description="Try a different filter or add the first employee record." />
        )}
      </SectionPanel>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit employee' : 'Add employee'}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {[
            ['name', 'Name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['department', 'Department'],
            ['position', 'Position'],
            ['joining_date', 'Joining date'],
            ['employee_code', 'Employee code'],
            ['salary', 'Salary'],
            ['location', 'Location'],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                className={inputClass}
                type={key.includes('date') ? 'date' : key === 'salary' ? 'number' : 'text'}
                value={form[key]}
                onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
              />
            </Field>
          ))}
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          {!editing ? (
            <Field label="Temporary password">
              <input className={inputClass} value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
            </Field>
          ) : null}
          <div className="md:col-span-2">
            <Field label="Skills">
              <input className={inputClass} value={form.skills} onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value }))} placeholder="React, SQL, Payroll" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Bio">
              <textarea className={textareaClass} value={form.bio} onChange={(e) => setForm((current) => ({ ...current, bio: e.target.value }))} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
              {editing ? 'Save changes' : 'Create employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
