import { useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

const TIPS = [
  {
    id: 1, category: "nutrition", icon: "🥗",
    titleKey: "tips_1_title",
    summaryKey: "tips_1_summary",
    contentKey: "tips_1_content",
    readTime: "3 min", date: "May 12, 2026", color: "from-green-500 to-emerald-500",
  },
  {
    id: 2, category: "fitness", icon: "🏃",
    titleKey: "tips_2_title",
    summaryKey: "tips_2_summary",
    contentKey: "tips_2_content",
    readTime: "4 min", date: "May 10, 2026", color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3, category: "sleep", icon: "😴",
    titleKey: "tips_3_title",
    summaryKey: "tips_3_summary",
    contentKey: "tips_3_content",
    readTime: "5 min", date: "May 8, 2026", color: "from-purple-500 to-indigo-500",
  },
  {
    id: 4, category: "hydration", icon: "💧",
    titleKey: "tips_4_title",
    summaryKey: "tips_4_summary",
    contentKey: "tips_4_content",
    readTime: "3 min", date: "May 6, 2026", color: "from-cyan-500 to-blue-500",
  },
  {
    id: 5, category: "mental_health", icon: "🧠",
    titleKey: "tips_5_title",
    summaryKey: "tips_5_summary",
    contentKey: "tips_5_content",
    readTime: "4 min", date: "May 4, 2026", color: "from-pink-500 to-rose-500",
  },
  {
    id: 6, category: "prevention", icon: "🛡️",
    titleKey: "tips_6_title",
    summaryKey: "tips_6_summary",
    contentKey: "tips_6_content",
    readTime: "5 min", date: "May 2, 2026", color: "from-teal-500 to-green-500",
  },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "nutrition", label: "Nutrition" },
  { key: "fitness", label: "Fitness" },
  { key: "sleep", label: "Sleep" },
  { key: "hydration", label: "Hydration" },
  { key: "mental_health", label: "Mental Health" },
  { key: "prevention", label: "Prevention" },
];

export default function HealthTips() {
  const { lang } = useLanguage();
  const [selectedCat, setSelectedCat] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const filtered = selectedCat === "all" ? TIPS : TIPS.filter((t) => t.category === selectedCat);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t("tips_title", lang)}</h2>
              <p className="text-gray-500 dark:text-gray-400">{t("tips_sub", lang)}</p>
            </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCat(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCat === cat.key
                  ? "bg-teal-500 text-white shadow-md shadow-teal-500/25"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-400"
              }`}
            >
              {t(cat.key, lang) || cat.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tip) => (
            <div
              key={tip.id}
              className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-br ${tip.color} p-6 relative overflow-hidden`}>
                <div className="absolute top-2 right-2 bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium">
                  {t(tip.category, lang) || tip.category}
                </div>
                <span className="text-5xl block mb-2">{tip.icon}</span>
                <h3 className="text-lg font-bold text-white leading-tight">{t(tip.titleKey, lang)}</h3>
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-3">
                  <span>📅 {tip.date}</span>
                  <span>⏱️ {tip.readTime} {t("tips_read", lang)}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {t(tip.summaryKey, lang)}
                </p>

                {expanded === tip.id && (
                  <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-3 animate-fade-in">
                    {t(tip.contentKey, lang)}
                  </div>
                )}

                <button
                  onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
                  className="text-teal-500 hover:text-teal-600 text-sm font-semibold transition-colors flex items-center gap-1"
                >
                  {expanded === tip.id ? t("tips_show_less", lang) : t("tips_read_more", lang)}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-8 text-center shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">{t("tips_subscribe_title", lang)}</h3>
          <p className="text-teal-100 text-sm mb-6">{t("tips_subscribe_sub", lang)}</p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder={t("tips_subscribe_placeholder", lang)}
              className="flex-1 bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 outline-none focus:border-white transition-all"
            />
            <button className="bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-all whitespace-nowrap">
              {t("tips_subscribe_btn", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}