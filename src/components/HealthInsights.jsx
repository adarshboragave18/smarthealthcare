import { useMemo, useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

const getBMI = (weight, height) => {
  if (!weight || !height) return null;
  const w = parseFloat(weight);
  const h = parseFloat(height) / 100;
  if (!w || !h) return null;
  return +(w / (h * h)).toFixed(1);
};

const formatDaysAgo = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const computeInsights = (user, lastCheckup) => {
  const bmi = getBMI(user?.weight, user?.height);
  const age = user?.age ? parseInt(user.age, 10) : null;
  const daysSinceCheckup = formatDaysAgo(lastCheckup);
  let score = 55;

  if (bmi) {
    if (bmi >= 18.5 && bmi < 25) score += 18;
    else if (bmi < 30) score += 6;
    else score -= 10;
  }

  if (age) {
    if (age < 35) score += 6;
    else if (age < 50) score += 2;
    else score -= 4;
  }

  if (daysSinceCheckup != null) {
    if (daysSinceCheckup <= 90) score += 9;
    else if (daysSinceCheckup <= 180) score += 2;
    else score -= 8;
  }

  if (user?.gender === "female") score += 2;
  if (user?.gender === "male") score += 1;

  score = Math.max(30, Math.min(98, Math.round(score)));

  const status = score >= 80 ? "Excellent" : score >= 65 ? "Good" : score >= 50 ? "Fair" : "Needs Attention";
  const statusColor = score >= 80 ? "bg-emerald-500/10 text-emerald-700" : score >= 65 ? "bg-amber-100 text-amber-700" : score >= 50 ? "bg-sky-100 text-sky-700" : "bg-rose-100 text-rose-700";

  const summary = [];
  if (bmi) {
    if (bmi < 18.5) summary.push("BMI indicates underweight, include nutrient-rich meals.");
    else if (bmi < 25) summary.push("BMI is healthy — keep up the balanced routine.");
    else if (bmi < 30) summary.push("BMI is slightly high; add more movement and lean protein.");
    else summary.push("BMI is in the obese range; prioritize gentle exercise and portion control.");
  }

  if (daysSinceCheckup != null) {
    if (daysSinceCheckup > 180) summary.push("It has been a while since your last checkup.");
    else summary.push(`Last medical checkup was ${daysSinceCheckup} days ago.`);
  } else {
    summary.push("Add your last checkup date in Profile to improve recommendations.");
  }

  const recommendations = [
    "Track daily hydration and sleep quality.",
    "Favor whole foods over processed meals.",
    "Plan at least 20 minutes of moderate movement each day.",
  ];

  const focus = [
    "Stay hydrated and prioritize electrolytes.",
    "Include a colorful salad or vegetable bowl in one meal.",
    "Use a walking break every 90 minutes.",
  ];

  if (score < 60) {
    focus.unshift("Schedule a health checkup soon.");
    recommendations.unshift("Talk to a healthcare provider about your current goals.");
  }

  return {
    bmi,
    score,
    status,
    statusColor,
    summary,
    recommendations,
    focus,
    nextGoal: score >= 80 ? "Maintain your strong habits" : "Build consistency with daily wellness steps",
    lastCheckupSummary: daysSinceCheckup != null ? `${daysSinceCheckup} ${daysSinceCheckup === 1 ? "day" : "days"} since last checkup` : "No checkup recorded",
  };
};

export default function HealthInsights({ user }) {
  const { lang } = useLanguage();
  const [lastCheckup] = useState(localStorage.getItem("shg_lastcheckup") || "");

  const insights = useMemo(() => computeInsights(user || {}, lastCheckup), [user, lastCheckup]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-teal-100 text-teal-700 px-4 py-2 text-sm font-semibold dark:bg-teal-900/20 dark:text-teal-200">
            ✨ {t("insights_title", lang)}
          </p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t("insights_sub", lang)}</h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("insights_description", lang)}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-teal-500 font-semibold">{t("insights_score", lang)}</p>
                <h3 className="text-5xl font-bold text-gray-900 dark:text-white">{insights.score}</h3>
                <p className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${insights.statusColor}`}>{insights.status}</p>
              </div>
              <div className="rounded-3xl bg-slate-100 dark:bg-slate-900 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{t("insights_last_checkup", lang)}</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{insights.lastCheckupSummary}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-5">
                <p className="text-xs text-slate-500 uppercase tracking-[0.24em]">{t("insights_goal", lang)}</p>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{insights.nextGoal}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-5">
                <p className="text-xs text-slate-500 uppercase tracking-[0.24em]">{t("insights_strengths", lang)}</p>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{user?.gender ? `${user.gender} health profile` : "Profile-based analysis"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-5">
                <p className="text-xs text-slate-500 uppercase tracking-[0.24em]">{t("insights_improvement", lang)}</p>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{insights.score >= 65 ? "Keep building on your routine." : "Focus on checkup and daily wellness."}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {insights.summary.map((line, index) => (
                <div key={index} className="rounded-3xl bg-slate-50 dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("insights_action_title", lang)}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t("insights_action_sub", lang)}</p>
              <div className="space-y-3">
                {insights.recommendations.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start rounded-3xl bg-slate-50 dark:bg-slate-900 p-4">
                    <span className="mt-1 text-xl">{idx === 0 ? "🔥" : idx === 1 ? "🥗" : "🚶"}</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-[2rem] p-6 shadow-2xl border border-white/10">
              <h3 className="text-lg font-semibold mb-4">{t("insights_focus", lang)}</h3>
              <div className="space-y-3">
                {insights.focus.map((item, idx) => (
                  <div key={idx} className="rounded-3xl bg-white/5 p-4">
                    <p className="text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
