"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getUsuario } from "@/lib/api-v2";
import {
  Building2,
  CheckCircle,
  Clock,
  Crown,
  Star,
  Rocket,
  FlaskConical,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
  empresasCriadas: number;
  limiteEmpresas: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

// ─── Helpers de fetch ─────────────────────────────────────────────────────────

const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gestpro-backend-production.up.railway.app";

function getToken(): string {
  if (typeof globalThis.window === "undefined") return "";
  return globalThis.localStorage.getItem("jwt_token") ?? "";
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

// ─── Definição dos planos ─────────────────────────────────────────────────────

const PLANOS = [
  {
    id: "EXPERIMENTAL",
    nome: "Experimental",
    descricao: "Para experimentar o GestPro",
    preco: null,
    duracao: "30 dias grátis",
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
    pagavel: false,
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
      "1 caixa",
      "Dashboard completo",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
    destaque: false,
    pagavel: true,
  },
  {
    id: "PRO",
    nome: "Pro",
    descricao: "Para negócios em crescimento",
    preco: "R$ 49,90",
    duracao: "por mês",
    icon: Rocket,
    cor: "#10b981",
    corMuted: "rgba(16,185,129,0.12)",
    features: [
      "5 empresas / lojas",
      "3 caixas por empresa",
      "Dashboard avançado",
      "Relatórios completos",
      "Suporte prioritário",
    ],
    destaque: true,
    pagavel: true,
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
    pagavel: true,
  },
] as const;

const ORDEM = ["EXPERIMENTAL", "BASICO", "PRO", "PREMIUM"] as const;

// ─── Duração do trial — deve bater com TipoPlano.EXPERIMENTAL.duracaoDiasPadrao
const DURACAO_TRIAL_DIAS = 30;

// ─── Helpers visuais ──────────────────────────────────────────────────────────

function barWidth(dias: number, total: number) {
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, (dias / total) * 100));
}

function barColor(pct: number) {
  if (pct > 50) return "var(--primary)";
  if (pct > 20) return "var(--warning)";
  return "var(--destructive)";
}

// ─── Componente interno ───────────────────────────────────────────────────────

