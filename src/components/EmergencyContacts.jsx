import { useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

const EMERGENCY_DATA = {
  "Delhi": {
    police: "100", ambulance: "102", fire: "101", covid: "1075",
    hospitals: ["AIIMS Delhi: 011-26588500", "Safdarjung Hospital: 011-26730430", "RML Hospital: 011-23404530"],
    poison: "1800-116-117",
  },
  "Mumbai": {
    police: "100", ambulance: "102", fire: "101", covid: "020-26127394",
    hospitals: ["KEM Hospital: 022-24107000", "Hinduja Hospital: 022-24452222", "Tata Memorial: 022-24177000"],
    poison: "022-24129000",
  },
  "Bangalore": {
    police: "100", ambulance: "108", fire: "101", covid: "104",
    hospitals: ["Manipal Hospital: 080-25024444", "Victoria Hospital: 080-26700005", "Nimhans: 080-46110007"],
    poison: "1800-200-1004",
  },
  "Chennai": {
    police: "100", ambulance: "104", fire: "101", covid: "044-29510500",
    hospitals: ["CMC Vellore: 0416-2281000", "Apollo Chennai: 044-28293333", "Govt General Hospital: 044-25305000"],
    poison: "044-28592124",
  },
  "Hyderabad": {
    police: "100", ambulance: "108", fire: "101", covid: "104",
    hospitals: ["NIMS Hyderabad: 040-23489000", "Yashoda Hospital: 040-45674567", "AIIMS Hyderabad: 040-24749000"],
    poison: "040-27704700",
  },
  "Kolkata": {
    police: "100", ambulance: "102", fire: "101", covid: "033-23579217",
    hospitals: ["SSKM Hospital: 033-22041010", "Medical College Kolkata: 033-22551600", "Apollo Kolkata: 033-23201000"],
    poison: "1800-345-8000",
  },
};

const NATIONAL = [
  { labelKey: "emergency_national", number: "112", icon: "🆘", color: "bg-red-500" },
  { labelKey: "emergency_ambulance", number: "102", icon: "🚑", color: "bg-orange-500" },
  { labelKey: "emergency_police", number: "100", icon: "👮", color: "bg-blue-600" },
  { labelKey: "emergency_fire_brigade", number: "101", icon: "🚒", color: "bg-red-600" },
  { labelKey: "emergency_women_helpline", number: "1091", icon: "🛡️", color: "bg-pink-500" },
  { labelKey: "emergency_child_helpline", number: "1098", icon: "👶", color: "bg-purple-500" },
  { labelKey: "emergency_disaster_mgmt", number: "108", icon: "⛑️", color: "bg-teal-600" },
  { labelKey: "emergency_mental_health", number: "iCall: 9152987821", icon: "🧠", color: "bg-indigo-500" },
];

export default function EmergencyContacts() {
  const { lang } = useLanguage();
  const [city, setCity] = useState("");
  const data = EMERGENCY_DATA[city];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t("emergency_title", lang)}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t("emergency_sub", lang)}</p>
        </div>

        {/* National Numbers */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("emergency_national_title", lang) || t("emergency_national_title", lang)}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {NATIONAL.map((n) => (
              <a
                key={n.labelKey}
                href={`tel:${n.number.split(":")[0]}`}
                className={`${n.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition-all hover:scale-105 shadow-lg`}
              >
                <span className="text-3xl block mb-2">{n.icon}</span>
                <p className="text-xs font-medium opacity-90 mb-1">{t(n.labelKey, lang)}</p>
                <p className="text-lg font-bold">{n.number}</p>
              </a>
            ))}
          </div>
        </div>

        {/* City Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("emergency_city_title", lang)}</h3>
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">{t("emergency_select_city", lang)}</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full md:w-72 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
            >
              <option value="">{t("emergency_select_city_placeholder", lang)}</option>
              {Object.keys(EMERGENCY_DATA).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {data && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { labelKey: "emergency_police", val: data.police, icon: "👮", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
                  { labelKey: "emergency_ambulance", val: data.ambulance, icon: "🚑", color: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" },
                  { labelKey: "emergency_fire", val: data.fire, icon: "🔥", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" },
                  { labelKey: "emergency_covid_helpline", val: data.covid, icon: "😷", color: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300" },
                ].map((item) => (
                  <a key={item.labelKey} href={`tel:${item.val}`} className={`${item.color} rounded-2xl p-4 text-center hover:scale-105 transition-all`}>
                    <span className="text-2xl block mb-1">{item.icon}</span>
                    <p className="text-xs font-medium mb-1">{t(item.labelKey, lang)}</p>
                    <p className="font-bold">{item.val}</p>
                  </a>
                ))}
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span>🏥</span> {t("major_hospitals_in", lang)} {city}
                </h4>
                <div className="space-y-2">
                  {data.hospitals.map((h) => (
                    <div key={h} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                      <span className="text-teal-500">📍</span>
                      <a href={`tel:${h.split(":")[1]?.trim()}`} className="text-gray-700 dark:text-gray-300 text-sm hover:text-teal-500 transition-colors">
                        {h}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-4">
                <p className="text-red-700 dark:text-red-300 text-sm">
                    <span className="font-bold">☠️ {t("emergency_poison", lang)}:</span> {data.poison}
                </p>
              </div>
            </div>
          )}

          {!city && (
            <div className="text-center py-8 text-gray-400">
              <span className="text-5xl block mb-2">🗺️</span>
              <p>{t("emergency_select_city_none", lang)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}