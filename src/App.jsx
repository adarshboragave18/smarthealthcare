import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import DemoOtpBanner from "./components/DemoOtpBanner";
import { getUserFromStorage } from "./utils/storage";
import { saveUserToCloud, isCloudStorageAvailable, flushPendingCloudUpdates } from "./utils/cloudStorage";

const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const Dashboard = lazy(() => import("./components/Dashboard"));

function PageLoader() {
  return (
    <div className="glass page-shell mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center rounded-[28px] px-8 py-10 text-center shadow-2xl">
      <div className="mb-4 h-14 w-14 rounded-full border-4 border-cyan-400/40 border-t-cyan-400 animate-spin" />
      <h2 className="text-xl font-semibold text-slate-100">Preparing your experience…</h2>
      <p className="mt-2 text-sm text-slate-300">Loading the smartest healthcare workspace for you.</p>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored) {
      setUser(stored);
      setPage("dashboard");
    }
  }, []);

  useEffect(() => {
    if (!isCloudStorageAvailable()) return;

    flushPendingCloudUpdates().catch((err) => {
      console.warn("Pending cloud save flush failed on startup:", err);
    });

    const onFocus = () => {
      flushPendingCloudUpdates().catch((err) => {
        console.warn("Pending cloud save flush failed on focus:", err);
      });
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const handleLogin = useCallback((userData) => {
    const now = new Date().toISOString();
    const updated = { ...userData, lastLogin: now };
    localStorage.setItem("shg_user", JSON.stringify(updated));

    if (isCloudStorageAvailable()) {
      saveUserToCloud(updated).catch((err) => {
        console.warn("Failed to save user to cloud on login:", err);
      });
    }

    setUser(updated);
    setPage("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("shg_user");
    setUser(null);
    setPage("login");
  }, []);

  const recaptchaVisible = import.meta.env.VITE_RECAPTCHA_VISIBLE === "true";

  return (
    <div className={`app-background ${darkMode ? "dark" : ""} transition-colors duration-500`}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="floating-orb orb-one" />
        <div className="floating-orb orb-two" />
        <div className="floating-orb orb-three" />
      </div>

      <DemoOtpBanner />
      <div id="recaptcha-container" className={recaptchaVisible ? "" : "hidden"} />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-3 py-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl animate-fade-in">
          <Suspense fallback={<PageLoader />}>
            {page === "login" && (
              <Login
                onLogin={handleLogin}
                onRegister={() => setPage("register")}
                darkMode={darkMode}
                toggleDark={toggleDark}
              />
            )}
            {page === "register" && (
              <Register
                onBack={() => setPage("login")}
                darkMode={darkMode}
                toggleDark={toggleDark}
              />
            )}
            {page === "dashboard" && (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                darkMode={darkMode}
                toggleDark={toggleDark}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}