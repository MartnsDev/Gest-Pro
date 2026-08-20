"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "pt" | "en" | "es";

const STORAGE_KEY = "gevyro-language";
const LanguageContext = createContext<{ language: Language; setLanguage: (value: Language) => void } | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "pt" || saved === "en" || saved === "es") setLanguageState(saved);
  }, []);

  const setLanguage = (value: Language) => {
    setLanguageState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : language === "en" ? "en-US" : "es-ES";
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage precisa estar dentro de LanguageProvider");
  return context;
}
