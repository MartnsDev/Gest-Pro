"use client";

import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface Props {
  children: ReactNode;
  onVoltar?: () => void;
}

export default function PaginaAcaoRapida({ children, onVoltar }: Props) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "32px 16px" }}>
      {onVoltar && (
        <div style={{ width: "100%", maxWidth: 560, marginBottom: 16 }}>
          <button onClick={onVoltar}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", fontSize: 13, padding: 0 }}>
            <ArrowLeft size={15} /> Voltar ao Dashboard
          </button>
        </div>
      )}
      {children}
    </div>
  );
}