import { Sparkles } from 'lucide-react';

export function DashboardPlaceholder({ title, items }) {
  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[28px] p-8 shadow-glow">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-200">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Checkpoint 1</p>
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
          </div>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">
          The authenticated shell is ready. These navigation sections are wired so we can expand them with live
          SQLite-backed dashboard modules in the next checkpoint.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="glass-panel rounded-3xl border border-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/30"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-indigo-200">
              {item.slice(0, 2).toUpperCase()}
            </div>
            <h2 className="text-lg font-semibold text-white">{item}</h2>
            <p className="mt-2 text-sm text-slate-400">Placeholder route ready for the next implementation pass.</p>
          </div>
        ))}
      </section>
    </div>
  );
}
