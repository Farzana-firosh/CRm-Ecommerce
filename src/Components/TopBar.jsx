import React, { useContext } from "react";
import { LanguageContext } from "./Context/LanguageContext";

export default function TopBar() {
  const { language, setLanguage } = useContext(LanguageContext);
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const translations = {
    en: { user: "Farzana" },
    ar: { user: " فرزانه" },
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-white to-blue-100 px-2 sm:px-4 md:px-6 py-2 sm:py-3 shadow-md flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
      <select
        className="border border-blue-200 bg-white px-3 py-1 rounded-lg text-blue-700 font-semibold shadow-sm focus:ring-2 focus:ring-blue-300 transition w-auto min-w-[120px]"
        onChange={handleLanguageChange}
        value={language}
      >
        <option value="en">English</option>
        <option value="ar">Arabic</option>
      </select>
      <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
        <span className="text-blue-900 font-semibold text-base truncate max-w-[120px] sm:max-w-none">
          {translations[language].user}
        </span>
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-bold shadow-md border-2 border-white text-base sm:text-lg">
          FA
        </div>
      </div>
    </div>
  );
}
