"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  BarChart2,
  FileText,
  Mail,
  Lock,
  User,
  Package,
  ShoppingCart,
  Shield,
  Clock,
  HeartHandshake,
  Menu,
} from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormInput } from "@/components/auth/FormInput";
import styles from "@/app/styles/auth.module.css";
import s from "@/app/styles/landing.module.css";

/* ─── Google Icon ─────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/* ─── SVG Illustration ────────────────────────────────────────────────────── */
function StoreIllustration() {
  return (
    <svg
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={s.illustration}
    >
      <ellipse
        cx="260"
        cy="395"
        rx="210"
        ry="22"
        fill="rgba(16,185,129,0.08)"
      />
      <rect x="52" y="205" width="38" height="98" rx="6" fill="url(#b1)" />
      <rect x="102" y="162" width="38" height="141" rx="6" fill="url(#b2)" />
      <rect x="152" y="118" width="38" height="185" rx="6" fill="url(#b3)" />
      <rect x="202" y="74" width="38" height="229" rx="6" fill="url(#b4)" />
      <path
        d="M71 200 L218 68"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="7 4"
      />
      <path
        d="M210 58 L222 70 L210 82"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="272" y="202" width="184" height="163" rx="8" fill="#1a3557" />
      <rect x="282" y="213" width="164" height="82" rx="5" fill="#0d213d" />
      <rect
        x="292"
        y="222"
        width="57"
        height="47"
        rx="4"
        fill="#3b82f6"
        opacity="0.75"
      />
      <rect
        x="359"
        y="222"
        width="57"
        height="47"
        rx="4"
        fill="#3b82f6"
        opacity="0.75"
      />
      <rect x="341" y="315" width="42" height="50" rx="4" fill="#0d213d" />
      <circle cx="375" cy="342" r="3" fill="#60a5fa" />
      <path d="M268 202 Q278 162 364 162 Q450 162 460 202 Z" fill="#10b981" />
      <path
        d="M288 202 Q293 167 364 167"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M314 202 Q319 165 364 164"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M392 202 Q388 166 364 164"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M416 202 Q412 168 364 167"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M440 202 Q436 170 364 169"
        stroke="white"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <rect x="38" y="66" width="82" height="72" rx="13" fill="#0f766e" />
      <path
        d="M54 88 L57 107 L96 107 L99 88"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M51 81 L54 88"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="67" cy="114" r="4.5" fill="white" />
      <circle cx="89" cy="114" r="4.5" fill="white" />
      <rect x="40" y="311" width="46" height="44" rx="4" fill="#f59e0b" />
      <rect x="46" y="302" width="46" height="44" rx="4" fill="#fbbf24" />
      <line
        x1="69"
        y1="302"
        x2="69"
        y2="346"
        stroke="#f59e0b"
        strokeWidth="1.5"
      />
      <line
        x1="46"
        y1="324"
        x2="92"
        y2="324"
        stroke="#f59e0b"
        strokeWidth="1.5"
      />
      <rect x="372" y="56" width="122" height="38" rx="19" fill="#059669" />
      <text
        x="433"
        y="80"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="700"
        fontFamily="'Sora',system-ui"
      >
        {"+24% vendas"}
      </text>
      <circle cx="484" cy="145" r="4.5" fill="#10b981" opacity="0.45" />
      <circle cx="499" cy="124" r="3" fill="#3b82f6" opacity="0.45" />
      <circle cx="472" cy="115" r="2" fill="#10b981" opacity="0.32" />
      <defs>
        <linearGradient id="b1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="b2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="b3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="b4" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Dados ───────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: <Package size={22} />,
    bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    color: "#059669",
    title: "Estoque Inteligente",
    desc: "Alertas automaticos de ruptura, movimentacao em tempo real e controle de validade.",
  },
  {
    icon: <ShoppingCart size={22} />,
    bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
    color: "#2563eb",
    title: "PDV Completo",
    desc: "Vendas rapidas, troco automatico, multiplas formas de pagamento e cupom fiscal.",
  },
  {
    icon: <BarChart2 size={22} />,
    bg: "linear-gradient(135deg, #ccfbf1, #99f6e4)",
    color: "#0d9488",
    title: "Dashboard em Tempo Real",
    desc: "Veja faturamento, ticket medio e produtos mais vendidos num unico painel.",
  },
  {
    icon: <Users size={22} />,
    bg: "linear-gradient(135deg, #fef3c7, #fde68a)",
    color: "#d97706",
    title: "CRM de Clientes",
    desc: "Historico de compras, perfil de consumo e acoes de fidelizacao integradas.",
  },
  {
    icon: <FileText size={22} />,
    bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
    color: "#7c3aed",
    title: "Notas Fiscais (NF-e)",
    desc: "Emita NF-e e NFC-e diretamente pelo sistema, sem precisar de outro software.",
  },
  {
    icon: <Shield size={22} />,
    bg: "linear-gradient(135deg, #fce7f3, #fbcfe8)",
    color: "#db2777",
    title: "Seguranca Bancaria",
    desc: "Criptografia ponta a ponta, backups diarios automaticos e controle de acesso por perfil.",
  },
];

