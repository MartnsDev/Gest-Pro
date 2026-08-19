"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isLight = mounted && resolvedTheme === "light";
  const nextTheme = isLight ? "dark" : "light";
  const label = isLight ? "Ativar tema noite" : "Ativar tema dia";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      title={label}
      aria-label={label}
      aria-pressed={isLight}
      style={{
        minWidth: compact ? 36 : 92,
        height: 36,
        padding: compact ? 0 : "0 11px",
        borderRadius: 9,
        border: "1px solid var(--border)",
        background: "var(--surface-elevated)",
        color: "var(--foreground-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 650,
        whiteSpace: "nowrap",
      }}
    >
      {isLight ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
      {!compact && (isLight ? "Dia" : "Noite")}
    </button>
  );
}
