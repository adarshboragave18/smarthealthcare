import { useEffect, useMemo, useState } from "react";
import { sendOTP, verifyOTP } from "../utils/otp";
import { getUserByPhone } from "../utils/storage";
import { syncUserDataFromCloud, isCloudStorageAvailable } from "../utils/cloudStorage";
import DarkToggle from "./DarkToggle";
import DemoOtpPopup from "./DemoOtpPopup";
import Toast from "./Toast";
import OtpPinInput from "./OtpPinInput";
import SmsModeBadge from "./SmsModeBadge";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

export default function Login({ onLogin, onRegister, darkMode, toggleDark }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpMode, setOtpMode] = useState("demo");
  const [showDemoOtpPopup, setShowDemoOtpPopup] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);
  const { lang } = useLanguage();

  const countdownLabel = useMemo(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes > 0 ? `${minutes}m ` : ""}${seconds.toString().padStart(2, "0")}s`;
  }, [countdown]);

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

    // If native plugin available, add listeners
    let removeListeners = null;
    if (typeof window !== 'undefined') {
      (async () => {
        try {
          const nativePhoneAuth = await import('../utils/nativePhoneAuth');
          removeListeners = nativePhoneAuth.addNativeListeners({
            codeSent: (data) => {
              setConfirmationResult({ verificationId: data.verificationId });
              setOtpMode('native');
              setStep('otp');
              setCountdown(300);
              setResendCountdown(30);
              showToast('info', 'Verification code sent (native)');
            },
            verificationCompleted: (data) => {
              showToast('success', 'Verification completed (native)');
            },
            signInSuccess: (data) => {
              // Native sign-in succeeded
              const phoneNumber = data?.user?.phoneNumber;
              const user = getUserByPhone(phoneNumber?.replace('+91',''));
              if (user) onLogin(user);
            }
          });
        } catch (e) {
          // ignore if module load fails
        }
      })();
    }

    return () => {
      if (removeListeners) removeListeners();
    };
  }, [onLogin]);

  async function handleSendOTP() {
    setOtp("");
    if (!/^\d{10}$/.test(phone)) {
      showToast("error", t("invalid_phone", lang));
      return;
    }

    setLoading(true);

    try {
      // If running as a native app and plugin is available, use native flow
      try {
        const nativePhoneAuth = await import('../utils/nativePhoneAuth');
        if (nativePhoneAuth?.hasNativePhoneAuth?.()) {
          const fullPhone = `+91${phone}`;
          const result = await nativePhoneAuth.startNativePhoneVerification(fullPhone);
          // result may include verificationId immediately; also codeSent event is emitted
          setOtpMode('native');
          setConfirmationResult({ verificationId: result?.verificationId });
          setStep('otp');
          setCountdown(300);
          setResendCountdown(30);
          showToast('success', 'OTP sent (native).');
          setLoading(false);
          return;
        }
      } catch (loadErr) {
        console.warn('Native auth module load failed:', loadErr);
      }

      const result = await sendOTP(phone);
      setOtpMode(result.mode || "real");
      setConfirmationResult(result.confirmationResult || null);
      setGeneratedOtp(result.demoOtp || result.otp || "");
      setStep("otp");
      setCountdown(result.expiresIn || 300);
      setResendCountdown(result.resendIn || 30);
      showToast("success", "OTP sent. Check your phone.");
      if (result.mode === "demo") {
        const demoCode = result.demoOtp || result.otp;
        setShowDemoOtpPopup(true);
        showToast("info", `Demo OTP: ${demoCode}`);
        console.info("Demo OTP:", demoCode);
      }
      // Demo mode returns OTP in result.demoOtp — handled via UI/toast and popup for testing
    } catch (error) {
      showToast("error", error.message || t("unable_send_otp", lang));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (!/^\d{6}$/.test(otp)) {
      showToast("error", t("invalid_otp", lang));
      return;
    }

    setLoading(true);

    try {
      let success = false;
      if (otpMode === 'native' && confirmationResult && confirmationResult.verificationId) {
        try {
          const nativePhoneAuth = await import('../utils/nativePhoneAuth');
          await nativePhoneAuth.verifyNativeCode(confirmationResult.verificationId, otp);
          success = true;
        } catch (nativeErr) {
          console.warn('Native code verify failed:', nativeErr);
          success = false;
        }
      } else {
        const res = await verifyOTP(phone, otp, generatedOtp, otpMode, confirmationResult);
        success = res === true;
      }
      if (!success) {
        showToast("error", t("invalid_otp", lang));
        return;
      }

      let user = getUserByPhone(phone);

      if (!user && isCloudStorageAvailable()) {
        try {
          user = await syncUserDataFromCloud(phone, {
            phone,
            name: "",
            lastLogin: null,
          });
        } catch (syncErr) {
          console.warn("Cloud sync failed, using a lightweight profile:", syncErr);
        }
      }

      if (!user) {
        user = {
          phone,
          name: "",
          lastLogin: null,
        };
      }

      showToast("success", "OTP verified. Logging in…");
      onLogin(user);
    } catch (error) {
      showToast("error", error.message || t("invalid_otp", lang));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    if (resendCountdown > 0) {
      showToast("error", `Please wait ${resendCountdown}s before resending OTP.`);
      return;
    }

    setLoading(true);

    try {
      const result = await sendOTP(phone);
      setOtpMode(result.mode || "real");
      setConfirmationResult(result.confirmationResult || null);
      setGeneratedOtp(result.demoOtp || result.otp || "");
      setCountdown(result.expiresIn || 300);
      setResendCountdown(result.resendIn || 30);
      showToast("success", "New OTP sent successfully.");
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="absolute top-4 right-4">
          <DarkToggle darkMode={darkMode} toggle={toggleDark} />
        </div>

        <div className="mb-8 text-center text-white">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-cyan-500/20">
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight font-display">SmartHealth</h1>
          <p className="mt-2 text-sm text-cyan-200/80">Secure OTP login for your healthcare dashboard</p>
          <SmsModeBadge />
        </div>

        <div className="glass rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-white">{step === "phone" ? t("login_with_mobile", lang) : t("enter_otp", lang)}</h2>
            <p className="mt-2 text-sm text-slate-300">{step === "phone" ? "Use your registered +91 phone number to log in." : "Enter the 6-digit code sent via SMS."}</p>
          </div>

          {step === "phone" && (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-cyan-100">{t("mobile_number", lang)}</label>
                <div className="flex gap-3">
                  <span className="inline-flex items-center rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("placeholder_10", lang)}
                    className="w-full rounded-2xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-300/30"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? t("sending_otp", lang) : t("send_otp", lang)}
              </button>
              <p className="text-center text-sm text-slate-400">No password needed — secure, fast, and built for healthcare.</p>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-5">
              <div>
                <p className="text-center text-sm text-slate-400">
                  {t("otp_sent", lang)} +91 {phone}.
                </p>
                <div className="mt-4 text-center text-sm text-slate-300">
                  {countdown > 0 ? `Expires in ${countdownLabel}` : "OTP expired. Request a new code."}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-cyan-100">{t("enter_6_digit", lang)}</label>
                <OtpPinInput length={6} value={otp} onChange={setOtp} disabled={loading} />
              </div>

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? t("verify_and_login", lang) : t("verify_and_login", lang)}
              </button>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || resendCountdown > 0}
                  className="rounded-2xl border border-white/15 bg-slate-950/60 px-5 py-3 text-sm text-white transition hover:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendCountdown > 0 ? `Resend available in ${resendCountdown}s` : "Resend OTP"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setGeneratedOtp("");
                    setConfirmationResult(null);
                    setCountdown(0);
                    setResendCountdown(0);
                  }}
                  className="text-center text-sm text-cyan-300 hover:text-white"
                >
                  {t("change_number", lang)}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            {t("new_user", lang)}{' '}
            <button onClick={onRegister} className="text-cyan-200 underline underline-offset-4 hover:text-white">
              {t("register_here", lang)}
            </button>
          </div>
        </div>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
      <DemoOtpPopup
        visible={showDemoOtpPopup && otpMode === "demo"}
        otp={generatedOtp}
        phone={phone}
        onClose={() => setShowDemoOtpPopup(false)}
        title="Demo OTP"
      />
    </div>
  );
}

