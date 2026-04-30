export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-10 text-center">
      <p className="text-base font-medium text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
