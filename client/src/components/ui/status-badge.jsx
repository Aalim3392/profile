import { cn } from '@/lib/utils.js';

const variants = {
  active: 'bg-emerald-500/12 text-emerald-200',
  inactive: 'bg-slate-500/12 text-slate-300',
  open: 'bg-sky-500/12 text-sky-200',
  closed: 'bg-slate-500/12 text-slate-300',
  paused: 'bg-amber-500/12 text-amber-200',
  pending: 'bg-amber-500/12 text-amber-200',
  approved: 'bg-emerald-500/12 text-emerald-200',
  rejected: 'bg-rose-500/12 text-rose-200',
  todo: 'bg-slate-500/12 text-slate-200',
  'in-progress': 'bg-indigo-500/12 text-indigo-200',
  completed: 'bg-emerald-500/12 text-emerald-200',
  overdue: 'bg-rose-500/12 text-rose-200',
  present: 'bg-emerald-500/12 text-emerald-200',
  absent: 'bg-rose-500/12 text-rose-200',
  'half-day': 'bg-amber-500/12 text-amber-200',
  leave: 'bg-sky-500/12 text-sky-200',
  success: 'bg-emerald-500/12 text-emerald-200',
  warning: 'bg-amber-500/12 text-amber-200',
  error: 'bg-rose-500/12 text-rose-200',
  info: 'bg-sky-500/12 text-sky-200',
};

export function StatusBadge({ value, className }) {
  const key = String(value || '').toLowerCase();
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize', variants[key] || 'bg-white/8 text-slate-200', className)}>
      {value}
    </span>
  );
}
