"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Dados ──────────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: "◈",
    title: "Frente de Caixa",
    desc: "PDV completo com pagamento misto, troco automático e emissão de cupom. Tão rápido quanto precisa ser.",
    tag: "PDV",
  },
  {
    icon: "◉",
    title: "Controle de Estoque",
    desc: "Cada venda deduz, cada cancelamento repõe. Alertas de estoque mínimo antes do problema acontecer.",
    tag: "ESTOQUE",
  },
  {
    icon: "◫",
    title: "Relatórios Reais",
    desc: "Receita, lucro, ticket médio, pico de horário. Exporte em PDF, CSV ou HTML com gráficos.",
    tag: "DADOS",
  },
  {
    icon: "◌",
    title: "Multi-empresa",
    desc: "Gerencie várias empresas com um único login. Dados completamente isolados por operação.",
    tag: "ESCALA",
  },
  {
    icon: "◧",
    title: "Clientes & Fornecedores",
    desc: "Histórico completo, CPF, CNPJ, contatos. Vincule clientes às vendas em segundos.",
    tag: "CRM",
  },
  {
    icon: "◎",
    title: "Segurança Real",
    desc: "JWT em cookie HttpOnly, OAuth2 com Google, troca de senha por código. Sem atalhos.",
    tag: "SEGURO",
  },
];

const PLANS = [
  { name: "Experimental", price: "Grátis", days: "7 dias", empresas: "1 empresa", caixas: "1 caixa", highlight: false },
  { name: "Básico", price: "R$ 29", period: "/mês", days: "30 dias", empresas: "1 empresa", caixas: "1 caixa", highlight: false },
  { name: "Pro", price: "R$ 59", period: "/mês", days: "30 dias", empresas: "2 empresas", caixas: "3 caixas", highlight: true },
  { name: "Premium", price: "R$ 99", period: "/mês", days: "30 dias", empresas: "Ilimitadas", caixas: "Ilimitados", highlight: false },
];

const METRICS = [
  { value: "0", suffix: "s", label: "para registrar uma venda" },
  { value: "100", suffix: "%", label: "dos dados em tempo real" },
  { value: "4", suffix: "x", label: "formas de pagamento" },
  { value: "∞", suffix: "", label: "relatórios exportáveis" },
];

/* ─── Hook: Intersection Observer ────────────────────────────────────────── */
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Componente: Cursor personalizado ───────────────────────────────────── */
function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dot.current) {
        dot.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };
    let raf: number;
    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (ring.current) {
        ring.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(animate);

    const addHover = () => { if (ring.current) ring.current.style.scale = "2"; };
    const removeHover = () => { if (ring.current) ring.current.style.scale = "1"; };
    document.querySelectorAll("a,button,[data-hover]").forEach(el => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dot} style={{ position: "fixed", width: 8, height: 8, borderRadius: "50%", background: "#10b981", pointerEvents: "none", zIndex: 9999, top: 0, left: 0, transition: "transform 0.05s linear" }} />
      <div ref={ring} style={{ position: "fixed", width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(16,185,129,0.5)", pointerEvents: "none", zIndex: 9998, top: 0, left: 0, transition: "scale 0.3s ease" }} />
    </>
  );
}

/* ─── Componente: Partículas de fundo ────────────────────────────────────── */
function GridBG() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }} />
      {/* Gradient orbs */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)", filter: "blur(40px)" }} />
      {/* Scan line */}
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)", pointerEvents: "none" }} />
    </div>
  );
}

/* ─── Componente: Contador animado ───────────────────────────────────────── */
function Counter({ value, suffix }: { value: string; suffix: string }) {
  const [display, setDisplay] = useState("0");
  const { ref, visible } = useVisible();

  useEffect(() => {
    if (!visible || isNaN(Number(value))) { setDisplay(value); return; }
    const end = Number(value);
    let start = 0;
    const duration = 1500;
    const step = duration / end;
    const timer = setInterval(() => {
      start += Math.ceil(end / 30);
      if (start >= end) { setDisplay(String(end)); clearInterval(timer); }
      else setDisplay(String(start));
    }, step);
    return () => clearInterval(timer);
  }, [visible, value]);

  return (
    <span ref={ref} style={{ display: "inline" }}>{display}{suffix}</span>
  );
}

