export default function Toast({ message, type = "info", onClose }) {
  if (!message) {
    return null;
  }

  const baseClasses =
    "fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border px-4 py-4 shadow-2xl backdrop-blur-xl transition-transform duration-300";

  const statusClasses =
    type === "success"
      ? "bg-emerald-500/95 text-white border-emerald-300"
      : type === "error"
      ? "bg-rose-500/95 text-white border-rose-300"
      : "bg-slate-800/95 text-white border-slate-500";

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold capitalize">{type}</p>
          <p className="mt-1 text-sm leading-6 text-white/90">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white transition"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
