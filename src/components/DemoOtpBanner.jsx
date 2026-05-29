import { useEffect, useState } from "react";

const DEMO_SMS = import.meta.env.VITE_DEMO_SMS === "true";

export default function DemoOtpBanner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!DEMO_SMS) return;
    try {
      const raw = localStorage.getItem("demoOtp");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setData(parsed);
    } catch (e) {
      // ignore parse errors
    }

    const onStorage = (e) => {
      if (e.key === "demoOtp") {
        try {
          setData(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (_) {
          setData(null);
        }
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!DEMO_SMS || !data) return null;

  const expiresAt = data.ts + (data.expiresIn || 300) * 1000;
  const secondsLeft = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));

  return (
    <div className="demo-otp-banner fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-300 text-yellow-900 px-4 py-2 rounded shadow-md">
      <div className="flex items-center gap-4">
        <div>
          <strong>Demo OTP:</strong> {data.otp} — for +91{data.phone}
        </div>
        <div className="text-sm opacity-80">expires in {secondsLeft}s</div>
        <button
          className="ml-4 underline text-sm"
          onClick={() => {
            try {
              localStorage.removeItem("demoOtp");
              setData(null);
            } catch (e) {}
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
