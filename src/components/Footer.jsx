import { useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

export default function Footer() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const { lang } = useLanguage();

  const handleSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-gray-300 pt-16 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1 glass-card p-6 rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl bg-emerald-500/15 text-emerald-300 rounded-2xl p-3">🏥</span>
              <span className="text-xl font-bold text-white">Smart<span className="text-teal-400">Health</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{t("footer_brand_desc", lang)}</p>
            <div className="flex gap-3">
              {[
                { icon: "🐦", href: "#", label: "Twitter/X" },
                { icon: "f", href: "#", label: "Facebook" },
                { icon: "in", href: "#", label: "LinkedIn" },
                { icon: "▶", href: "#", label: "YouTube" },
                { icon: "📸", href: "#", label: "Instagram" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 bg-slate-800 hover:bg-teal-500 rounded-2xl flex items-center justify-center text-sm transition-all hover:-translate-y-0.5"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer_quick_links_title", lang)}</h4>
            <ul className="space-y-2 text-sm">
              {t("footer_quick_links", lang).map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-teal-400 transition-colors">→ {l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Health Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer_health_resources", lang)}</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "WHO Health Info", href: "https://www.who.int" },
                { label: "AYUSH Ministry", href: "https://www.ayush.gov.in" },
                { label: "MoHFW India", href: "https://mohfw.gov.in" },
                { label: "National Health Portal", href: "https://nhp.gov.in" },
                { label: "ICMR", href: "https://www.icmr.gov.in" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer" className="hover:text-teal-400 transition-colors">→ {l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Form */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("footer_contact_us", lang)}</h4>
            {submitted ? (
              <div className="bg-teal-900/50 border border-teal-700 rounded-2xl p-4 text-teal-300 text-sm text-center">{t("footer_message_sent", lang)}</div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={t("footer_placeholder_name", lang)}
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400 transition-colors"
                />
                <input
                  type="email"
                  placeholder={t("footer_placeholder_email", lang)}
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400 transition-colors"
                />
                <textarea
                  rows={3}
                  placeholder={t("footer_placeholder_message", lang)}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400 transition-colors resize-none"
                />
                <button
                  onClick={handleSubmit}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
                >
                  {t("footer_send_message", lang)}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 mb-4">
          <p className="text-xs text-gray-500 text-center">⚠️ <strong>{t("footer_disclaimer_title", lang)}</strong> {t("footer_disclaimer", lang)}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <p>{t("footer_copyright", lang)}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-teal-400 transition-colors">{t("footer_privacy", lang)}</a>
            <a href="#" className="hover:text-teal-400 transition-colors">{t("footer_terms", lang)}</a>
            <a href="#" className="hover:text-teal-400 transition-colors">{t("footer_cookie", lang)}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
