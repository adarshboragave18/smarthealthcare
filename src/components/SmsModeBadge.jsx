import { useEffect, useState } from "react";

export default function SmsModeBadge() {
  const demo = import.meta.env.VITE_DEMO_SMS === "true";
  const mode = demo ? "Demo" : "Real";

  const colors = {
    Demo: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    Real: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  };

  const smsApi = import.meta.env.VITE_FIREBASE_API_KEY || "";
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!demo) {
      if (smsApi) {
        setStatus({ ok: true, message: "Firebase phone authentication active" });
      } else {
        setStatus({ ok: false, message: "Firebase phone auth unconfigured" });
      }
    }
  }, [demo, smsApi]);

  return (
    <div className={`inline-flex items-center gap-3 mt-3 px-3 py-1.5 rounded-full text-xs font-medium border ${colors[mode]}`}>
      <span className="inline-flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: demo ? "#f59e0b" : smsApi ? "#10b981" : "#ef4444" }} />
        <span>SMS: {mode}</span>
      </span>
      {status && (
        <span className={`ml-2 text-xs ${status.ok ? "text-emerald-300" : "text-rose-300"}`}>{status.message}</span>
      )}
    </div>
  );
}
