"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUsuario } from "@/lib/api";
import {
  CheckCircle2, Crown, Rocket,
  Star, FlaskConical, ArrowRight, Loader2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── Config visual por plano ──────────────────────────────────────────────────

const PLANO_CONFIG: Record<string, {
  nome: string; cor: string; corMuted: string;
  icon: React.ElementType; mensagem: string;
}> = {
  BASICO: {
    nome: "Básico", cor: "#3b82f6", corMuted: "rgba(59,130,246,0.12)", icon: Star,
    mensagem: "Agora você pode gerenciar sua empresa e caixa com total controle.",
  },
  PRO: {
    nome: "Pro", cor: "#10b981", corMuted: "rgba(16,185,129,0.12)", icon: Rocket,
    mensagem: "Você desbloqueou até 5 empresas e 3 caixas por empresa. Escale seu negócio!",
  },
  PREMIUM: {
    nome: "Premium", cor: "#f59e0b", corMuted: "rgba(245,158,11,0.12)", icon: Crown,
    mensagem: "Empresas e caixas ilimitados com suporte dedicado 24h. Bem-vindo ao topo!",
  },
  EXPERIMENTAL: {
    nome: "Experimental", cor: "#6366f1", corMuted: "rgba(99,102,241,0.12)", icon: FlaskConical,
    mensagem: "Seu período de teste está ativo. Explore tudo que o GestPro oferece!",
  },
};

// Mapa de Price ID → PlanoTipo (mesmos valores do backend PlanoTipo.java)
// Assim não dependemos do banco estar atualizado — lemos direto da sessão Stripe
const PRICE_ID_PARA_PLANO: Record<string, string> = {
  "price_1TDnfQDclXzxI403gm63pKl2": "BASICO",
  "price_1TDnmuDclXzxI403u86yx5Fp":  "PRO",
  "price_1TDnnSDclXzxI403l0d9hAk0":  "PREMIUM",
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PagamentoSucessoPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const sessionId    = searchParams.get("session_id");

  const [nomeUsuario, setNomeUsuario] = useState("");
  const [tipoPlano,   setTipoPlano]   = useState("");
  const [loading,     setLoading]     = useState(true);
  const [contador,    setContador]    = useState(8);

  useEffect(() => {
    async function carregar() {
      try {
        // 1. Busca o nome do usuário imediatamente (não depende do plano)
        const usuario = await getUsuario();
        setNomeUsuario(usuario.nome?.split(" ")[0] ?? "");

        // 2. Se tem session_id, consulta o backend para saber qual plano foi contratado
        //    O endpoint retorna o Price ID da sessão Stripe, sem depender do webhook
        if (sessionId) {
          try {
            const res = await fetch(
              `${API}/api/payments/session-info?sessionId=${sessionId}`,
              { credentials: "include" }
            );
            if (res.ok) {
              const data = await res.json();
              // data.priceId → converte para nome do plano
              const plano = PRICE_ID_PARA_PLANO[data.priceId] ?? usuario.tipoPlano;
              setTipoPlano(plano);
              return; // já tem o plano, não precisa fazer polling
            }
          } catch {
            // fallback: usa o tipoPlano do usuário
          }
        }

        // 3. Fallback: polling — tenta até 5x com 1.5s de intervalo
        //    aguarda o webhook ativar o plano no banco
        let tentativas = 0;
        const poll = async () => {
          tentativas++;
          const u = await getUsuario();
          const planoAtualizado = u.tipoPlano !== "EXPERIMENTAL"
            ? u.tipoPlano
            : usuario.tipoPlano;

          if (planoAtualizado !== "EXPERIMENTAL" || tentativas >= 5) {
            setTipoPlano(planoAtualizado ?? "BASICO");
          } else {
            setTimeout(poll, 1500);
          }
        };

        // Espera 1s antes do primeiro poll
        setTimeout(poll, 1000);

      } catch {
        setTipoPlano("BASICO");
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [sessionId]);

  // Countdown → redireciona para /dashboard com flag de toast
  useEffect(() => {
    if (loading) return;
    const iv = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          clearInterval(iv);
          router.push("/dashboard?payment=success");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [loading, router]);

  const config = PLANO_CONFIG[tipoPlano] ?? PLANO_CONFIG["BASICO"];
  const Icon   = config.icon;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--background)",
        flexDirection: "column", gap: 16,
      }}>
        <Loader2 size={32} color="var(--primary)"
          style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: "var(--foreground-muted)", margin: 0 }}>
          Confirmando seu pagamento…
        </p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Sucesso ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--background)", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
      }}>

        {/* Ícone de check animado */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "rgba(16,185,129,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "popIn .4s cubic-bezier(.175,.885,.32,1.275)",
        }}>
          <CheckCircle2 size={44} color="#10b981" strokeWidth={1.8} />
        </div>

        {/* Card principal */}
        <div style={{
          width: "100%", background: "var(--surface-elevated)",
          border: `1px solid ${config.cor}33`, borderRadius: 20,
          padding: "32px 28px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
          textAlign: "center", boxShadow: `0 0 40px ${config.cor}18`,
        }}>

          {/* Ícone + nome do plano */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: config.corMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={26} color={config.cor} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "0 0 4px" }}>
                Plano ativado
              </p>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: config.cor, margin: 0, lineHeight: 1 }}>
                {config.nome}
              </h1>
            </div>
          </div>

          <div style={{ width: "100%", height: 1, background: "var(--border)" }} />

          {/* Agradecimento */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
              {nomeUsuario ? `Obrigado, ${nomeUsuario}! 🎉` : "Pagamento confirmado! 🎉"}
            </h2>
            <p style={{ fontSize: 14, color: "var(--foreground-muted)", margin: 0, lineHeight: 1.6 }}>
              {config.mensagem}
            </p>
          </div>

          <div style={{ width: "100%", height: 1, background: "var(--border)" }} />

          {/* Detalhes */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Status",         valor: "Ativo",                        cor: "#10b981" },
              { label: "Cobrança",       valor: "Mensal automática via Stripe", cor: undefined },
              { label: "Próxima fatura", valor: "Em 30 dias",                   cor: undefined },
            ].map(item => (
              <div key={item.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "var(--surface-overlay)",
                borderRadius: 10, fontSize: 13,
              }}>
                <span style={{ color: "var(--foreground-muted)" }}>{item.label}</span>
                <span style={{ fontWeight: 600, color: item.cor ?? "var(--foreground)" }}>
                  {item.valor}
                </span>
              </div>
            ))}
          </div>

          {/* Botão */}
          <button
            onClick={() => router.push("/dashboard?payment=success")}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "13px 0", background: config.cor,
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", transition: "opacity .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Ir para o Dashboard <ArrowRight size={16} />
          </button>

          <p style={{ fontSize: 12, color: "var(--foreground-subtle)", margin: "-8px 0 0" }}>
            Redirecionando em{" "}
            <span style={{ fontWeight: 600, color: "var(--foreground-muted)" }}>{contador}s</span>
          </p>
        </div>

        <p style={{ fontSize: 12, color: "var(--foreground-subtle)", textAlign: "center", margin: 0 }}>
          Dúvidas?{" "}
          <a href="mailto:gestprosuporte@gmail.com"
            style={{ color: "var(--primary)", textDecoration: "none" }}>
            gestprosuporte@gmail.com
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)} }
        @keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}