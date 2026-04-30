import { cn } from '@/lib/utils.js';

export function StatCard({ icon: Icon, label, value, hint, className }) {
  return (
    <div className={cn('glass-panel rounded-[24px] border border-white/10 p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-indigo-200">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