const impactItems = [
  {
    icon: <Clock size={22} />,
    title: "Economize 15h por semana",
    desc: "Automatize tarefas manuais como controle de estoque, fechamento de caixa e emissao de notas.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Aumente seu faturamento em 24%",
    desc: "Lojistas que usam o GestPro reportam aumento medio de 24% nas vendas nos primeiros 90 dias.",
  },
  {
    icon: <HeartHandshake size={22} />,
    title: "Suporte que resolve de verdade",
    desc: "Time 100% brasileiro, disponivel por chat e WhatsApp. Tempo medio de resposta: 3 minutos.",
  },
];

const pricingPlans = [
  {
    name: "Basico",
    desc: "Ideal para quem esta comecando e quer organizar a loja.",
    price: "29,90",
    period: "mes",
    save: null,
    popular: false,
    features: [
      { text: "Controle de estoque", enabled: true },
      { text: "PDV simplificado", enabled: true },
      { text: "Ate 500 produtos", enabled: true },
      { text: "1 usuario", enabled: true },
      { text: "Relatorios basicos", enabled: true },
      { text: "Suporte por email", enabled: true },
      { text: "NF-e e NFC-e", enabled: false },
      { text: "CRM de clientes", enabled: false },
    ],
    btnLabel: "Comecar gratis",
  },
  {
    name: "Pro",
    desc: "Para lojas em crescimento que precisam de mais controle.",
    price: "49,90",
    period: "mes",
    save: "Mais popular",
    popular: true,
    features: [
      { text: "Tudo do Basico", enabled: true },
      { text: "Produtos ilimitados", enabled: true },
      { text: "Ate 5 usuarios", enabled: true },
      { text: "NF-e e NFC-e", enabled: true },
      { text: "CRM de clientes", enabled: true },
      { text: "Dashboards avancados", enabled: true },
      { text: "Suporte prioritario", enabled: true },
      { text: "Integracoes (iFood, Shopee)", enabled: false },
    ],
    btnLabel: "Comecar gratis",
  },
  {
    name: "Premium",
    desc: "Para operacoes maiores com multiplas lojas e equipes.",
    price: "89,90",
    period: "mes",
    save: "Economize 40%/ano",
    popular: false,
    features: [
      { text: "Tudo do Pro", enabled: true },
      { text: "Usuarios ilimitados", enabled: true },
      { text: "Multi-lojas", enabled: true },
      { text: "Integracoes completas", enabled: true },
      { text: "API personalizada", enabled: true },
      { text: "Relatorios customizados", enabled: true },
      { text: "Gerente de conta dedicado", enabled: true },
      { text: "Suporte 24/7 WhatsApp", enabled: true },
    ],
    btnLabel: "Falar com vendas",
  },
];

