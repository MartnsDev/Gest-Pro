"use client";

export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new Event("gevyro:open-cookie-preferences"),
        )
      }
      className="mt-4 rounded-full bg-[#258c53] px-5 py-3 text-sm font-semibold text-white"
    >
      Gerenciar preferências
    </button>
  );
}
