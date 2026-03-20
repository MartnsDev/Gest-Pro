"use client";

import { useEffect, useState } from "react";
import {
  Zap, Building2, Store, BarChart3,
  CheckCircle, Clock, Crown, Star, Rocket, FlaskConical,
  ArrowRight, AlertCircle,
} from "lucide-react";

interface PlanoInfo {
  tipoPlano: string;
  diasRestantes: number;
  empresasCriadas: number;
  limiteEmpresas: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

async function fetchAuth<T>(path: string): Promise<T> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// ─── Definição dos planos ──────────────────────────────────────────────────
const PLANOS = [
  {
    id: "EXPERIMENTAL",
    nome: "Experimental",
    descricao: "Para experimentar o GestPro",
    preco: null,
    duracao: "7 dias",
    icon: FlaskConical,
    cor: "#6366f1",
    corMuted: "rgba(99,102,241,0.12)",
    features: [
      "1 empresa / loja",
      "1 caixa por empresa",
      "Dashboard completo",
      "Cadastro de produtos",
      "Registro de vendas",
    ],
    destaque: false,
  },
  {
    id: "BASICO",
    nome: "Básico",
    descricao: "Ideal para pequenos negócios",
    preco: "R$ 29,90",
    duracao: "por mês",
    icon: Star,
    cor: "#3b82f6",
    corMuted: "rgba(59,130,246,0.12)",
    features: [
      "1 empresa / loja",
      "1 caixa por empresa",
      "Dashboard completo",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
    destaque: false,
  },
  {
    id: "PRO",
    nome: "Pro",
    descricao: "Para negócios em crescimento",
    preco: "R$ 59,90",
    duracao: "por mês",
    icon: Rocket,
    cor: "#10b981",
    corMuted: "rgba(16,185,129,0.12)",
    features: [
      "2 empresas / lojas",
      "3 caixas por empresa",
      "Dashboard avançado",
      "Relatórios completos",
      "Suporte prioritário",
    ],
    destaque: true,
  },
  {
    id: "PREMIUM",
    nome: "Premium",
    descricao: "Para redes e franquias",
    preco: "R$ 99,90",
    duracao: "por mês",
    icon: Crown,
    cor: "#f59e0b",
    corMuted: "rgba(245,158,11,0.12)",
    features: [
      "Empresas ilimitadas",
      "Caixas ilimitados",
      "Dashboard completo",
      "Relatórios avançados",
      "Suporte dedicado 24h",
    ],
    destaque: false,
  },
];

const ORDEM = ["EXPERIMENTAL", "BASICO", "PRO", "PREMIUM"];

function barWidth(diasRestantes: number, duracaoTotal: number) {
  if (duracaoTotal === 0) return 0;
  return Math.min(100, Math.max(0, (diasRestantes / duracaoTotal) * 100));
}

function barColor(pct: number) {
  if (pct > 50) return "var(--primary)";
  if (pct > 20) return "var(--warning)";
  return "var(--destructive)";
}

export default function Planos() {
  const [plano,   setPlano]   = useState<PlanoInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuth<{ planoUsuario: PlanoInfo }>("/api/v1/dashboard/visao-geral")
      .then(d => setPlano(d.planoUsuario))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const planoAtualIdx = plano ? ORDEM.indexOf(plano.tipoPlano) : -1;
  const duracaoTotal  = plano?.tipoPlano === "EXPERIMENTAL" ? 7 : 30;
  const pct           = plano ? barWidth(plano.diasRestantes, duracaoTotal) : 100;
  const planoAtual    = PLANOS.find(p => p.id === plano?.tipoPlano);

  return (
    <div style={{ padding: "28px 28px 60px", display: "flex", flexDirection: "column", gap: 32, maxWidth: 900 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Planos & Assinaturas</h1>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)", marginTop: 6 }}>
          Gerencie seu plano e expanda o que seu negócio pode fazer.
        </p>
      </div>

      {/* Card plano atual */}
      {loading ? (
        <div style={{ height: 120, background: "var(--surface-elevated)", borderRadius: 16, border: "1px solid var(--border)" }} className="skeleton" />
      ) : plano && planoAtual ? (
        <div style={{
          background: "var(--surface-elevated)",
          border: `1px solid ${planoAtual.cor}44`,
          borderRadius: 16, padding: "22px 24px",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: planoAtual.corMuted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <planoAtual.icon size={22} color={planoAtual.cor} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Plano {planoAtual.nome}</p>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: planoAtual.corMuted, color: planoAtual.cor }}>
                    ATIVO
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "3px 0 0" }}>{planoAtual.descricao}</p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: planoAtual.cor, margin: 0 }}>
                {planoAtual.preco ?? "Gratuito"}
              </p>
              <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "2px 0 0" }}>{planoAtual.duracao}</p>
            </div>
          </div>

