import { useState } from "react";
import { useLanguage } from "../useLanguage";
import { t } from "../utils/i18n";

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];

const HOSPITALS = [
  { name: "AIIMS Delhi", city: "Delhi", address: "Ansari Nagar, New Delhi", lat: 28.5672, lng: 77.2100, type: "Government", pincode: "110029" },
  { name: "Fortis Escorts Heart Institute", city: "Delhi", address: "Okhla Road, New Delhi", lat: 28.5580, lng: 77.2521, type: "Private", pincode: "110025" },
  { name: "Sir Ganga Ram Hospital", city: "Delhi", address: "Rajender Nagar, New Delhi", lat: 28.6423, lng: 77.1855, type: "Private", pincode: "110060" },
  { name: "Kokilaben Dhirubhai Ambani Hospital", city: "Mumbai", address: "Andheri West, Mumbai", lat: 19.0905, lng: 72.8320, type: "Private", pincode: "400053" },
  { name: "Sion Hospital", city: "Mumbai", address: "Sion, Mumbai", lat: 19.0447, lng: 72.8601, type: "Government", pincode: "400022" },
  { name: "Nair Hospital", city: "Mumbai", address: "Bandra, Mumbai", lat: 19.0466, lng: 72.8359, type: "Government", pincode: "400050" },
  { name: "NIMHANS", city: "Bangalore", address: "Hosur Road, Bangalore", lat: 12.9196, lng: 77.5857, type: "Government", pincode: "560029" },
  { name: "Manipal Hospital", city: "Bangalore", address: "Old Airport Road, Bangalore", lat: 12.9718, lng: 77.6167, type: "Private", pincode: "560017" },
  { name: "Apollo Hospitals", city: "Chennai", address: "Greams Road, Chennai", lat: 13.0645, lng: 80.2420, type: "Private", pincode: "600006" },
  { name: "Government General Hospital", city: "Chennai", address: "Park Town, Chennai", lat: 13.0827, lng: 80.2707, type: "Government", pincode: "600003" },
  { name: "AIG Hospitals", city: "Hyderabad", address: "Gachibowli, Hyderabad", lat: 17.4497, lng: 78.3809, type: "Private", pincode: "500032" },
  { name: "Osmania General Hospital", city: "Hyderabad", address: "Koti, Hyderabad", lat: 17.3817, lng: 78.4867, type: "Government", pincode: "500095" },
  { name: "Ruby Hall Clinic", city: "Pune", address: "Bund Garden Road, Pune", lat: 18.5386, lng: 73.8624, type: "Private", pincode: "411001" },
  { name: "Kasturba Medical College Hospital", city: "Mangalore", address: "Bennekudru, Mangalore", lat: 12.8770, lng: 74.8340, type: "Government", pincode: "575006" },
  { name: "Sanjay Gandhi Postgraduate Institute", city: "Lucknow", address: "Raebareli Road, Lucknow", lat: 26.7974, lng: 81.1768, type: "Government", pincode: "226014" },
];

const toRadians = (degrees) => degrees * (Math.PI / 180);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const findNearestHospitals = (location, city, query, pincode) => {
  let results = [...HOSPITALS];

  if (pincode) {
    results = results.filter((hospital) => hospital.pincode === pincode);
  }

  if (city) {
    results = results.filter((hospital) => hospital.city.toLowerCase() === city.toLowerCase());
  }

  if (query) {
    const term = query.toLowerCase();
    results = results.filter((hospital) =>
      hospital.name.toLowerCase().includes(term) ||
      hospital.address.toLowerCase().includes(term) ||
      hospital.city.toLowerCase().includes(term) ||
      hospital.type.toLowerCase().includes(term) ||
      hospital.pincode?.includes(term)
    );
  }

  if (location) {
    return results
      .map((hospital) => ({
        ...hospital,
        distance: calculateDistance(location.latitude, location.longitude, hospital.lat, hospital.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }

  return results.slice(0, 5);
};

const getDirectionsUrl = (hospital, location) => {
  if (location) {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${location.latitude},${location.longitude};${hospital.lat},${hospital.lng}`;
  }

  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${hospital.name} ${hospital.city}`)}`;
};

export default function HospitalMap() {
  const { lang } = useLanguage();
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [query, setQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (!city && !pincode && !query && !userLocation) {
      setError(t("hospitals_enter_city_or_query", lang));
      setNearestHospitals([]);
      return;
    }

    const results = findNearestHospitals(userLocation, city, query, pincode.trim());
    setNearestHospitals(results);
    setError(results.length === 0 ? t("hospitals_no_results", lang) : "");
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError(t("hospitals_geo_unsupported", lang));
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserLocation(location);
        setCity("");
        setPincode("");
        setQuery("");
        const results = findNearestHospitals(location, "", "", "");
        setNearestHospitals(results);
        setLocationLoading(false);
      },
      () => {
        setError(t("hospitals_geo_failed", lang));
        setLocationLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t("hospitals_title", lang)}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t("hospitals_sub", lang)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
            >
              <option value="">{t("hospitals_select_city_placeholder", lang)}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder={t("hospitals_pin_placeholder", lang)}
              className="w-44 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
            />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("hospitals_search_placeholder", lang)}
              className="flex-1 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30"
            />

            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:from-teal-400 hover:to-cyan-400 hover:scale-105"
            >
              {t("hospitals_search_btn", lang)}
            </button>
          </div>

          <button
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {locationLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {t("hospitals_getting_location", lang)}
              </>
            ) : (
              <>{t("hospitals_use_location", lang)}</>
            )}
          </button>

          {userLocation && (
            <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
              📍 {t("hospitals_location_detected", lang)} {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>
          )}
        </div>

        {nearestHospitals.length > 0 ? (
          <div className="grid gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">{t("hospitals_nearest_title", lang)}</div>
            {nearestHospitals.map((hospital) => (
              <div key={hospital.name} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{hospital.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{hospital.type} • {hospital.city}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{hospital.address}</p>
                  </div>
                  <div className="text-right">
                    {hospital.distance !== undefined && (
                      <p className="text-base font-semibold text-teal-700 dark:text-teal-300">{hospital.distance.toFixed(1)} km</p>
                    )}
                    <a
                      href={getDirectionsUrl(hospital, userLocation)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-300 hover:text-teal-500"
                    >
                      <span>→</span>
                      {userLocation ? t("hospitals_directions", lang) : t("hospitals_view_on_map", lang)}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-xl border border-gray-100 dark:border-gray-700">
            <span className="text-6xl block mb-4">🏥</span>
            <h3 className="text-gray-700 dark:text-gray-300 font-semibold">{t("hospitals_search_for", lang)}</h3>
            <p className="text-gray-400 text-sm mt-1">{t("hospitals_sub", lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
