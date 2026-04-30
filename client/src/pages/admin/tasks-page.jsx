import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { Field } from '@/components/ui/field.jsx';
import { Modal } from '@/components/ui/modal.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-indigo-400';
const statuses = ['todo', 'in-progress', 'completed', 'overdue'];

export function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee: '', priority: '', status: '' });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '', status: 'todo' });

  const fetchData = async () => {
    const [tasksResponse, employeesResponse] = await Promise.all([
      api.get('/admin/tasks', { params: filters }),
      api.get('/admin/employees'),
    ]);
    setTasks(tasksResponse.data.data);
    setEmployees(employeesResponse.data.data);
  };

  useEffect(() => {
    fetchData();
  }, [filters.employee, filters.priority, filters.status]);

  const grouped = useMemo(
    () => statuses.map((status) => ({ status, items: tasks.filter((task) => task.status === status) })),
    [tasks]
  );

  const createTask = async (event) => {
    event.preventDefault();
    await api.post('/admin/tasks', form);
    toast.success('Task created.');
    setOpen(false);
    setForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '', status: 'todo' });
    fetchData();
  };

  const moveTask = async (task, nextStatus) => {
    await api.put(`/admin/tasks/${task.id}`, { status: nextStatus });
    toast.success('Task updated.');
    fetchData();
  };

  const deleteTask = async (id) => {
    await api.delete(`/admin/tasks/${id}`);
    toast.success('Task deleted.');
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin workspace"
        title="Task management"
        description="Track tasks by stage, assign work to employees, and move cards across the board."
        actions={
          <button type="button" onClick={() => setOpen(true)} className="rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">
            <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" />Create task</span>
          </button>
        }
      />

      <SectionPanel
        title="Filters"
        actions={
          <>
            <select className={inputClass} value={filters.employee} onChange={(e) => setFilters((current) => ({ ...current, employee: e.target.value }))}>
              <option value="">All employees</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </select>
            <select className={inputClass} value={filters.priority} onChange={(e) => setFilters((current) => ({ ...current, priority: e.target.value }))}>
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <select className={inputClass} value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
              <option value="">All statuses</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </>
        }
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {grouped.map((column) => (
            <div key={column.status} className="space-y-3 rounded-[22px] border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">{column.status}</h2>
                <span className="text-xs text-slate-500">{column.items.length}</span>
              </div>
              {column.items.map((task) => (
                <div key={task.id} className="rounded-[18px] border border-white/8 bg-slate-950/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-white">{task.title}</p>
                    <StatusBadge value={task.priority} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{task.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {task.assigned_to_name || 'Unassigned'} • due {formatDate(task.due_date)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {statuses.filter((status) => status !== task.status).slice(0, 2).map((status) => (
                      <button key={status} type="button" onClick={() => moveTask(task, status)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white transition hover:bg-white/10">
                        Move to {status}
                      </button>
                    ))}
                    <button type="button" onClick={() => deleteTask(task.id)} className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-500/15">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </SectionPanel>

      <Modal open={open} onClose={() => setOpen(false)} title="Create task">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={createTask}>
          <div className="md:col-span-2">
            <Field label="Title"><input className={inputClass} value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Description"><textarea className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-400" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} /></Field>
          </div>
          <Field label="Assign to">
            <select className={inputClass} value={form.assigned_to} onChange={(e) => setForm((current) => ({ ...current, assigned_to: e.target.value }))}>
              <option value="">Select employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className={inputClass} value={form.priority} onChange={(e) => setForm((current) => ({ ...current, priority: e.target.value }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
          <Field label="Due date"><input className={inputClass} type="date" value={form.due_date} onChange={(e) => setForm((current) => ({ ...current, due_date: e.target.value }))} /></Field>
          <Field label="Initial status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-400">Create task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
