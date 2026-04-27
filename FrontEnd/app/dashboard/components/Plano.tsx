"use client";

import { useEffect, useState, Suspense, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2, CheckCircle2, Clock, Crown, Star, Rocket,
  FlaskConical, ArrowRight, AlertCircle, Loader2,
  ShieldCheck, Zap, Quote, Check
} from "lucide-react";
import { useEmpresa } from "../context/Empresacontext";
import { getToken } from "@/lib/auth-v2";

// =====================================================================
// 1. CONFIGURAÇÕES E API
// =====================================================================
const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const cleanUrl = envUrl.replace(/\/api\/v1\/?$/, '').replace(/\/v1\/?$/, '').replace(/\/$/, '');
  return `${cleanUrl}/api/nota-fiscal`;
};
const API_BASE = getApiBase();

const API_GLOBAL = process.env.NEXT_PUBLIC_API_URL ?? "https://gestpro-backend-production.up.railway.app";

async function fetchAuth<T>(path: string): Promise<T> {
  const token = await resolveToken();
  const res = await fetch(`${API_GLOBAL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

async function resolveToken() {
  try {
    const t = await getToken();
    if (t) return t;
  } catch (e) {}
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("jwt_token") || localStorage.getItem("token") || localStorage.getItem("access_token");
  }
  return null;
}

// =====================================================================
// 2. DEFINIÇÃO DOS PLANOS
// =====================================================================
const PLANOS = [
  {
    id: "EXPERIMENTAL", nome: "Experimental", descricao: "Explore todo o potencial da plataforma.",
    preco: "Grátis", duracao: "por 30 dias", icon: FlaskConical,
    corBase: "#6366f1", corBg: "rgba(99, 102, 241, 0.1)",
    features: ["1 empresa gerenciada", "1 frente de caixa (PDV)", "Até 300 produtos", "Relatórios e Dashboards", "Emissão de Nota Fiscal", "Histórico de 2 meses"],
    destaque: false, pagavel: false, cta: "Iniciar Teste"
  },
  {
    id: "BASICO", nome: "Básico", descricao: "A fundação sólida para pequenos negócios.",
    preco: "R$ 29,90", duracao: "por mês", icon: Star,
    corBase: "#3b82f6", corBg: "rgba(59, 130, 246, 0.1)",
    features: ["1 empresa gerenciada", "1 frente de caixa (PDV)", "Até 500 produtos", "Relatórios completos", "Histórico de 6 meses", "Controle de dívidas", "Suporte via e-mail"],
    destaque: false, pagavel: true, cta: "Assinar Básico"
  },
  {
    id: "PRO", nome: "Pro", descricao: "Ferramentas avançadas para quem quer crescer.",
    preco: "R$ 49,90", duracao: "por mês", icon: Rocket,
    corBase: "#10b981", corBg: "rgba(16, 185, 129, 0.1)",
    features: ["Até 5 empresas", "Até 5 frentes de caixa", "Produtos ilimitados", "Histórico de 1 ano", "Exportação PDF/CSV", "Backup automático", "Suporte prioritário"],
    destaque: true, pagavel: true, cta: "Escolher o Pro"
  },
  {
    id: "PREMIUM", nome: "Premium", descricao: "Poder absoluto para franquias e redes.",
    preco: "R$ 99,90", duracao: "por mês", icon: Crown,
    corBase: "#f59e0b", corBg: "rgba(245, 158, 11, 0.1)",
    features: ["Empresas ilimitadas", "Caixas ilimitados", "Histórico ilimitado", "Relatórios avançados", "API para integrações", "Backup automático", "Suporte dedicado 24h"],
    destaque: false, pagavel: true, cta: "Assinar Premium"
  }
] as const;

const ORDEM = ["EXPERIMENTAL", "BASICO", "PRO", "PREMIUM"] as const;
const DURACAO_TRIAL_DIAS = 30;

function barWidth(dias: number, total: number) { return total === 0 ? 0 : Math.min(100, Math.max(0, (dias / total) * 100)); }
function barColor(pct: number) { return pct > 50 ? "#10b981" : pct > 20 ? "#f59e0b" : "#ef4444"; }

// =====================================================================
// 3. COMPONENTE INTERNO
// =====================================================================
function PlanosInner() {
  const searchParams = useSearchParams();
  const [plano, setPlano] = useState<any>(null);
  const [emailUsuario, setEmailUsuario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPlano, setLoadingPlano] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [cancelado, setCancelado] = useState(false);
  
  // Controle de Efeitos Visuais no React
  const [hoverCard, setHoverCard] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("canceled") === "true") {
      setCancelado(true);
      globalThis.window.history.replaceState({}, "", "/dashboard/planos");
    }
  }, [searchParams]);

  useEffect(() => {
    const carregarDados = async () => {
      const token = await resolveToken();
      const headers: HeadersInit = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

      fetch(`${API_GLOBAL}/api/usuario`, { credentials: "include", headers })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((data) => setEmailUsuario(data.email ?? null)).catch(() => {});

      fetchAuth<any>("/api/v1/dashboard/vendas/plano-usuario")
        .then(setPlano).catch(() => {}).finally(() => setLoading(false));
    };
    carregarDados();
  }, []);

  async function handleAssinar(planoId: string) {
    if (!emailUsuario) { setErro("Não foi possível identificar seu e-mail. Recarregue a página."); return; }
    setErro(null); setLoadingPlano(planoId);

    try {
      const token = await resolveToken();
      const res = await fetch(`${API_GLOBAL}/api/payments/create-checkout-session`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ plano: planoId, customerEmail: emailUsuario }),
      });

      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data?.error ?? "Erro ao iniciar o checkout."); }
      const { url } = await res.json();
      globalThis.window.location.href = url;
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Não foi possível iniciar o checkout.");
      setLoadingPlano(null);
    }
  }

  const planoAtualIdx = plano ? ORDEM.indexOf(plano.tipoPlano as (typeof ORDEM)[number]) : -1;
  const pct = plano ? barWidth(plano.diasRestantes, DURACAO_TRIAL_DIAS) : 100;
  const planoAtual = PLANOS.find((p) => p.id === plano?.tipoPlano);
  const estaAtivo = plano?.statusAcesso === "ATIVO";

  // =====================================================================
  // RENDER (Estilos Nativos Blindados)
  // =====================================================================
  return (
    <div style={{ padding: "40px 24px 80px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 60, fontFamily: "system-ui, sans-serif", color: "#f8fafc" }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ textAlign: "center", maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "6px 14px", borderRadius: 99, fontSize: 13, fontWeight: 700, marginBottom: 24, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <Zap size={14} /> Atualize seu negócio hoje
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 16, background: "linear-gradient(to right, #ffffff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 16px 0" }}>
          Acelere o crescimento da sua empresa com o plano ideal
        </h1>
        <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
          De pequenos lojistas a grandes franquias. Escolha o poder de gestão que o seu negócio precisa para lucrar mais e perder menos tempo.
        </p>

        {erro && (
          <div style={{ marginTop: 24, padding: "14px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, color: "#ef4444", fontSize: 14, display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
            <AlertCircle size={18} /> {erro}
          </div>
        )}
        {cancelado && (
          <div style={{ marginTop: 24, padding: "14px 20px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, color: "#f59e0b", fontSize: 14, display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
            <AlertCircle size={18} /> Checkout cancelado. Fique à vontade para assinar quando estiver pronto.
          </div>
        )}
      </section>

      {/* 2. PLANO ATUAL BANNER */}
      {!loading && plano && planoAtual && (
        <section style={{ background: "#181a20", border: `1px solid ${planoAtual.corBase}44`, borderRadius: 20, padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: planoAtual.corBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <planoAtual.icon size={30} color={planoAtual.corBase} />
            </div>
            <div>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Seu plano atual</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#fff" }}>{planoAtual.nome}</h2>
                <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99, background: estaAtivo ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: estaAtivo ? "#10b981" : "#ef4444", border: `1px solid ${estaAtivo ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  {plano.statusAcesso === "ATIVO" ? "ATIVO" : "BLOQUEADO"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 250, maxWidth: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8" }}><Clock size={14} /> Ciclo de Faturamento</span>
              <span style={{ color: pct < 20 ? "#ef4444" : "#f8fafc" }}>{plano.diasRestantes} dias restantes</span>
            </div>
            <div style={{ height: 8, background: "#0f1115", borderRadius: 99, overflow: "hidden", border: "1px solid #272a30" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: barColor(pct), transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: 99 }} />
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#94a3b8", background: "#0f1115", border: "1px solid #272a30", padding: "12px 20px", borderRadius: 14 }}>
            <Building2 size={18} color={planoAtual.corBase} />
            <span>Lojas ativas: <strong style={{ color: "#fff" }}>{plano.empresasCriadas}</strong> / {plano.limiteEmpresas >= 99 ? "Ilimitado" : plano.limiteEmpresas}</span>
          </div>
        </section>
      )}

      {/* 3. GRID DE PLANOS */}
      <section className="pricing-grid-container">
        <style>{`
          .pricing-grid-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; align-items: stretch; }
          @media (max-width: 1024px) { .pricing-grid-container { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 640px) { .pricing-grid-container { grid-template-columns: 1fr; } }
        `}</style>
        
        {PLANOS.map((p, idx) => {
          const isAtual = p.id === plano?.tipoPlano;
          const isUpgrade = idx > planoAtualIdx && planoAtualIdx >= 0;
          const isLoading = loadingPlano === p.id;
          const isHovered = hoverCard === p.id;

          // Dinâmica de estilos baseada no Hover do React
          let cardStyle: React.CSSProperties = {
            background: isAtual ? "#181a20" : "#0f1115",
            border: `1px solid ${isAtual ? p.corBase : isHovered ? p.corBase : "#272a30"}`,
            borderRadius: 24, padding: "32px 24px", position: "relative",
            display: "flex", flexDirection: "column",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered && !isAtual ? "translateY(-8px)" : "translateY(0)",
            boxShadow: isHovered && !isAtual ? `0 20px 40px ${p.corBg}` : "none",
          };

          if (p.destaque) {
            cardStyle = {
              ...cardStyle,
              border: `2px solid ${p.corBase}`,
              background: "linear-gradient(180deg, #181a20 0%, #0f1115 100%)",
              transform: isHovered ? "scale(1.02) translateY(-8px)" : "scale(1.02)",
              boxShadow: isHovered ? `0 25px 50px ${p.corBg}` : `0 10px 30px ${p.corBg}`,
              zIndex: 10
            };
          }

          return (
            <div 
              key={p.id} 
              style={cardStyle}
              onMouseEnter={() => setHoverCard(p.id)}
              onMouseLeave={() => setHoverCard(null)}
            >
              {p.destaque && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: p.corBase, color: "#fff", padding: "6px 16px", borderRadius: 99, fontSize: 12, fontWeight: 800, letterSpacing: "0.5px", boxShadow: `0 4px 12px ${p.corBg}`, whiteSpace: "nowrap" }}>
                  MELHOR CUSTO-BENEFÍCIO
                </div>
              )}
              
              <div style={{ width: 52, height: 52, borderRadius: 14, background: p.corBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <p.icon size={26} color={p.corBase} />
              </div>
              
              <h3 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>{p.nome}</h3>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, minHeight: 42, lineHeight: 1.5 }}>{p.descricao}</p>
              
              <div style={{ fontSize: 38, fontWeight: 800, color: p.corBase, margin: "24px 0 8px", display: "flex", alignItems: "flex-end", gap: 4 }}>
                {p.preco}
                {p.preco !== "Grátis" && <span style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", paddingBottom: 8 }}>/mês</span>}
              </div>

              <button
                disabled={isAtual || isLoading || !p.pagavel}
                onClick={() => { if (!isAtual && !isLoading && p.pagavel) handleAssinar(p.id); }}
                style={{
                  width: "100%", padding: 16, marginTop: 16, marginBottom: 32, borderRadius: 12, fontSize: 14, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: isAtual || !p.pagavel || isLoading ? "default" : "pointer",
                  transition: "all 0.2s",
                  background: isAtual ? "#272a30" : p.destaque ? p.corBase : "transparent",
                  color: isAtual ? "#94a3b8" : p.destaque ? "#fff" : "#fff",
                  border: isAtual ? "none" : p.destaque ? "none" : `1px solid ${isHovered ? p.corBase : "#272a30"}`,
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Aguarde...</> 
                 : isAtual ? <><Check size={18} /> Plano Atual</> 
                 : !p.pagavel ? p.cta 
                 : <>{p.cta} {isUpgrade && <ArrowRight size={18} />}</>}
              </button>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 16px 0" }}>O que está incluído</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#cbd5e1", lineHeight: 1.4 }}>
                      <CheckCircle2 size={18} color={p.corBase} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </section>

      {/* 4. PROVA SOCIAL */}
      <section style={{ marginTop: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Empresas que confiam no GestPro</h3>
          <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>Junte-se a milhares de empreendedores que automatizaram suas vendas.</p>
        </div>
        <div className="trust-grid">
          <style>{`
            .trust-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
            @media (max-width: 768px) { .trust-grid { grid-template-columns: 1fr; } }
          `}</style>
          
          {[
            { cor: "#3b82f6", texto: "Depois que começamos a usar o plano Pro, nossa emissão de notas e gestão de estoque ficou totalmente automatizada. Economizamos horas toda semana.", autor: "Carlos M., Distribuidora" },
            { cor: "#10b981", texto: "A visão multi-lojas do Premium salvou a nossa franquia. Consigo ver o faturamento de todas as 4 unidades em tempo real na mesma tela.", autor: "Amanda T., Rede de Varejo" },
            { cor: "#f59e0b", texto: "Interface limpa, rápida e direto ao ponto. O controle de caixa me deu clareza sobre o dinheiro que estava parado no estoque.", autor: "Roberto F., Loja de Eletrônicos" }
          ].map((dep, i) => (
            <div key={i} style={{ background: "#181a20", padding: 32, borderRadius: 20, border: "1px solid #272a30" }}>
              <Quote size={28} color={dep.cor} style={{ marginBottom: 16, opacity: 0.8 }} />
              <p style={{ fontSize: 15, fontStyle: "italic", color: "#cbd5e1", marginBottom: 24, lineHeight: 1.6 }}>"{dep.texto}"</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>— {dep.autor}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TABELA DE COMPARAÇÃO */}
      <section style={{ marginTop: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Comparativo Detalhado</h3>
          <p style={{ color: "#94a3b8", fontSize: 16, margin: 0 }}>Descubra exatamente os limites e o poder de cada assinatura.</p>
        </div>
        <div style={{ overflowX: "auto", background: "#181a20", border: "1px solid #272a30", borderRadius: 24, padding: "8px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700, textAlign: "left" }}>
            <thead>
              <tr>
                <th style={{ padding: "24px", color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #272a30" }}>Recurso e Funcionalidade</th>
                {PLANOS.map((p) => (
                  <th key={p.id} style={{ padding: "24px", textAlign: "center", color: p.id === plano?.tipoPlano ? p.corBase : "#f8fafc", fontWeight: 800, borderBottom: "1px solid #272a30" }}>
                    {p.nome}
                    {p.id === plano?.tipoPlano && <div style={{ fontSize: 10, color: p.corBase, marginTop: 4, letterSpacing: "1px" }}>ATUAL</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Lojas Gerenciadas", values: ["1", "1", "5", "Ilimitado"] },
                { label: "Frentes de Caixa (PDV)", values: ["1", "1", "5", "Ilimitado"] },
                { label: "Limite de Produtos", values: ["300", "500", "Ilimitado", "Ilimitado"] },
                { label: "Histórico de Dados", values: ["2 Meses", "6 Meses", "1 Ano", "Vitalício"] },
                { label: "Emissão de Nota Fiscal", values: [true, true, true, true] },
                { label: "Controle de Dívidas (Fiado)", values: [false, true, true, true] },
                { label: "Exportação Avançada (PDF/CSV)", values: [false, false, true, true] },
                { label: "Backup Automático Nuvem", values: [false, false, true, true] },
                { label: "API de Integração", values: [false, false, false, true] },
                { label: "Nível de Suporte", values: ["—", "E-mail (48h)", "Prioritário (12h)", "Dedicado (24/7)"] },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: i === 9 ? "none" : "1px solid #272a30" }}>
                  <td style={{ padding: "20px 24px", color: "#cbd5e1", fontWeight: 500 }}>{row.label}</td>
                  {row.values.map((v, j) => (
                    <td key={j} style={{ padding: "20px 24px", textAlign: "center" }}>
                      {typeof v === "boolean" ? (
                        v ? <Check size={20} color="#10b981" style={{ margin: "0 auto" }} /> : <span style={{ color: "#475569" }}>—</span>
                      ) : (
                        <span style={{ fontWeight: PLANOS[j].id === plano?.tipoPlano ? 700 : 500, color: PLANOS[j].id === plano?.tipoPlano ? "#fff" : "#94a3b8" }}>{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. TRUST BADGE FOOTER */}
      <section style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", padding: "24px 32px", borderRadius: 20, maxWidth: 650 }}>
          <ShieldCheck size={48} color="#10b981" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 6px", color: "#10b981" }}>Pagamento Seguro e Sem Fidelidade</h4>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>
              Transações processadas com segurança militar. Você tem liberdade total para alterar seu plano ou cancelar sua assinatura a qualquer momento com um único clique.
            </p>
          </div>
        </div>
      </section>

      <style dangerouslySetInlineStyle={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}

export default function Planos() {
  return (
    <Suspense fallback={<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", color: "#94a3b8", gap: 16 }}><Loader2 size={32} className="animate-spin" /><p>Carregando as melhores opções para o seu negócio...</p></div>}>
      <PlanosInner />
    </Suspense>
  );
}