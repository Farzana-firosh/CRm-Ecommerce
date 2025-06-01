import React, { createContext, useState, useEffect, useContext } from "react";
import { translations } from "../../i18n/translations";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const { t, language, setLanguage } = useContext(LanguageContext);
  return { t, language, setLanguage };
}
