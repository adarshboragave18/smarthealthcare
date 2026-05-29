// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function ensureFirebaseConfig() {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Firebase configuration is missing. Add VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID to your .env file.");
  }
}

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

if (typeof window !== "undefined" && isFirebaseConfigured() && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  getAnalytics(app);
}

// Some Firebase builds expect `auth.settings` to exist with
// `appVerificationDisabledForTesting`. Ensure a safe default to
// avoid runtime `Cannot read properties of undefined` errors.
try {
  if (typeof auth.settings === "undefined") {
    Object.defineProperty(auth, "settings", {
      value: { appVerificationDisabledForTesting: false },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } else if (typeof auth.settings.appVerificationDisabledForTesting === "undefined") {
    try {
      auth.settings.appVerificationDisabledForTesting = false;
    } catch {
      Object.defineProperty(auth.settings, "appVerificationDisabledForTesting", {
        value: false,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
  }
} catch (e) {
  // be conservative: if we cannot write to auth.settings, ignore and continue
}

// Development runtime diagnostics to help capture the source of `appVerificationDisabledForTesting` errors.
if (import.meta.env.DEV) {
  try {
    // eslint-disable-next-line no-console
    console.debug("[firebase] config check", {
      firebaseConfig: {
        apiKey: !!firebaseConfig.apiKey,
        authDomain: !!firebaseConfig.authDomain,
        projectId: !!firebaseConfig.projectId,
        appId: !!firebaseConfig.appId,
        measurementId: !!firebaseConfig.measurementId,
      },
      authSettingsExists: typeof auth.settings !== "undefined",
      authSettings: auth.settings,
    });
  } catch (e) {
    // ignore logging errors
  }
}

export async function initRecaptcha(containerId = "recaptcha-container") {
  if (typeof window === "undefined") {
    throw new Error("reCAPTCHA requires window.");
  }

  // Ensure a single DOM container exists (do not duplicate).
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    // append near the end of body so it's available on every page
    document.body.appendChild(container);
  }

  try {
    if (typeof auth.settings === "undefined" || auth.settings === null) {
      Object.defineProperty(auth, "settings", {
        value: { appVerificationDisabledForTesting: false },
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else if (typeof auth.settings.appVerificationDisabledForTesting === "undefined") {
      try {
        auth.settings.appVerificationDisabledForTesting = false;
      } catch {
        Object.defineProperty(auth.settings, "appVerificationDisabledForTesting", {
          value: false,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
    }

    // Create the verifier only once and reuse it across clicks/renders.
    if (!window.recaptchaVerifier) {
      const recaptchaVisible = import.meta.env.VITE_RECAPTCHA_VISIBLE === "true";
      const recaptchaSize = recaptchaVisible ? "normal" : "invisible";

      // eslint-disable-next-line no-console
      if (import.meta.env.DEV) console.debug("[firebase] creating RecaptchaVerifier (first time)", { containerId, authSettings: auth.settings, recaptchaSize, recaptchaVisible });

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        containerId,
        {
          size: recaptchaSize,
          badge: "bottomright",
          callback: (token) => {
            // Optional: notify app that reCAPTCHA was solved
            // eslint-disable-next-line no-console
            if (import.meta.env.DEV) console.log("reCAPTCHA solved", { token });
          },
        }
      );

      // Wait for the widget to render once.
      try {
        await window.recaptchaVerifier.render();
      } catch (renderErr) {
        // eslint-disable-next-line no-console
        console.error("[firebase] reCAPTCHA render failed", renderErr);
        throw renderErr;
      }
    }

    return window.recaptchaVerifier;
  } catch (err) {
    // log then rethrow with clearer context
    // eslint-disable-next-line no-console
    console.error("[firebase] RecaptchaVerifier init error", err);
    throw new Error("Failed to initialize reCAPTCHA verifier: " + (err?.message || err));
  }
}

export async function sendPhoneOtp(phone) {
  ensureFirebaseConfig();

  // DEV-only bypass for local testing without contacting Firebase SMS
  // Enable by setting VITE_PHONE_AUTH_DEV_BYPASS=true in your .env
  if (import.meta.env.DEV && import.meta.env.VITE_PHONE_AUTH_DEV_BYPASS === "true") {
    const key = "devConfirmationOtp";
    let otp = null;

    try {
      const stored = JSON.parse(localStorage.getItem(key) || "null");
      if (stored && stored.phone === phone && Date.now() < stored.expiry) {
        otp = stored.otp;
      }
    } catch (e) {
      // ignore localStorage parse errors
    }

    if (!otp) {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const payload = { phone, otp, expiry: Date.now() + 5 * 60 * 1000 };
      try { localStorage.setItem(key, JSON.stringify(payload)); } catch (e) {}
    }

    // eslint-disable-next-line no-console
    console.warn("[firebase] PHONE_AUTH_DEV_BYPASS active — using local mock confirmationResult", { phone });

    const confirmationResult = {
      verificationId: `dev-${Date.now()}`,
      confirm: async (code) => {
        try {
          const stored = JSON.parse(localStorage.getItem(key) || "null") || {};
          if (String(code).trim() === String(stored.otp)) {
            return Promise.resolve({ user: { phoneNumber: phone } });
          }
        } catch (e) {
          // ignore
        }
        const err = new Error("Invalid verification code.");
        err.code = "auth/invalid-verification-code";
        return Promise.reject(err);
      },
    };

    return confirmationResult;
  }

  const verifier = await initRecaptcha();
  return signInWithPhoneNumber(auth, phone, verifier);
}
