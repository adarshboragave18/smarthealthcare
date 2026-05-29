export default function DemoOtpPopup({ visible, otp, phone, onClose, title = "Demo OTP" }) {
  if (!visible || !otp) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-gradient-to-br from-teal-900/50 via-cyan-950/50 to-slate-950/50 backdrop-blur-3xl p-4 pt-16">
      <div className="w-full max-w-sm mt-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">{title}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Your demo OTP</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/20"
            aria-label="Close demo OTP popup"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-950/90 p-5 text-center border border-white/10">
          <p className="text-sm text-slate-400">Use this code for testing:</p>
          <p className="mt-3 text-4xl font-semibold tracking-[0.14em] text-cyan-300">{otp}</p>
          {phone ? <p className="mt-3 text-sm text-slate-400">for +91 {phone}</p> : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-400 hover:text-white"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
