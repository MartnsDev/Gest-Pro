"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Crown,
  Star,
  Rocket,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield,
  Zap,
  TrendingUp,
  Lock,
  RefreshCw,
  BarChart2,
  Users,
  Package,
} from "lucide-react";
import { getUsuario } from "@/lib/api-v2";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

// ─── Config ───────────────────────────────────────────────────────────────────

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gestpro-backend-production.up.railway.app";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("jwt_token") ?? "";
}

async function fetchAuth<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// ─── Dados estáticos ──────────────────────────────────────────────────────────

const PLANOS = [
  {
    id: "BASICO",
    nome: "Básico",
    tagline: "Para quem está começando",
    preco: "29,90",
    icon: Star,
    cor: "#3b82f6",
    corBg: "rgba(59,130,246,0.08)",
    corBorder: "rgba(59,130,246,0.25)",
    destaque: false,
    features: [
      "1 empresa / loja",
      "1 caixa registrador",
      "Dashboard completo",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
  },
  {
    id: "PRO",
    nome: "Pro",
    tagline: "O mais escolhido",
    preco: "49,90",
    icon: Rocket,
    cor: "#10b981",
    corBg: "rgba(16,185,129,0.08)",
    corBorder: "rgba(16,185,129,0.30)",
    destaque: true,
    features: [
      "5 empresas / lojas",
      "3 caixas por empresa",
      "Dashboard avançado",
      "Relatórios completos",
      "Suporte prioritário",
    ],
  },
  {
    id: "PREMIUM",
    nome: "Premium",
    tagline: "Para redes e franquias",
    preco: "99,90",
    icon: Crown,
    cor: "#f59e0b",
    corBg: "rgba(245,158,11,0.08)",
    corBorder: "rgba(245,158,11,0.25)",
    destaque: false,
    features: [
      "Empresas ilimitadas",
      "Caixas ilimitados",
      "Dashboard completo",
      "Relatórios avançados",
      "Suporte dedicado 24h",
    ],
  },
] as const;

type PlanoId = (typeof PLANOS)[number]["id"];

const BENEFICIOS = [
  { icon: BarChart2,  texto: "Vendas em tempo real"    },
  { icon: Package,    texto: "Estoque automatizado"    },
  { icon: Users,      texto: "Gestão de clientes"      },
  { icon: TrendingUp, texto: "Relatórios inteligentes" },
  { icon: Lock,       texto: "Dados 100% seguros"      },
  { icon: RefreshCw,  texto: "Cancele quando quiser"   },
];

// ─── Página principal ─────────────────────────────────────────────────────────
// Sem Suspense wrapper aqui — o layout pai já deve prover o Suspense se necessário.
// useSearchParams é lido uma única vez via useRef para não causar re-renders.

export default function Pagamento() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Lê query param UMA única vez na montagem → sem loop de re-render
  const initialPlano = useRef<PlanoId>(
    (PLANOS.find(
      (p) => p.id === (searchParams.get("plano")?.toUpperCase() ?? "")
    )?.id ?? "PRO") as PlanoId
  );

  const [selecionado,  setSelecionado]  = useState<PlanoId>(initialPlano.current);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [planoAtual,   setPlanoAtual]   = useState<PlanoDTO | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [processando,  setProcessando]  = useState(false);
  const [erro,         setErro]         = useState<string | null>(null);

  // ── Fetch único na montagem ───────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    Promise.all([
      fetchAuth<PlanoDTO>("/api/v1/dashboard/vendas/plano-usuario"),
      getUsuario(),
    ])
      .then(([planoData, usuario]) => {
        if (cancelado) return;
        setPlanoAtual(planoData);
        setEmailUsuario(usuario.email);
      })
      .catch(() => { /* silencioso */ })
      .finally(() => { if (!cancelado) setLoading(false); });

    return () => { cancelado = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Checkout ──────────────────────────────────────────────────────────────
  async function handleAssinar() {
    if (!emailUsuario) {
      setErro("Não foi possível identificar seu e-mail. Recarregue a página.");
      return;
    }
    setErro(null);
    setProcessando(true);

    try {
      const token = getToken();
      const res   = await fetch(`${API}/api/payments/create-checkout-session`, {
        method:      "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plano: selecionado, customerEmail: emailUsuario }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao iniciar o checkout.");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Não foi possível iniciar o checkout.");
      setProcessando(false);
    }
  }

  const plano       = PLANOS.find((p) => p.id === selecionado)!;
  const Icon        = plano.icon;
  const estaInativo = planoAtual?.statusAcesso === "INATIVO";

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 920 }}>

      {/* ── Cabeçalho marketing ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 12px", borderRadius: 99, marginBottom: 14,
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
        }}>
          <TrendingUp size={13} color="#10b981" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", letterSpacing: ".04em" }}>
            GESTÃO PROFISSIONAL
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--foreground)", margin: "0 0 8px", lineHeight: 1.25 }}>
          Transforme sua loja em uma{" "}
          <span style={{ color: "#10b981" }}>máquina de vendas</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--foreground-muted)", margin: 0, maxWidth: 500 }}>
          Controle estoque, vendas e clientes em um só lugar.
          {estaInativo && " Seu acesso expirou — escolha um plano e retome agora."}
        </p>
      </div>

      {/* ── Banners de alerta ─────────────────────────────────────────────── */}
      {estaInativo && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 16px", marginBottom: 20,
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12, fontSize: 13, color: "var(--destructive)",
        }}>
          <AlertCircle size={15} />
          Seu período {planoAtual?.tipoPlano === "EXPERIMENTAL" ? "experimental" : "de acesso"} encerrou. Assine para retomar o acesso.
        </div>
      )}

      {erro && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "11px 16px", marginBottom: 20,
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12, fontSize: 13, color: "var(--destructive)",
        }}>
          <AlertCircle size={15} />
          {erro}
        </div>
      )}

      {/* ── Layout principal ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        {/* ── Coluna esquerda ──────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Seleção de planos */}
          <div style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground-muted)", margin: 0, textTransform: "uppercase", letterSpacing: ".06em" }}>
                Escolha seu plano
              </p>
            </div>

            {PLANOS.map((p, i) => {
              const sel   = selecionado === p.id;
              const PIcon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelecionado(p.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 20px", border: "none",
                    borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    borderLeft: sel ? `3px solid ${p.cor}` : "3px solid transparent",
                    background: sel ? p.corBg : "transparent",
                    cursor: "pointer", textAlign: "left",
                    transition: "background .12s, border-color .12s",
                  }}
                >
                  {/* Ícone */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: sel ? p.corBg : "var(--surface-overlay)",
                    border: `1px solid ${sel ? p.corBorder : "transparent"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .12s",
                  }}>
                    <PIcon size={18} color={sel ? p.cor : "var(--foreground-muted)"} />
                  </div>

                  {/* Nome + tagline */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: sel ? "var(--foreground)" : "var(--foreground-muted)" }}>
                        {p.nome}
                      </span>
                      {p.destaque && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px",
                          background: p.cor, color: "#fff", borderRadius: 99,
                        }}>
                          POPULAR
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: "var(--foreground-subtle)" }}>
                      {p.tagline}
                    </span>
                  </div>

                  {/* Preço */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 19, fontWeight: 800, color: sel ? p.cor : "var(--foreground-muted)", margin: 0, lineHeight: 1 }}>
                      R$ {p.preco}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "2px 0 0" }}>/mês</p>
                  </div>

                  {/* Radio */}
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${sel ? p.cor : "var(--border)"}`,
                    background: sel ? p.cor : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .12s",
                  }}>
                    {sel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Benefícios */}
          <div style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 16, padding: "18px 20px",
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground-muted)", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: ".06em" }}>
              Incluso em todos os planos
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {BENEFICIOS.map(({ icon: BIcon, texto }) => (
                <div key={texto} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--foreground-muted)" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                    background: "rgba(16,185,129,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <BIcon size={13} color="#10b981" />
                  </div>
                  {texto}
                </div>
              ))}
            </div>
          </div>

          {/* Prova social */}
          <div style={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 16, padding: "18px 20px",
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #10b981, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#fff",
            }}>
              M
            </div>
            <div>
              <p style={{ fontSize: 13, color: "var(--foreground)", margin: "0 0 5px", fontStyle: "italic", lineHeight: 1.5 }}>
                "Antes eu perdia vendas por falta de controle. Com o GestPro, organizo tudo em minutos."
              </p>
              <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: 0, fontWeight: 600 }}>
                Marcos Oliveira · Loja de Eletrônicos, SP
              </p>
            </div>
          </div>

        </div>

        {/* ── Coluna direita: resumo ────────────────────────────────────────── */}
        <div style={{ width: 272, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            background: "var(--surface-elevated)",
            border: `1.5px solid ${plano.corBorder}`,
            borderRadius: 16, padding: "20px",
            display: "flex", flexDirection: "column", gap: 16,
          }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                background: plano.corBg, border: `1px solid ${plano.corBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={19} color={plano.cor} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                  Plano {plano.nome}
                </p>
                <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "2px 0 0" }}>
                  {plano.tagline}
                </p>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {plano.features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--foreground-muted)" }}>
                  <CheckCircle size={13} color={plano.cor} style={{ flexShrink: 0, marginTop: 1 }} />
                  {f}
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: "var(--border)" }} />

            {/* Preço */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>Cobrança mensal</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: plano.cor, lineHeight: 1 }}>
                  R$ {plano.preco}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "3px 0 0", textAlign: "right" }}>
                Sem multa por cancelamento
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleAssinar}
              disabled={processando || loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 0", border: "none", borderRadius: 12,
                background: processando || loading ? "var(--surface-overlay)" : plano.cor,
                color: processando || loading ? "var(--foreground-subtle)" : "#fff",
                fontSize: 14, fontWeight: 700,
                cursor: processando || loading ? "not-allowed" : "pointer",
                boxShadow: processando || loading ? "none" : `0 4px 18px ${plano.cor}40`,
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => {
                if (!processando && !loading)
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
              }}
              onMouseLeave={(e) => {
                if (!processando && !loading)
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
              }}
            >
              {loading ? (
                <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Carregando...</>
              ) : processando ? (
                <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Redirecionando...</>
              ) : (
                <><CreditCard size={14} /> Assinar agora <ArrowRight size={13} /></>
              )}
            </button>

            {/* Selos */}
            <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--foreground-subtle)" }}>
                <Shield size={11} /> Pagamento seguro
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--foreground-subtle)" }}>
                <Zap size={11} /> Ativação imediata
              </div>
            </div>

            <p style={{ fontSize: 11, color: "var(--foreground-subtle)", textAlign: "center", margin: 0 }}>
              Processado via <strong style={{ color: "var(--foreground-muted)" }}>Stripe</strong>
            </p>
          </div>

          {/* Voltar */}
          <button
            onClick={() => router.push("/dashboard/planos")}
            style={{
              background: "none", border: "none",
              color: "var(--foreground-muted)", fontSize: 13,
              cursor: "pointer", padding: "6px 0",
              textDecoration: "underline", textUnderlineOffset: 3,
              width: "100%",
            }}
          >
            ← Ver todos os planos
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}