export function Modal({ open, title, children, onClose, width = 'max-w-2xl' }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className={`glass-panel w-full ${width} rounded-[28px] border border-white/10 p-6 shadow-2xl`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
