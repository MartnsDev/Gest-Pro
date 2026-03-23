"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Feature {
  icon: string;
  title: string;
  desc: string;
  tag: string;
  stat: string;
}

interface Plan {
  name: string;
  price: string;
  period?: string;
  desc: string;
  features: string[];
  highlight: boolean;
  cta: string;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const FEATURES: Feature[] = [
  { icon: "⬡", title: "Frente de Caixa", desc: "PDV completo com pagamento misto, troco automático e emissão de cupom.", tag: "PDV", stat: "< 3s por venda" },
  { icon: "⬢", title: "Controle de Estoque", desc: "Cada venda deduz automaticamente. Alertas de mínimo antes do problema acontecer.", tag: "ESTOQUE", stat: "Tempo real" },
  { icon: "◈", title: "Relatórios Reais", desc: "Receita, lucro, ticket médio. Exporte em PDF, CSV ou HTML com gráficos.", tag: "DADOS", stat: "4 formatos" },
  { icon: "◎", title: "Multi-empresa", desc: "Várias empresas com um único login. Dados completamente isolados.", tag: "ESCALA", stat: "Ilimitadas" },
  { icon: "◉", title: "Clientes & Vendas", desc: "Histórico completo, CPF, CNPJ. Vincule clientes às vendas em segundos.", tag: "CRM", stat: "360° view" },
  { icon: "⬟", title: "Segurança Total", desc: "JWT HttpOnly, OAuth2 Google, troca por código. Sem atalhos de segurança.", tag: "AUTH", stat: "Enterprise" },
];

const PLANS: Plan[] = [
  { name: "Experimental", price: "Grátis", desc: "Para conhecer o sistema", features: ["7 dias", "1 empresa", "1 caixa", "Relatórios básicos"], highlight: false, cta: "Começar grátis" },
  { name: "Básico", price: "R$ 29", period: "/mês", desc: "Para negócios em início", features: ["30 dias", "1 empresa", "1 caixa", "Todos relatórios"], highlight: false, cta: "Assinar Básico" },
  { name: "Pro", price: "R$ 59", period: "/mês", desc: "Para quem está crescendo", features: ["30 dias", "2 empresas", "3 caixas", "Exportação avançada"], highlight: true, cta: "Assinar Pro" },
  { name: "Premium", price: "R$ 99", period: "/mês", desc: "Sem limites operacionais", features: ["30 dias", "Ilimitadas", "Ilimitados", "Suporte prioritário"], highlight: false, cta: "Assinar Premium" },
];

const STATS = [
  { value: 3, suffix: "s", label: "para registrar uma venda" },
  { value: 100, suffix: "%", label: "dos dados em tempo real" },
  { value: 4, suffix: "x", label: "formas de pagamento" },
  { value: 23, suffix: "k", label: "vendas processadas" },
];

/* ─── Hooks ──────────────────────────────────────────────────────────────── */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCount(target: number, active: boolean, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

/* ─── Background ─────────────────────────────────────────────────────────── */
function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "#030305",
      }} />
      {/* Grid de pontos */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(16,185,129,0.15) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }} />
      {/* Glow principal */}
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: 800, height: 800,
        background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />
      {/* Glow secundário */}
      <div style={{
        position: "absolute", bottom: "10%", right: "-10%",
        width: 600, height: 600,
        background: "radial-gradient(ellipse, rgba(5,150,105,0.06) 0%, transparent 70%)",
        filter: "blur(80px)",
      }} />
      {/* Linhas horizontais scan */}
      <div style={{
        position: "absolute", inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
      }} />
    </div>
  );
}

