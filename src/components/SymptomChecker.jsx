import { useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

const SYMPTOMS = [
  "Fever", "Headache", "Cough", "Sore Throat", "Fatigue", "Nausea",
  "Vomiting", "Diarrhea", "Chest Pain", "Shortness of Breath",
  "Dizziness", "Back Pain", "Joint Pain", "Rash", "Itchy Skin",
  "Redness", "Blisters", "Acne", "Dry Skin", "Skin Irritation",
  "Hives", "Skin Scaling", "Crusting", "Loss of Appetite",
  "Abdominal Pain", "Runny Nose", "Eye Pain", "Ear Pain", "Swelling",
];
const SKIN_SYMPTOMS = ["Rash", "Itchy Skin", "Redness", "Blisters", "Acne", "Dry Skin", "Skin Irritation", "Hives", "Skin Scaling", "Crusting"];

const CONDITION_DATABASE = {
  "Fever,Cough,Sore Throat": {
    condition: "Common Cold / Flu",
    severity: "Mild",
    advice: "Rest, hydrate, take OTC medications. See a doctor if fever > 103°F or symptoms worsen after 7 days.",
    icon: "🤧",
    homeCare: ["Get adequate sleep (7-9 hours)", "Drink warm fluids (tea, soup)", "Use a humidifier", "Gargle with warm salt water", "Apply warm compress to sinuses"],
    medicines: [
      { name: "Paracetamol", dosage: "500mg", frequency: "Every 4-6 hours", warning: "Max 4g/day", sideEffects: "Rare if used as directed" },
      { name: "Cough Syrup (DXM)", dosage: "10-20ml", frequency: "Every 4-6 hours", warning: "May cause drowsiness", sideEffects: "Dizziness, drowsiness" },
      { name: "Vitamin C", dosage: "500mg", frequency: "Daily", warning: "None significant", sideEffects: "Rare" }
    ],
    avoid: ["Smoking", "Alcohol", "Cold drinks", "Strenuous exercise"]
  },
  "Chest Pain,Shortness of Breath": {
    condition: "Possible Cardiac Issue",
    severity: "Critical",
    advice: "⚠️ SEEK EMERGENCY CARE IMMEDIATELY. Call 112 now.",
    icon: "❤️‍🔥",
    homeCare: [],
    medicines: [],
    avoid: []
  },
  "Fever,Headache,Nausea": {
    condition: "Possible Viral Infection",
    severity: "Moderate",
    advice: "Rest and stay hydrated. If fever persists beyond 3 days, consult a doctor.",
    icon: "🦠",
    homeCare: ["Rest for 24-48 hours", "Drink plenty of water", "Consume light, nutritious food", "Monitor temperature regularly", "Stay in a cool environment"],
    medicines: [
      { name: "Paracetamol", dosage: "500mg", frequency: "Every 4-6 hours", warning: "Max 4g/day", sideEffects: "Rare" },
      { name: "Ibuprofen", dosage: "200mg", frequency: "Every 6-8 hours", warning: "Take with food", sideEffects: "Stomach upset" },
      { name: "Antiemetic (Ondansetron)", dosage: "4mg", frequency: "Every 8 hours as needed", warning: "For nausea", sideEffects: "Headache" }
    ],
    avoid: ["Heavy foods", "Dairy products", "Spicy food", "Strenuous activity"]
  },
  "Diarrhea,Vomiting,Nausea": {
    condition: "Gastroenteritis (Food Poisoning)",
    severity: "Mild–Moderate",
    advice: "Stay hydrated with ORS. Eat light foods. See a doctor if symptoms persist beyond 48 hours.",
    icon: "🤢",
    homeCare: ["Drink ORS (Oral Rehydration Solution)", "Stay hydrated with clear fluids", "Eat bland foods (rice, toast, banana)", "Avoid dairy for 48 hours", "Rest completely"],
    medicines: [
      { name: "ORS Powder", dosage: "1 sachet per liter", frequency: "Every 4-6 hours", warning: "Essential for hydration", sideEffects: "None" },
      { name: "Loperamide", dosage: "2mg", frequency: "Every 6 hours", warning: "Do not use if fever present", sideEffects: "Constipation" },
      { name: "Zinc Supplements", dosage: "10-20mg", frequency: "Daily for 10 days", warning: "During and after infection", sideEffects: "Rare" }
    ],
    avoid: ["Fatty foods", "Dairy", "Spicy foods", "Caffeine", "Alcohol"]
  },
  "Dizziness,Headache": {
    condition: "Possible Hypertension or Migraine",
    severity: "Moderate",
    advice: "Lie down in a quiet, dark room. If severe, seek care.",
    icon: "💫",
    homeCare: ["Rest in dark, quiet room", "Apply cold compress to forehead", "Avoid bright lights and noise", "Drink water slowly", "Practice deep breathing"],
    medicines: [
      { name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours", warning: "As needed", sideEffects: "Rare" },
      { name: "Ibuprofen", dosage: "200-400mg", frequency: "Every 6-8 hours", warning: "With food", sideEffects: "Stomach upset" },
      { name: "Sumatriptan", dosage: "50mg", frequency: "Once per migraine", warning: "For severe migraines only", sideEffects: "Dizziness" }
    ],
    avoid: ["Bright screens", "Loud noises", "Skipping meals", "Caffeine withdrawal"]
  },
  "Rash,Itchy Skin,Redness": {
    condition: "Dermatitis / Eczema",
    severity: "Mild–Moderate",
    advice: "Use gentle skin care, avoid harsh soaps, and keep the skin hydrated. See a dermatologist if it worsens.",
    icon: "🧴",
    homeCare: ["Use fragrance-free moisturizer", "Avoid hot showers", "Wear loose clothing", "Apply cool compresses", "Use gentle cleanser"],
    medicines: [
      { name: "Hydrocortisone cream", dosage: "Apply thin layer twice daily", frequency: "As needed", warning: "Use short-term", sideEffects: "Skin thinning" },
      { name: "Antihistamine", dosage: "10mg", frequency: "Once daily", warning: "May cause drowsiness", sideEffects: "Drowsiness" }
    ],
    avoid: ["Harsh soaps", "Scratching", "Perfumed products", "Hot water"]
  },
  "Acne,Redness": {
    condition: "Acne or Folliculitis",
    severity: "Mild",
    advice: "Keep the skin clean, avoid squeezing pimples, and use non-comedogenic products.",
    icon: "🌿",
    homeCare: ["Wash gently with mild cleanser", "Avoid touching the face", "Use oil-free moisturizer", "Avoid heavy makeup"],
    medicines: [
      { name: "Benzoyl peroxide gel", dosage: "Apply once daily", frequency: "Daily", warning: "May bleach fabrics", sideEffects: "Dryness" },
      { name: "Salicylic acid cleanser", dosage: "Use daily", frequency: "Daily", warning: "Use sparingly", sideEffects: "Irritation" }
    ],
    avoid: ["Picking pimples", "Oily skincare", "Excessive sun exposure"]
  },
  "Blisters,Rash": {
    condition: "Contact Dermatitis or Blistering Skin Reaction",
    severity: "Mild",
    advice: "Protect the affected area and avoid further irritation. Keep it clean and dry.",
    icon: "🩹",
    homeCare: ["Cover with clean dressing", "Avoid rubbing the spot", "Use cool compresses", "Switch to mild soap"],
    medicines: [
      { name: "Topical antibiotic ointment", dosage: "Apply as directed", frequency: "Daily", warning: "Keep area clean", sideEffects: "None common" }
    ],
    avoid: ["Friction", "Harsh detergents", "Tight clothing"]
  },
  "Dry Skin,Itchy Skin": {
    condition: "Dry Skin / Eczema",
    severity: "Mild",
    advice: "Moisturize regularly and avoid irritants. Use gentle fabrics and lukewarm water.",
    icon: "🧼",
    homeCare: ["Apply moisturizer after washing", "Use a humidifier", "Avoid harsh soaps", "Wear soft fabrics"],
    medicines: [
      { name: "Moisturizing cream", dosage: "Apply twice daily", frequency: "Daily", warning: "Use fragrance-free", sideEffects: "None" }
    ],
    avoid: ["Hot water", "Scratchy fabrics", "Fragranced products"]
  },
  "Rash,Swelling,Itchy Skin": {
    condition: "Allergic Skin Reaction",
    severity: "Moderate",
    advice: "Identify and avoid the trigger. Apply cool compresses and consider antihistamines.",
    icon: "⚡",
    homeCare: ["Keep the area clean", "Use cool compress", "Elevate if swollen", "Identify triggers"],
    medicines: [
      { name: "Oral antihistamine", dosage: "10mg", frequency: "Once daily", warning: "May cause drowsiness", sideEffects: "Drowsiness" }
    ],
    avoid: ["Known allergens", "Scratching", "Perfumes"]
  },
  "Back Pain": {
    condition: "Muscle Strain or Back Pain",
    severity: "Mild–Moderate",
    advice: "Rest and apply heat or ice. Maintain good posture. See a doctor if pain persists beyond 2 weeks.",
    icon: "🔙",
    homeCare: ["Apply heat therapy (first 48 hours: ice)", "Use comfortable mattress", "Do gentle stretching exercises", "Maintain proper posture", "Avoid heavy lifting"],
    medicines: [
      { name: "Ibuprofen", dosage: "200-400mg", frequency: "Every 6-8 hours", warning: "With food", sideEffects: "Stomach upset" },
      { name: "Muscle Relaxant", dosage: "4-8mg", frequency: "2-3 times daily", warning: "Short-term use", sideEffects: "Drowsiness" },
      { name: "Pain Relief Gel", dosage: "Apply locally", frequency: "3-4 times daily", warning: "Topical", sideEffects: "Skin irritation" }
    ],
    avoid: ["Heavy lifting", "Prolonged sitting", "Bending", "Twisting motions"]
  },
  "Joint Pain": {
    condition: "Possible Arthritis or Joint Strain",
    severity: "Mild–Moderate",
    advice: "Rest the affected joint. Apply heat or cold therapy. Seek medical care if pain is severe.",
    icon: "🦵",
    homeCare: ["Rest and elevate affected joint", "Apply ice for first 48 hours", "Use heat therapy after 48 hours", "Do gentle range-of-motion exercises", "Use compression bandage"],
    medicines: [
      { name: "Ibuprofen", dosage: "200-400mg", frequency: "Every 6-8 hours", warning: "With food", sideEffects: "Stomach upset" },
      { name: "Glucosamine", dosage: "500-1500mg", frequency: "Daily", warning: "Long-term benefit", sideEffects: "None" },
      { name: "Topical NSAIDs", dosage: "Apply as needed", frequency: "3-4 times daily", warning: "Topical only", sideEffects: "Skin irritation" }
    ],
    avoid: ["Strenuous exercise", "Heavy lifting", "Prolonged standing"]
  },
  "Shortness of Breath": {
    condition: "Respiratory Issues",
    severity: "Moderate–Critical",
    advice: "Monitor closely. If severe or accompanied by chest pain, seek immediate care.",
    icon: "😤",
    homeCare: ["Sit upright to ease breathing", "Use humidifier", "Inhale steam from hot shower", "Avoid triggers and allergens", "Practice deep breathing"],
    medicines: [
      { name: "Salbutamol Inhaler", dosage: "1-2 puffs", frequency: "As needed", warning: "Rescue inhaler", sideEffects: "Tremor, palpitations" },
      { name: "Expectorant (Guaifenesin)", dosage: "200mg", frequency: "Every 4-6 hours", warning: "Helps clear mucus", sideEffects: "Mild nausea" }
    ],
    avoid: ["Smoke", "Pollution", "Allergens", "Strenuous exercise"]
  },
  "default": {
    condition: "General Discomfort",
    severity: "Mild",
    advice: "Drink water and rest",
    icon: "🩺",
    homeCare: ["Get adequate rest", "Stay hydrated", "Maintain hygiene", "Eat healthy food"],
    medicines: [{ name: "Paracetamol", dosage: "500mg", frequency: "Every 6 hours as needed", warning: "Max 4g/day", sideEffects: "Rare" }],
    avoid: ["Stress", "Lack of sleep", "Junk food"]
  }
};

const INDIVIDUAL_SYMPTOM_DATA = {
  Fever: { advice: "Keep hydrated, rest, and monitor your temperature.", condition: "Fever-related infection" },
  Headache: { advice: "Rest in a dark room and avoid loud noise.", condition: "Tension headache or migraine" },
  Cough: { advice: "Drink warm fluids and avoid irritants.", condition: "Respiratory irritation" },
  "Sore Throat": { advice: "Gargle with warm salt water and stay hydrated.", condition: "Throat irritation" },
  Fatigue: { advice: "Rest and eat balanced meals.", condition: "General tiredness" },
  Nausea: { advice: "Sip water slowly and eat bland foods.", condition: "Gastrointestinal upset" },
  Vomiting: { advice: "Drink ORS and stay hydrated.", condition: "Possible food poisoning" },
  Diarrhea: { advice: "Stay hydrated and avoid dairy.", condition: "Gastroenteritis" },
  "Chest Pain": { advice: "Seek medical care if pain is severe or sudden.", condition: "Potential cardiac or respiratory issue" },
  "Shortness of Breath": { advice: "Sit upright, breathe slowly, and seek help if it worsens.", condition: "Respiratory distress" },
  Dizziness: { advice: "Sit down, drink water, and avoid sudden movement.", condition: "Low blood pressure or dehydration" },
  "Back Pain": { advice: "Use heat or ice and avoid heavy lifting.", condition: "Muscle strain" },
  "Joint Pain": { advice: "Rest the joint and avoid high-impact activity.", condition: "Possible inflammation" },
  Rash: { advice: "Keep the area clean and avoid irritants.", condition: "Skin irritation" },
  "Itchy Skin": { advice: "Avoid scratching and use mild moisturizer.", condition: "Skin irritation" },
  Redness: { advice: "Use cool compresses and avoid hot water.", condition: "Inflammation or irritation" },
  Blisters: { advice: "Keep the area clean and protect it from friction.", condition: "Blister or contact reaction" },
  Acne: { advice: "Use gentle cleansing and avoid squeezing pimples.", condition: "Acne or follicle inflammation" },
  "Dry Skin": { advice: "Apply fragrance-free moisturizer frequently.", condition: "Dry skin" },
  "Skin Irritation": { advice: "Use hypoallergenic products and soothe the skin gently.", condition: "Irritated skin" },
  Hives: { advice: "Avoid triggers and consider antihistamines if needed.", condition: "Allergic skin reaction" },
  "Skin Scaling": { advice: "Apply gentle moisturizer and avoid harsh exfoliation.", condition: "Skin scaling or psoriasis" },
  Crusting: { advice: "Keep the area clean and avoid picking at it.", condition: "Skin healing or irritation" },
  "Loss of Appetite": { advice: "Eat small, frequent meals and stay hydrated.", condition: "Mild digestive distress" },
  "Abdominal Pain": { advice: "Avoid fatty foods and rest.", condition: "Digestive issue" },
  "Runny Nose": { advice: "Use saline nasal drops and rest.", condition: "Allergic or viral congestion" },
  "Eye Pain": { advice: "Avoid screen strain and rest your eyes.", condition: "Eye irritation" },
  "Ear Pain": { advice: "Avoid water in the ear and seek care if it persists.", condition: "Ear infection or pressure" },
  Swelling: { advice: "Elevate the area and avoid pressure.", condition: "Inflammation" }
};

const buildSymptomNarrative = (symptoms, bestMatch, exactMatch, confidence, photoAttached = false) => {
  const selectedText = symptoms.length > 0 ? symptoms.join(", ") : "no symptoms";
  const symptomConditions = [...new Set(symptoms.map((sym) => INDIVIDUAL_SYMPTOM_DATA[sym]?.condition).filter(Boolean))];
  const conditionText = bestMatch?.value?.condition || "general discomfort";
  const summary = exactMatch
    ? `This symptom cluster matches a known preset for ${bestMatch.key.replace(/,/g, ", ")}.`
    : `The selected symptoms are most consistent with ${conditionText.toLowerCase()} and the system estimates ${confidence}% confidence.`;
  const symptomReasonLines = symptoms.map((sym) => {
    const data = INDIVIDUAL_SYMPTOM_DATA[sym];
    return data
      ? `${sym}: suggests ${data.condition.toLowerCase()}.`
      : `${sym}: included in the pattern analysis.`;
  });
  const reasoning = [
    `Selected symptoms: ${selectedText}.`,
    exactMatch
      ? `Exact preset match: ${bestMatch.key.replace(/,/g, ", ")}.`
      : `Closest matching preset: ${bestMatch?.key.replace(/,/g, ", ") || "none"}.`,
    `Derived conditions from symptom patterns: ${symptomConditions.length > 0 ? symptomConditions.join(", ") : "None"}.`,
    ...symptomReasonLines,
  ];
  if (photoAttached) {
    reasoning.push("A user-provided photo was included to refine the assessment.");
  }
  reasoning.push("This recommendation is based on the highest confidence match and symptom-specific advice patterns.");
  return { summary, reasoning };
};

const getSymptomImportance = (symptom, bestMatch) => {
  if (!symptom) return "Low";
  if (bestMatch?.key?.split(",").includes(symptom)) return "High";
  if (INDIVIDUAL_SYMPTOM_DATA[symptom]) return "Medium";
  return "Low";
};

const getContributorBadgeStyle = (importance) => {
  if (importance === "High") return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700";
  if (importance === "Medium") return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700";
  return "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
};

const getSeverityColor = (s) => {
  if (s === "Critical") return "text-red-500 bg-red-50 dark:bg-red-900/30 border-red-200";
  if (s === "Moderate" || s === "Mild–Moderate") return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200";
  return "text-green-600 bg-green-50 dark:bg-green-900/30 border-green-200";
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return "text-green-700 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700";
  if (confidence >= 50) return "text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700";
  return "text-red-700 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700";
};

const getSkinKitSuggestion = (symptoms, photoAttached) => {
  const skinMatches = symptoms.filter((sym) => SKIN_SYMPTOMS.includes(sym));
  if (!skinMatches.length && !photoAttached) return null;

  if (skinMatches.length > 0) {
    const kitType = skinMatches.includes("Acne")
      ? "Acne Care Kit"
      : skinMatches.includes("Blisters")
      ? "Blister Care Kit"
      : skinMatches.includes("Hives")
      ? "Sensitive Skin Kit"
      : "Skin Comfort Kit";

    return {
      title: `${kitType} Suggestion`,
      note: photoAttached
        ? "Photo review is available based on the uploaded image and selected skin symptoms."
        : "Upload a photo of the affected area for more personalized guidance.",
      items: [
        "Use gentle, fragrance-free cleansers",
        "Apply hypoallergenic moisturizer twice daily",
        "Avoid scratching or rubbing the affected area",
        "Keep the skin cool and avoid hot water",
        photoAttached ? "Consider dermatologist review if symptoms persist" : "Update symptoms with a photo to refine this recommendation",
      ],
    };
  }

  return {
    title: "Skin Photo Review Kit",
    note: "A photo was provided for reference. This is a general guide; consult a doctor for a diagnosis.",
    items: [
      "Keep the area clean and dry",
      "Avoid touching or scratching the skin",
      "Use a gentle moisturizer if needed",
      "Monitor for spreading or worsening symptoms",
      "Seek professional care if uncertain",
    ],
  };
};

export default function SymptomChecker() {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoWarning, setPhotoWarning] = useState("");

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });

  const analyzeSymptoms = (symptoms, photoAttached = false) => {
    setLoading(true);
    setTimeout(() => {
      const entries = Object.entries(CONDITION_DATABASE).filter(([key]) => key !== "default");
      const scored = entries.map(([key, value]) => {
        const keySymptoms = key.split(",");
        const matches = keySymptoms.filter((sym) => symptoms.includes(sym));
        const score = matches.length / keySymptoms.length;
        return {
          key,
          value,
          matchesCount: matches.length,
          missingCount: keySymptoms.length - matches.length,
          extraCount: symptoms.filter((sym) => !keySymptoms.includes(sym)).length,
          score,
        };
      });

      const bestMatch = scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
        return a.extraCount - b.extraCount;
      })[0];

      const matchedSymptoms = bestMatch ? bestMatch.key.split(",").filter((sym) => symptoms.includes(sym)) : [];
      const strongestContributors = (matchedSymptoms.length > 0 ? matchedSymptoms : symptoms.slice(0, 3)).map((sym) => ({
        name: sym,
        importance: getSymptomImportance(sym, bestMatch),
      }));
      const confidence = bestMatch ? Math.round(bestMatch.score * 100) : 0;
      let nextResult = CONDITION_DATABASE.default;
      const skinKit = getSkinKitSuggestion(symptoms, photoAttached);
      if (bestMatch && bestMatch.score === 1) {
        nextResult = {
          ...bestMatch.value,
          confidence,
          exactMatch: true,
          matchName: bestMatch.key.replace(/,/g, ", "),
          strongestContributors,
          ...buildSymptomNarrative(symptoms, bestMatch, true, confidence, photoAttached),
          skinKit,
          photoUploaded: photoAttached,
        };
      } else if (bestMatch && bestMatch.score >= 0.5) {
        const symptomAdvice = [...new Set(symptoms.map((sym) => INDIVIDUAL_SYMPTOM_DATA[sym]?.advice).filter(Boolean))].join(" ");
        nextResult = {
          ...bestMatch.value,
          condition: `Likely ${bestMatch.value.condition}`,
          advice: `${bestMatch.value.advice} ${symptomAdvice || "Drink water and rest."}`,
          confidence,
          exactMatch: false,
          strongestContributors,
          ...buildSymptomNarrative(symptoms, bestMatch, false, confidence, photoAttached),
          skinKit,
          photoUploaded: photoAttached,
        };
      } else {
        const adviceFromSymptoms = [...new Set(symptoms.map((sym) => INDIVIDUAL_SYMPTOM_DATA[sym]?.advice).filter(Boolean))];
        nextResult = {
          ...CONDITION_DATABASE.default,
          advice: adviceFromSymptoms.length > 0 ? adviceFromSymptoms.join(" ") : CONDITION_DATABASE.default.advice,
          confidence,
          exactMatch: false,
          strongestContributors,
          ...buildSymptomNarrative(symptoms, bestMatch, false, confidence, photoAttached),
          skinKit,
          photoUploaded: photoAttached,
        };
      }

      setResult(nextResult);
      setLoading(false);
    }, 600);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoWarning("Please upload a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoWarning("Image must be smaller than 5MB.");
      return;
    }

    setPhotoWarning("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoPreview(dataUrl);
      if (selected.length > 0) {
        analyzeSymptoms(selected, true);
      }
    } catch (error) {
      setPhotoWarning("Unable to read the selected image.");
    }
  };

  const toggle = (s) => {
    setSelected((prev) => {
      const newSelected = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
      if (newSelected.length > 0) analyzeSymptoms(newSelected, !!photoPreview);
      else setResult(null);
      return newSelected;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t("symptom_title", lang)}</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">{t("symptom_sub", lang)}</p>
          <div className="inline-block mt-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-700">{t("symptom_warning", lang)}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 sticky top-20">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">
                {t("symptom_select_all", lang)} ({selected.length})
              </h3>
              <div className="space-y-2">
                {SYMPTOMS.map((s) => (
                  <button key={s} onClick={() => toggle(s)} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    selected.includes(s)
                      ? "bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/25"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-teal-400"
                  }`}>
                    {selected.includes(s) ? "✓ " : ""}{s}
                  </button>
                ))}
              </div>
              {selected.length > 0 && (
                <button onClick={() => { setSelected([]); setResult(null); }} className="w-full mt-4 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm">
                  {t("symptom_clear", lang)}
                </button>
              )}

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{t("symptom_upload_photo", lang)}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-sm text-gray-700 dark:text-gray-300 file:bg-teal-500 file:text-white file:px-3 file:py-2 file:rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t("symptom_photo_upload_hint", lang)}</p>
                {photoWarning && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{photoWarning}</p>}
                {photoPreview && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={photoPreview} alt="Uploaded symptom preview" className="w-full h-40 object-cover" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 p-3">{t("symptom_photo_preview", lang)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!result && selected.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 text-center h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">{t("symptom_start_prompt", lang)}</p>
              </div>
            )}
            {loading && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 text-center">
                <svg className="animate-spin h-8 w-8 text-teal-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">{t("symptom_analyzing", lang)}</p>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <div className={`rounded-2xl p-6 border ${getSeverityColor(result.severity)}`}>
                  <div className="flex items-start gap-4">
                    <span className="text-5xl">{result.icon}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{t("symptom_possible_condition", lang)}</p>
                      <h3 className="text-xl font-bold mb-2">{result.condition}</h3>
                      {result.exactMatch && result.matchName && (
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-700 text-xs font-semibold px-3 py-1">
                            Matched preset
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {result.matchName}
                          </span>
                        </div>
                      )}
                      {!result.exactMatch && selected.length > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          <span className="font-semibold">Selected Symptoms:</span> {selected.join(", ")}
                        </p>
                      )}
                      {result.strongestContributors?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Top contributors</p>
                          <div className="flex flex-wrap gap-2">
                            {result.strongestContributors.map((contributor) => (
                              <span key={contributor.name} className={`inline-flex items-center rounded-full text-[11px] font-semibold px-3 py-1 border ${getContributorBadgeStyle(contributor.importance)}`}>
                                {contributor.name}
                                <span className="ml-1 opacity-80">({contributor.importance})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.summary && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{result.summary}</p>
                      )}
                      <div className="inline-block text-xs font-bold px-3 py-1 rounded-full border border-current opacity-80 mb-3">
                        {t("symptom_severity", lang)} {result.severity}
                      </div>
                      {result.confidence !== undefined && (
                        <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full opacity-80 mb-3 ml-2 border ${getConfidenceColor(result.confidence)}`}>
                          Confidence: {result.confidence}%
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{result.advice}</p>
                      {result.photoUploaded && photoPreview && (
                        <div className="mt-4 rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img src={photoPreview} alt="Uploaded symptom information" className="w-full h-56 object-cover" />
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 text-sm text-gray-600 dark:text-gray-300">
                            {t("symptom_photo_preview", lang)}
                          </div>
                        </div>
                      )}
                      {result.skinKit && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 mt-4">
                          <h4 className="font-bold text-lg text-emerald-900 dark:text-emerald-300 mb-2">{result.skinKit.title}</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{result.skinKit.note}</p>
                          <ul className="space-y-2 text-sm text-emerald-900 dark:text-emerald-200">
                            {result.skinKit.items.map((item, i) => (
                              <li key={i} className="flex gap-2 items-start">
                                <span className="mt-1">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.reasoning?.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                          <p className="font-semibold mb-2">How this result was generated</p>
                          <ul className="list-disc list-inside space-y-1">
                            {result.reasoning.map((line, i) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {result.condition !== "Possible Cardiac Issue" && (
                  <>
                    {result.homeCare.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
                        <h4 className="font-bold text-lg text-blue-900 dark:text-blue-300 mb-3">{t("solution_home_care", lang)}</h4>
                        <ul className="space-y-2">
                          {result.homeCare.map((care, i) => (
                            <li key={i} className="text-sm text-blue-800 dark:text-blue-200 flex gap-2">
                              <span className="text-blue-500">✓</span>
                              <span>{care}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.medicines.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-700">
                        <h4 className="font-bold text-lg text-green-900 dark:text-green-300 mb-4">{t("solution_medicines", lang)}</h4>
                        <div className="space-y-3">
                          {result.medicines.map((med, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-100 dark:border-green-800">
                              <p className="font-semibold text-green-900 dark:text-green-300 mb-2">{med.name}</p>
                              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">{t("medicine_dosage", lang)}:</span> {med.dosage}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600 dark:text-gray-400">{t("medicine_frequency", lang)}:</span> {med.frequency}
                                </div>
                              </div>
                              <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-700 mb-2">
                                ⚠️ {med.warning}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{t("medicine_side_effects", lang)}:</span> {med.sideEffects}
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-200 dark:border-yellow-700">
                          {t("medicine_warning", lang)}
                        </p>
                      </div>
                    )}

                    {result.avoid.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-700">
                        <h4 className="font-bold text-lg text-red-900 dark:text-red-300 mb-3">{t("solution_activities", lang)}</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.avoid.map((activity, i) => (
                            <span key={i} className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-sm font-medium px-3 py-1.5 rounded-full border border-red-300 dark:border-red-600">
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <p className="text-xs text-center text-gray-400 dark:text-gray-500 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {t("symptom_ai_disclaimer", lang)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}