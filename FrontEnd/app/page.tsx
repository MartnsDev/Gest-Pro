"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface NavProps { onLogin: () => void; onRegister: () => void; }
interface HeroProps { onRegister: () => void; onLogin: () => void; }
interface PlansProps { onRegister: () => void; }
interface CTAProps { onRegister: () => void; onLogin: () => void; }

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=Manrope:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    ::selection { background: rgba(16,185,129,0.28); color: #e2fef4; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #050608; }
    ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.35); border-radius: 2px; }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes floatY {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-14px); }
    }
    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes pulseBorder {
      0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.0); }
      50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0.12); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes gridMove {
      0%   { transform: translateY(0); }
      100% { transform: translateY(60px); }
    }
    @keyframes dashFloat {
      0%,100% { transform: translateY(0) rotate(-2deg); }
      50%      { transform: translateY(-20px) rotate(2deg); }
    }
    @keyframes glowPulse {
      0%,100% { opacity: 0.5; }
      50%      { opacity: 1; }
    }
    @keyframes counterUp {
      from { opacity:0; transform:translateY(12px); }
      to   { opacity:1; transform:translateY(0); }
    }

    .fade-up        { animation: fadeUp 0.7s ease both; }
    .fade-in        { animation: fadeIn 0.6s ease both; }
    .float-y        { animation: floatY 6s ease-in-out infinite; }
    .float-y-slow   { animation: floatY 9s ease-in-out infinite; }
    .spin-slow      { animation: spinSlow 20s linear infinite; }
    .glow-pulse     { animation: glowPulse 3s ease-in-out infinite; }
    .dash-float     { animation: dashFloat 7s ease-in-out infinite; }

    /* delay helpers */
    .d1 { animation-delay: .1s; }
    .d2 { animation-delay: .2s; }
    .d3 { animation-delay: .35s; }
    .d4 { animation-delay: .5s; }
    .d5 { animation-delay: .65s; }
    .d6 { animation-delay: .8s; }

    /* hover lift */
    .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

    /* green btn */
    .btn-green {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      border: none;
      cursor: pointer;
      font-family: 'Manrope', sans-serif;
      font-weight: 600;
      border-radius: 10px;
      transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
      animation: pulseBorder 3s ease-in-out infinite;
    }
    .btn-green:hover {
      transform: translateY(-2px) scale(1.03);
      filter: brightness(1.12);
      box-shadow: 0 10px 36px rgba(16,185,129,0.38);
    }

    /* ghost btn */
    .btn-ghost {
      background: transparent;
      color: rgba(241,245,249,0.75);
      border: 1px solid rgba(255,255,255,0.12);
      cursor: pointer;
      font-family: 'Manrope', sans-serif;
      font-weight: 500;
      border-radius: 10px;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .btn-ghost:hover {
      border-color: rgba(16,185,129,0.5);
      color: #10b981;
      background: rgba(16,185,129,0.06);
    }

    /* card glass */
    .glass {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      backdrop-filter: blur(12px);
      border-radius: 16px;
    }
    .glass-bright {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(16,185,129,0.18);
      backdrop-filter: blur(16px);
      border-radius: 16px;
    }

    /* section headings */
    .section-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #10b981;
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.22);
      padding: 5px 14px;
      border-radius: 99px;
      margin-bottom: 18px;
    }
    .section-heading {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      color: #f1f5f9;
      line-height: 1.1;
    }
    .section-sub {
      font-family: 'Manrope', sans-serif;
      font-weight: 400;
      color: rgba(241,245,249,0.55);
      line-height: 1.7;
    }

    /* grid-line bg */
    .grid-bg::before {
      content: '';
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
    }

    /* green dot blink */
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .blink { animation: blink 2s ease-in-out infinite; }

    /* plan card popular ring */
    .popular-ring {
      border: 1.5px solid rgba(16,185,129,0.6) !important;
      box-shadow: 0 0 40px rgba(16,185,129,0.12), inset 0 0 40px rgba(16,185,129,0.03);
    }

    /* mobile menu */
    .mob-menu {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(5,6,8,0.97);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 28px;
      animation: fadeIn 0.2s ease;
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   BACKGROUND  (ambient blobs + grid)
───────────────────────────────────────────── */
const Background = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
    {/* Dark base */}
    <div style={{ position: "absolute", inset: 0, background: "#050608" }} />
    {/* Blob top-left */}
    <div className="glow-pulse" style={{
      position: "absolute", top: "-15%", left: "-10%",
      width: 700, height: 700, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 65%)",
      filter: "blur(60px)",
    }} />
    {/* Blob top-right */}
    <div style={{
      position: "absolute", top: "5%", right: "-12%",
      width: 500, height: 500, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)",
      filter: "blur(80px)",
    }} />
    {/* Blob center */}
    <div className="glow-pulse" style={{
      position: "absolute", top: "45%", left: "30%",
      width: 800, height: 400, borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 65%)",
      filter: "blur(80px)",
    }} />
    {/* Grid overlay */}
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }} />
    {/* Vignette */}
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,6,8,0.7) 100%)",
    }} />
  </div>
);

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
const Nav = ({ onLogin, onRegister }: NavProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = ["Funcionalidades", "Como Funciona", "Planos"];

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "12px 0" : "20px 0",
        background: scrolled ? "rgba(5,6,8,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
              fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff",
            }}>G</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              Gest<span style={{ color: "#10b981" }}>Pro</span>
            </span>
          </div>

          {/* Desktop Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 36 }} className="desktop-nav">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} style={{
                fontFamily: "'Manrope', sans-serif", fontSize: 14, fontWeight: 500,
                color: "rgba(241,245,249,0.6)", textDecoration: "none",
                transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,245,249,0.6)")}
              >{l}</a>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn-ghost" onClick={onLogin} style={{ padding: "9px 20px", fontSize: 14 }}>Entrar</button>
            <button className="btn-green" onClick={onRegister} style={{ padding: "9px 20px", fontSize: 14 }}>Começar grátis</button>
            {/* Hamburger */}
            <button onClick={() => setMenuOpen(true)} style={{
              display: "none", background: "none", border: "none", cursor: "pointer",
              color: "#f1f5f9", fontSize: 22, padding: 4,
            }} className="mob-hamburger">☰</button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mob-menu" onClick={() => setMenuOpen(false)}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, color: "#f1f5f9", textDecoration: "none" }}
            >{l}</a>
          ))}
          <button className="btn-green" onClick={onRegister} style={{ padding: "14px 40px", fontSize: 16, marginTop: 16 }}>Começar grátis</button>
        </div>
      )}

      {/* Hide desktop-nav on small screens */}
      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .mob-hamburger{display:flex!important;}
        }
      `}</style>
    </>
  );
};

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
const DashboardPreview = () => (
  <div className="dash-float" style={{
    width: "100%", maxWidth: 720,
    borderRadius: 18, overflow: "hidden",
    border: "1px solid rgba(16,185,129,0.25)",
    boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.1), 0 0 80px rgba(16,185,129,0.08)",
    position: "relative",
  }}>
    {/* Top bar */}
    <div style={{
      background: "#0d0f12", borderBottom: "1px solid rgba(255,255,255,0.07)",
      padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
    }}>
      {["#ff5f57","#ffbd2e","#28c840"].map(c => (
        <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
      ))}
      <div style={{
        flex: 1, height: 22, borderRadius: 6, background: "rgba(255,255,255,0.05)",
        marginLeft: 12, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.3)",
      }}>gestpro.app/dashboard</div>
    </div>

    {/* Dashboard body */}
    <div style={{ background: "#0d0f12", padding: "16px", display: "flex", gap: 12 }}>
      {/* Sidebar */}
      <div style={{ width: 48, display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
        {["📊","📦","💰","👤","📈"].map((ic, i) => (
          <div key={i} style={{
            width: 32, height: 32, borderRadius: 8,
            background: i === 0 ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}>{ic}</div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1 }}>
        {/* Stat chips */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Vendas Hoje", value: "R$ 134,48", color: "#10b981" },
            { label: "Vendas Mês", value: "R$ 606,48", color: "#3b82f6" },
            { label: "Lucro Mês", value: "R$ 297,50", color: "#f59e0b" },
            { label: "Em Estoque", value: "4 itens", color: "#8b5cf6" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 10px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div style={{
          background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)",
          padding: "12px", height: 100, position: "relative", overflow: "hidden",
        }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>VENDAS DIÁRIAS</div>
          <svg viewBox="0 0 300 50" style={{ width: "100%", height: 55 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,45 C20,42 40,38 60,30 C80,22 100,20 120,18 C140,16 160,12 180,15 C200,18 220,22 240,10 C260,8 280,5 300,8 L300,55 L0,55 Z" fill="url(#chartGrad)" />
            <path d="M0,45 C20,42 40,38 60,30 C80,22 100,20 120,18 C140,16 160,12 180,15 C200,18 220,22 240,10 C260,8 280,5 300,8" fill="none" stroke="#10b981" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Mini table */}
        <div style={{ marginTop: 8 }}>
          {[
            { name: "Eight", val: "R$ 92,00", tag: "Pix" },
            { name: "Produto B", val: "R$ 48,00", tag: "Crédito" },
            { name: "Produto C", val: "R$ 32,00", tag: "Dinheiro" },
          ].map(row => (
            <div key={row.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{row.name}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "2px 7px", borderRadius: 5 }}>{row.tag}</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, color: "#10b981" }}>{row.val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Glow overlay */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      background: "linear-gradient(180deg, transparent 60%, rgba(16,185,129,0.04) 100%)",
      borderRadius: 18,
    }} />
  </div>
);

const Hero = ({ onRegister, onLogin }: HeroProps) => (
  <section style={{
    position: "relative", zIndex: 10,
    minHeight: "100vh", display: "flex", alignItems: "center",
    padding: "120px 28px 80px",
    maxWidth: 1200, margin: "0 auto",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 64, width: "100%", flexWrap: "wrap" }}>

      {/* Left text */}
      <div style={{ flex: "1 1 400px" }}>
        {/* Badge */}
        <div className="fade-up d1" style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28,
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.22)",
          borderRadius: 99, padding: "6px 16px",
          fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#10b981",
          letterSpacing: ".1em", textTransform: "uppercase",
        }}>
          <span className="blink" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          Gestão de Vendas Inteligente
        </div>

        {/* Heading */}
        <h1 className="fade-up d2" style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: "clamp(40px, 5vw, 68px)",
          lineHeight: 1.05, letterSpacing: "-0.03em",
          color: "#f1f5f9", marginBottom: 22,
        }}>
          Seu negócio,<br />
          <span style={{
            background: "linear-gradient(135deg, #10b981 0%, #34d399 60%, #6ee7b7 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>no controle.</span>
        </h1>

        {/* Sub */}
        <p className="fade-up d3" style={{
          fontFamily: "'Manrope', sans-serif", fontWeight: 400,
          fontSize: 17, lineHeight: 1.75, color: "rgba(241,245,249,0.6)",
          maxWidth: 460, marginBottom: 40,
        }}>
          Caixa, vendas, estoque e relatórios em um único painel. Feito para
          lojistas que querem crescer sem complicação.
        </p>

        {/* Buttons */}
        <div className="fade-up d4" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button className="btn-green" onClick={onRegister} style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}>
            Começar grátis →
          </button>
          <button className="btn-ghost" onClick={onLogin} style={{ padding: "14px 26px", fontSize: 15, borderRadius: 12 }}>
            Já tenho conta
          </button>
        </div>

        {/* Social proof */}
        <div className="fade-up d5" style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex" }}>
            {["#10b981","#34d399","#6ee7b7","#a7f3d0","#d1fae5"].map((c, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `linear-gradient(135deg, ${c}, #059669)`,
                border: "2px solid #050608",
                marginLeft: i === 0 ? 0 : -10,
                fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {["M","J","A","R","L"][i]}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>+2.400 lojistas</div>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 12, color: "rgba(241,245,249,0.45)" }}>já usam o GestPro</div>
          </div>
        </div>
      </div>

      {/* Right: Dashboard preview */}
      <div className="fade-in d3" style={{ flex: "1 1 380px", display: "flex", justifyContent: "center", position: "relative" }}>
        {/* Decorative ring */}
        <div className="spin-slow" style={{
          position: "absolute", width: 500, height: 500,
          borderRadius: "50%", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          border: "1px dashed rgba(16,185,129,0.1)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", top: "50%", left: "50%", transform: "translate(-50%,-50%)", border: "1px dashed rgba(16,185,129,0.07)", pointerEvents: "none" }} />
        <DashboardPreview />
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   STATS
───────────────────────────────────────────── */
const Stats = () => {
  const stats = [
    { value: "2.400+", label: "Lojistas ativos" },
    { value: "R$ 12M+", label: "Em vendas gerenciadas" },
    { value: "99,9%", label: "Uptime garantido" },
    { value: "4.9★", label: "Avaliação média" },
  ];

  return (
    <section style={{ position: "relative", zIndex: 10, padding: "0 28px 100px" }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2,
        borderRadius: 18, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        {stats.map((s, i) => (
          <div key={i} className="hover-lift" style={{
            padding: "36px 28px",
            background: "rgba(255,255,255,0.025)",
            borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            textAlign: "center",
          }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 36, color: "#10b981", letterSpacing: "-0.03em", marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: "rgba(241,245,249,0.45)", fontWeight: 400 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
const Features = () => {
  const feats = [
    {
      icon: "💰", title: "Controle de Caixa",
      desc: "Abra e feche caixas com saldo inicial, acompanhe cada centavo em tempo real com total transparência.",
      tag: "Financeiro",
    },
    {
      icon: "📦", title: "Gestão de Estoque",
      desc: "Monitore produtos, receba alertas de estoque zero e nunca perca uma venda por falta de produto.",
      tag: "Estoque",
    },
    {
      icon: "📊", title: "Relatórios Completos",
      desc: "Exporte em CSV, HTML ou PDF. Visualize por período, por caixa ou produto com gráficos detalhados.",
      tag: "Analytics",
    },
    {
      icon: "💳", title: "Multi Pagamentos",
      desc: "PIX, Dinheiro, Débito e Crédito. Registre tudo e veja a distribuição por forma de pagamento.",
      tag: "Pagamentos",
    },
    {
      icon: "👥", title: "Gestão de Clientes",
      desc: "Cadastre clientes, acompanhe histórico de compras e construa relacionamentos duradouros.",
      tag: "CRM",
    },
    {
      icon: "🏢", title: "Multi Empresa",
      desc: "Gerencie várias filiais ou negócios em uma única conta. Troque com um clique.",
      tag: "Empresas",
    },
  ];

  return (
    <section id="funcionalidades" style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-tag">✦ Funcionalidades</div>
          <h2 className="section-heading" style={{ fontSize: "clamp(32px,4vw,52px)", marginBottom: 16 }}>
            Tudo que você precisa,<br />num só lugar
          </h2>
          <p className="section-sub" style={{ maxWidth: 480, margin: "0 auto", fontSize: 16 }}>
            Do caixa ao relatório final, o GestPro cobre todas as etapas da gestão do seu comércio.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {feats.map((f, i) => (
            <div key={i} className="glass hover-lift" style={{ padding: "28px 24px", cursor: "default", transition: "border-color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.25)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 28 }}>{f.icon}</div>
                <span style={{
                  fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#10b981",
                  background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
                  padding: "3px 10px", borderRadius: 99, letterSpacing: ".08em",
                }}>{f.tag}</span>
              </div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 19, color: "#f1f5f9", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 14, color: "rgba(241,245,249,0.5)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────────── */
const HowItWorks = () => {
  const steps = [
    { n: "01", title: "Crie sua conta", desc: "Cadastro em menos de 2 minutos. Sem cartão de crédito.", icon: "🚀" },
    { n: "02", title: "Configure sua empresa", desc: "Adicione produtos, defina preços e abra seu primeiro caixa.", icon: "⚙️" },
    { n: "03", title: "Registre vendas", desc: "Interface simples para lançar vendas rapidamente no dia a dia.", icon: "💸" },
    { n: "04", title: "Analise e cresça", desc: "Relatórios automáticos com insights para tomar decisões certeiras.", icon: "📈" },
  ];

  return (
    <section id="como-funciona" style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-tag">✦ Como Funciona</div>
          <h2 className="section-heading" style={{ fontSize: "clamp(32px,4vw,52px)", marginBottom: 16 }}>
            Simples do início ao fim
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24, position: "relative" }}>
          {/* Connector line */}
          <div style={{
            position: "absolute", top: 42, left: "12%", right: "12%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)",
            zIndex: 0,
          }} />
          {steps.map((s, i) => (
            <div key={i} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <div style={{
                width: 68, height: 68, borderRadius: "50%", margin: "0 auto 20px",
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(16,185,129,0.3)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(16,185,129,0.12)",
                fontSize: 26,
              }}>
                {s.icon}
              </div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#10b981", letterSpacing: ".12em", marginBottom: 8 }}>{s.n}</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: "rgba(241,245,249,0.5)", lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   PLANS
───────────────────────────────────────────── */
const Plans = ({ onRegister }: PlansProps) => {
  const plans = [
    {
      name: "Free", price: "R$ 0", period: "/mês",
      desc: "Para testar e começar.",
      features: ["1 empresa", "1 caixa ativo", "Até 30 vendas/mês", "Relatórios básicos", "Suporte por email"],
      cta: "Começar grátis", popular: false,
    },
    {
      name: "PRO", price: "R$ 29", period: "/mês",
      desc: "Para quem leva o negócio a sério.",
      features: ["Empresas ilimitadas", "Caixas ilimitados", "Vendas ilimitadas", "Relatórios avançados + export", "Gestão de clientes", "Multi pagamentos", "Suporte prioritário"],
      cta: "Assinar PRO", popular: true,
    },
    {
      name: "Enterprise", price: "Sob consulta", period: "",
      desc: "Para redes e franquias.",
      features: ["Tudo do PRO", "API dedicada", "Onboarding personalizado", "SLA garantido", "Gerente de conta"],
      cta: "Falar com vendas", popular: false,
    },
  ];

  return (
    <section id="planos" style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-tag">✦ Planos</div>
          <h2 className="section-heading" style={{ fontSize: "clamp(32px,4vw,52px)", marginBottom: 16 }}>
            Preço justo,<br />valor real
          </h2>
          <p className="section-sub" style={{ fontSize: 16 }}>Comece grátis. Escale quando quiser.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20, alignItems: "center" }}>
          {plans.map((p, i) => (
            <div key={i}
              className={`glass hover-lift ${p.popular ? "popular-ring" : ""}`}
              style={{ padding: "32px 28px", position: "relative", transform: p.popular ? "scale(1.03)" : "none" }}
            >
              {p.popular && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(90deg, #10b981, #059669)",
                  borderRadius: 99, padding: "4px 18px",
                  fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#fff", letterSpacing: ".1em",
                  whiteSpace: "nowrap",
                }}>⭐ MAIS POPULAR</div>
              )}
              <div style={{ marginBottom: 6, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: p.popular ? "#10b981" : "rgba(241,245,249,0.6)" }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 34, color: "#f1f5f9" }}>{p.price}</span>
                <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: "rgba(241,245,249,0.4)" }}>{p.period}</span>
              </div>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: "rgba(241,245,249,0.45)", marginBottom: 24, lineHeight: 1.6 }}>{p.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#10b981", fontSize: 14, marginTop: 1 }}>✓</span>
                    <span style={{ fontFamily: "'Manrope',sans-serif", fontSize: 13, color: "rgba(241,245,249,0.65)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                className={p.popular ? "btn-green" : "btn-ghost"}
                onClick={onRegister}
                style={{ width: "100%", padding: "12px", fontSize: 14, borderRadius: 10 }}
              >{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   ABOUT / TESTIMONIALS
───────────────────────────────────────────── */
const About = () => {
  const quotes = [
    { name: "Matheus C.", role: "Loja de roupas", text: "Abri meu caixa e já tinha tudo funcionando em minutos. Nunca imaginei que seria tão fácil controlar as vendas." },
    { name: "Ana Paula R.", role: "Loja de acessórios", text: "Os relatórios me mostraram que estava perdendo dinheiro em dois produtos. Ajustei os preços e o lucro cresceu 40%." },
    { name: "Ricardo M.", role: "Mercadinho", text: "Gerencio 3 filiais pelo celular. O GestPro me dá uma visão completa de cada unidade com poucos cliques." },
  ];

  return (
    <section style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-tag">✦ Depoimentos</div>
          <h2 className="section-heading" style={{ fontSize: "clamp(30px,4vw,48px)" }}>
            Quem usa, recomenda
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {quotes.map((q, i) => (
            <div key={i} className="glass hover-lift" style={{ padding: "28px 24px" }}>
              <div style={{ fontSize: 24, color: "#10b981", marginBottom: 14, fontFamily: "'Syne',sans-serif" }}>"</div>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 14, color: "rgba(241,245,249,0.65)", lineHeight: 1.75, marginBottom: 20 }}>{q.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff",
                }}>{q.name[0]}</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{q.name}</div>
                  <div style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, color: "rgba(241,245,249,0.35)" }}>{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   CTA FINAL
───────────────────────────────────────────── */
const CTAFinal = ({ onRegister, onLogin }: CTAProps) => (
  <section style={{ position: "relative", zIndex: 10, padding: "80px 28px 100px" }}>
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <div className="glass-bright" style={{ padding: "64px 48px", borderRadius: 24, position: "relative", overflow: "hidden" }}>
        {/* Glow bg */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 500, height: 300, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />
        <div className="section-tag" style={{ margin: "0 auto 24px" }}>✦ Comece hoje mesmo</div>
        <h2 className="section-heading" style={{ fontSize: "clamp(30px,4vw,52px)", marginBottom: 18 }}>
          Pronto para ter<br />
          <span style={{
            background: "linear-gradient(135deg, #10b981, #34d399)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>controle total?</span>
        </h2>
        <p className="section-sub" style={{ fontSize: 16, maxWidth: 420, margin: "0 auto 36px" }}>
          Junte-se a mais de 2.400 lojistas que já descobriram o poder de gerir com inteligência.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-green" onClick={onRegister} style={{ padding: "15px 36px", fontSize: 15, borderRadius: 12 }}>
            Criar conta grátis →
          </button>
          <button className="btn-ghost" onClick={onLogin} style={{ padding: "15px 28px", fontSize: 15, borderRadius: 12 }}>
            Já tenho conta
          </button>
        </div>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 12, color: "rgba(241,245,249,0.3)", marginTop: 20 }}>
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const Footer = () => (
  <footer style={{
    position: "relative", zIndex: 10,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 28px",
  }}>
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "linear-gradient(135deg, #10b981, #059669)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: "#fff",
        }}>G</div>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#f1f5f9" }}>
          Gest<span style={{ color: "#10b981" }}>Pro</span>
        </span>
      </div>
      <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 12, color: "rgba(241,245,249,0.3)" }}>
        © {new Date().getFullYear()} GestPro · Todos os direitos reservados
      </p>
      <div style={{ display: "flex", gap: 24 }}>
        {["Termos", "Privacidade", "Contato"].map(l => (
          <a key={l} href="#" style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 12,
            color: "rgba(241,245,249,0.35)", textDecoration: "none",
            transition: "color .2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,245,249,0.35)")}
          >{l}</a>
        ))}
      </div>
    </div>
  </footer>
);

/* ─────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const toLogin = useCallback(() => router.push("/auth/login"), [router]);
  const toRegister = useCallback(() => router.push("/auth/cadastro"), [router]);

  return (
    <div style={{ background: "#050608", color: "#f1f5f9", minHeight: "100vh", overflowX: "hidden" }}>
      <GlobalStyles />
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