          {/* Barra de tempo */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "var(--foreground-muted)", display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={12} /> Tempo restante
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: pct < 20 ? "var(--destructive)" : "var(--foreground)" }}>
                {plano.diasRestantes} dias
              </span>
            </div>
            <div style={{ height: 6, background: "var(--surface-overlay)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor(pct), borderRadius: 99, transition: "width .6s ease" }} />
            </div>
          </div>

          {/* Uso */}
          <div style={{ display: "flex", gap: 20, paddingTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--foreground-muted)" }}>
              <Building2 size={14} color={planoAtual.cor} />
              <span>{plano.empresasCriadas} / {plano.limiteEmpresas === 99 ? "∞" : plano.limiteEmpresas} empresas</span>
            </div>
          </div>

          {pct < 20 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--destructive-muted)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "var(--destructive)" }}>
              <AlertCircle size={14} /> Seu plano expira em breve. Renove para não perder o acesso.
            </div>
          )}
        </div>
      ) : null}

      {/* Separador */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span style={{ fontSize: 12, color: "var(--foreground-subtle)", textTransform: "uppercase", letterSpacing: ".07em", whiteSpace: "nowrap" }}>
          Todos os planos
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* Grid de planos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {PLANOS.map((p, idx) => {
          const isAtual   = p.id === plano?.tipoPlano;
          const isUpgrade = idx > planoAtualIdx && planoAtualIdx >= 0;
          const Icon = p.icon;

          return (
            <div key={p.id} style={{
              position: "relative",
              background: "var(--surface-elevated)",
              border: `1px solid ${isAtual ? p.cor + "66" : p.destaque ? p.cor + "33" : "var(--border)"}`,
              borderRadius: 16,
              padding: "22px 20px",
              display: "flex", flexDirection: "column", gap: 16,
              transition: "transform .18s, border-color .18s",
            }}
              onMouseEnter={e => !isAtual && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)")}
              onMouseLeave={e => !isAtual && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
            >
              {/* Badge destaque */}
              {p.destaque && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", padding: "3px 14px", background: p.cor, color: "#fff", borderRadius: 99, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                  MAIS POPULAR
                </div>
              )}

              {/* Badge atual */}
              {isAtual && (
                <div style={{ position: "absolute", top: 14, right: 14, padding: "2px 8px", background: p.corMuted, color: p.cor, borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                  ATUAL
                </div>
              )}

              {/* Ícone + nome */}
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: p.corMuted, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <Icon size={20} color={p.cor} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{p.nome}</p>
                <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "3px 0 0" }}>{p.descricao}</p>
              </div>

              {/* Preço */}
              <div>
                <p style={{ fontSize: 24, fontWeight: 800, color: p.cor, margin: 0, lineHeight: 1 }}>
                  {p.preco ?? "Grátis"}
                </p>
                <p style={{ fontSize: 12, color: "var(--foreground-subtle)", margin: "4px 0 0" }}>{p.duracao}</p>
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--foreground-muted)" }}>
                    <CheckCircle size={14} color={p.cor} style={{ flexShrink: 0, marginTop: 1 }} />
                    {f}
                  </div>
                ))}
              </div>

              {/* Botão */}
              <button
                disabled={isAtual}
                style={{
                  marginTop: 4,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px 0",
                  background: isAtual ? "var(--surface-overlay)" : isUpgrade ? p.cor : "transparent",
                  border: `1px solid ${isAtual ? "var(--border)" : p.cor}`,
                  borderRadius: 10,
                  color: isAtual ? "var(--foreground-subtle)" : isUpgrade ? "#fff" : p.cor,
                  fontSize: 13, fontWeight: 600,
                  cursor: isAtual ? "default" : "pointer",
                  transition: "opacity .15s",
                }}
                onMouseEnter={e => !isAtual && ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
                onMouseLeave={e => !isAtual && ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                onClick={() => !isAtual && alert(`Entre em contato para assinar o plano ${p.nome}.`)}
              >
                {isAtual ? (
                  <><CheckCircle size={14} /> Plano atual</>
                ) : isUpgrade ? (
                  <>Fazer upgrade <ArrowRight size={14} /></>
                ) : (
                  <>Fazer downgrade</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparativo rápido */}
      <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Comparativo de limites</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--foreground-muted)", fontWeight: 500 }}>Recurso</th>
                {PLANOS.map(p => (
                  <th key={p.id} style={{ padding: "12px 16px", textAlign: "center", color: p.id === plano?.tipoPlano ? p.cor : "var(--foreground-muted)", fontWeight: p.id === plano?.tipoPlano ? 700 : 500 }}>
                    {p.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Duração", values: ["7 dias", "30 dias", "30 dias", "30 dias"] },
                { label: "Empresas", values: ["1", "1", "2", "Ilimitado"] },
                { label: "Caixas / empresa", values: ["1", "1", "3", "Ilimitado"] },
                { label: "Relatórios",  values: ["Básico", "Básico", "Completo", "Avançado"] },
                { label: "Suporte",     values: ["—", "E-mail", "Prioritário", "Dedicado 24h"] },
              ].map((row, i) => (
                <tr key={row.label} style={{ borderBottom: "1px solid var(--border-subtle)", background: i % 2 === 0 ? "transparent" : "var(--surface-overlay)" }}>
                  <td style={{ padding: "11px 20px", color: "var(--foreground-muted)", fontWeight: 500 }}>{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} style={{ padding: "11px 16px", textAlign: "center", color: PLANOS[j].id === plano?.tipoPlano ? "var(--foreground)" : "var(--foreground-muted)", fontWeight: PLANOS[j].id === plano?.tipoPlano ? 600 : 400 }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}