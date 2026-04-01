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
   ICONS
───────────────────────────────────────────── */
const ArrowRight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Check = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

/* ─────────────────────────────────────────────
   GLOBAL STYLES — design do Arquivo 1
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::selection { background: rgba(16,185,129,0.28); color: #fff; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #050608; }
    ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.35); border-radius: 2px; }
    html { scroll-behavior: smooth; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-20px); }
    }
    @keyframes pulse-glow {
      0%,100% { box-shadow: 0 0 40px rgba(16,185,129,0.2); }
      50%     { box-shadow: 0 0 80px rgba(16,185,129,0.4); }
    }
    @keyframes grid-fade {
      from { opacity: 0; }
      to { opacity: 0.03; }
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .fade-up { animation: fadeUp 0.8s ease both; }
    .float   { animation: float 6s ease-in-out infinite; }
    .pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
    .blink   { animation: blink 2s ease-in-out infinite; }
    .spin-slow { animation: spinSlow 20s linear infinite; }
    .d1 { animation-delay: .1s; }
    .d2 { animation-delay: .2s; }
    .d3 { animation-delay: .35s; }
    .d4 { animation-delay: .5s; }
    .d5 { animation-delay: .65s; }

    /* ── Botões do Arquivo 1 ── */
    .btn-primary {
      background: #10b981;
      color: #fff;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s ease;
      text-decoration: none;
    }
    .btn-primary:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(16,185,129,0.3);
    }

    .btn-outline {
      background: transparent;
      color: #94a3b8;
      border: 1px solid rgba(148,163,184,0.2);
      cursor: pointer;
      font-family: inherit;
      font-weight: 500;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.25s ease;
      text-decoration: none;
    }
    .btn-outline:hover {
      border-color: #10b981;
      color: #10b981;
    }

    /* ── Cards do Arquivo 1 ── */
    .card {
      background: rgba(13,15,18,0.6);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    .card:hover {
      border-color: rgba(16,185,129,0.3);
      transform: translateY(-4px);
    }

    .stat-card {
      background: rgba(16,185,129,0.05);
      border: 1px solid rgba(16,185,129,0.1);
      border-radius: 12px;
    }

    /* ── Mobile menu overlay ── */
    .mob-menu {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(5,6,8,0.98);
      backdrop-filter: blur(20px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 32px;
      animation: fadeUp 0.2s ease;
    }

    @media(max-width:1024px){
      .desktop-only { display: none !important; }
      .mobile-only  { display: flex !important; }
      .hero-grid    { flex-direction: column !important; }
      .hero-content { align-items: center !important; text-align: center !important; }
      .plans-grid   { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media(max-width:768px){
      .hero-text        { font-size: 32px !important; line-height: 1.2 !important; }
      .section-title    { font-size: 28px !important; }
      .features-grid    { grid-template-columns: 1fr !important; }
      .plans-grid       { grid-template-columns: 1fr !important; }
      .stats-grid       { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
      .testimonials-grid{ grid-template-columns: 1fr !important; }
      .steps-grid       { grid-template-columns: 1fr !important; }
      .mob-hamburger    { display: flex !important; }
      .desktop-nav-btns { display: none !important; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   BACKGROUND — idêntico ao Arquivo 1
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
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
      `,
        backgroundSize: "60px 60px",
        animation: "grid-fade 1s ease forwards",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "-30%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "120%",
        height: "60%",
        background:
          "radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)",
      }}
    />

    {
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.15,
          }}
        >
          <source src="/videos/video-teste-comprensado.mp4" type="video/mp4" />
        </video>
      </div>
    }
  </div>
);

/* ─────────────────────────────────────────────
   LOGO
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
          borderRadius: 8,
        }}
      />
      <span
        style={{
          fontWeight: 700,
          fontSize,
          color: "#f1f5f9",
          letterSpacing: "-0.02em",
        }}
      >
        GestPro
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────
   NAV — estilo Arquivo 1 + lógica Arquivo 2
───────────────────────────────────────────── */
const Nav = ({ onLogin, onRegister }: NavProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label: "Funcionalidades", href: "#funcionalidades" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Planos", href: "#planos" },
  ];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 0",
          background: scrolled ? "rgba(5,6,8,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />

          {/* Links desktop */}
          <div
            className="desktop-only"
            style={{ display: "flex", alignItems: "center", gap: 40 }}
          >
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(148,163,184,0.8)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(148,163,184,0.8)")
                }
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Botões desktop */}
          <div className="desktop-only" style={{ display: "flex", gap: 12 }}>
            <button
              className="btn-outline"
              onClick={onLogin}
              style={{ padding: "10px 20px", fontSize: 14 }}
            >
              Entrar
            </button>
            <button
              className="btn-primary"
              onClick={onRegister}
              style={{ padding: "10px 24px", fontSize: 14 }}
            >
              Começar grátis
            </button>
          </div>

          {/* Hamburguer mobile */}
          <button
            className="mobile-only mob-hamburger"
            onClick={() => setMenuOpen(true)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#f1f5f9",
              padding: 8,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
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
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#f1f5f9",
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
          <button
            className="btn-primary"
            onClick={() => {
              setMenuOpen(false);
              onRegister();
            }}
            style={{ padding: "16px 48px", fontSize: 16, marginTop: 24 }}
          >
            Começar grátis
          </button>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   DASHBOARD PREVIEW — do Arquivo 2
───────────────────────────────────────────── */
const DashboardPreview = () => (
  <div
    style={{
      width: "100%",
      maxWidth: 600,
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
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
          style={{ width: 11, height: 11, borderRadius: "80%", background: c }}
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
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
        }}
      >
        gestpro.app/dashboard
      </div>
    </div>
    <img
      src="/images/dashboard3.png"
      alt="GestPro Dashboard"
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   HERO — layout Arquivo 2 + estilo Arquivo 1
───────────────────────────────────────────── */
const lojistas = [
  { nome: "Kelly", img: "/logistas-img/kelly.jpg" },
  { nome: "Heloisa", img: "/logistas-img/heloisa.png" },
  { nome: "Matheus", img: "/logistas-img/matheus.jpg" },
  { nome: "Ricardo", img: "/logistas-img/matheus.png" },
  { nome: "Gabriela", img: "/logistas-img/gabriela.jpg" },
];

const Hero = ({ onRegister, onLogin }: HeroProps) => (
  <section
    style={{
      position: "relative",
      zIndex: 10,
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      padding: "120px 24px 80px",
    }}
  >
    <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div
        className="hero-grid"
        style={{ display: "flex", alignItems: "center", gap: 80 }}
      >
        {/* Lado esquerdo */}
        <div
          className="hero-content"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 28,
          }}
        >
          {/* Badge */}
          <div
            className="fade-up"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 100,
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
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#10b981",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Gestão de Vendas Inteligente
            </span>
          </div>

          {/* Headline */}
          <h1
            className="hero-text fade-up d1"
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#f1f5f9",
              letterSpacing: "-0.03em",
            }}
          >
            Seu negócio,
            <br />
            <span style={{ color: "#10b981" }}>no controle.</span>
          </h1>

          {/* Sub */}
          <p
            className="fade-up d2"
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(148,163,184,0.8)",
              maxWidth: 480,
            }}
          >
            Caixa, vendas, estoque e relatórios em um único painel.
            <br />
            Feito para lojistas que querem crescer sem complicação.
          </p>

          {/* CTAs */}
          <div
            className="fade-up d3"
            style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
          >
            <button
              className="btn-primary"
              onClick={onRegister}
              style={{ padding: "16px 32px", fontSize: 16 }}
            >
              Começar grátis <ArrowRight />
            </button>
            <button
              className="btn-outline"
              onClick={onLogin}
              style={{ padding: "16px 26px", fontSize: 16 }}
            >
              Já tenho conta
            </button>
          </div>

          {/* Social proof — avatares reais do Arquivo 2 */}
          <div
            className="fade-up d4"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {lojistas.slice(0, 5).map((lojista, i) => (
                <div
                  key={lojista.nome}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "3px solid #050608",
                    marginLeft: i > 0 ? -12 : 0,
                    overflow: "hidden",
                    background: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10 - i,
                  }}
                >
                  <img
                    src={lojista.img}
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
            <div>
              <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>
                +1.200 lojistas
              </div>
              <div style={{ color: "rgba(148,163,184,0.6)", fontSize: 13 }}>
                já usam o GestPro
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito — preview flutuante */}
        <div
          className="desktop-only float"
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            position: "relative",
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
          <div className="pulse-glow">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   STATS — dados do Arquivo 2, estilo Arquivo 1
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
      style={{ position: "relative", zIndex: 10, padding: "0 24px 80px" }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 16,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="stat-card fade-up"
              style={{
                padding: "24px 20px",
                textAlign: "center",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#10b981",
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: "rgba(148,163,184,0.6)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   FEATURES — dados do Arquivo 2, cards do Arquivo 1
───────────────────────────────────────────── */
const Features = () => {
  const feats = [
    {
      icon: "💰",
      title: "Controle de Caixa",
      tag: "Financeiro",
      desc: "Abra e feche caixas com saldo inicial, acompanhe cada centavo em tempo real com total transparência.",
    },
    {
      icon: "📦",
      title: "Gestão de Estoque",
      tag: "Estoque",
      desc: "Monitore produtos, receba alertas de estoque zero e nunca perca uma venda por falta de produto.",
    },
    {
      icon: "📊",
      title: "Relatórios Completos",
      tag: "Analytics",
      desc: "Exporte em CSV, HTML ou PDF. Visualize por período, por caixa ou produto com gráficos detalhados.",
    },
    {
      icon: "💳",
      title: "Multi Pagamentos",
      tag: "Pagamentos",
      desc: "PIX, Dinheiro, Débito e Crédito. Registre tudo e veja a distribuição por forma de pagamento.",
    },
    {
      icon: "👥",
      title: "Gestão de Clientes",
      tag: "CRM",
      desc: "Cadastre clientes, acompanhe histórico de compras e construa relacionamentos duradouros.",
    },
    {
      icon: "🏢",
      title: "Multi Empresa",
      tag: "Empresas",
      desc: "Gerencie várias filiais ou negócios em uma única conta. Troque com um clique.",
    },
  ];

  return (
    <section
      id="funcionalidades"
      style={{ position: "relative", zIndex: 10, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            className="fade-up"
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              color: "#10b981",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Funcionalidades
          </span>
          <h2
            className="section-title fade-up d1"
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            Tudo que você precisa,
            <br />
            <span style={{ color: "#10b981" }}>num só lugar.</span>
          </h2>
        </div>

        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {feats.map((f, i) => (
            <div
              key={i}
              className="card fade-up"
              style={{ padding: "32px 28px", animationDelay: `${i * 0.1}s` }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(16,185,129,0.1)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                  }}
                >
                  {f.icon}
                </div>
                <span
                  style={{
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
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#f1f5f9",
                  marginBottom: 10,
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "rgba(148,163,184,0.7)",
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
   HOW IT WORKS — passos do Arquivo 2, cards do Arquivo 1
───────────────────────────────────────────── */
const HowItWorks = () => {
  const steps = [
    {
      n: "01",
      icon: "🚀",
      title: "Crie sua conta",
      desc: "Cadastro em menos de 2 minutos. Sem cartão de crédito.",
    },
    {
      n: "02",
      icon: "⚙️",
      title: "Configure sua empresa",
      desc: "Adicione produtos, defina preços e abra seu primeiro caixa.",
    },
    {
      n: "03",
      icon: "💸",
      title: "Registre vendas",
      desc: "Interface simples para lançar vendas rapidamente no dia a dia.",
    },
    {
      n: "04",
      icon: "📈",
      title: "Analise e cresça",
      desc: "Relatórios automáticos com insights para tomar decisões certeiras.",
    },
  ];

  return (
    <section
      id="como-funciona"
      style={{ position: "relative", zIndex: 10, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            className="fade-up"
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              color: "#10b981",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Como funciona
          </span>
          <h2
            className="section-title fade-up d1"
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            Simples de usar,
            <br />
            <span style={{ color: "#10b981" }}>poderoso de verdade.</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {steps.map((s, i) => (
            <div
              key={i}
              className="card fade-up"
              style={{
                padding: "28px 32px",
                display: "flex",
                alignItems: "center",
                gap: 28,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  flexShrink: 0,
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#10b981",
                    letterSpacing: "0.1em",
                  }}
                >
                  {s.n}
                </span>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#f1f5f9",
                    marginBottom: 4,
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(148,163,184,0.7)" }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   PLANS — planos do Arquivo 2, estilo Arquivo 1
───────────────────────────────────────────── */
const Plans = ({ onRegister }: PlansProps) => {
  const plans = [
    {
      name: "Experimental",
      price: "Grátis",
      period: "30 dias grátis",
      desc: "Para experimentar o GestPro",
      popular: false,
      emoji: "🎁",
      features: [
        "1 empresa / loja",
        "1 caixa por empresa",
        "Dashboard completo",
        "Cadastro de produtos",
        "Registro de vendas",
        "Produtos ilimitados",
        "Exportação PDF/CSV",
        "Nota fiscal",
        "Gestão completa",
      ],
      cta: "Começar grátis",
    },
    {
      name: "Básico",
      price: "R$ 29,90",
      period: "por mês",
      desc: "Ideal para pequenos negócios",
      popular: false,
      emoji: "⭐",
      features: [
        "1 empresa / loja",
        "1 caixa",
        "Dashboard completo",
        "Relatórios básicos",
        "Suporte por e-mail",
        "Até 500 produtos",
        "Exportação PDF/CSV",
        "Nota fiscal",
      ],
      cta: "Assinar Básico",
    },
    {
      name: "Pro",
      price: "R$ 49,90",
      period: "por mês",
      desc: "Para negócios em crescimento",
      popular: true,
      emoji: "🚀",
      features: [
        "5 empresas / lojas",
        "5 caixas",
        "Dashboard avançado",
        "Relatórios completos",
        "Suporte prioritário",
        "Produtos ilimitados",
        "Exportação PDF/CSV",
        "Nota fiscal",
        "Gestão completa",
      ],
      cta: "Assinar Pro",
    },
    {
      name: "Premium",
      price: "R$ 99,90",
      period: "por mês",
      desc: "Para redes e franquias",
      popular: false,
      emoji: "👑",
      features: [
        "Empresas ilimitadas",
        "Caixas ilimitados",
        "Dashboard completo",
        "Relatórios avançados",
        "Suporte dedicado 24h",
        "Produtos ilimitados",
        "Exportação PDF/CSV",
        "Nota fiscal",
        "Gestão completa",
        "API para integrações",
      ],
      cta: "Assinar Premium",
    },
  ];

  return (
    <section
      id="planos"
      style={{ position: "relative", zIndex: 10, padding: "80px 24px" }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            className="fade-up"
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              color: "#10b981",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Planos
          </span>
          <h2
            className="section-title fade-up d1"
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
            }}
          >
            Escolha o plano ideal
            <br />
            <span style={{ color: "#10b981" }}>para seu negócio.</span>
          </h2>
          <p
            className="fade-up d2"
            style={{
              fontSize: 16,
              color: "rgba(148,163,184,0.6)",
              marginTop: 12,
            }}
          >
            Comece grátis. Escale quando quiser.
          </p>
        </div>

        <div
          className="plans-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          {plans.map((p, i) => (
            <div
              key={i}
              className="fade-up"
              style={{
                background: p.popular
                  ? "rgba(16,185,129,0.05)"
                  : "rgba(13,15,18,0.6)",
                border: p.popular
                  ? "1px solid rgba(16,185,129,0.3)"
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "28px 24px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                animationDelay: `${i * 0.1}s`,
                boxShadow: p.popular
                  ? "0 0 40px rgba(16,185,129,0.12), inset 0 0 40px rgba(16,185,129,0.03)"
                  : "none",
              }}
            >
              {p.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#10b981",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "6px 18px",
                    borderRadius: 100,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Mais Popular
                </div>
              )}

              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "rgba(16,185,129,0.1)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  fontSize: 22,
                }}
              >
                {p.emoji}
              </div>

              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#f1f5f9",
                  marginBottom: 4,
                }}
              >
                {p.name}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.6)",
                  marginBottom: 20,
                }}
              >
                {p.desc}
              </p>

              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: p.popular ? "#10b981" : "#f1f5f9",
                  }}
                >
                  {p.price}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(148,163,184,0.6)",
                    marginLeft: 8,
                  }}
                >
                  {p.period}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 24,
                  flex: 1,
                }}
              >
                {p.features.map((f, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{ color: "#10b981", flexShrink: 0, marginTop: 1 }}
                    >
                      <Check />
                    </div>
                    <span
                      style={{ fontSize: 13, color: "rgba(148,163,184,0.8)" }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className={p.popular ? "btn-primary" : "btn-outline"}
                onClick={onRegister}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  fontSize: 14,
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

/* ─────────────────────────────────────────────
   TESTIMONIALS — do Arquivo 2, estilo Arquivo 1
───────────────────────────────────────────── */
const quotes = [
  {
    name: "Gabriela M.",
    role: "Proprietária da GM Black Sports",
    img: "/logistas-img/gabriela.jpg",
    text: "Eu vivia escrava de planilhas e sempre ficava aquela dúvida se os números batiam. O GestPro me deu liberdade. Hoje resolvo tudo pelo celular entre um treino e outro na loja.",
  },
  {
    name: "Jakeline S.",
    role: "Dona de Adega",
    img: "/logistas-img/jakeline.jpg",
    text: "Minha maior dor de cabeça era o fechamento de caixa; sempre parecia que estava faltando algo. Com o sistema, o fluxo ficou automático. É um alívio chegar no fim do dia e ver que tudo bateu.",
  },
  {
    name: "Felipe C.",
    role: "Empreendedor",
    img: "/logistas-img/felipe.jpg",
    text: "Cuidar de mais de uma unidade à distância era um caos, eu nunca sabia o que estava acontecendo de verdade. O GestPro virou meus olhos. Consigo ver cada venda em tempo real de onde estiver.",
  },
];

const Testimonials = () => (
  <section style={{ position: "relative", zIndex: 10, padding: "80px 24px" }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span
          className="fade-up"
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            color: "#10b981",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Depoimentos
        </span>
        <h2
          className="section-title fade-up d1"
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
          }}
        >
          O que dizem os
          <br />
          <span style={{ color: "#10b981" }}>nossos lojistas.</span>
        </h2>
      </div>

      <div
        className="testimonials-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 20,
        }}
      >
        {quotes.map((q, i) => (
          <div
            key={i}
            className="card fade-up"
            style={{ padding: 32, animationDelay: `${i * 0.15}s` }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "2px solid rgba(16,185,129,0.3)",
                  overflow: "hidden",
                  background: "#1e293b",
                  flexShrink: 0,
                }}
              >
                <img
                  src={q.img}
                  alt={q.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>
                  {q.name}
                </h4>
                <p style={{ fontSize: 12, color: "#10b981" }}>{q.role}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} />
              ))}
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "rgba(148,163,184,0.7)",
                fontStyle: "italic",
              }}
            >
              "{q.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   CTA FINAL — lógica do Arquivo 2, estilo Arquivo 1
───────────────────────────────────────────── */
const CTAFinal = ({ onRegister, onLogin }: CTAProps) => (
  <section style={{ position: "relative", zIndex: 10, padding: "80px 24px" }}>
    <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
      <div
        style={{
          background: "rgba(16,185,129,0.05)",
          border: "1px solid rgba(16,185,129,0.18)",
          borderRadius: 24,
          padding: "64px 48px",
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

        <span
          className="fade-up"
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            color: "#10b981",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Comece Grátis
        </span>
        <h2
          className="section-title fade-up d1"
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Pronto para ter
          <br />
          <span style={{ color: "#10b981" }}>controle total?</span>
        </h2>
        <p
          className="fade-up d2"
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "rgba(148,163,184,0.7)",
            marginBottom: 32,
            maxWidth: 420,
            margin: "0 auto 32px",
          }}
        >
          Sem cartão de crédito. PDV completo desde o dia 1.
          <br />
          Estoque, caixa e relatórios inclusos.
        </p>
        <div
          className="fade-up d3"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn-primary"
            onClick={onRegister}
            style={{ padding: "16px 32px", fontSize: 16 }}
          >
            Criar conta grátis <ArrowRight />
          </button>
          <button
            className="btn-outline"
            onClick={onLogin}
            style={{ padding: "16px 26px", fontSize: 16 }}
          >
            Já tenho conta
          </button>
        </div>
        <p
          style={{
            fontSize: 12,
            color: "rgba(148,163,184,0.35)",
            marginTop: 20,
          }}
        >
          Sem cartão de crédito · Cancele quando quiser
        </p>
        <div
          className="fade-up d4"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 20,
          }}
        >
          <div style={{ display: "flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} />
            ))}
          </div>
          <span style={{ fontSize: 14, color: "rgba(148,163,184,0.6)" }}>
            4.8/5 — avaliado por +200 lojistas
          </span>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   FOOTER — links do Arquivo 2, estilo Arquivo 1
───────────────────────────────────────────── */
const Footer = () => {
  const links = [
    { label: "Como usar", href: "/como-usar" },
    { label: "Termos", href: "/termos" },
    { label: "Privacidade", href: "/privacidade" },
    { label: "Contato", href: "/contato" },
  ];

  return (
    <footer
      style={{
        position: "relative",
        zIndex: 10,
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <Logo size="small" />
        <span style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>
          © {new Date().getFullYear()} GestPro · Todos os direitos reservados
        </span>
        <div style={{ display: "flex", gap: 24 }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              style={{
                fontSize: 14,
                color:
                  l.label === "Como usar" ? "#10b981" : "rgba(148,163,184,0.5)",
                textDecoration: "none",
                fontWeight: l.label === "Como usar" ? 600 : 400,
                transition: "color .2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color =
                  l.label === "Como usar" ? "#10b981" : "rgba(148,163,184,0.5)")
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
