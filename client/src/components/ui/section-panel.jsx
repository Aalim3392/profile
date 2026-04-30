import { cn } from '@/lib/utils.js';

export function SectionPanel({ title, description, actions, children, className }) {
  return (
    <section className={cn('glass-panel rounded-[24px] border border-white/10 p-5 md:p-6', className)}>
      {(title || description || actions) && (
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h2 className="text-lg font-semibold text-white">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
