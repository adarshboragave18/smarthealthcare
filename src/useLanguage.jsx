import { useContext } from "react";
import LanguageContext from "./LanguageContextContext";

export function useLanguage() {
  return useContext(LanguageContext);
}
