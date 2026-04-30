export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}
