import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

export default function Hero({ user, setActive }) {
  const { lang } = useLanguage();

  const stats = [
    { icon: "💓", label: t("stat_heart", lang), value: "72 bpm", color: "text-red-400" },
    { icon: "🩸", label: t("stat_bp", lang), value: "120/80", color: "text-orange-400" },
    { icon: "🌡️", label: t("stat_temp", lang), value: "98.6°F", color: "text-yellow-400" },
    { icon: "💧", label: t("stat_hydration", lang), value: t("stat_hydration_good", lang), color: "text-blue-400" },
  ];

  const quickActions = [
    { label: t("quick_bmi", lang), section: "BMI", icon: "⚖️", color: "from-teal-500 to-cyan-500" },
    { label: t("quick_symptom", lang), section: "Symptoms", icon: "🔍", color: "from-purple-500 to-pink-500" },
    { label: t("quick_emergency", lang), section: "Emergency", icon: "🚨", color: "from-red-500 to-orange-500" },
    { label: t("quick_hospital", lang), section: "Hospitals", icon: "🏥", color: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.22),_transparent_22%),linear-gradient(180deg,_rgba(14,165,233,0.14),_rgba(14,165,233,0))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_18%),linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.88))]" />
        <div className="relative bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 dark:from-teal-900 dark:via-cyan-900 dark:to-blue-900 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-teal-500/20">
          <div className="absolute top-8 right-8 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: `${8 + i * 14}%`,
                left: `${10 + i * 9}%`,
                animation: `float ${3 + i}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.45}s`,
              }}
            />
          ))}

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{t("hero_dashboard_active", lang)}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              <span className="text-teal-200">{user?.name || t("hero_default_user", lang)} 👋</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-xl">{t("hero_subtitle", lang)}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActive("Symptoms")}
                className="bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-all transform hover:scale-105 shadow-xl"
              >
                {t("hero_check_symptoms", lang)}
              </button>
              <button
                onClick={() => setActive("Hospitals")}
                className="bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-all border border-white/30"
              >
                {t("hero_find_hospitals", lang)}
              </button>
            </div>

            {user?.lastLogin && (
              <div className="mt-8 inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-sm text-white/80">
                <span>🕐</span>
                <span>{t("hero_last_login", lang)} {new Date(user.lastLogin).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all hover:-translate-y-1">
              <span className="text-3xl">{stat.icon}</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t("hero_quick_actions_title", lang)}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => setActive(a.section)}
              className={`bg-gradient-to-br ${a.color} p-6 rounded-2xl text-white text-left hover:scale-105 transition-transform shadow-lg`}
            >
              <span className="text-3xl block mb-2">{a.icon}</span>
              <span className="font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}