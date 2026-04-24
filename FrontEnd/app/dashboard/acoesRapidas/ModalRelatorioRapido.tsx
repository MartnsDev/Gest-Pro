"use client";

import { useState, useEffect, ReactNode } from "react";
import { X, BarChart3, FileText } from "lucide-react";
import { toast } from "sonner";

/* ─── Modal Base Interno ─── */
function Overlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

/* ─── Tipos ─── */
interface RelatorioHoje {
  titulo: string; 
  periodo: string; 
  nomeEmpresa: string; 
  geradoEm: string;
  totalVendas: number; 
  receitaTotal: number; 
  lucroTotal: number;
  totalDescontos: number; 
  ticketMedio: number; 
  maiorVenda: number;
  menorVenda: number; 
  cancelamentos: number; 
  valorCancelado: number;
}

/* ─── Helpers e Estilos ─── */
const fmt = (v?: number | null) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

const btnP: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "12px 0",
  background: "var(--primary)", border: "none", borderRadius: 8,
  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", justifyContent: "center",
  width: "100%", marginTop: 8
};

/* ─── Componente Principal ─── */
interface Props {
  empresaId: number;
  onClose: () => void;
  onIrRelatorios: () => void;
}

export default function ModalRelatorioRapido({ empresaId, onClose, onIrRelatorios }: Props) {
  const [rel, setRel] = useState<RelatorioHoje | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchRelatorio = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("jwt_token") ?? document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ?? "";
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
        
        const res = await fetch(`${base}/api/v1/relatorios/hoje?empresaId=${empresaId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.mensagem || "Não foi possível carregar o resumo de hoje.");
        }

        const data = await res.json();
        setRel(data);
      } catch (error: any) {
        setErro(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorio();
  }, [empresaId]);

  return (
    <Overlay onClose={onClose}>
      <div className="animate-fade-in" style={{
        background: "var(--surface-elevated)", border: "1px solid var(--border)",
        borderRadius: 14, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
        display: "flex", flexDirection: "column"
      }}>
        {/* Cabeçalho */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Resumo de Hoje</h2>
            <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "3px 0 0" }}>
              {rel?.periodo || "Carregando período..."}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* Esqueletos de Carregamento */}
          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 68, background: "var(--surface-overlay)", borderRadius: 10, opacity: 0.5, animation: "pulse 1.5s infinite" }} />
              ))}
            </div>
          )}

          {/* Mensagem de Erro */}
          {erro && !loading && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--destructive)", background: "rgba(239,68,68,0.05)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>{erro}</p>
            </div>
          )}

          {/* Dados do Relatório */}
          {rel && !loading && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { l: "Receita Total",  v: fmt(rel.receitaTotal), c: "var(--primary)",   bg: "rgba(16,185,129,.08)" },
                  { l: "Lucro Estimado", v: fmt(rel.lucroTotal),   c: "#60a5fa",          bg: "rgba(96,165,250,.08)" },
                  { l: "Ticket Médio",   v: fmt(rel.ticketMedio),  c: "#c084fc",          bg: "rgba(192,132,252,.08)" },
                  { l: "Nº de Vendas",   v: String(rel.totalVendas), c: "var(--foreground)", bg: "var(--surface-overlay)" },
                ].map(s => (
                  <div key={s.l} style={{ background: s.bg, borderRadius: 10, padding: "12px 14px", border: `1px solid ${s.bg.replace('.08', '.2')}` }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>
                      {s.l}
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.c, margin: 0 }}>
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>

              {/* Estado Vazio (Sem Vendas Hoje) */}
              {rel.totalVendas === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--foreground-muted)", background: "var(--surface-overlay)", borderRadius: 10, marginTop: 8 }}>
                  <BarChart3 size={32} style={{ opacity: 0.3, margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 13, margin: 0 }}>Nenhuma venda registrada hoje ainda.</p>
                </div>
              )}

              {/* Botão de Ação */}
              <button 
                onClick={() => { 
                  onClose(); 
                  onIrRelatorios(); 
                }} 
                style={btnP}
              >
                <FileText size={16} /> Ver Relatórios Completos
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}