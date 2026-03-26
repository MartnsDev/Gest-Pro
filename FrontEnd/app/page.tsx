"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface NavProps {
  onLogin: () => void;
  onRegister: () => void;
}
interface HeroProps {
  onRegister: () => void;
  onLogin: () => void;
}
interface PlansProps {
  onRegister: () => void;
}
interface CTAProps {
  onRegister: () => void;
  onLogin: () => void;
}

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::selection { background: rgba(16,185,129,0.28); color: #e2fef4; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #050608; }
    ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.35); border-radius: 2px; }

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
    @keyframes dashFloat {
      0%,100% { transform: translateY(0) rotate(-2deg); }
      50%      { transform: translateY(-20px) rotate(2deg); }
    }
    @keyframes glowPulse {
      0%,100% { opacity: 0.5; }
      50%      { opacity: 1; }
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    .fade-up        { animation: fadeUp 0.7s ease both; }
    .fade-in        { animation: fadeIn 0.6s ease both; }
    .float-y        { animation: floatY 6s ease-in-out infinite; }
    .spin-slow      { animation: spinSlow 20s linear infinite; }
    .glow-pulse     { animation: glowPulse 3s ease-in-out infinite; }
    .dash-float     { animation: dashFloat 7s ease-in-out infinite; }
    .blink          { animation: blink 2s ease-in-out infinite; }

    .d1 { animation-delay: .1s; }
    .d2 { animation-delay: .2s; }
    .d3 { animation-delay: .35s; }
    .d4 { animation-delay: .5s; }
    .d5 { animation-delay: .65s; }
    .d6 { animation-delay: .8s; }

    .hover-lift { transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

    .btn-green {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      border: none;
      cursor: pointer;
      font-family: var(--font-manrope), 'Manrope', sans-serif;
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

    .btn-ghost {
      background: transparent;
      color: rgba(241,245,249,0.75);
      border: 1px solid rgba(255,255,255,0.12);
      cursor: pointer;
      font-family: var(--font-manrope), 'Manrope', sans-serif;
      font-weight: 500;
      border-radius: 10px;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .btn-ghost:hover {
      border-color: rgba(16,185,129,0.5);
      color: #10b981;
      background: rgba(16,185,129,0.06);
    }

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

    .section-tag {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-dm-mono), 'DM Mono', monospace;
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
      font-family: var(--font-syne), 'Syne', sans-serif;
      font-weight: 800;
      color: #f1f5f9;
      line-height: 1.1;
    }
    .section-sub {
      font-family: var(--font-manrope), 'Manrope', sans-serif;
      font-weight: 400;
      color: rgba(241,245,249,0.55);
      line-height: 1.7;
    }

    .popular-ring {
      border: 1.5px solid rgba(16,185,129,0.6) !important;
      box-shadow: 0 0 40px rgba(16,185,129,0.12), inset 0 0 40px rgba(16,185,129,0.03);
    }

    .mob-menu {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(5,6,8,0.97);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 28px;
      animation: fadeIn 0.2s ease;
    }

    @media(max-width:768px){
      .desktop-nav{display:none!important;}
      .mob-hamburger{display:flex!important;}
      .dash-float{animation:none!important;}
    }
    
    @media(max-width:1024px){
      .plans-grid{grid-template-columns:repeat(2, 1fr)!important;}
    }
    
    @media(max-width:640px){
      .hero-text{font-size:32px!important;}
      .hero-sub{font-size:15px!important;}
      .section-heading{font-size:28px!important;}
      .stats-grid{grid-template-columns:1fr 1fr!important;}
      .features-grid{grid-template-columns:1fr!important;}
      .plans-grid{grid-template-columns:1fr!important;}
      .steps-grid{grid-template-columns:1fr!important;}
      .testimonials-grid{grid-template-columns:1fr!important;}
      .footer-grid{grid-template-columns:1fr!important;text-align:center;}
      .footer-links{justify-content:center!important;}
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   BACKGROUND
───────────────────────────────────────────── */
const Background = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    <div style={{ position: "absolute", inset: 0, background: "#050608" }} />
    <div
      className="glow-pulse"
      style={{
        position: "absolute",
        top: "-15%",
        left: "-10%",
        width: 700,
        height: 700,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 65%)",
        filter: "blur(60px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "5%",
        right: "-12%",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)",
        filter: "blur(80px)",
      }}
    />
    <div
      className="glow-pulse"
      style={{
        position: "absolute",
        top: "45%",
        left: "30%",
        width: 800,
        height: 400,
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(16,185,129,0.05) 0%, transparent 65%)",
        filter: "blur(80px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(5,6,8,0.7) 100%)",
      }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   LOGO COMPONENT
───────────────────────────────────────────── */
const Logo = ({ size = "default" }: { size?: "default" | "small" }) => {
  const logoSize = size === "small" ? 28 : 36;
  const fontSize = size === "small" ? 16 : 20;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
      }}
    >
      <img
        src="/images/logo.png"
        alt="GestPro"
        style={{
          width: logoSize,
          height: logoSize,
          objectFit: "contain",
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-syne), 'Syne', sans-serif",
          fontWeight: 800,
          fontSize,
          color: "#f1f5f9",
          letterSpacing: "-0.02em",
        }}
      >
        Gest<span style={{ color: "#10b981" }}>Pro</span>
      </span>
    </div>
  );
};

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
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: scrolled ? "12px 0" : "20px 0",
          background: scrolled ? "rgba(5,6,8,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid transparent",
          transition: "all 0.35s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />

          <div
            style={{ display: "flex", alignItems: "center", gap: 36 }}
            className="desktop-nav"
          >
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(" ", "-")}`}
                style={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(241,245,249,0.6)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(241,245,249,0.6)")
                }
              >
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              className="btn-ghost desktop-nav"
              onClick={onLogin}
              style={{ padding: "9px 20px", fontSize: 14 }}
            >
              Entrar
            </button>
            <button
              className="btn-green desktop-nav"
              onClick={onRegister}
              style={{ padding: "9px 20px", fontSize: 14 }}
            >
              Começar grátis
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#f1f5f9",
                fontSize: 22,
                padding: 4,
              }}
              className="mob-hamburger"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="mob-menu" onClick={() => setMenuOpen(false)}>
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "none",
              border: "none",
              color: "#f1f5f9",
              fontSize: 28,
              cursor: "pointer",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#f1f5f9",
                textDecoration: "none",
              }}
            >
              {l}
            </a>
          ))}
          <button
            className="btn-green"
            onClick={onRegister}
            style={{ padding: "14px 40px", fontSize: 16, marginTop: 16 }}
          >
            Começar grátis
          </button>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   DASHBOARD PREVIEW
───────────────────────────────────────────── */
const DashboardPreview = () => (
  <div
    className="dash-float"
    style={{
      width: "100%",
      maxWidth: 800,
      borderRadius: 18,
      overflow: "hidden",
      border: "1px solid rgba(16,185,129,0.25)",
      boxShadow:
        "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.1), 0 0 80px rgba(16,185,129,0.08)",
      position: "relative",
    }}
  >
    <div
      style={{
        background: "#0d0f12",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
        <div
          key={c}
          style={{ width: 11, height: 11, borderRadius: "50%", background: c }}
        />
      ))}
      <div
        style={{
          flex: 1,
          height: 22,
          borderRadius: 6,
          background: "rgba(255,255,255,0.05)",
          marginLeft: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        gestpro.app/dashboard
      </div>
    </div>

    <img
      src="/images/dashboard.png"
      alt="GestPro Dashboard - PDV, estoque, caixa e relatórios"
      style={{
        width: "100%",
        height: "auto",
        display: "block",
      }}
    />

    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(180deg, transparent 60%, rgba(16,185,129,0.04) 100%)",
        borderRadius: 18,
      }}
    />
  </div>
);

const lojistas = [
  { nome: "Kelly", img: "/logistas-img/Kelly.png" },
  { nome: "Heloisa", img: "/logistas-img/heloisa.png" },
  { nome: "Matheus", img: "/logistas-img/matheus.png" },
  { nome: "Ricardo", img: "/logistas-img/ricardo.png" },
  { nome: "Lorena", img: "/logistas-img/lorena.png" },
];

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
const Hero = ({ onRegister, onLogin }: HeroProps) => (
  <section
    style={{
      position: "relative",
      zIndex: 10,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "100px 20px 60px",
      maxWidth: 1200,
      margin: "0 auto",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <div
          className="fade-up d1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.22)",
            borderRadius: 99,
            padding: "6px 16px",
            fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
            fontSize: 11,
            color: "#10b981",
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          <span
            className="blink"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#10b981",
              display: "inline-block",
            }}
          />
          Gestão de Vendas Inteligente
        </div>

        <h1
          className="fade-up d2 hero-text"
          style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 6vw, 68px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "#f1f5f9",
            marginBottom: 18,
          }}
        >
          Seu negócio,
          <br />
          <span
            style={{
              background:
                "linear-gradient(135deg, #10b981 0%, #34d399 60%, #6ee7b7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            no controle.
          </span>
        </h1>

        <p
          className="fade-up d3 hero-sub"
          style={{
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            fontWeight: 400,
            fontSize: "clamp(14px, 3vw, 17px)",
            lineHeight: 1.7,
            color: "rgba(241,245,249,0.6)",
            maxWidth: 460,
            marginBottom: 32,
          }}
        >
          Caixa, vendas, estoque e relatórios em um único painel. Feito para
          lojistas que querem crescer sem complicação.
        </p>

        <div
          className="fade-up d4"
          style={{ display: "flex", gap: 14, flexWrap: "wrap" }}
        >
          <button
            className="btn-green"
            onClick={onRegister}
            style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}
          >
            Começar grátis →
          </button>
          <button
            className="btn-ghost"
            onClick={onLogin}
            style={{ padding: "14px 26px", fontSize: 15, borderRadius: 12 }}
          >
            Já tenho conta
          </button>
        </div>

        <div
          className="fade-up d5"
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
         <div style={{ display: "flex", alignItems: "center" }}>
  {/* Limitamos estritamente a 5 fotos */}
  {lojistas.slice(0, 5).map((lojista, i) => (
    <div
      key={lojista.nome} // KEY única evita repetição de render
      style={{
        width: 24, 
        height: 24,
        borderRadius: "50%",
        border: "2px solid #050608",
        marginLeft: i === 0 ? 0 : -12,
        overflow: "hidden",
        background: "#1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10 - i, 
      }}
    >
      <img
        // O timestamp Date.now() força o navegador a carregar o arquivo real do disco
        src={`${lojista.img}?v=${Date.now()}`} 
        alt={lojista.nome}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  ))}
</div>
          
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: "#f1f5f9",
              }}
            >
              +1.200 lojistas
            </div>
            <div
              style={{
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                fontSize: 12,
                color: "rgba(241,245,249,0.45)",
              }}
            >
              já usam o GestPro
            </div>
          </div>
        </div>
      </div>

      <div
        className="fade-in d3"
        style={{
          flex: "1 1 300px",
          display: "flex",
          justifyContent: "center",
          position: "relative",
          minWidth: 0,
          width: "100%",
        }}
      >
        <div
          className="spin-slow"
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            border: "1px dashed rgba(16,185,129,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            border: "1px dashed rgba(16,185,129,0.07)",
            pointerEvents: "none",
          }}
        />
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
    { value: "1.200+", label: "Lojistas ativos" },
    { value: "R$ 12M+", label: "Em vendas gerenciadas" },
    { value: "98,7%", label: "Uptime garantido" },
    { value: "4.8★", label: "Avaliação média" },
  ];

  return (
    <section
      style={{ position: "relative", zIndex: 10, padding: "0 28px 100px" }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className="hover-lift"
            style={{
              padding: "36px 28px",
              background: "rgba(255,255,255,0.025)",
              borderRight:
                i < stats.length - 1
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "none",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 36,
                color: "#10b981",
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                fontSize: 13,
                color: "rgba(241,245,249,0.45)",
                fontWeight: 400,
              }}
            >
              {s.label}
            </div>
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
      icon: "💰",
      title: "Controle de Caixa",
      desc: "Abra e feche caixas com saldo inicial, acompanhe cada centavo em tempo real com total transparência.",
      tag: "Financeiro",
    },
    {
      icon: "📦",
      title: "Gestão de Estoque",
      desc: "Monitore produtos, receba alertas de estoque zero e nunca perca uma venda por falta de produto.",
      tag: "Estoque",
    },
    {
      icon: "📊",
      title: "Relatórios Completos",
      desc: "Exporte em CSV, HTML ou PDF. Visualize por período, por caixa ou produto com gráficos detalhados.",
      tag: "Analytics",
    },
    {
      icon: "💳",
      title: "Multi Pagamentos",
      desc: "PIX, Dinheiro, Débito e Crédito. Registre tudo e veja a distribuição por forma de pagamento.",
      tag: "Pagamentos",
    },
    {
      icon: "👥",
      title: "Gestão de Clientes",
      desc: "Cadastre clientes, acompanhe histórico de compras e construa relacionamentos duradouros.",
      tag: "CRM",
    },
    {
      icon: "🏢",
      title: "Multi Empresa",
      desc: "Gerencie várias filiais ou negócios em uma única conta. Troque com um clique.",
      tag: "Empresas",
    },
  ];

  return (
    <section
      id="funcionalidades"
      style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-tag">Funcionalidades</div>
          <h2
            className="section-heading"
            style={{ fontSize: "clamp(32px,4vw,52px)", marginBottom: 16 }}
          >
            Tudo que você precisa,
            <br />
            num só lugar
          </h2>
          <p
            className="section-sub"
            style={{ maxWidth: 480, margin: "0 auto", fontSize: 16 }}
          >
            Do caixa ao relatório final, o GestPro cobre todas as etapas da
            gestão do seu comércio.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {feats.map((f, i) => (
            <div
              key={i}
              className="glass hover-lift"
              style={{
                padding: "28px 24px",
                cursor: "default",
                transition: "border-color .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(16,185,129,0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 28 }}>{f.icon}</div>
                <span
                  style={{
                    fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                    fontSize: 10,
                    color: "#10b981",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    padding: "3px 10px",
                    borderRadius: 99,
                    letterSpacing: ".08em",
                  }}
                >
                  {f.tag}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-syne), 'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 19,
                  color: "#f1f5f9",
                  marginBottom: 10,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: 14,
                  color: "rgba(241,245,249,0.5)",
                  lineHeight: 1.7,
                }}
              >
                {f.desc}
              </p>
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
    {
      n: "01",
      title: "Crie sua conta",
      desc: "Cadastro em menos de 2 minutos. Sem cartão de crédito.",
      icon: "🚀",
    },
    {
      n: "02",
      title: "Configure sua empresa",
      desc: "Adicione produtos, defina preços e abra seu primeiro caixa.",
      icon: "⚙️",
    },
    {
      n: "03",
      title: "Registre vendas",
      desc: "Interface simples para lançar vendas rapidamente no dia a dia.",
      icon: "💸",
    },
    {
      n: "04",
      title: "Analise e cresça",
      desc: "Relatórios automáticos com insights para tomar decisões certeiras.",
      icon: "📈",
    },
  ];

  return (
    <section
      id="como-funciona"
      style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-tag">Como Funciona</div>
          <h2
            className="section-heading"
            style={{ fontSize: "clamp(32px,4vw,52px)", marginBottom: 16 }}
          >
            Simples do início ao fim
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 24,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 42,
              left: "12%",
              right: "12%",
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(16,185,129,0.3), transparent)",
              zIndex: 0,
            }}
          />
          {steps.map((s, i) => (
            <div
              key={i}
              style={{ textAlign: "center", position: "relative", zIndex: 1 }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  margin: "0 auto 20px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1.5px solid rgba(16,185,129,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 24px rgba(16,185,129,0.12)",
                  fontSize: 26,
                }}
              >
                {s.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                  fontSize: 10,
                  color: "#10b981",
                  letterSpacing: ".12em",
                  marginBottom: 8,
                }}
              >
                {s.n}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-syne), 'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#f1f5f9",
                  marginBottom: 8,
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: 13,
                  color: "rgba(241,245,249,0.5)",
                  lineHeight: 1.65,
                }}
              >
                {s.desc}
              </p>
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
      name: "Experimental",
      price: "Grátis",
      period: "30 dias grátis",
      desc: "Para experimentar o GestPro",
      features: [
        "1 empresa / loja",
        "1 caixa por empresa",
        "Dashboard completo",
        "Cadastro de produtos",
        "Registro de vendas",
        "Produtos ilimitados",
        "Exportacao PDF/CSV",
        "Nota fiscal",
        "Gestao completa",
      ],
      cta: "Plano gratuito",
      popular: false,
      icon: "flask",
      color: "#3b82f6",
    },
    {
      name: "Basico",
      price: "R$ 29,90",
      period: "por mes",
      desc: "Ideal para pequenos negocios",
      features: [
        "1 empresa / loja",
        "1 caixa",
        "Dashboard completo",
        "Relatorios basicos",
        "Suporte por e-mail",
        "Até 500 produtos",
        "Exportacao PDF/CSV",
        "Nota fiscal",
      ],
      cta: "Assinar Basico",
      popular: false,
      icon: "star",
      color: "#f1f5f9",
    },
    {
      name: "Pro",
      price: "R$ 49,90",
      period: "por mes",
      desc: "Para negocios em crescimento",
      features: [
        "5 empresas / lojas",
        "5 caixas",
        "Dashboard avancado",
        "Relatorios completos",
        "Suporte prioritario",
        "Produtos ilimitados",
        "Exportacao PDF/CSV",
        "Nota fiscal",
        "Gestao completa",
      ],
      cta: "Assinar Pro",
      popular: true,
      icon: "rocket",
      color: "#10b981",
    },
    {
      name: "Premium",
      price: "R$ 99,90",
      period: "por mes",
      desc: "Para redes e franquias",
      features: [
        "Empresas ilimitadas",
        "Caixas ilimitados",
        "Dashboard completo",
        "Relatorios avancados",
        "Suporte dedicado 24h",
        "Produtos ilimitados",
        "Exportacao PDF/CSV",
        "Nota fiscal",
        "Gestao completa",
        "API para integracoes",
        "Gestao de usuarios",
        "Gestao de estoque",
      ],
      cta: "Assinar Premium",
      popular: false,
      icon: "crown",
      color: "#f59e0b",
    },
  ];

  const getIcon = (icon: string, color: string) => {
    switch (icon) {
      case "flask":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 22h12M9 2h6M12 2v6M9 8h6l3 14H6z" />
          </svg>
        );
      case "star":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case "rocket":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
        );
      case "crown":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section
      id="planos"
      style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-tag">Planos</div>
          <h2
            className="section-heading"
            style={{ fontSize: "clamp(32px,4vw,52px)", marginBottom: 16 }}
          >
            Preco justo,
            <br />
            valor real
          </h2>
          <p className="section-sub" style={{ fontSize: 16 }}>
            Comece gratis. Escale quando quiser.
          </p>
        </div>

        <div
          className="plans-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          {plans.map((p, i) => (
            <div
              key={i}
              className={`glass hover-lift ${p.popular ? "popular-ring" : ""}`}
              style={{
                padding: "28px 24px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {p.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #10b981, #059669)",
                    borderRadius: 99,
                    padding: "4px 18px",
                    fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
                    fontSize: 10,
                    color: "#fff",
                    letterSpacing: ".1em",
                    whiteSpace: "nowrap",
                  }}
                >
                  MAIS POPULAR
                </div>
              )}

              {/* Icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {getIcon(p.icon, p.color)}
              </div>

              <div
                style={{
                  marginBottom: 4,
                  fontFamily: "var(--font-syne), 'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#f1f5f9",
                }}
              >
                {p.name}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: 12,
                  color: "rgba(241,245,249,0.45)",
                  marginBottom: 16,
                  lineHeight: 1.5,
                }}
              >
                {p.desc}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 4,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: p.price === "Gratis" ? 28 : 26,
                    color: p.popular ? "#10b981" : "#f1f5f9",
                  }}
                >
                  {p.price}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: 12,
                  color: "rgba(241,245,249,0.4)",
                  marginBottom: 20,
                }}
              >
                {p.period}
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 24,
                  flex: 1,
                }}
              >
                {p.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{ color: "#10b981", fontSize: 14, marginTop: 1 }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span
                      style={{
                        fontFamily:
                          "var(--font-manrope), 'Manrope', sans-serif",
                        fontSize: 13,
                        color: "rgba(241,245,249,0.65)",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className={p.popular ? "btn-green" : "btn-ghost"}
                onClick={onRegister}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: 14,
                  borderRadius: 10,
                  marginTop: "auto",
                }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ────���────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────────── */
const Testimonials = () => {
  const quotes = [
    {
      name: "Gabriela M.",
      role: "Proprietária da SportLife",
      text: "O GestPro aposentou minhas planilhas infinitas. O que eu levava horas para conferir, hoje resolvo em minutos pelo celular. Sobrou tempo para o que importa: vender!",
    },
    {
      name: "Jakeline S.",
      role: "Gerente da Adega Imperial",
      text: "Minha maior dor era o controle de estoque e o fechamento de caixa. Com o GestPro, o fluxo ficou impecável e eu finalmente parei de perder dinheiro por falta de organização.",
    },
    {
      name: "Ricardo M.",
      role: "Dono da Rede Mercadinho+",
      text: "Gerenciar 3 filiais à distância parecia impossível. O GestPro é meus olhos em cada unidade. Consigo ver as vendas em tempo real e tomar decisões sem precisar sair de casa.",
    },
  ];

  return (
    <section style={{ position: "relative", zIndex: 10, padding: "80px 28px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="section-tag">Depoimentos</div>
          <h2
            className="section-heading"
            style={{ fontSize: "clamp(30px,4vw,48px)" }}
          >
            Quem usa, recomenda
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
          }}
        >
          {quotes.map((q, i) => (
            <div
              key={i}
              className="glass hover-lift"
              style={{ padding: "28px 24px" }}
            >
              <div
                style={{
                  fontSize: 24,
                  color: "#10b981",
                  marginBottom: 14,
                  fontFamily: "var(--font-syne), 'Syne', sans-serif",
                }}
              >
                "
              </div>
              <p
                style={{
                  fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                  fontSize: 14,
                  color: "rgba(241,245,249,0.65)",
                  lineHeight: 1.75,
                  marginBottom: 20,
                }}
              >
                {q.text}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "#fff",
                  }}
                >
                  {q.name[0]}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-syne), 'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#f1f5f9",
                    }}
                  >
                    {q.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                      fontSize: 11,
                      color: "rgba(241,245,249,0.35)",
                    }}
                  >
                    {q.role}
                  </div>
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
  <section
    style={{ position: "relative", zIndex: 10, padding: "80px 28px 100px" }}
  >
    <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <div
        className="glass-bright"
        style={{
          padding: "64px 48px",
          borderRadius: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 500,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div className="section-tag" style={{ margin: "0 auto 24px" }}>
          Comece hoje mesmo
        </div>
        <h2
          className="section-heading"
          style={{ fontSize: "clamp(30px,4vw,52px)", marginBottom: 18 }}
        >
          Pronto para ter
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #10b981, #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            controle total?
          </span>
        </h2>
        <p
          className="section-sub"
          style={{ fontSize: 16, maxWidth: 420, margin: "0 auto 36px" }}
        >
          Junte-se a mais de 2.400 lojistas que já descobriram o poder de gerir
          com inteligência.
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn-green"
            onClick={onRegister}
            style={{ padding: "15px 36px", fontSize: 15, borderRadius: 12 }}
          >
            Criar conta grátis →
          </button>
          <button
            className="btn-ghost"
            onClick={onLogin}
            style={{ padding: "15px 28px", fontSize: 15, borderRadius: 12 }}
          >
            Já tenho conta
          </button>
        </div>
        <p
          style={{
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            fontSize: 12,
            color: "rgba(241,245,249,0.3)",
            marginTop: 20,
          }}
        >
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const Footer = () => {
  const links = [
    { label: "Como usar", href: "/como-usar" },
    { label: "Termos", href: "#" },
    { label: "Privacidade", href: "#" },
    { label: "Contato", href: "#" },
  ];

  return (
    <footer
      style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "40px 28px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Logo size="small" />
        <p
          style={{
            fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
            fontSize: 12,
            color: "rgba(241,245,249,0.3)",
          }}
        >
          {new Date().getFullYear()} GestPro - Todos os direitos reservados
        </p>
        <div className="footer-links" style={{ display: "flex", gap: 24 }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                fontSize: 12,
                color:
                  l.label === "Como usar"
                    ? "#10b981"
                    : "rgba(241,245,249,0.35)",
                textDecoration: "none",
                transition: "color .2s",
                fontWeight: l.label === "Como usar" ? 600 : 400,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  l.label === "Como usar"
                    ? "#10b981"
                    : "rgba(241,245,249,0.35)")
              }
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────── */
export default function LandingPage() {
  const router = useRouter();
  const goLogin = useCallback(() => router.push("/auth/login"), [router]);
  const goRegister = useCallback(() => router.push("/auth/cadastro"), [router]);

  return (
    <main
      style={{
        background: "#050608",
        minHeight: "100vh",
        color: "#f1f5f9",
        overflowX: "hidden",
      }}
    >
      <GlobalStyles />
      <Background />
      <Nav onLogin={goLogin} onRegister={goRegister} />
      <Hero onRegister={goRegister} onLogin={goLogin} />
      <Stats />
      <Features />
      <HowItWorks />
      <Plans onRegister={goRegister} />
      <Testimonials />
      <CTAFinal onRegister={goRegister} onLogin={goLogin} />
      <Footer />
    </main>
  );
}
