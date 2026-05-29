import { useEffect, useState } from "react";
import LanguageContext from "./LanguageContextContext";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("sh_lang") || "en");

  useEffect(() => {
    localStorage.setItem("sh_lang", lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
