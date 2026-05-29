import { useRef, useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";
import { saveUser } from "../utils/storage";

export default function UserProfile({ user }) {
  const { lang } = useLanguage();
  const [lastCheckup, setLastCheckup] = useState(
    localStorage.getItem("shg_lastcheckup") || ""
  );
  const [editCheckup, setEditCheckup] = useState(false);
  const [checkupInput, setCheckupInput] = useState(lastCheckup);
  const [photo, setPhoto] = useState(user?.photo || null);
  const [photoError, setPhotoError] = useState("");
  const fileRef = useRef(null);

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resizeImage = (dataUrl, maxDimension = 512) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const width = Math.round(image.width * ratio);
      const height = Math.round(image.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = reject;
    image.src = dataUrl;
  });

  const savePhoto = async (file) => {
    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select a valid image file (JPG, PNG, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be 5MB or smaller.");
      return;
    }

    try {
      let dataUrl = await readFileAsDataUrl(file);
      if (file.size > 1024 * 1024) {
        dataUrl = await resizeImage(dataUrl, 512);
      }
      setPhoto(dataUrl);
      const updated = { ...user, photo: dataUrl };
      saveUser(updated);
      localStorage.setItem("shg_user", JSON.stringify(updated));
    } catch (err) {
      setPhotoError("Could not process this image. Try a different file.");
    }
  };

  const saveCheckup = () => {
    localStorage.setItem("shg_lastcheckup", checkupInput);
    setLastCheckup(checkupInput);
    setEditCheckup(false);
  };

  const bmi = user?.weight && user?.height
    ? (parseFloat(user.weight) / ((parseFloat(user.height) / 100) ** 2)).toFixed(1)
    : null;

  const getBMICat = (b) => {
    if (b < 18.5) return { label: t("bmi_ranges_under", lang), color: "text-blue-400" };
    if (b < 25) return { label: t("bmi_ranges_normal", lang), color: "text-green-400" };
    if (b < 30) return { label: t("bmi_ranges_overweight", lang), color: "text-yellow-400" };
    return { label: t("bmi_ranges_obese", lang), color: "text-red-400" };
  };

  const cat = bmi ? getBMICat(parseFloat(bmi)) : null;

  const fields = [
    { label: t("full_name", lang), value: user?.name, icon: "👤" },
    { label: t("mobile_number", lang), value: user?.phone ? `+91 ${user.phone}` : "—", icon: "📱" },
    { label: t("date_of_birth", lang), value: user?.dob ? new Date(user.dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—", icon: "🎂" },
    { label: t("age", lang), value: user?.age ? `${user.age} ${t("profile_years", lang)}` : "—", icon: "📅" },
    { label: t("gender", lang), value: user?.gender ? t(user.gender, lang) : "—", icon: "⚧" },
    { label: t("weight", lang), value: user?.weight ? `${user.weight} kg` : "—", icon: "⚖️" },
    { label: t("height", lang), value: user?.height ? `${user.height} cm` : "—", icon: "📏" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t("profile_title", lang)}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t("profile_sub", lang)}</p>
        </div>

        {/* Avatar + Name */}
        <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-3xl p-8 text-center mb-6 shadow-2xl">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 border-4 border-white/30 overflow-hidden">
            {photo ? (
              <img src={photo} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">{user?.gender === "female" ? "👩" : user?.gender === "male" ? "👨" : "🧑"}</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (f) savePhoto(f);
            }}
            className="hidden"
          />
          <div className="mt-2 flex justify-center gap-2">
            <button onClick={() => fileRef.current && fileRef.current.click()} className="text-sm bg-white/20 text-white px-3 py-1 rounded-full">Change Photo</button>
            {photo && <button onClick={() => { setPhoto(null); setPhotoError(""); try { saveUser({ ...user, photo: null }); localStorage.setItem('shg_user', JSON.stringify({ ...user, photo: null })); } catch (e) {} }} className="text-sm bg-white/10 text-white px-3 py-1 rounded-full">Remove</button>}
          </div>
          <p className="mt-2 text-xs text-white/80">Supported: JPG, PNG, GIF. Max 5MB; large images are resized automatically.</p>
          {photoError && <p className="mt-2 text-xs text-red-200">{photoError}</p>}
          <h3 className="text-2xl font-bold text-white">{user?.name}</h3>
          <p className="text-teal-200 text-sm mt-1">+91 {user?.phone}</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm text-white">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {t("profile_member_since", lang)} {user?.registeredAt ? new Date(user.registeredAt).toLocaleDateString("en-IN") : "—"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Details */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <span>📋</span> {t("profile_personal_info", lang)}
            </h4>
            <div className="space-y-3">
              {fields.map((f) => (
                <div key={f.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {f.icon} {f.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">{f.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* BMI Card */}
            {bmi && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <span>⚖️</span> {t("profile_bmi_status", lang)}
                </h4>
                <div className="text-center">
                  <p className={`text-5xl font-bold ${cat.color}`}>{bmi}</p>
                  <p className={`text-lg font-semibold mt-1 ${cat.color}`}>{cat.label}</p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {t("profile_bmi_details", lang)
                      .replace("{height}", user.height)
                      .replace("{weight}", user.weight)}
                  </div>
                </div>
              </div>
            )}

            {/* Login Times */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <span>🕐</span> {t("profile_login_history", lang)}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t("profile_last_login", lang)}</span>
                  <span className="font-medium text-gray-800 dark:text-white text-xs">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString("en-IN") : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t("profile_registered_on", lang)}</span>
                  <span className="font-medium text-gray-800 dark:text-white text-xs">
                    {user?.registeredAt ? new Date(user.registeredAt).toLocaleString("en-IN") : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Last Checkup */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <span>🩺</span> {t("profile_last_checkup", lang)}
              </h4>
              {editCheckup ? (
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    value={checkupInput}
                    onChange={(e) => setCheckupInput(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-white text-sm outline-none focus:border-teal-400"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveCheckup} className="flex-1 bg-teal-500 text-white text-sm py-2 rounded-xl hover:bg-teal-600 transition-colors">{t("profile_save", lang)}</button>
                    <button onClick={() => setEditCheckup(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t("profile_cancel", lang)}</button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                    {lastCheckup ? new Date(lastCheckup).toLocaleString("en-IN") : t("profile_not_recorded", lang)}
                  </p>
                  <button
                    onClick={() => setEditCheckup(true)}
                    className="text-sm text-teal-500 hover:text-teal-600 font-semibold transition-colors"
                  >
                    {lastCheckup ? t("profile_update_checkup", lang) : t("profile_add_checkup", lang)}
                  </button>
                  {lastCheckup && (
                    <div className="mt-3 text-xs text-gray-400">
                      {Math.floor((Date.now() - new Date(lastCheckup)) / (1000 * 60 * 60 * 24))} {t("profile_days_ago", lang)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}