const navItems = [
  { label: "Funcionalidades", target: "features" },
  { label: "Diferenciais", target: "impact" },
  { label: "Precos", target: "pricing" },
  { label: "Contato", target: "cta" },
];

/* ─── Scroll reveal hook ──────────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `${s.reveal} ${visible ? s.revealVisible : ""}` };
}

/* ─── RevealSection wrapper ───────────────────────────────────────────────── */
function RevealSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, className } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  /* login */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* register */
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  /* UI */
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  /* ─── Scroll to section ─── */
  const scrollToSection = useCallback((id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setRegSuccess(true);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setRegLoading(false);
    }
  };

  const openModal = (m: "login" | "register") => {
    setModal(m);
    setError("");
    setRegError("");
    setRegSuccess(false);
  };

  return (
    <div className={s.page}>
      {/* ════════════════════ NAVBAR ════════════════════ */}
      <nav className={`${s.navbar} ${scrolled ? s.navbarScrolled : ""}`}>
        <div className={s.navInner}>
          <div className={s.logo}>
            <svg
              width="26"
              height="26"
              viewBox="0 0 36 36"
              fill="none"
              aria-hidden
            >
              <rect x="2" y="14" width="5" height="18" rx="2" fill="#3b82f6" />
              <rect x="10" y="8" width="5" height="24" rx="2" fill="#06b6d4" />
              <rect x="18" y="2" width="5" height="30" rx="2" fill="#10b981" />
              <path
                d="M6 12 L21 4"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M18 3 L24 2 L23 8"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="28"
                cy="20"
                r="6"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              <path
                d="M26 20 h4 M28 18 v4"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>
              <span className={s.logoDark}>Gest</span>
              <span className={s.logoGreen}>Pro</span>
            </span>
          </div>

          {/* Nav Links desktop */}
          <div className={s.navLinks}>
            {navItems.map((item) => (
              <button
                key={item.target}
                className={s.navLink}
                onClick={() => scrollToSection(item.target)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={s.navActions}>
            <button
              className={s.navBtnSecondary}
              onClick={() => openModal("login")}
            >
              Entrar
            </button>
            <button
              className={s.navBtnPrimary}
              onClick={() => openModal("register")}
            >
              Comecar gratis <ArrowRight size={14} />
            </button>
            <button
              className={s.mobileMenuBtn}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`${s.mobileMenu} ${mobileOpen ? s.mobileMenuOpen : ""}`}>
        {navItems.map((item) => (
          <button
            key={item.target}
            className={s.mobileMenuLink}
            onClick={() => scrollToSection(item.target)}
          >
            {item.label}
          </button>
        ))}
        <div className={s.mobileMenuActions}>
          <button
            className={s.navBtnSecondary}
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => {
              setMobileOpen(false);
              openModal("login");
            }}
          >
            Entrar
          </button>
          <button
            className={s.navBtnPrimary}
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => {
              setMobileOpen(false);
              openModal("register");
            }}
          >
            Comecar gratis <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ════════════════════ HERO ════════════════════ */}
      <section className={s.heroSection} id="hero">
        <div className={s.heroGrid}>
          <div className={s.heroLeft}>
            <div className={s.floatWrapper}>
              <StoreIllustration />
            </div>
          </div>

          <div className={s.heroRight}>
            <span className={s.badge}>
              <span className={s.badgeDot} />
              {"7 dias gratis \u2014 sem cartao de credito"}
            </span>

            <h1 className={s.heroTitle}>
              Sua loja no controle.
              <br />
              <span className={s.heroHighlight}>Suas vendas nas alturas.</span>
            </h1>

            <p className={s.heroSubtitle}>
              {"Mais de "}
              <strong style={{ color: "#34d399" }}>2.400 lojistas</strong>
              {
                " ja organizam estoque, vendas e clientes com o GestPro \u2014 e faturam mais todo mes. Comece hoje, sem burocracia."
              }
            </p>

            <div className={s.socialRow}>
              <div className={s.avatarStack}>
                {["#10b981", "#3b82f6", "#f59e0b", "#ec4899"].map((c, i) => (
                  <div
                    key={i}
                    className={s.avatarBubble}
                    style={{ background: c, marginLeft: i ? "-10px" : 0 }}
                  >
                    {["M", "A", "R", "C"][i]}
                  </div>
                ))}
              </div>
              <p className={s.socialText}>
                <strong>{"+2.400"}</strong> {"lojistas ativos \u2014 4,9/5"}
              </p>
            </div>

            <div className={s.heroCta}>
              <button
                className={s.ctaBtnPrimary}
                onClick={() => openModal("register")}
              >
                Testar 7 dias gratis
                <ArrowRight size={16} />
              </button>
              <button
                className={s.ctaBtnGhost}
                onClick={() => openModal("login")}
              >
                Ja tenho conta
              </button>
            </div>

            <div className={s.heroGuarantees}>
              {[
                "Sem cartao de credito",
                "Cancele quando quiser",
                "Suporte em portugues",
              ].map((t) => (
                <span key={t} className={s.guaranteeItem}>
                  <Check size={12} strokeWidth={3} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <svg
          className={s.wave}
          viewBox="0 0 1440 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 36 C360 72 1080 0 1440 36 L1440 72 L0 72 Z"
            fill="#f0fdf4"
          />
        </svg>
      </section>

      {/* ════════════════════ TRUST BAR ════════════════════ */}
      <RevealSection>
        <div className={s.trustBar}>
          <div className={s.trustInner}>
            {[
              { val: "2.400+", label: "Lojas ativas" },
              { val: "R$ 18M+", label: "Em vendas gerenciadas" },
              { val: "99,9%", label: "Uptime garantido" },
              { val: "4,9/5", label: "Avaliacao dos clientes" },
            ].map((t) => (
              <div key={t.label} className={s.trustItem}>
                <span className={s.trustVal}>{t.val}</span>
                <span className={s.trustLabel}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section className={s.featuresSection} id="features">
        <div className={s.sectionInner}>
          <RevealSection>
            <div className={s.sectionHead}>
              <span className={s.sectionEyebrow}>Funcionalidades</span>
              <h2 className={s.sectionTitle}>Tudo para sua loja crescer</h2>
              <p className={s.sectionSub}>
                Cada recurso foi criado pensando no dia a dia de quem trabalha
                com varejo.
              </p>
            </div>
          </RevealSection>
          <div className={s.featureGrid}>
            {features.map((f, i) => (
              <RevealSection key={f.title} delay={i * 80}>
                <div className={s.featureCard}>
                  <div
                    className={s.featureIconWrap}
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <h3 className={s.featureTitle}>{f.title}</h3>
                  <p className={s.featureDesc}>{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ IMPACT / DIFERENCIAIS ════════════════════ */}
      <section className={s.impactSection} id="impact">
        <RevealSection>
          <div
            className={s.sectionHead}
            style={{ maxWidth: 1160, margin: "0 auto 48px" }}
          >
            <span className={s.sectionEyebrow}>Diferenciais</span>
            <h2 className={s.sectionTitle}>
              Por que lojistas escolhem o GestPro?
            </h2>
            <p className={s.sectionSub}>
              Resultados reais de quem ja usa o sistema no dia a dia.
            </p>
          </div>
        </RevealSection>
        <div className={s.impactGrid}>
          {impactItems.map((item, i) => (
            <RevealSection key={item.title} delay={i * 100}>
              <div className={s.impactCard}>
                <div className={s.impactIcon}>{item.icon}</div>
                <h3 className={s.impactTitle}>{item.title}</h3>
                <p className={s.impactDesc}>{item.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ════════════════════ PRICING ════════════════════ */}
      <section className={s.pricingSection} id="pricing">
        <div className={s.sectionInner}>
          <RevealSection>
            <div className={s.sectionHead}>
              <span className={s.sectionEyebrow}>Precos</span>
              <h2 className={s.sectionTitle}>
                Escolha o plano ideal para sua loja
              </h2>
              <p className={s.sectionSub}>
                {"Comece com "}
                <strong>7 dias gratis</strong>
                {". Sem cartao. Cancele quando quiser."}
              </p>
            </div>
          </RevealSection>

          <div className={s.pricingGrid}>
            {pricingPlans.map((plan, i) => (
              <RevealSection key={plan.name} delay={i * 120}>
                <div
                  className={`${s.pricingCard} ${plan.popular ? s.pricingCardPopular : ""}`}
                >
                  {plan.popular && (
                    <div className={s.popularBadge}>Mais Popular</div>
                  )}

                  <p className={s.pricingName}>{plan.name}</p>
                  <p className={s.pricingDesc}>{plan.desc}</p>

                  <div className={s.pricingPriceRow}>
                    <span className={s.pricingCurrency}>R$</span>
                    <span className={s.pricingAmount}>{plan.price}</span>
                    <span className={s.pricingPeriod}>/{plan.period}</span>
                  </div>

                  {plan.save ? (
                    <span className={s.pricingSave}>{plan.save}</span>
                  ) : (
                    <div className={s.pricingNosave} />
                  )}

                  <hr className={s.pricingDivider} />

                  <ul className={s.pricingFeaturesList}>
                    {plan.features.map((f) => (
                      <li
                        key={f.text}
                        className={`${s.pricingFeatureItem} ${!f.enabled ? s.pricingFeatureDisabled : ""}`}
                      >
                        <span className={s.pricingFeatureIcon}>
                          {f.enabled ? (
                            <Check size={12} strokeWidth={3} />
                          ) : (
                            <X size={12} strokeWidth={3} />
                          )}
                        </span>
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={
                      plan.popular ? s.pricingBtnPrimary : s.pricingBtn
                    }
                    onClick={() => openModal("register")}
                  >
                    {plan.btnLabel}
                    <ArrowRight size={14} />
                  </button>
                  <p className={s.pricingNote}>
                    {"Sem cartao \u00B7 Cancele quando quiser"}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CTA FINAL ════════════════════ */}
      <section className={s.ctaSection} id="cta">
        <RevealSection>
          <div className={s.ctaContent}>
            <span className={s.ctaEyebrow}>Pronto para crescer?</span>
            <h2 className={s.ctaTitle}>
              Pare de perder vendas por falta de controle.
            </h2>
            <p className={s.ctaSub}>
              Cada dia sem um sistema de gestao e dinheiro deixado na mesa.
              Comece agora em menos de 2 minutos.
            </p>
            <button
              className={s.ctaBtnPrimary}
              onClick={() => openModal("register")}
            >
              {"Comecar gratis agora"}
              <ArrowRight size={16} />
            </button>
            <div
              className={s.heroGuarantees}
              style={{ justifyContent: "center", marginTop: 8 }}
            >
              {["7 dias gratis", "Sem cartao", "Suporte 24/7"].map((t) => (
                <span key={t} className={s.guaranteeItemDark}>
                  <Check size={12} strokeWidth={3} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLogo}>
            <span className={s.logoDark}>Gest</span>
            <span className={s.logoGreen}>Pro</span>
          </div>
          <nav className={s.footerLinks}>
            {[
              { label: "Funcionalidades", target: "features" },
              { label: "Precos", target: "pricing" },
              { label: "Contato", target: "cta" },
            ].map((l) => (
              <button
                key={l.label}
                className={s.footerLink}
                onClick={() => scrollToSection(l.target)}
              >
                {l.label}
              </button>
            ))}
            <a href="#" className={s.footerLink}>
              Politica de Privacidade
            </a>
            <a href="#" className={s.footerLink}>
              Termos de Uso
            </a>
          </nav>
          <p className={s.footerCopy}>
            {"\u00A9"} {new Date().getFullYear()} GestPro. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>

      {/* ════════════════════ MODAL ════════════════════ */}
      {modal && (
        <div
          className={s.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className={s.modalCard}>
            <button
              className={s.modalClose}
              onClick={() => setModal(null)}
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            <AuthLayout
              title={
                modal === "login"
                  ? "GARANTA 7 DIAS GRATIS!"
                  : "CRIE SUA CONTA GRATIS!"
              }
              subtitle={
                modal === "login"
                  ? "Sua loja organizada, suas vendas garantidas"
                  : "Comece gratis, sem cartao de credito"
              }
            >
              {/* LOGIN */}
              {modal === "login" && (
                <>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                  <form onSubmit={handleLogin} className={styles.authForm}>
                    <FormInput
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={Mail}
                      required
                      disabled={loading}
                    />
                    <FormInput
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={Lock}
                      required
                      disabled={loading}
                    />
                    <div style={{ textAlign: "right" }}>
                      <a
                        href="#"
                        style={{
                          fontSize: "12.5px",
                          color: "#94a3b8",
                          textDecoration: "none",
                        }}
                      >
                        Esqueceu a senha?
                      </a>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={styles.btnPrimary}
                    >
                      {loading ? "Entrando..." : "Entrar"}{" "}
                      <Check size={20} strokeWidth={3} />
                    </button>
                    <button type="button" className={styles.btnSecondary}>
                      <GoogleIcon /> Login com Google
                    </button>
                    <div style={{ textAlign: "center", marginTop: 16 }}>
                      <p style={{ fontSize: "13px", color: "#64748b" }}>
                        {"Nao tem uma conta? "}
                        <button
                          type="button"
                          onClick={() => openModal("register")}
                          className={styles.authLink}
                        >
                          Cadastre-se
                        </button>
                      </p>
                    </div>
                  </form>
                </>
              )}

              {/* REGISTER */}
              {modal === "register" && (
                <>
                  {regSuccess ? (
                    <div className={s.successBox}>
                      <div className={s.successCircle}>
                        <Check
                          size={32}
                          strokeWidth={3}
                          style={{ color: "#059669" }}
                        />
                      </div>
                      <p className={s.successTitle}>
                        Conta criada com sucesso!
                      </p>
                      <p className={s.successDesc}>
                        Verifique seu e-mail para confirmar o cadastro.
                      </p>
                      <button
                        className={styles.btnPrimary}
                        onClick={() => openModal("login")}
                      >
                        Fazer login <Check size={16} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {regError && (
                        <div className={styles.errorMessage}>{regError}</div>
                      )}
                      <form
                        onSubmit={handleRegister}
                        className={styles.authForm}
                      >
                        <FormInput
                          type="text"
                          placeholder="Nome completo"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          icon={User}
                          required
                          disabled={regLoading}
                        />
                        <FormInput
                          type="email"
                          placeholder="Email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          icon={Mail}
                          required
                          disabled={regLoading}
                        />
                        <FormInput
                          type="password"
                          placeholder="Senha (min. 6 caracteres)"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          icon={Lock}
                          required
                          disabled={regLoading}
                        />
                        <button
                          type="submit"
                          disabled={regLoading}
                          className={styles.btnPrimary}
                        >
                          {regLoading
                            ? "Criando conta..."
                            : "Criar minha conta"}{" "}
                          <Check size={20} strokeWidth={3} />
                        </button>
                        <button type="button" className={styles.btnSecondary}>
                          <GoogleIcon /> Cadastrar com Google
                        </button>
                        <div style={{ textAlign: "center", marginTop: 16 }}>
                          <p style={{ fontSize: "13px", color: "#64748b" }}>
                            {"Ja tem uma conta? "}
                            <button
                              type="button"
                              onClick={() => openModal("login")}
                              className={styles.authLink}
                            >
                              Entrar
                            </button>
                          </p>
                        </div>
                      </form>
                    </>
                  )}
                </>
              )}
            </AuthLayout>
          </div>
        </div>
      )}
    </div>
  );
}
