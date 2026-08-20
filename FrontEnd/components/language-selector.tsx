"use client";

import { useLanguage, type Language } from "@/components/language-provider";

const options: { value: Language; flag: string; label: string; name: string }[] = [
  { value: "pt", flag: "🇧🇷", label: "PT", name: "Português" },
  { value: "en", flag: "🇺🇸", label: "EN", name: "English" },
  { value: "es", flag: "🇪🇸", label: "ES", name: "Español" },
];

export function LanguageSelector({ dark = false }: { dark?: boolean }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div role="group" aria-label="Selecionar idioma" className={`inline-flex items-center gap-1 rounded-full border p-1 ${dark ? "border-white/15 bg-white/5" : "border-zinc-200 bg-white"}`}>
      {options.map((option) => (
        <button key={option.value} type="button" onClick={() => setLanguage(option.value)} title={option.name} aria-pressed={language === option.value}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition ${language === option.value ? "bg-[#258c53] text-white shadow-sm" : dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:bg-zinc-100"}`}>
          <span className="text-base leading-none" aria-hidden>{option.flag}</span><span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
