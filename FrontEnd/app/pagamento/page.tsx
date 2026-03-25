"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Crown,
  Star,
  Rocket,
  FlaskConical,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield,
  Zap,
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

// ─── Planos pagos disponíveis ─────────────────────────────────────────────────

const PLANOS_PAGOS = [
  {
    id: "BASICO",
    nome: "Básico",
    descricao: "Ideal para pequenos negócios",
    preco: "R$ 29,90",
    precoNum: 29.9,
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
  },
  {
    id: "PRO",
    nome: "Pro",
    descricao: "Para negócios em crescimento",
    preco: "R$ 49,90",
    precoNum: 49.9,
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
  },
  {
    id: "PREMIUM",
    nome: "Premium",
    descricao: "Para redes e franquias",
    preco: "R$ 99,90",
    precoNum: 99.9,
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
] as const;

// ─── Componente interno ───────────────────────────────────────────────────────

function PagamentoInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Plano pré-selecionado via query string (ex: /pagamento?plano=PRO)
  const planoQuery = searchParams.get("plano")?.toUpperCase() ?? "";
  const defaultPlano =
    PLANOS_PAGOS.find((p) => p.id === planoQuery)?.id ?? "PRO";

  const [planoSelecionado, setPlanoSelecionado] = useState<string>(defaultPlano);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [planoAtual, setPlanoAtual] = useState<PlanoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ── Busca dados do usuário e plano atual ──────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetchAuth<PlanoDTO>("/api/v1/dashboard/vendas/plano-usuario"),
      getUsuario(),
    ])
      .then(([planoData, usuario]) => {
        setPlanoAtual(planoData);
        setEmailUsuario(usuario.email);
      })
      .catch(() => {
        // falha silenciosa
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Checkout → redireciona para Stripe ───────────────────────────────────
  async function handleAssinar() {
    if (!emailUsuario) {
      setErro("Não foi possível identificar seu e-mail. Recarregue a página.");
      return;
    }

    setErro(null);
    setProcessando(true);

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
          plano: planoSelecionado,
          customerEmail: emailUsuario,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erro ao iniciar o checkout.");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Não foi possível iniciar o checkout.";
      setErro(msg);
      setProcessando(false);
    }
  }

  const plano = PLANOS_PAGOS.find((p) => p.id === planoSelecionado)!;
  const Icon = plano.icon;
  const planoAtualInativo = planoAtual?.statusAcesso === "INATIVO";

  return (
    <div
      style={{
        padding: "28px 28px 60px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        maxWidth: 860,
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
          Assinar plano
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--foreground-muted)",
            marginTop: 6,
          }}
        >
          {planoAtualInativo
            ? "Seu acesso está bloqueado. Escolha um plano para reativar."
            : "Escolha o plano ideal e continue no Stripe com segurança."}
        </p>
      </div>

      {/* Banner plano inativo */}
      {planoAtualInativo && (
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
          Seu período {planoAtual?.tipoPlano === "EXPERIMENTAL" ? "experimental" : "de acesso"} encerrou. Assine para retomar.
        </div>
      )}

      {/* Erro */}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>

        {/* ── Coluna esquerda: seleção de plano ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Label */}
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground-muted)", margin: 0, textTransform: "uppercase", letterSpacing: ".05em" }}>
            Escolha seu plano
          </p>

          {PLANOS_PAGOS.map((p) => {
            const selecionado = planoSelecionado === p.id;
            const PIcon = p.icon;

            return (
              <button
                key={p.id}
                onClick={() => setPlanoSelecionado(p.id)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  background: "var(--surface-elevated)",
                  border: `1.5px solid ${selecionado ? p.cor : "var(--border)"}`,
                  borderRadius: 14,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color .15s, transform .15s",
                }}
                onMouseEnter={(e) => {
                  if (!selecionado)
                    (e.currentTarget as HTMLButtonElement).style.borderColor = p.cor + "66";
                }}
                onMouseLeave={(e) => {
                  if (!selecionado)
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                }}
              >
                {/* Badge mais popular */}
                {p.destaque && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 20,
                      padding: "2px 10px",
                      background: p.cor,
                      color: "#fff",
                      borderRadius: 99,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    MAIS POPULAR
                  </div>
                )}

                {/* Ícone */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: selecionado ? p.corMuted : "var(--surface-overlay)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background .15s",
                  }}
                >
                  <PIcon size={20} color={selecionado ? p.cor : "var(--foreground-muted)"} />
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                    {p.nome}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "2px 0 0" }}>
                    {p.descricao}
                  </p>
                </div>

                {/* Preço */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: p.cor, margin: 0, lineHeight: 1 }}>
                    {p.preco}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "2px 0 0" }}>
                    {p.duracao}
                  </p>
                </div>

                {/* Check */}
                {selecionado && (
                  <CheckCircle
                    size={18}
                    color={p.cor}
                    style={{ flexShrink: 0, marginLeft: 8 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Coluna direita: resumo + CTA ──────────────────────────────── */}
        <div
          style={{
            width: 280,
            background: "var(--surface-elevated)",
            border: `1.5px solid ${plano.cor}44`,
            borderRadius: 16,
            padding: "22px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "sticky",
            top: 24,
          }}
        >
          {/* Header resumo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: plano.corMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={20} color={plano.cor} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
                Plano {plano.nome}
              </p>
              <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "2px 0 0" }}>
                {plano.descricao}
              </p>
            </div>
          </div>

          {/* Divisor */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plano.features.map((f) => (
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
                <CheckCircle size={14} color={plano.cor} style={{ flexShrink: 0, marginTop: 1 }} />
                {f}
              </div>
            ))}
          </div>

          {/* Divisor */}
          <div style={{ height: 1, background: "var(--border)" }} />

          {/* Total */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--foreground-muted)" }}>
                Cobrança mensal
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: plano.cor,
                  lineHeight: 1,
                }}
              >
                {plano.preco}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "4px 0 0", textAlign: "right" }}>
              Cancele quando quiser
            </p>
          </div>

          {/* Botão CTA */}
          <button
            onClick={handleAssinar}
            disabled={processando || loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 0",
              background: processando || loading ? "var(--surface-overlay)" : plano.cor,
              border: "none",
              borderRadius: 12,
              color: processando || loading ? "var(--foreground-subtle)" : "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: processando || loading ? "default" : "pointer",
              opacity: processando ? 0.8 : 1,
              transition: "opacity .15s, background .15s",
            }}
            onMouseEnter={(e) => {
              if (!processando && !loading)
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              if (!processando && !loading)
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
            }}
          >
            {processando ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Redirecionando...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Assinar via Stripe
                <ArrowRight size={14} />
              </>
            )}
          </button>

          {/* Selos de segurança */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              paddingTop: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--foreground-subtle)",
              }}
            >
              <Shield size={12} />
              Pagamento seguro
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--foreground-subtle)",
              }}
            >
              <Zap size={12} />
              Ativação imediata
            </div>
          </div>
        </div>
      </div>

      {/* Voltar */}
      <button
        onClick={() => router.push("/dashboard/planos")}
        style={{
          alignSelf: "flex-start",
          background: "none",
          border: "none",
          color: "var(--foreground-muted)",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        ← Ver todos os planos
      </button>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Export default com Suspense ──────────────────────────────────────────────

export default function Pagamento() {
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
          Carregando...
        </div>
      }
    >
      <PagamentoInner />
    </Suspense>
  );
}