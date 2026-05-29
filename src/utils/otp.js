import { sendPhoneOtp } from "../firebase";

const DEMO_SMS = import.meta.env.VITE_DEMO_SMS === "true";

function normalizePhone(phone) {
  return phone?.toString().replace(/\D/g, "") || "";
}

function assertValidPhone(phone) {
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }
}

function translateFirebaseOtpError(error) {
  const code = error?.code || "";
  switch (code) {
    case "auth/invalid-phone-number":
      return "Invalid phone number. Use a valid 10-digit Indian mobile number.";
    case "auth/missing-app-credential":
      return "reCAPTCHA verification failed. Refresh the page and try again.";
    case "auth/configuration-not-found":
      return "Phone authentication is not configured for this Firebase project. Check Firebase console and authorized domains.";
    case "auth/too-many-requests":
      return "Too many OTP requests. Please wait and try again later.";
    case "auth/code-expired":
      return "OTP expired. Request a new code.";
    case "auth/invalid-verification-code":
      return "Invalid OTP. Please check the code and try again.";
    case "auth/operation-not-allowed":
      return "Phone authentication is not enabled for this Firebase project. Enable Phone sign-in in the Firebase console and add localhost as an authorized domain.";
    default:
      if (typeof error?.message === "string" && error.message.includes("OPERATION_NOT_ALLOWED")) {
        return "SMS cannot be sent until Phone Authentication is enabled for this Firebase project. Enable Phone sign-in in the Firebase console and add localhost as an authorized domain.";
      }
      return error?.message || "Unable to process OTP at this time.";
  }
}

export async function sendOTP(phone) {
  const normalizedPhone = normalizePhone(phone);
  assertValidPhone(normalizedPhone);

  if (DEMO_SMS) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const payload = { phone: normalizedPhone, otp, ts: Date.now(), expiresIn: 300 };
      localStorage.setItem("demoOtp", JSON.stringify(payload));
    } catch (e) {
      // ignore localStorage errors in restricted environments
    }
    return { mode: "demo", otp, demoOtp: otp, expiresIn: 300, resendIn: 30 };
  }

  try {
    const confirmationResult = await sendPhoneOtp(`+91${normalizedPhone}`);
    return { mode: "real", confirmationResult, expiresIn: 300, resendIn: 30 };
  } catch (error) {
    throw new Error(translateFirebaseOtpError(error));
  }
}

export async function verifyOTP(phone, otp, generatedOtp, mode = "demo", confirmationResult = null) {
  if (!/^[0-9]{6}$/.test(otp?.toString().trim() || "")) {
    throw new Error("Enter a valid 6-digit OTP.");
  }

  if (mode === "demo") {
    return otp.trim() === (generatedOtp || "").trim();
  }

  if (!confirmationResult) {
    throw new Error("Confirmation result unavailable. Please request a new code.");
  }

  try {
    await confirmationResult.confirm(otp.trim());
    return true;
  } catch (error) {
    throw new Error(translateFirebaseOtpError(error));
  }
}
