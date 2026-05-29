import { useEffect, useMemo, useState } from "react";
import { saveUser, getUserByPhone } from "../utils/storage";
import { sendOTP, verifyOTP } from "../utils/otp";
import { initRecaptcha } from "../firebase";
import DarkToggle from "./DarkToggle";
import DemoOtpPopup from "./DemoOtpPopup";
import Toast from "./Toast";
import OtpPinInput from "./OtpPinInput";
import SmsModeBadge from "./SmsModeBadge";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

export default function Register({ onBack, darkMode, toggleDark }) {
  const [form, setForm] = useState({
    name: "", phone: "", dob: "", gender: "", weight: "", height: "",
  });
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState("demo");
  const [demoOtp, setDemoOtp] = useState("");
  const [showDemoOtpPopup, setShowDemoOtpPopup] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);

  const calcAge = (dob) => {
    if (!dob) return "";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  const age = calcAge(form.dob);
  const { lang } = useLanguage();

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setInterval(() => setCountdown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (resendCountdown <= 0) return undefined;
    const timer = window.setInterval(() => setResendCountdown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const countdownLabel = useMemo(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes > 0 ? `${minutes}m ` : ""}${seconds.toString().padStart(2, "0")}s`;
  }, [countdown]);

  function showToast(type, message) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 5000);
  }

  useEffect(() => {
    const demo = import.meta.env.VITE_DEMO_SMS === "true";
    const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
    if (!demo && !firebaseApiKey) {
      showToast("error", "Firebase phone auth is unconfigured. Set VITE_FIREBASE_API_KEY and VITE_DEMO_SMS in .env");
    }
    // Initialize visible reCAPTCHA once when running with real Firebase
    if (!demo && firebaseApiKey) {
      (async () => {
        try {
          await initRecaptcha();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[recaptcha] init failed', e);
        }
      })();
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    const { name, phone, dob, gender, weight, height } = form;
    if (!name || !phone || !dob || !gender || !weight || !height) {
      showToast("error", t("all_fields_required", lang));
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      showToast("error", t("invalid_phone", lang));
      return;
    }

    const existing = getUserByPhone(phone);
    if (existing) {
      showToast("error", "This mobile number is already registered.");
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(phone);
      setOtpMode(result.mode || "real");
      setConfirmationResult(result.confirmationResult || null);
      setDemoOtp(result.demoOtp || result.otp || "");
      setCountdown(result.expiresIn || 300);
      setResendCountdown(result.resendIn || 30);
      setStep("otp");
      showToast("success", "OTP sent to +91 " + phone);
      if (result.mode === "demo") {
        const demoCode = result.demoOtp || result.otp;
        setShowDemoOtpPopup(true);
        showToast("info", `Demo OTP: ${demoCode}`);
        console.info("Demo OTP:", demoCode);
      }
      // Demo OTP displayed via toast/console for development; UI handles demo flow
    } catch (error) {
      showToast("error", error.message || t("unable_send_otp", lang));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!/^\d{6}$/.test(otp)) {
      showToast("error", t("invalid_otp", lang));
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(form.phone, otp, demoOtp, otpMode, confirmationResult);
      const userData = { ...form, age, registeredAt: new Date().toISOString(), lastLogin: null };
      saveUser(userData);
      setStep("success");
      showToast("success", "Registration successful.");
      window.setTimeout(() => onBack(), 2200);
    } catch (error) {
      showToast("error", error.message || t("invalid_otp", lang));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) {
      showToast("error", `Please wait ${resendCountdown}s before resending.`);
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(form.phone);
      setOtpMode(result.mode || "real");
      setConfirmationResult(result.confirmationResult || null);
      setDemoOtp(result.demoOtp || result.otp || "");
      setCountdown(result.expiresIn || 300);
      setResendCountdown(result.resendIn || 30);
      showToast("success", "New OTP sent.");
      if (result.mode === "demo") {
        const demoCode = result.demoOtp || result.otp;
        setShowDemoOtpPopup(true);
        showToast("info", `Demo OTP: ${demoCode}`);
        console.info("Demo OTP:", demoCode);
      }
    } catch (error) {
      showToast("error", error.message || t("unable_send_otp", lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.25),transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.18),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),transparent_25%)]" />

      <div className="absolute top-4 right-4">
        <DarkToggle darkMode={darkMode} toggle={toggleDark} />
      </div>

      <div className="w-full max-w-lg relative z-10">
          <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl shadow-2xl mb-3">
            <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{t("create_account", lang)}</h1>
          <p className="text-teal-300/70 text-sm">{t("join_us", lang)}</p>
          <SmsModeBadge />
        </div>

        {step === "success" ? (
          <div className="bg-teal-500/20 border border-teal-400/40 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-white text-xl font-bold">{t("registered_success", lang)}</h2>
            <p className="text-teal-300 text-sm mt-2">{t("redirecting_login", lang)}</p>
          </div>
        ) : (
          <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50">
            {step === "form" ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: t("full_name", lang), name: "name", type: "text", placeholder: "" },
                    { label: t("mobile_number", lang), name: "phone", type: "tel", placeholder: t("placeholder_10", lang) },
                    { label: t("date_of_birth", lang), name: "dob", type: "date", placeholder: "" },
                    { label: t("weight", lang), name: "weight", type: "number", placeholder: "e.g. 65" },
                    { label: t("height", lang), name: "height", type: "number", placeholder: "e.g. 170" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="text-teal-300 text-xs font-medium block mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={field.name === "phone" ? (e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") }) : handleChange}
                        placeholder={field.placeholder}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder-white/40 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all text-sm"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-teal-300 text-xs font-medium block mb-1">{t("gender", lang)}</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all text-sm"
                    >
                      <option value="" className="text-gray-800">{t("select_gender", lang)}</option>
                      <option value="male" className="text-gray-800">{t("male", lang)}</option>
                      <option value="female" className="text-gray-800">{t("female", lang)}</option>
                      <option value="other" className="text-gray-800">{t("other", lang)}</option>
                    </select>
                  </div>
                </div>

                {age && (
                  <div className="mt-3 bg-teal-500/10 border border-teal-400/30 rounded-xl px-4 py-2 flex items-center gap-2">
                    <span className="text-teal-400 text-sm">🎂 {t("age_calculated", lang)}</span>
                    <span className="text-white font-bold">{age} years</span>
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70"
                  >
                    {loading ? t("sending_otp", lang) : t("create_account_btn", lang)}
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full text-teal-300 text-sm hover:text-white transition-colors"
                  >
                    {t("back_to_login", lang)}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-5">
                  <p className="text-teal-300 text-sm">OTP sent to +91 {form.phone}. Expires in {countdownLabel}.</p>
                </div>
                <div>
                  <label className="text-teal-300 text-sm font-medium block mb-2">Enter the 6-digit code</label>
                  <OtpPinInput length={6} value={otp} onChange={setOtp} disabled={loading} />
                </div>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70"
                  >
                    {loading ? t("verifying_otp", lang) : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading || resendCountdown > 0}
                    className="w-full rounded-2xl border border-white/15 bg-slate-950/60 px-5 py-3 text-sm text-white transition hover:border-cyan-300/60 disabled:opacity-60"
                  >
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("form");
                      setOtp("");
                      setConfirmationResult(null);
                      setCountdown(0);
                      setResendCountdown(0);
                    }}
                    className="w-full text-teal-300 text-sm hover:text-white transition-colors"
                  >
                    Change number
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>

    <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    <DemoOtpPopup
      visible={showDemoOtpPopup && otpMode === "demo"}
      otp={demoOtp}
      phone={form.phone}
      onClose={() => setShowDemoOtpPopup(false)}
      title="Demo OTP"
    />
    </>
  );
}
