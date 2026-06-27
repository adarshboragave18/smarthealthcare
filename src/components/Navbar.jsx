import { useState } from "react";
import DarkToggle from "./DarkToggle";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

export default function Navbar({ user, sections, active, setActive, onLogout, darkMode, toggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <button onClick={() => setActive("Home")} className="group flex items-center gap-2">
          <span className="text-xl group-hover:animate-bounce sm:text-2xl">🏥</span>
          <span className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
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
        <div className="flex items-center gap-2 sm:gap-3">
          <DarkToggle darkMode={darkMode} toggle={toggleDark} />
          {/* Language selector */}
          <div className="hidden xs:block">
            <LanguageSelector />
          </div>
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
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
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
        <div className="space-y-1 border-t border-gray-200 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-900 md:hidden sm:px-4">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => { setActive(s); setMenuOpen(false); }}
              className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                active === s
                  ? "bg-teal-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-800"
              }`}
            >
              {s}
            </button>
          ))}
          <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500">
                {t("lastLogin", lang)}: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "—"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-xs text-white"
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