/* ─── Componente: Linha de ticker ────────────────────────────────────────── */
function Ticker() {
  const items = ["CONTROLE DE CAIXA", "GESTÃO DE ESTOQUE", "RELATÓRIOS EM TEMPO REAL", "MULTI-EMPRESA", "EMISSÃO DE CUPOM", "ANÁLISE DE LUCRO", "PDV COMPLETO", "OAUTH2 GOOGLE"];
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", borderTop: "1px solid rgba(16,185,129,0.15)", borderBottom: "1px solid rgba(16,185,129,0.15)", padding: "14px 0", background: "rgba(16,185,129,0.02)" }}>
      <div style={{ display: "flex", gap: 60, animation: "ticker 30s linear infinite", whiteSpace: "nowrap" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(16,185,129,0.6)", fontFamily: "'DM Mono', monospace" }}>
            {item} <span style={{ color: "rgba(16,185,129,0.3)", marginLeft: 30 }}>—</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Componente: Card de feature ────────────────────────────────────────── */
function FeatureCard({ feat, index }: { feat: typeof FEATURES[0]; index: number }) {
  const { ref, visible } = useVisible();
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding: "32px", borderRadius: 2,
        border: `1px solid ${hovered ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`,
        background: hovered ? "rgba(16,185,129,0.04)" : "rgba(255,255,255,0.01)",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${index * 80}ms`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Glow no hover */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: hovered ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)" : "transparent", transition: "background 0.4s" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <span style={{ fontSize: 28, color: "rgba(16,185,129,0.8)", lineHeight: 1 }}>{feat.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "rgba(16,185,129,0.4)", fontFamily: "'DM Mono', monospace", padding: "4px 8px", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 2 }}>
          {feat.tag}
        </span>
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", margin: "0 0 12px", letterSpacing: "-0.02em", fontFamily: "'Syne', sans-serif" }}>{feat.title}</h3>
      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: 0, fontFamily: "'DM Mono', monospace" }}>{feat.desc}</p>
    </div>
  );
}

/* ─── Página Principal ────────────────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  const heroParallax = -scrollY * 0.3;

  return (
    <div style={{ background: "#050507", color: "#f8fafc", minHeight: "100vh", fontFamily: "'DM Mono', monospace", overflowX: "hidden" }}>
      <Cursor />
      <GridBG />

      {/* ── Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(16,185,129,0.3); color: #fff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #050507; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.4); }

        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }

        .hero-title {
          animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .hero-sub {
          animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.25s both;
        }
        .hero-cta {
          animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.4s both;
        }
        .hero-badge {
          animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0s both;
        }

        .btn-primary {
          background: #10b981;
          color: #000;
          border: none;
          padding: 16px 36px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          border-radius: 2px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          text-transform: uppercase;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.15);
          transform: translateX(-100%);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .btn-primary:hover::before { transform: translateX(0); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(16,185,129,0.3); }
        .btn-primary:active { transform: translateY(0); }

        .btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 16px 36px;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          border-radius: 2px;
          transition: all 0.3s;
        }
        .btn-ghost:hover {
          border-color: rgba(16,185,129,0.4);
          color: #10b981;
          background: rgba(16,185,129,0.04);
        }

        .nav-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.1em;
          transition: color 0.2s;
          font-family: 'DM Mono', monospace;
          cursor: pointer;
        }
        .nav-link:hover { color: rgba(255,255,255,0.9); }

        .plan-card {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 2px;
          padding: 36px;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          background: rgba(255,255,255,0.01);
          cursor: default;
        }
        .plan-card:hover {
          border-color: rgba(16,185,129,0.35);
          background: rgba(16,185,129,0.03);
          transform: translateY(-4px);
        }
        .plan-card.highlight {
          border-color: rgba(16,185,129,0.5);
          background: rgba(16,185,129,0.05);
        }

        .metric-item {
          transition: all 0.3s;
        }
        .metric-item:hover {
          transform: scale(1.05);
        }

        .faq-item {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }

        .dashboard-preview {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 48px",
        height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrollY > 40 ? "rgba(5,5,7,0.92)" : "transparent",
        backdropFilter: scrollY > 40 ? "blur(20px)" : "none",
        borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, border: "1.5px solid #10b981", borderRadius: 6, transform: "rotate(45deg)" }} />
            <div style={{ position: "absolute", inset: 6, background: "#10b981", borderRadius: 2, transform: "rotate(45deg)" }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: "#f8fafc" }}>
            Gest<span style={{ color: "#10b981" }}>Pro</span>
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {["Funcionalidades", "Planos", "Sobre"].map(link => (
            <a key={link} className="nav-link" href={`#${link.toLowerCase()}`}>{link}</a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn-ghost" onClick={() => router.push("/auth/login")} style={{ padding: "10px 24px" }}>
            Entrar
          </button>
          <button className="btn-primary" onClick={() => router.push("/auth/cadastro")} style={{ padding: "10px 24px" }}>
            Começar grátis
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 48px 80px", position: "relative", textAlign: "center" }}>

        {/* Mouse glow */}
        <div style={{
          position: "fixed", pointerEvents: "none", zIndex: 1,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)",
          transform: `translate(${mousePos.x - 200}px, ${mousePos.y - 200}px)`,
          transition: "transform 0.15s ease",
        }} />

        {/* Badge */}
        <div className="hero-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 99, background: "rgba(16,185,129,0.06)", marginBottom: 40, position: "relative", zIndex: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#10b981", fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", animation: "blink 2s ease infinite" }} />
            Em desenvolvimento ativo
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.06em" }}>— experimente grátis por 7 dias</span>
        </div>

        {/* Título */}
        <h1 className="hero-title" style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(48px, 7vw, 96px)",
          lineHeight: 1.0,
          letterSpacing: "-0.04em",
          maxWidth: 900,
          color: "#f8fafc",
          position: "relative",
          zIndex: 2,
          marginBottom: 28,
        }}>
          Gestão que cabe<br />
          <span style={{
            background: "linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            no seu negócio.
          </span>
        </h1>

        {/* Sub */}
        <p className="hero-sub" style={{
          fontSize: "clamp(15px, 1.8vw, 18px)",
          color: "rgba(255,255,255,0.45)",
          maxWidth: 520,
          lineHeight: 1.8,
          marginBottom: 48,
          position: "relative",
          zIndex: 2,
        }}>
          PDV, estoque, caixa e relatórios em um sistema só.
          Sem planilha, sem complicação.
          <span style={{ color: "rgba(16,185,129,0.7)" }}> Para quem não tem tempo a perder.</span>
        </p>

        {/* CTAs */}
        <div className="hero-cta" style={{ display: "flex", gap: 16, alignItems: "center", position: "relative", zIndex: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn-primary" onClick={() => router.push("/auth/cadastro")}>
            → Começar grátis
          </button>
          <button className="btn-ghost" onClick={() => router.push("/auth/login")}>
            Já tenho conta
          </button>
        </div>

        {/* Trust line */}
        <div style={{ marginTop: 64, display: "flex", alignItems: "center", gap: 32, color: "rgba(255,255,255,0.2)", fontSize: 11, letterSpacing: "0.1em", position: "relative", zIndex: 2, flexWrap: "wrap", justifyContent: "center" }}>
          {["JWT + OAuth2", "Dados isolados por empresa", "Exportação sem servidor"].map((item, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "rgba(16,185,129,0.5)", fontSize: 8 }}>◆</span>
              {item}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: scrollY > 50 ? 0 : 1, transition: "opacity 0.3s" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.2)" }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(16,185,129,0.5), transparent)" }} />
        </div>

        {/* Dashboard preview mockup */}
        <div style={{
          marginTop: 100,
          width: "100%",
          maxWidth: 900,
          position: "relative",
          zIndex: 2,
          transform: `translateY(${heroParallax * 0.2}px)`,
        }}>
          <div className="dashboard-preview" style={{
            border: "1px solid rgba(16,185,129,0.15)",
            borderRadius: 8,
            overflow: "hidden",
            background: "rgba(10,10,15,0.8)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 80px 160px rgba(0,0,0,0.6), 0 0 80px rgba(16,185,129,0.05)",
          }}>
            {/* Barra do topo */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(239,68,68,0.6)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(245,158,11,0.6)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(16,185,129,0.6)" }} />
              <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.03)", borderRadius: 4, marginLeft: 16 }} />
            </div>
            {/* Corpo */}
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", height: 340 }}>
              {/* Sidebar */}
              <div style={{ borderRight: "1px solid rgba(255,255,255,0.04)", padding: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {["Dashboard", "Produtos", "Vendas", "Clientes", "Relatórios"].map((item, i) => (
                  <div key={item} style={{ padding: "8px 12px", borderRadius: 4, background: i === 0 ? "rgba(16,185,129,0.12)" : "transparent", fontSize: 11, color: i === 0 ? "#10b981" : "rgba(255,255,255,0.25)", fontFamily: "'DM Mono', monospace" }}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Conteúdo */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                  {["R$ 1.240", "R$ 380", "23 vendas", "7 alertas"].map((val, i) => (
                    <div key={i} style={{ padding: "14px 16px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6, background: "rgba(255,255,255,0.01)" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: i === 3 ? "rgba(239,68,68,0.8)" : "#10b981", fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>{val}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}>
                        {["RECEITA HOJE", "LUCRO", "REALIZADAS", "ESTOQUE"][i]}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Gráfico mock */}
                <div style={{ flex: 1, border: "1px solid rgba(255,255,255,0.04)", borderRadius: 6, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginBottom: 12 }}>VENDAS DA SEMANA</div>
                  <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,60 C50,60 60,20 100,25 C140,30 160,45 200,30 C240,15 260,35 300,20 C340,5 360,30 400,15 L400,80 L0,80 Z" fill="url(#areaGrad)" />
                    <path d="M0,60 C50,60 60,20 100,25 C140,30 160,45 200,30 C240,15 260,35 300,20 C340,5 360,30 400,15" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* Reflexo */}
          <div style={{ position: "absolute", bottom: -60, left: "10%", right: "10%", height: 60, background: "linear-gradient(to bottom, rgba(16,185,129,0.04), transparent)", filter: "blur(20px)", transform: "scaleY(-1) translateY(-100%)" }} />
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <Ticker />

      {/* ── MÉTRICAS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 48px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
          {METRICS.map((m, i) => {
            const { ref, visible } = useVisible();
            return (
              <div ref={ref} key={i} className="metric-item" style={{
                padding: "40px 48px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`,
                textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 56, letterSpacing: "-0.04em", lineHeight: 1, color: "#f8fafc", marginBottom: 10 }}>
                  <Counter value={m.value} suffix={m.suffix} />
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{m.label.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="funcionalidades" style={{ padding: "100px 48px", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="FUNCIONALIDADES"
            title={<>Tudo que você precisa.<br /><span style={{ color: "rgba(255,255,255,0.25)" }}>Nada que você não usa.</span></>}
            sub="Desenvolvido a partir dos problemas reais de quem opera um pequeno negócio todos os dias."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginTop: 64, border: "1px solid rgba(255,255,255,0.05)" }}>
            {FEATURES.map((feat, i) => (
              <FeatureCard key={i} feat={feat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section style={{ padding: "100px 48px", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="COMO FUNCIONA"
            title={<>De zero ao controle<br /><span style={{ color: "rgba(255,255,255,0.25)" }}>em minutos.</span></>}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginTop: 80, position: "relative" }}>
            {/* Linha de conexão */}
            <div style={{ position: "absolute", top: 28, left: "12%", right: "12%", height: 1, background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), rgba(16,185,129,0.3), transparent)", zIndex: 0 }} />
            {[
              { n: "01", title: "Crie sua conta", desc: "Email e senha ou login com Google. Confirmação imediata." },
              { n: "02", title: "Cadastre sua empresa", desc: "Nome fantasia, CNPJ. Pronto para operar." },
              { n: "03", title: "Abra o caixa", desc: "Informe o saldo inicial e comece a registrar." },
              { n: "04", title: "Venda e analise", desc: "Cada venda gera dados. Relatórios em tempo real." },
            ].map((step, i) => {
              const { ref, visible } = useVisible();
              return (
                <div ref={ref} key={i} style={{
                  padding: "0 24px",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(32px)",
                  transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 150}ms`,
                  position: "relative",
                  zIndex: 1,
                }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(16,185,129,0.4)", background: "rgba(5,5,7,1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 13, fontWeight: 700, color: "#10b981", fontFamily: "'DM Mono', monospace" }}>
                    {step.n}
                  </div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#f8fafc", marginBottom: 10, letterSpacing: "-0.02em" }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PLANOS ───────────────────────────────────────────────────────── */}
      <section id="planos" style={{ padding: "100px 48px", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="PLANOS"
            title={<>Comece grátis.<br /><span style={{ color: "rgba(255,255,255,0.25)" }}>Cresça conforme precisar.</span></>}
            sub="Sem cartão de crédito para começar. Upgrade a qualquer momento."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 64 }}>
            {PLANS.map((plan, i) => {
              const { ref, visible } = useVisible();
              return (
                <div ref={ref} key={i} className={`plan-card${plan.highlight ? " highlight" : ""}`}
                  style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`, position: "relative" }}>
                  {plan.highlight && (
                    <div style={{ position: "absolute", top: -1, left: 24, right: 24, height: 2, background: "linear-gradient(90deg, transparent, #10b981, transparent)" }} />
                  )}
                  {plan.highlight && (
                    <div style={{ marginBottom: 16, fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#10b981", fontFamily: "'DM Mono', monospace" }}>MAIS POPULAR</div>
                  )}
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 24 }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: plan.highlight ? "#10b981" : "#f8fafc" }}>{plan.price}</span>
                    {plan.period && <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{plan.period}</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                    {[plan.days, plan.empresas, plan.caixas].map((feat, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                        <span style={{ color: "#10b981", fontSize: 10 }}>✓</span>
                        {feat}
                      </div>
                    ))}
                  </div>
                  <button className={plan.highlight ? "btn-primary" : "btn-ghost"}
                    onClick={() => router.push("/auth/cadastro")}
                    style={{ width: "100%", padding: "12px 0" }}>
                    {plan.name === "Experimental" ? "Começar grátis" : "Escolher plano"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOBRE ────────────────────────────────────────────────────────── */}
      <section id="sobre" style={{ padding: "100px 48px", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(16,185,129,0.6)", marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>SOBRE O PROJETO</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.04em", color: "#f8fafc", lineHeight: 1.1, marginBottom: 24 }}>
              Construído por quem<br />entende o problema.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.9, marginBottom: 16 }}>
              O GestPro nasceu da observação de uma lacuna real: pequenos comerciantes usam planilhas frágeis ou sistemas complexos demais para a sua realidade.
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.9, marginBottom: 32 }}>
              Desenvolvido por <span style={{ color: "#10b981" }}>Matheus Martins</span>, com Java/Spring Boot no backend e Next.js no frontend — arquitetura sólida, interface que qualquer pessoa consegue operar.
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="https://www.linkedin.com/in/matheusmartnsdev/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: "10px 20px", fontSize: 12, textDecoration: "none", display: "inline-block" }}>
                LinkedIn
              </a>
              <a href="https://www.instagram.com/gestpro.app/" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: "10px 20px", fontSize: 12, textDecoration: "none", display: "inline-block" }}>
                Instagram
              </a>
            </div>
          </div>

          {/* Tech stack visual */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { name: "Spring Boot 3", desc: "Backend + Segurança", color: "#6DB33F" },
              { name: "Next.js 14", desc: "Frontend + App Router", color: "#f8fafc" },
              { name: "MySQL 8", desc: "Banco Relacional", color: "#4479A1" },
              { name: "JWT + OAuth2", desc: "Autenticação", color: "#10b981" },
              { name: "Spring Security", desc: "Autorização", color: "#6DB33F" },
              { name: "TypeScript", desc: "Tipagem Estática", color: "#3178C6" },
            ].map((tech, i) => {
              const { ref, visible } = useVisible();
              return (
                <div ref={ref} key={i} style={{
                  padding: "20px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 2,
                  opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
                  transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: tech.color, marginBottom: 10 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>{tech.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>{tech.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section style={{ padding: "120px 48px", position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center", overflow: "hidden" }}>
        {/* Glow central */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(16,185,129,0.6)", marginBottom: 24, fontFamily: "'DM Mono', monospace" }}>COMECE AGORA</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(40px, 6vw, 72px)", letterSpacing: "-0.04em", lineHeight: 1.0, color: "#f8fafc", marginBottom: 24 }}>
            Sem planilha.<br />
            <span style={{ color: "#10b981" }}>Sem desculpa.</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 48, lineHeight: 1.7 }}>
            7 dias grátis, sem cartão de crédito. Seu negócio com controle real em menos de 5 minutos.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => router.push("/auth/cadastro")} style={{ padding: "18px 48px", fontSize: 14 }}>
              → Criar conta grátis
            </button>
            <button className="btn-ghost" onClick={() => router.push("/auth/login")} style={{ padding: "18px 48px", fontSize: 14 }}>
              Fazer login
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: "40px 48px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2, flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 20, height: 20, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, border: "1.5px solid rgba(16,185,129,0.6)", borderRadius: 4, transform: "rotate(45deg)" }} />
            <div style={{ position: "absolute", inset: 5, background: "rgba(16,185,129,0.6)", borderRadius: 2, transform: "rotate(45deg)" }} />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>GestPro</span>
          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>© 2025 Matheus Martins</span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["LinkedIn", "Instagram", "GitHub"].map(link => (
            <a key={link} className="nav-link" href="#" style={{ fontSize: 11 }}>{link}</a>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "'DM Mono', monospace" }}>
          Em desenvolvimento ativo
        </div>
      </footer>
    </div>
  );
}

/* ─── Componente auxiliar: SectionHeader ─────────────────────────────────── */
function SectionHeader({ tag, title, sub }: { tag: string; title: React.ReactNode; sub?: string }) {
  const { ref, visible } = useVisible();
  return (
    <div ref={ref} style={{ maxWidth: 600, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(24px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(16,185,129,0.6)", marginBottom: 20, fontFamily: "'DM Mono', monospace" }}>{tag}</div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.04em", lineHeight: 1.05, color: "#f8fafc", marginBottom: sub ? 16 : 0 }}>
        {title}
      </h2>
      {sub && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginTop: 16 }}>{sub}</p>}
    </div>
  );
}