function PlanosInner() {
  const searchParams = useSearchParams();

  const [plano, setPlano] = useState<PlanoDTO | null>(null);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlano, setLoadingPlano] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelado, setCancelado] = useState(false);

  // ── Detecta retorno cancelado da Stripe ───────────────────────────────────
  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      setCancelado(true);
      globalThis.window.history.replaceState({}, "", "/dashboard/planos");
    }
  }, [searchParams]);

  // ── Busca dados separados: email (nunca 403) + plano (pode 403) ───────────
  // Email vem de /usuario/me — endpoint público autenticado, sem checagem de plano.
  // Plano vem separado para que a falha não impeça o botão de assinar.
  useEffect(() => {
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Email: nunca retorna 403 por plano inativo
    fetch(`${API}/api/v1/usuario/me`, { credentials: "include", headers })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setEmailUsuario(data.email ?? null))
      .catch(() => {}); // silencioso — erro aparece ao clicar

    // Plano: pode retornar 403; tratamos silenciosamente
    fetchAuth<PlanoDTO>("/api/v1/dashboard/vendas/plano-usuario")
      .then(setPlano)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Checkout → redireciona para Stripe ───────────────────────────────────
  async function handleAssinar(planoId: string) {
    if (!emailUsuario) {
      setErro("Não foi possível identificar seu e-mail. Recarregue a página.");
      return;
    }

    setErro(null);
    setLoadingPlano(planoId);

    try {
      const token = getToken();

      const res = await fetch(`${API}/api/payments/create-checkout-session`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          plano: planoId,
          customerEmail: emailUsuario,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao iniciar o checkout.");
      }

      const { url } = await res.json();
      globalThis.window.location.href = url;
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Não foi possível iniciar o checkout.";
      setErro(msg);
      setLoadingPlano(null);
    }
  }

  // ── Derivações ─────────────────────────────────────────────────────────────
  const planoAtualIdx =
    plano ? ORDEM.indexOf(plano.tipoPlano as (typeof ORDEM)[number]) : -1;

  // Para planos pagos, a duração real vem da Stripe (sempre 30 dias/mês).
  // Para EXPERIMENTAL, usa a constante local que espelha o enum do backend.
  const duracaoTotal = DURACAO_TRIAL_DIAS; // 30 para todos

  const pct = plano ? barWidth(plano.diasRestantes, duracaoTotal) : 100;
  const planoAtual = PLANOS.find((p) => p.id === plano?.tipoPlano);
  const estaAtivo = plano?.statusAcesso === "ATIVO";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        padding: "28px 28px 60px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        maxWidth: 900,
      }}
    >
      {/* Cabeçalho */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          Planos & Assinaturas
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--foreground-muted)",
            marginTop: 6,
          }}
        >
          Gerencie seu plano e expanda o que seu negócio pode fazer.
        </p>
      </div>

      {/* Erro global */}
      {erro && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "var(--destructive-muted)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10,
            fontSize: 13,
            color: "var(--destructive)",
          }}
        >
          <AlertCircle size={14} />
          {erro}
        </div>
      )}

      {/* Banner de cancelamento */}
      {cancelado && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10,
            fontSize: 13,
            color: "#d97706",
          }}
        >
          <AlertCircle size={14} />
          Pagamento cancelado. Você pode assinar quando quiser.
        </div>
      )}

      {/* Card do plano atual */}
      {loading ? (
        <div
          style={{
            height: 160,
            background: "var(--surface-elevated)",
            borderRadius: 16,
            border: "1px solid var(--border)",
          }}
          className="skeleton"
        />
      ) : plano && planoAtual ? (
        <div
          style={{
            background: "var(--surface-elevated)",
            border: `1px solid ${planoAtual.cor}44`,
            borderRadius: 16,
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Título + preço */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: planoAtual.corMuted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <planoAtual.icon size={22} color={planoAtual.cor} />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--foreground)",
                      margin: 0,
                    }}
                  >
                    Plano {planoAtual.nome}
                  </p>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 99,
                      background: estaAtivo
                        ? planoAtual.corMuted
                        : "rgba(239,68,68,0.12)",
                      color: estaAtivo
                        ? planoAtual.cor
                        : "var(--destructive)",
                    }}
                  >
                    {plano.statusAcesso}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--foreground-muted)",
                    margin: "3px 0 0",
                  }}
                >
                  {planoAtual.descricao}
                </p>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: planoAtual.cor,
                  margin: 0,
                }}
              >
                {planoAtual.preco ?? "Gratuito"}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  margin: "2px 0 0",
                }}
              >
                {planoAtual.duracao}
              </p>
            </div>
          </div>

          {/* Barra de tempo */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Clock size={12} /> Tempo restante
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color:
                    pct < 20
                      ? "var(--destructive)"
                      : "var(--foreground)",
                }}
              >
                {plano.diasRestantes}{" "}
                {plano.diasRestantes === 1 ? "dia" : "dias"}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "var(--surface-overlay)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: barColor(pct),
                  borderRadius: 99,
                  transition: "width .6s ease",
                }}
              />
            </div>
          </div>

          {/* Uso */}
          <div style={{ display: "flex", gap: 20, paddingTop: 4 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                color: "var(--foreground-muted)",
              }}
            >
              <Building2 size={14} color={planoAtual.cor} />
              <span>
                {plano.empresasCriadas} /{" "}
                {plano.limiteEmpresas >= 99 ? "∞" : plano.limiteEmpresas}{" "}
                empresas
              </span>
            </div>
          </div>

          {/* Alertas */}
          {pct < 20 && estaAtivo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                background: "var(--destructive-muted)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--destructive)",
              }}
            >
              <AlertCircle size={14} />
              Seu plano expira em breve. Renove para não perder o acesso.
            </div>
          )}
          {!estaAtivo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                background: "var(--destructive-muted)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--destructive)",
              }}
            >
              <AlertCircle size={14} />
              Seu acesso está bloqueado. Assine um plano para reativar.
            </div>
          )}
        </div>
      ) : null}

      {/* Separador */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        <span
          style={{
            fontSize: 12,
            color: "var(--foreground-subtle)",
            textTransform: "uppercase",
            letterSpacing: ".07em",
            whiteSpace: "nowrap",
          }}
        >
          Todos os planos
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {/* Grid de planos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {PLANOS.map((p, idx) => {
          const isAtual = p.id === plano?.tipoPlano;
          const isUpgrade = idx > planoAtualIdx && planoAtualIdx >= 0;
          const isLoading = loadingPlano === p.id;
          const Icon = p.icon;

          return (
            <div
              key={p.id}
              style={{
                position: "relative",
                background: "var(--surface-elevated)",
                border: `1px solid ${
                  isAtual
                    ? p.cor + "66"
                    : p.destaque
                    ? p.cor + "33"
                    : "var(--border)"
                }`,
                borderRadius: 16,
                padding: "22px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                transition: "transform .18s, border-color .18s",
              }}
              onMouseEnter={(e) => {
                if (!isAtual)
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                if (!isAtual)
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
              }}
            >
              {p.destaque && (
                <div
                  style={{
                    position: "absolute",
                    top: -11,
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "3px 14px",
                    background: p.cor,
                    color: "#fff",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  MAIS POPULAR
                </div>
              )}

              {isAtual && (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    padding: "2px 8px",
                    background: p.corMuted,
                    color: p.cor,
                    borderRadius: 99,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  ATUAL
                </div>
              )}

              <div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: p.corMuted,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon size={20} color={p.cor} />
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--foreground)",
                    margin: 0,
                  }}
                >
                  {p.nome}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--foreground-muted)",
                    margin: "3px 0 0",
                  }}
                >
                  {p.descricao}
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: p.cor,
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {p.preco ?? "Grátis"}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--foreground-subtle)",
                    margin: "4px 0 0",
                  }}
                >
                  {p.duracao}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flex: 1,
                }}
              >
                {p.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--foreground-muted)",
                    }}
                  >
                    <CheckCircle
                      size={14}
                      color={p.cor}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    {f}
                  </div>
                ))}
              </div>

              <button
                disabled={isAtual || isLoading || !p.pagavel}
                style={{
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 0",
                  background:
                    isAtual || !p.pagavel
                      ? "var(--surface-overlay)"
                      : isUpgrade
                      ? p.cor
                      : "transparent",
                  border: `1px solid ${
                    isAtual || !p.pagavel ? "var(--border)" : p.cor
                  }`,
                  borderRadius: 10,
                  color:
                    isAtual || !p.pagavel
                      ? "var(--foreground-subtle)"
                      : isUpgrade
                      ? "#fff"
                      : p.cor,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    isAtual || !p.pagavel || isLoading ? "default" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  transition: "opacity .15s",
                }}
                onMouseEnter={(e) => {
                  if (!isAtual && !isLoading && p.pagavel)
                    (e.currentTarget as HTMLButtonElement).style.opacity =
                      "0.85";
                }}
                onMouseLeave={(e) => {
                  if (!isAtual && !isLoading && p.pagavel)
                    (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                }}
                onClick={() => {
                  if (!isAtual && !isLoading && p.pagavel)
                    handleAssinar(p.id);
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Aguarde...
                  </>
                ) : isAtual ? (
                  <>
                    <CheckCircle size={14} /> Plano atual
                  </>
                ) : !p.pagavel ? (
                  <>Plano gratuito</>
                ) : isUpgrade ? (
                  <>
                    Fazer upgrade <ArrowRight size={14} />
                  </>
                ) : (
                  <>Fazer downgrade</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tabela comparativa */}
      <div
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Comparativo de limites
          </p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    color: "var(--foreground-muted)",
                    fontWeight: 500,
                  }}
                >
                  Recurso
                </th>
                {PLANOS.map((p) => (
                  <th
                    key={p.id}
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      color:
                        p.id === plano?.tipoPlano
                          ? p.cor
                          : "var(--foreground-muted)",
                      fontWeight: p.id === plano?.tipoPlano ? 700 : 500,
                    }}
                  >
                    {p.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                // EXPERIMENTAL tem 30 dias de trial, planos pagos são mensais (30 dias via Stripe)
                {
                  label: "Duração",
                  values: ["30 dias", "Mensal", "Mensal", "Mensal"],
                },
                { label: "Empresas", values: ["1", "1", "5", "Ilimitado"] },
                { label: "Caixas", values: ["1", "1", "3", "Ilimitado"] },
                {
                  label: "Relatórios",
                  values: ["Básico", "Básico", "Completo", "Avançado"],
                },
                {
                  label: "Suporte",
                  values: ["—", "E-mail", "Prioritário", "Dedicado 24h"],
                },
              ].map((row, i) => (
                <tr
                  key={row.label}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background:
                      i % 2 === 0
                        ? "transparent"
                        : "var(--surface-overlay)",
                  }}
                >
                  <td
                    style={{
                      padding: "11px 20px",
                      color: "var(--foreground-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {row.label}
                  </td>
                  {row.values.map((v, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "11px 16px",
                        textAlign: "center",
                        color:
                          PLANOS[j].id === plano?.tipoPlano
                            ? "var(--foreground)"
                            : "var(--foreground-muted)",
                        fontWeight:
                          PLANOS[j].id === plano?.tipoPlano ? 600 : 400,
                      }}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Export default com Suspense ──────────────────────────────────────────────

export default function Planos() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            color: "var(--foreground-muted)",
            fontSize: 14,
          }}
        >
          Carregando planos...
        </div>
      }
    >
      <PlanosInner />
    </Suspense>
  );
}