"use client";

import { useLanguage } from "@/components/language-provider";

const labels = { pt: "Falar com a Gevyro pelo WhatsApp", en: "Contact Gevyro on WhatsApp", es: "Hablar con Gevyro por WhatsApp" };

export function WhatsAppFloat() {
  const { language } = useLanguage();
  return (
    <a href="https://wa.me/5511932649629?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20Gevyro." target="_blank" rel="noreferrer" aria-label={labels[language]} title={labels[language]}
      className="fixed bottom-5 right-5 z-[90] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_28px_rgba(0,0,0,.25)] transition hover:-translate-y-1 hover:bg-[#20bd5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366]">
      <svg viewBox="0 0 32 32" width="29" height="29" fill="currentColor" aria-hidden><path d="M16.04 3a12.7 12.7 0 0 0-10.9 19.22L3.5 28.2l6.13-1.61A12.7 12.7 0 1 0 16.04 3Zm0 22.85c-2.02 0-4-.54-5.72-1.56l-.41-.24-3.64.95.97-3.54-.27-.43a10.17 10.17 0 1 1 9.07 4.82Zm5.58-7.61c-.3-.15-1.8-.89-2.08-.99-.28-.1-.48-.15-.69.15-.2.3-.79.99-.97 1.19-.18.2-.36.23-.66.08-1.78-.89-2.95-1.59-4.13-3.61-.31-.54.31-.5.89-1.67.1-.2.05-.38-.03-.53-.08-.15-.69-1.65-.94-2.26-.25-.6-.5-.51-.69-.52h-.58c-.2 0-.53.08-.81.38-.28.3-1.06 1.04-1.06 2.54s1.09 2.95 1.24 3.15c.15.2 2.14 3.27 5.19 4.59.72.31 1.29.5 1.73.64.73.23 1.39.2 1.91.12.58-.09 1.8-.74 2.05-1.45.25-.71.25-1.32.18-1.45-.08-.13-.28-.2-.58-.35Z"/></svg>
    </a>
  );
}