/* ─── Nav ────────────────────────────────────────────────────────────────── */
function Nav({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      height: 68,
      display: "flex", alignItems: "center",
      padding: "0 clamp(24px, 5vw, 80px)",
      background: scrolled ? "rgba(3,3,5,0.88)" : "transparent",
      backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
      borderBottom: scrolled ? "1px solid rgba(16,185,129,0.1)" : "1px solid transparent",
      transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.9"/>
          <rect x="17" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.4"/>
          <rect x="4" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.4"/>
          <rect x="17" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.7"/>
        </svg>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
          Gest<span style={{ color: "#10b981" }}>Pro</span>
        </span>
      </div>

      {/* Links */}
      <div style={{ display: "flex", gap: 36, alignItems: "center" }}>
        {["Funcionalidades", "Planos", "Sobre"].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{
            fontSize: 13, color: "rgba(241,245,249,0.45)", textDecoration: "none",
            letterSpacing: "0.02em", fontFamily: "'DM Mono', monospace",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f1f5f9")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,245,249,0.45)")}>
            {item}
          </a>
        ))}
      </div>

      {/* Ações */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
        <button onClick={onLogin} style={{
          background: "transparent", border: "1px solid rgba(241,245,249,0.12)",
          color: "rgba(241,245,249,0.6)", padding: "9px 20px",
          fontSize: 13, fontFamily: "'DM Mono', monospace", borderRadius: 6,
          cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"; e.currentTarget.style.color = "#10b981"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(241,245,249,0.12)"; e.currentTarget.style.color = "rgba(241,245,249,0.6)"; }}>
          Entrar
        </button>
        <button onClick={onRegister} style={{
          background: "#10b981", border: "none",
          color: "#030305", padding: "9px 20px",
          fontSize: 13, fontFamily: "'DM Mono', monospace", borderRadius: 6,
          cursor: "pointer", fontWeight: 700, letterSpacing: "0.02em", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#34d399"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.transform = "translateY(0)"; }}>
          Começar grátis →
        </button>
      </div>
    </nav>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────────── */
function Hero({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "120px clamp(24px, 6vw, 120px) 80px",
      position: "relative", zIndex: 2, textAlign: "center",
    }}>
      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 14px 6px 8px",
        border: "1px solid rgba(16,185,129,0.2)", borderRadius: 99,
        background: "rgba(16,185,129,0.05)",
        marginBottom: 48,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0s",
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%", background: "#10b981",
          boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
          animation: "pulse 2s ease infinite",
          display: "inline-block",
        }} />
        <span style={{ fontSize: 12, color: "#10b981", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
          Em desenvolvimento ativo
        </span>
        <span style={{ fontSize: 12, color: "rgba(241,245,249,0.3)", fontFamily: "'DM Mono', monospace" }}>
          — 7 dias grátis
        </span>
      </div>

      {/* Título principal */}
      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(52px, 8vw, 108px)",
        lineHeight: 0.95,
        letterSpacing: "-0.04em",
        color: "#f1f5f9",
        maxWidth: 900,
        marginBottom: 0,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s",
      }}>
        Gestão que
        <br />
        <span style={{
          backgroundImage: "linear-gradient(135deg, #10b981 0%, #34d399 40%, #6ee7b7 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          simplifica.
        </span>
      </h1>

      {/* Subtítulo */}
      <p style={{
        fontSize: "clamp(15px, 1.8vw, 19px)",
        color: "rgba(241,245,249,0.45)",
        maxWidth: 520,
        lineHeight: 1.75,
        margin: "32px 0 48px",
        fontFamily: "'DM Mono', monospace",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.22s",
      }}>
        PDV, estoque, caixa e relatórios em um sistema só.
        <span style={{ color: "rgba(16,185,129,0.8)" }}> Para quem não tem tempo a perder.</span>
      </p>

      {/* CTAs */}
      <div style={{
        display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.34s",
      }}>
        <button onClick={onRegister} style={{
          background: "#10b981", border: "none", color: "#030305",
          padding: "16px 40px", fontSize: 14, fontWeight: 700,
          fontFamily: "'DM Mono', monospace", borderRadius: 8,
          cursor: "pointer", letterSpacing: "0.05em", transition: "all 0.3s",
          boxShadow: "0 0 40px rgba(16,185,129,0.25)",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#34d399"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(16,185,129,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(16,185,129,0.25)"; }}>
          → Começar grátis
        </button>
        <button onClick={onLogin} style={{
          background: "transparent", border: "1px solid rgba(241,245,249,0.12)",
          color: "rgba(241,245,249,0.65)", padding: "16px 40px",
          fontSize: 14, fontFamily: "'DM Mono', monospace", borderRadius: 8,
          cursor: "pointer", letterSpacing: "0.03em", transition: "all 0.3s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.35)"; e.currentTarget.style.color = "#10b981"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(241,245,249,0.12)"; e.currentTarget.style.color = "rgba(241,245,249,0.65)"; }}>
          Já tenho conta
        </button>
      </div>

      {/* Trust badges */}
      <div style={{
        display: "flex", gap: 32, marginTop: 56, flexWrap: "wrap", justifyContent: "center",
        opacity: mounted ? 1 : 0,
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.48s",
      }}>
        {["JWT + OAuth2", "Dados isolados", "Exportação completa"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(241,245,249,0.25)", fontFamily: "'DM Mono', monospace" }}>
            <span style={{ color: "rgba(16,185,129,0.5)", fontSize: 8 }}>◆</span>
            {item}
          </div>
        ))}
      </div>

      {/* Dashboard mockup */}
      <DashboardMockup mounted={mounted} />
    </section>
  );
}

/* ─── Dashboard Mockup ───────────────────────────────────────────────────── */
function DashboardMockup({ mounted }: { mounted: boolean }) {
  return (
    <div style={{
      marginTop: 96, width: "100%", maxWidth: 960,
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0) perspective(1200px) rotateX(0deg)" : "translateY(40px) perspective(1200px) rotateX(4deg)",
      transition: "all 1.2s cubic-bezier(0.16,1,0.3,1) 0.5s",
      position: "relative",
    }}>
      {/* Glow sob o card */}
      <div style={{
        position: "absolute", bottom: -40, left: "15%", right: "15%", height: 80,
        background: "rgba(16,185,129,0.12)", filter: "blur(40px)", borderRadius: "50%",
      }} />

      <div style={{
        border: "1px solid rgba(16,185,129,0.12)",
        borderRadius: 16, overflow: "hidden",
        background: "rgba(8,8,12,0.9)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 100px 200px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset",
      }}>
        {/* Barra topo */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.01)",
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["rgba(239,68,68,0.7)", "rgba(245,158,11,0.7)", "rgba(16,185,129,0.7)"].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{
            flex: 1, height: 22, maxWidth: 300, margin: "0 auto",
            background: "rgba(255,255,255,0.04)", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace",
          }}>
            gestpro.com.br/dashboard
          </div>
          <div style={{ width: 60 }} />
        </div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", height: 380 }}>
          {/* Sidebar */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.04)", padding: "20px 12px", background: "rgba(255,255,255,0.005)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, padding: "0 8px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}>Martins Essentials</span>
            </div>
            {["Dashboard", "Produtos", "Vendas", "Clientes", "Relatórios", "Empresas"].map((item, i) => (
              <div key={item} style={{
                padding: "9px 12px", borderRadius: 6, marginBottom: 2,
                background: i === 0 ? "rgba(16,185,129,0.1)" : "transparent",
                fontSize: 12,
                color: i === 0 ? "#10b981" : "rgba(255,255,255,0.2)",
                fontFamily: "'DM Mono', monospace",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ opacity: 0.6, fontSize: 10 }}>
                  {["▣", "◫", "◉", "◎", "◈", "⬡"][i]}
                </span>
                {item}
              </div>
            ))}
          </div>

          {/* Conteúdo */}
          <div style={{ padding: 24, overflow: "hidden" }}>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "RECEITA HOJE", value: "R$ 134,48", color: "#10b981" },
                { label: "LUCRO MÊS", value: "R$ 297,50", color: "#34d399" },
                { label: "VENDAS", value: "23", color: "#6ee7b7" },
                { label: "ESTOQUE", value: "4 produtos", color: "#f59e0b" },
              ].map((kpi, i) => (
                <div key={i} style={{
                  padding: "14px 16px", borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.015)",
                }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>{kpi.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: kpi.color, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.03em" }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Gráfico */}
            <div style={{
              border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8,
              padding: "16px 20px", background: "rgba(255,255,255,0.01)", marginBottom: 14,
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginBottom: 14, fontFamily: "'DM Mono', monospace" }}>VENDAS DIÁRIAS</div>
              <svg width="100%" height="80" viewBox="0 0 500 80" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,70 C60,70 80,50 120,40 C160,30 180,55 230,35 C280,15 300,45 350,25 C390,10 420,35 500,20 L500,80 L0,80 Z" fill="url(#g1)" />
                <path d="M0,70 C60,70 80,50 120,40 C160,30 180,55 230,35 C280,15 300,45 350,25 C390,10 420,35 500,20" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.9" />
                {[[120, 40], [230, 35], [350, 25], [500, 20]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill="#10b981" opacity="0.8" />
                ))}
              </svg>
            </div>

            {/* Ações rápidas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {["Nova Venda", "Produto", "Cliente", "Relatório"].map((a, i) => (
                <div key={i} style={{
                  padding: "10px", borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: i === 0 ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.01)",
                  fontSize: 10, color: i === 0 ? "#10b981" : "rgba(255,255,255,0.25)",
                  fontFamily: "'DM Mono', monospace", textAlign: "center",
                }}>
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats ──────────────────────────────────────────────────────────────── */
function Stats() {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} style={{ position: "relative", zIndex: 2, borderTop: "1px solid rgba(16,185,129,0.08)", borderBottom: "1px solid rgba(16,185,129,0.08)", background: "rgba(16,185,129,0.02)" }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {STATS.map((s, i) => {
          const count = useCount(s.value, inView);
          return (
            <div key={i} style={{
              padding: "56px 40px", textAlign: "center",
              borderRight: i < 3 ? "1px solid rgba(16,185,129,0.08)" : "none",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`,
            }}>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 60, letterSpacing: "-0.04em", lineHeight: 1,
                color: "#f1f5f9", marginBottom: 8,
              }}>
                {count}{s.suffix}
              </div>
              <div style={{ fontSize: 12, color: "rgba(241,245,249,0.3)", letterSpacing: "0.08em", fontFamily: "'DM Mono', monospace" }}>
                {s.label.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────────────────────────── */
function Features() {
  const { ref, inView } = useInView();
  return (
    <section id="funcionalidades" ref={ref} style={{ padding: "120px clamp(24px, 6vw, 80px)", position: "relative", zIndex: 2 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          marginBottom: 72,
          opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontSize: 11, color: "rgba(16,185,129,0.7)", letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
            FUNCIONALIDADES
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 60px)", letterSpacing: "-0.04em", color: "#f1f5f9", lineHeight: 1.05, maxWidth: 560 }}>
            Tudo que você precisa.<br />
            <span style={{ color: "rgba(241,245,249,0.2)" }}>Nada que não usa.</span>
          </h2>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.08)", borderRadius: 12, overflow: "hidden" }}>
          {FEATURES.map((feat, i) => (
            <FeatureCard key={i} feat={feat} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feat, index, inView }: { feat: Feature; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "36px 32px",
        background: hovered ? "rgba(16,185,129,0.05)" : "rgba(3,3,5,0.95)",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${index * 70}ms`,
        cursor: "default", position: "relative", overflow: "hidden",
      }}>
      {/* Top border glow on hover */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: hovered ? "linear-gradient(90deg, transparent, #10b981, transparent)" : "transparent",
        transition: "background 0.4s",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <span style={{ fontSize: 32, color: hovered ? "#10b981" : "rgba(16,185,129,0.5)", transition: "color 0.3s" }}>{feat.icon}</span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(16,185,129,0.4)", fontFamily: "'DM Mono', monospace", padding: "3px 8px", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 4 }}>
            {feat.tag}
          </span>
          <span style={{ fontSize: 10, color: hovered ? "#10b981" : "rgba(241,245,249,0.2)", fontFamily: "'DM Mono', monospace", transition: "color 0.3s" }}>
            {feat.stat}
          </span>
        </div>
      </div>

      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 10, letterSpacing: "-0.02em" }}>{feat.title}</h3>
      <p style={{ fontSize: 13, color: "rgba(241,245,249,0.4)", lineHeight: 1.75, fontFamily: "'DM Mono', monospace" }}>{feat.desc}</p>
    </div>
  );
}

/* ─── How It Works ───────────────────────────────────────────────────────── */
function HowItWorks() {
  const { ref, inView } = useInView();
  const steps = [
    { n: "01", title: "Crie sua conta", desc: "Email + senha ou Google OAuth2. Confirmação imediata, sem burocracia." },
    { n: "02", title: "Cadastre a empresa", desc: "Nome fantasia e CNPJ. Sistema pronto para operar em minutos." },
    { n: "03", title: "Abra o caixa", desc: "Informe o saldo inicial e comece a registrar vendas em segundos." },
    { n: "04", title: "Analise os dados", desc: "Cada venda alimenta dashboards em tempo real. Exportação instantânea." },
  ];

  return (
    <section style={{ padding: "120px clamp(24px, 6vw, 80px)", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          marginBottom: 80,
          opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontSize: 11, color: "rgba(16,185,129,0.7)", letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
            COMO FUNCIONA
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-0.04em", color: "#f1f5f9", lineHeight: 1.05 }}>
            Zero a controle total<br />
            <span style={{ color: "rgba(241,245,249,0.2)" }}>em 4 passos.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, position: "relative" }}>
          {/* Linha conectora */}
          <div style={{
            position: "absolute", top: 28, left: "6%", right: "6%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.25) 20%, rgba(16,185,129,0.25) 80%, transparent)",
          }} />

          {steps.map((step, i) => (
            <div key={i} style={{
              padding: "0 28px",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(32px)",
              transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`,
              position: "relative",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "1px solid rgba(16,185,129,0.35)",
                background: "#030305",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 28, fontSize: 14, fontWeight: 700,
                color: "#10b981", fontFamily: "'DM Mono', monospace",
              }}>
                {step.n}
              </div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 10, letterSpacing: "-0.02em" }}>{step.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(241,245,249,0.4)", lineHeight: 1.75, fontFamily: "'DM Mono', monospace" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Plans ──────────────────────────────────────────────────────────────── */
function Plans({ onRegister }: { onRegister: () => void }) {
  const { ref, inView } = useInView();
  return (
    <section id="planos" ref={ref} style={{ padding: "120px clamp(24px, 6vw, 80px)", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          marginBottom: 72,
          opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(24px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontSize: 11, color: "rgba(16,185,129,0.7)", letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>PLANOS</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 5vw, 56px)", letterSpacing: "-0.04em", color: "#f1f5f9", lineHeight: 1.05 }}>
            Comece grátis.<br />
            <span style={{ color: "rgba(241,245,249,0.2)" }}>Cresça sem limites.</span>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {PLANS.map((plan, i) => (
            <PlanCard key={i} plan={plan} index={i} inView={inView} onRegister={onRegister} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({ plan, index, inView, onRegister }: { plan: Plan; index: number; inView: boolean; onRegister: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "32px 28px",
        border: `1px solid ${plan.highlight ? "rgba(16,185,129,0.4)" : hovered ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12,
        background: plan.highlight ? "rgba(16,185,129,0.05)" : hovered ? "rgba(255,255,255,0.01)" : "transparent",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        opacity: inView ? 1 : 0,
        transitionDelay: `${index * 80}ms`,
        position: "relative",
      }}>
      {plan.highlight && (
        <div style={{
          position: "absolute", top: -1, left: "20%", right: "20%", height: 2,
          background: "linear-gradient(90deg, transparent, #10b981, transparent)",
          borderRadius: 2,
        }} />
      )}
      {plan.highlight && (
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#10b981", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
          ★ MAIS POPULAR
        </div>
      )}
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{plan.name}</div>
      <div style={{ fontSize: 12, color: "rgba(241,245,249,0.3)", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>{plan.desc}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 28 }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: plan.highlight ? "#10b981" : "#f1f5f9" }}>{plan.price}</span>
        {plan.period && <span style={{ fontSize: 13, color: "rgba(241,245,249,0.3)", fontFamily: "'DM Mono', monospace" }}>{plan.period}</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {plan.features.map((feat, j) => (
          <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(241,245,249,0.5)", fontFamily: "'DM Mono', monospace" }}>
            <span style={{ color: "#10b981", fontSize: 10, flexShrink: 0 }}>✓</span>
            {feat}
          </div>
        ))}
      </div>

      <button onClick={onRegister} style={{
        width: "100%", padding: "12px",
        background: plan.highlight ? "#10b981" : "transparent",
        border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
        color: plan.highlight ? "#030305" : "rgba(241,245,249,0.6)",
        fontSize: 13, fontWeight: plan.highlight ? 700 : 500,
        fontFamily: "'DM Mono', monospace", borderRadius: 8,
        cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.2s",
      }}
        onMouseEnter={e => {
          if (plan.highlight) { e.currentTarget.style.background = "#34d399"; }
          else { e.currentTarget.style.borderColor = "rgba(16,185,129,0.35)"; e.currentTarget.style.color = "#10b981"; }
        }}
        onMouseLeave={e => {
          if (plan.highlight) { e.currentTarget.style.background = "#10b981"; }
          else { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(241,245,249,0.6)"; }
        }}>
        {plan.cta}
      </button>
    </div>
  );
}

/* ─── About ──────────────────────────────────────────────────────────────── */
function About() {
  const { ref, inView } = useInView();
  const stack = [
    { name: "Spring Boot 3", desc: "Backend + Segurança", dot: "#6DB33F" },
    { name: "Next.js 16", desc: "Frontend + App Router", dot: "#f1f5f9" },
    { name: "MySQL 8", desc: "Banco Relacional", dot: "#4479A1" },
    { name: "JWT + OAuth2", desc: "Autenticação", dot: "#10b981" },
    { name: "TypeScript", desc: "Tipagem Estática", dot: "#3178C6" },
    { name: "Redis", desc: "Cache & Sessions", dot: "#DC382D" },
  ];

  return (
    <section id="sobre" ref={ref} style={{ padding: "120px clamp(24px, 6vw, 80px)", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div style={{ opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(-32px)", transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
          <div style={{ fontSize: 11, color: "rgba(16,185,129,0.7)", letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>SOBRE O PROJETO</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", letterSpacing: "-0.04em", color: "#f1f5f9", lineHeight: 1.1, marginBottom: 24 }}>
            Construído por quem<br />entende o problema.
          </h2>
          <p style={{ fontSize: 14, color: "rgba(241,245,249,0.45)", lineHeight: 1.9, fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
            O GestPro nasceu da observação de uma lacuna real: pequenos comerciantes usam planilhas frágeis ou sistemas complexos demais para a sua realidade.
          </p>
          <p style={{ fontSize: 14, color: "rgba(241,245,249,0.45)", lineHeight: 1.9, fontFamily: "'DM Mono', monospace", marginBottom: 36 }}>
            Desenvolvido por <span style={{ color: "#10b981" }}>Matheus Martins</span> — arquitetura Java/Spring Boot + Next.js, focada em solidez e experiência de uso real.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "LinkedIn", href: "https://www.linkedin.com/in/matheusmartnsdev/" },
              { label: "Instagram", href: "https://www.instagram.com/gestpro.app/" },
            ].map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                padding: "10px 20px", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(241,245,249,0.5)", fontSize: 12, fontFamily: "'DM Mono', monospace",
                borderRadius: 8, textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.35)"; e.currentTarget.style.color = "#10b981"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(241,245,249,0.5)"; }}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
          opacity: inView ? 1 : 0, transform: inView ? "none" : "translateX(32px)",
          transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s",
        }}>
          {stack.map((tech, i) => (
            <div key={i} style={{
              padding: "20px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.01)",
              transition: "all 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.2)"; e.currentTarget.style.background = "rgba(16,185,129,0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.01)"; }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: tech.dot, marginBottom: 10 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9", fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>{tech.name}</div>
              <div style={{ fontSize: 11, color: "rgba(241,245,249,0.3)", fontFamily: "'DM Mono', monospace" }}>{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA Final ──────────────────────────────────────────────────────────── */
function CTAFinal({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} style={{ padding: "140px clamp(24px, 6vw, 80px)", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1000, height: 500, background: "radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{
        position: "relative", maxWidth: 680, margin: "0 auto",
        opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ fontSize: 11, color: "rgba(16,185,129,0.7)", letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace", marginBottom: 28 }}>COMECE AGORA</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(44px, 7vw, 80px)", letterSpacing: "-0.04em", lineHeight: 0.95, color: "#f1f5f9", marginBottom: 28 }}>
          Sem planilha.<br />
          <span style={{ color: "#10b981" }}>Sem desculpa.</span>
        </h2>
        <p style={{ fontSize: 15, color: "rgba(241,245,249,0.4)", marginBottom: 52, lineHeight: 1.7, fontFamily: "'DM Mono', monospace" }}>
          7 dias grátis, sem cartão de crédito. Seu negócio com controle real em menos de 5 minutos.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onRegister} style={{
            background: "#10b981", border: "none", color: "#030305",
            padding: "18px 52px", fontSize: 14, fontWeight: 700,
            fontFamily: "'DM Mono', monospace", borderRadius: 8,
            cursor: "pointer", letterSpacing: "0.05em",
            boxShadow: "0 0 60px rgba(16,185,129,0.3)", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#34d399"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.transform = "translateY(0)"; }}>
            → Criar conta grátis
          </button>
          <button onClick={onLogin} style={{
            background: "transparent", border: "1px solid rgba(241,245,249,0.12)",
            color: "rgba(241,245,249,0.6)", padding: "18px 52px",
            fontSize: 14, fontFamily: "'DM Mono', monospace", borderRadius: 8,
            cursor: "pointer", letterSpacing: "0.03em", transition: "all 0.3s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.35)"; e.currentTarget.style.color = "#10b981"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(241,245,249,0.12)"; e.currentTarget.style.color = "rgba(241,245,249,0.6)"; }}>
            Fazer login
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      padding: "36px clamp(24px, 6vw, 80px)",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexWrap: "wrap", gap: 16, position: "relative", zIndex: 2,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.6"/>
          <rect x="17" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.3"/>
          <rect x="4" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.3"/>
          <rect x="17" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.5"/>
        </svg>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "rgba(241,245,249,0.4)" }}>GestPro</span>
        <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>© 2025 Matheus Martins</span>
      </div>
      <div style={{ display: "flex", gap: 28 }}>
        {["LinkedIn", "Instagram", "GitHub"].map(link => (
          <a key={link} href="#" style={{ fontSize: 12, color: "rgba(241,245,249,0.25)", textDecoration: "none", fontFamily: "'DM Mono', monospace", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(241,245,249,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,245,249,0.25)")}>
            {link}
          </a>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "'DM Mono', monospace" }}>
        Em desenvolvimento ativo
      </div>
    </footer>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const toLogin = useCallback(() => router.push("/auth/login"), [router]);
  const toRegister = useCallback(() => router.push("/auth/cadastro"), [router]);

  return (
    <div style={{ background: "#030305", color: "#f1f5f9", minHeight: "100vh", overflowX: "hidden" }}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(16,185,129,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #030305; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 2px; }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.05); }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      <Background />
      <Nav onLogin={toLogin} onRegister={toRegister} />
      <Hero onRegister={toRegister} onLogin={toLogin} />
      <Stats />
      <Features />
      <HowItWorks />
      <Plans onRegister={toRegister} />
      <About />
      <CTAFinal onRegister={toRegister} onLogin={toLogin} />
      <Footer />
    </div>
  );
}