import { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import DemoOtpBanner from "./components/DemoOtpBanner";
import { getUserFromStorage } from "./utils/storage";

export default function App() {
  const [page, setPage] = useState("login"); // login | register | dashboard
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const stored = getUserFromStorage();
    if (stored) {
      setUser(stored);
      setPage("dashboard");
    }
  }, []);

  const handleLogin = (userData) => {
    const now = new Date().toISOString();
    const updated = { ...userData, lastLogin: now };
    localStorage.setItem("shg_user", JSON.stringify(updated));
    setUser(updated);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("shg_user");
    setUser(null);
    setPage("login");
  };

  return (
    <div className={`app-background ${darkMode ? "dark" : ""} transition-colors duration-500`}> 
      <DemoOtpBanner />
      {/* Toggle visibility with VITE_RECAPTCHA_VISIBLE=true for debugging */}
      {(() => {
        const recaptchaVisible = import.meta.env.VITE_RECAPTCHA_VISIBLE === "true";
        return <div id="recaptcha-container" className={recaptchaVisible ? "" : "hidden"} />;
      })()}
      {page === "login" && (
        <Login
          onLogin={handleLogin}
          onRegister={() => setPage("register")}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(!darkMode)}
        />
      )}
      {page === "register" && (
        <Register
          onBack={() => setPage("login")}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(!darkMode)}
        />
      )}
      {page === "dashboard" && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(!darkMode)}
        />
      )}
    </div>
  );
}