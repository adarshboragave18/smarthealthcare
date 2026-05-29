import { useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

export default function BMICalculator({ user }) {
  const { lang } = useLanguage();
  const [weight, setWeight] = useState(user?.weight || "");
  const [height, setHeight] = useState(user?.height || "");
  const [bmi, setBmi] = useState(null);
  const [unit, setUnit] = useState("metric");

  const calcBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return;
    let result;
    if (unit === "metric") {
      result = w / ((h / 100) * (h / 100));
    } else {
      result = (703 * w) / (h * h);
    }
    setBmi(result.toFixed(1));
  };

  const getBMICategory = (b) => {
    if (b < 18.5) return { label: t("bmi_ranges_under", lang), color: "text-blue-400", bg: "bg-blue-500/20", tip: "Consider increasing your caloric intake with nutrient-rich foods." };
    if (b < 25) return { label: t("bmi_ranges_normal", lang), color: "text-green-400", bg: "bg-green-500/20", tip: "Great! Maintain your healthy lifestyle with regular exercise and balanced diet." };
    if (b < 30) return { label: t("bmi_ranges_over", lang), color: "text-yellow-400", bg: "bg-yellow-500/20", tip: "Consider regular exercise and a balanced diet to reach a healthy weight." };
    return { label: t("bmi_ranges_obese", lang), color: "text-red-400", bg: "bg-red-500/20", tip: "Please consult a healthcare professional for a personalized weight management plan." };
  };

  const cat = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const bmiPercent = bmi ? Math.min((parseFloat(bmi) / 40) * 100, 100) : 0;

  const ranges = [
    { key: "under", label: "Underweight", range: "< 18.5", color: "bg-blue-400" },
    { key: "normal", label: "Normal", range: "18.5–24.9", color: "bg-green-400" },
    { key: "over", label: "Overweight", range: "25–29.9", color: "bg-yellow-400" },
    { key: "obese", label: "Obese", range: "≥ 30", color: "bg-red-400" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t("bmi_title", lang)}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t("bmi_sub", lang)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          {/* Unit Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 mb-6 w-fit">
            {["metric", "imperial"].map((u) => (
              <button
                key={u}
                onClick={() => { setUnit(u); setBmi(null); }}
                className={`px-5 py-2 text-sm font-medium transition-all capitalize ${
                  unit === u ? "bg-teal-500 text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {t(`bmi_unit_${u}`, lang)} ({u === "metric" ? "kg/cm" : "lb/in"})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                {t("bmi_weight", lang)} ({unit === "metric" ? "kg" : "lbs"})
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === "metric" ? "e.g. 70" : "e.g. 154"}
                className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                {t("bmi_height", lang)} ({unit === "metric" ? "cm" : "inches"})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={unit === "metric" ? "e.g. 170" : "e.g. 67"}
                className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all"
              />
            </div>
          </div>

          <button
            onClick={calcBMI}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3.5 rounded-xl hover:from-teal-400 hover:to-cyan-400 transition-all transform hover:scale-[1.02] shadow-lg shadow-teal-500/25"
          >
            {t("bmi_calculate", lang)}
          </button>

          {bmi && cat && (
            <div className="mt-8 space-y-4 animate-fade-in">
              {/* Result */}
              <div className={`${cat.bg} rounded-2xl p-6 text-center border border-white/20`}>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{t("bmi_your_bmi", lang)}</p>
                <p className={`text-6xl font-bold ${cat.color}`}>{bmi}</p>
                <p className={`text-lg font-semibold mt-2 ${cat.color}`}>{cat.label}</p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>15</span><span>25</span><span>30</span><span>40</span>
                </div>
                <div className="h-3 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-400 rounded-full shadow-lg transition-all duration-500"
                    style={{ left: `calc(${bmiPercent}% - 10px)` }}
                  />
                </div>
              </div>

              {/* Tip */}
              <div className="bg-teal-50 dark:bg-teal-900/30 rounded-xl p-4 border border-teal-200 dark:border-teal-700">
                <p className="text-teal-700 dark:text-teal-300 text-sm">💡 {cat.tip}</p>
              </div>
            </div>
          )}

          {/* BMI ranges reference */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
            {ranges.map((r) => (
              <div key={r.label} className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className={`w-3 h-3 ${r.color} rounded-full mx-auto mb-1`} />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{t(`bmi_ranges_${r.key}` , lang) || r.label}</p>
                <p className="text-xs text-gray-500">{r.range}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}