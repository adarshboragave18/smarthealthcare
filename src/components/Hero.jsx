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
        <div className="relative overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-700 shadow-2xl shadow-teal-500/20 dark:from-teal-900 dark:via-cyan-900 dark:to-blue-900 sm:rounded-[2.5rem]">
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

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 sm:mb-6 sm:px-4">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="text-sm font-medium text-white/90">{t("hero_dashboard_active", lang)}</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold leading-tight text-white sm:mb-4 sm:text-4xl md:text-6xl">
              <span className="text-teal-200">{user?.name || t("hero_default_user", lang)} 👋</span>
            </h1>
            <p className="mb-6 max-w-xl text-sm leading-6 text-white/80 sm:mb-8 sm:text-lg">{t("hero_subtitle", lang)}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={() => setActive("Symptoms")}
                className="w-full rounded-xl bg-white px-5 py-3 font-semibold text-teal-700 shadow-xl transition-all hover:scale-[1.01] hover:bg-teal-50 sm:w-auto sm:px-6"
              >
                {t("hero_check_symptoms", lang)}
              </button>
              <button
                onClick={() => setActive("Hospitals")}
                className="w-full rounded-xl border border-white/30 bg-white/20 px-5 py-3 font-semibold text-white transition-all hover:bg-white/30 sm:w-auto sm:px-6"
              >
                {t("hero_find_hospitals", lang)}
              </button>
            </div>

            {user?.lastLogin && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white/80 sm:mt-8">
                <span>🕐</span>
                <span>{t("hero_last_login", lang)} {new Date(user.lastLogin).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto -mt-6 max-w-7xl px-3 sm:-mt-8 sm:px-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:p-4">
              <span className="text-2xl sm:text-3xl">{stat.icon}</span>
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 sm:text-xs">{stat.label}</p>
              <p className={`mt-0.5 text-lg font-bold sm:text-xl ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-12">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white sm:mb-6 sm:text-2xl">{t("hero_quick_actions_title", lang)}</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {quickActions.map((a) => (
            <button
              key={a.label}
              onClick={() => setActive(a.section)}
              className={`rounded-2xl bg-gradient-to-br ${a.color} p-4 text-left text-white shadow-lg transition-transform hover:scale-[1.01] sm:p-6`}
            >
              <span className="mb-2 block text-2xl sm:text-3xl">{a.icon}</span>
              <span className="text-sm font-semibold leading-5 sm:text-base">{a.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}