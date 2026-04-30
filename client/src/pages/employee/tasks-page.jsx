import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';
import { formatDate } from '@/lib/format.js';
import { EmptyState } from '@/components/ui/empty-state.jsx';
import { Modal } from '@/components/ui/modal.jsx';
import { PageHeader } from '@/components/ui/page-header.jsx';
import { SectionPanel } from '@/components/ui/section-panel.jsx';
import { StatusBadge } from '@/components/ui/status-badge.jsx';

const inputClass = 'h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none';

export function EmployeeTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    const response = await api.get('/employee/tasks', { params: filters });
    setTasks(response.data.data);
  };

  useEffect(() => {
    fetchTasks();
  }, [filters.status, filters.priority]);

  const updateStatus = async (task, status) => {
    await api.put(`/employee/tasks/${task.id}`, { status });
    toast.success('Task updated.');
    fetchTasks();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employee workspace" title="My tasks" description="Track your priorities, update progress, and inspect details without losing context." />

      <SectionPanel
        title="Assigned tasks"
        actions={
          <>
            <select className={inputClass} value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}>
              <option value="">All statuses</option>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
            <select className={inputClass} value={filters.priority} onChange={(e) => setFilters((current) => ({ ...current, priority: e.target.value }))}>
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </>
        }
      >
        {tasks.length ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium text-white">{task.title}</p>
                    <p className="mt-2 text-sm text-slate-300">{task.description}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Due {formatDate(task.due_date)}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge value={task.status} />
                      <StatusBadge value={task.priority} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {task.status !== 'in-progress' ? <button type="button" onClick={() => updateStatus(task, 'in-progress')} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white">Start</button> : null}
                      {task.status !== 'completed' ? <button type="button" onClick={() => updateStatus(task, 'completed')} className="rounded-2xl bg-emerald-500/15 px-3 py-2 text-xs text-emerald-100">Complete</button> : null}
                      <button type="button" onClick={() => setSelectedTask(task)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white">View</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No tasks found" description="Try another filter or check back when new work is assigned." />
        )}
      </SectionPanel>

      <Modal open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)} title={selectedTask?.title || 'Task details'}>
        {selectedTask ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-300">{selectedTask.description}</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={selectedTask.status} />
              <StatusBadge value={selectedTask.priority} />
            </div>
            <p className="text-sm text-slate-400">Due date: {formatDate(selectedTask.due_date)}</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
