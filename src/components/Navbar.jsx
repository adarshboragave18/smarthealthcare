import { useState } from "react";
import DarkToggle from "./DarkToggle";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

export default function Navbar({ user, sections, active, setActive, onLogout, darkMode, toggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setActive("Home")} className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:animate-bounce">🏥</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            Smart<span className="text-teal-500">Health</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {sections.map((s) => {
            const key = `section_${s.toLowerCase()}`;
            const label = t(key, lang);
            return (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active === s
                    ? "bg-teal-500 text-white shadow-md shadow-teal-500/30"
                    : "text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-800"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <DarkToggle darkMode={darkMode} toggle={toggleDark} />
          {/* Language selector */}
          <LanguageSelector />
          <div className="hidden md:flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.lastLogin
                  ? `${t("last", lang)}: ${new Date(user.lastLogin).toLocaleDateString()}`
                  : t("welcome", lang)}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
            >
              {t("logout", lang)}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="space-y-1.5">
              <span className={`block w-5 h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-4 space-y-1">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => { setActive(s); setMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === s
                  ? "bg-teal-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {t("lastLogin", lang)}: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white text-xs px-4 py-2 rounded-lg"
            >
              {t("logout", lang)}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="px-2 py-1 text-sm rounded-md border bg-white dark:bg-gray-800"
      aria-label="Language selector"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="kn">ಕನ್ನಡ</option>
    </select>
  );
}
