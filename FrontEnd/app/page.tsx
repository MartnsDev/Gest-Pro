"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  X,
  ArrowRight,
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
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import { login, cadastrar } from "@/lib/api";
import s from "@/app/styles/landing.module.css";
import a from "@/app/styles/auth.module.css";

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

/* ─── SVG Illustration ─────────────────────────────────────────────────────── */
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
        opacity=".75"
      />
      <rect
        x="359"
        y="222"
        width="57"
        height="47"
        rx="4"
        fill="#3b82f6"
        opacity=".75"
      />
      <rect x="341" y="315" width="42" height="50" rx="4" fill="#0d213d" />
      <circle cx="375" cy="342" r="3" fill="#60a5fa" />
      <path d="M268 202 Q278 162 364 162 Q450 162 460 202 Z" fill="#10b981" />
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
        +24% vendas
      </text>
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

/* ─── Scroll Reveal ────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, className: `${s.reveal} ${visible ? s.revealVisible : ""}` };
}
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const { ref, className } = useReveal();
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

/* ─── FormInput ─────────────────────────────────────────────────────────────── */
function FormInput({
  icon: Icon,
  rightSlot,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ElementType;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className={a.inputWrap}>
      <span className={a.inputIcon}>
        <Icon size={17} />
      </span>
      <input
        className={`${a.input} ${rightSlot ? a.inputWithRight : ""}`}
        {...props}
      />
      {rightSlot && <span className={a.inputRight}>{rightSlot}</span>}
    </div>
  );
}

/* ─── EyeBtn ─────────────────────────────────────────────────────────────────── */
function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" className={a.eyeBtn} onClick={toggle}>
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

/* ─── PhotoUpload ────────────────────────────────────────────────────────────── */
function PhotoUpload({
  preview,
  onChange,
  onRemove,
}: {
  preview: string | null;
  onChange: (f: File) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={a.photoArea}>
      <div className={a.photoCircle} onClick={() => ref.current?.click()}>
        {preview ? (
          <>
            <img src={preview} alt="Foto" className={a.photoPreview} />
            <div className={a.photoOverlay}>
              <Camera size={20} />
            </div>
          </>
        ) : (
          <>
            <div className={a.photoPlaceholder}>
              <Camera size={24} style={{ color: "#cbd5e1" }} />
              <span className={a.photoPlaceholderText}>
                Foto de
                <br />
                perfil
              </span>
            </div>
            <div className={a.photoOverlay}>
              <Camera size={20} />
            </div>
          </>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className={a.photoInput}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />
      </div>
      {preview ? (
        <button type="button" className={a.photoRemove} onClick={onRemove}>
          Remover foto
        </button>
      ) : (
        <span className={a.photoLabel}>
          Clique para adicionar foto (opcional)
        </span>
      )}
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────────────────────────────── */
function Modal({
  type,
  onClose,
  onSwitch,
}: {
  type: "login" | "register";
  onClose: () => void;
  onSwitch: (t: "login" | "register") => void;
}) {
  /* login */
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  /* register */
  const [nome, setNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  /* shared */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const isLogin = type === "login";

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const handlePhotoChange = (file: File) => {
    setFotoFile(file);
    const r = new FileReader();
    r.onloadend = () => setFotoPreview(r.result as string);
    r.readAsDataURL(file);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, pass);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPass !== regConfirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (regPass.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await cadastrar(nome, regEmail, regPass, fotoFile || undefined);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={a.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={a.modalCard}>
        <div className={a.cardTopBar} />
        <button className={a.modalClose} onClick={onClose} aria-label="Fechar">
          <X size={15} />
        </button>
        <div className={a.modalBody}>
          <div className={a.modalHeader}>
            <div className={a.brand}>
              <span className={a.brandDark}>Gest</span>
              <span className={a.brandGreen}>Pro</span>
            </div>
            <h2 className={a.modalTitle}>
              {isLogin ? "Bem-vindo de volta!" : "Crie sua conta grátis"}
            </h2>
            <p className={a.modalSubtitle}>
              {isLogin
                ? "Entre para acessar sua loja"
                : "7 dias grátis · Sem cartão de crédito"}
            </p>
          </div>

          {success ? (
            <div className={a.successBox}>
              <div className={`${a.successIcon} ${a.successIconGreen}`}>
                <Check size={32} strokeWidth={3} style={{ color: "#059669" }} />
              </div>
              <p className={a.successTitle}>Conta criada!</p>
              <p className={a.successDesc}>
                Verifique seu e-mail para confirmar o cadastro.
              </p>
              <button
                className={a.btnPrimary}
                onClick={() => onSwitch("login")}
              >
                Fazer login <Check size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <>
              {error && <div className={a.errorBox}>{error}</div>}
              {isLogin ? (
                <form onSubmit={handleLogin} className={a.form}>
                  <FormInput
                    icon={Mail}
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <FormInput
                    icon={Lock}
                    type={showPass ? "text" : "password"}
                    placeholder="Senha"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    disabled={loading}
                    rightSlot={
                      <EyeBtn
                        show={showPass}
                        toggle={() => setShowPass((v) => !v)}
                      />
                    }
                  />
                  <a href="/esqueceu-senha" className={a.forgotLink}>
                    Esqueceu a senha?
                  </a>
                  <button
                    type="submit"
                    disabled={loading}
                    className={a.btnPrimary}
                  >
                    {loading ? (
                      <>
                        <span className={a.spinner} /> Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </button>
                  <button type="button" className={a.btnGoogle}>
                    <GoogleIcon /> Entrar com Google
                  </button>
                  <p className={a.switchRow}>
                    Não tem conta?{" "}
                    <button
                      type="button"
                      className={a.linkBtn}
                      onClick={() => onSwitch("register")}
                    >
                      Cadastre-se
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className={a.form}>
                  <PhotoUpload
                    preview={fotoPreview}
                    onChange={handlePhotoChange}
                    onRemove={() => {
                      setFotoFile(null);
                      setFotoPreview(null);
                    }}
                  />
                  <FormInput
                    icon={User}
                    type="text"
                    placeholder="Nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <FormInput
                    icon={Mail}
                    type="email"
                    placeholder="E-mail"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <FormInput
                    icon={Lock}
                    type={showRegPass ? "text" : "password"}
                    placeholder="Senha (mín. 6 caracteres)"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    required
                    disabled={loading}
                    rightSlot={
                      <EyeBtn
                        show={showRegPass}
                        toggle={() => setShowRegPass((v) => !v)}
                      />
                    }
                  />
                  <FormInput
                    icon={Lock}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirmar snha"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    required
                    disabled={loading}
                    rightSlot={
                      <EyeBtn
                        show={showConfirm}
                        toggle={() => setShowConfirm((v) => !v)}
                      />
                    }
                  />
                  {regConfirm && (
                    <div
                      className={`${a.matchRow} ${regPass === regConfirm ? a.matchOk : a.matchErr}`}
                    >
                      {regPass === regConfirm ? (
                        <>
                          <Check size={12} strokeWidth={3} /> Senhas coincidem
                        </>
                      ) : (
                        <>
                          <X size={12} strokeWidth={3} /> Senhas não coincidem
                        </>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className={a.btnPrimary}
                  >
                    {loading ? (
                      <>
                        <span className={a.spinner} /> Criando conta...
                      </>
                    ) : (
                      "Criar minha conta"
                    )}
                  </button>
                  <button type="button" className={a.btnGoogle}>
                    <GoogleIcon /> Cadastrar com Google
                  </button>
                  <p className={a.switchRow}>
                    Já tem conta?{" "}
                    <button
                      type="button"
                      className={a.linkBtn}
                      onClick={() => onSwitch("login")}
                    >
                      Entrar
                    </button>
                  </p>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: <Package size={22} />,
    bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
    color: "#059669",
    title: "Estoque Inteligente",
    desc: "Alertas automáticos de ruptura, movimentação em tempo real e controle de validade.",
  },
  {
    icon: <ShoppingCart size={22} />,
    bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
    color: "#2563eb",
    title: "PDV Completo",
    desc: "Vendas rápidas, troco automático, múltiplas formas de pagamento e cupom fiscal.",
  },
  {
    icon: <BarChart2 size={22} />,
    bg: "linear-gradient(135deg,#ccfbf1,#99f6e4)",
    color: "#0d9488",
    title: "Dashboard em Tempo Real",
    desc: "Veja faturamento, ticket médio e produtos mais vendidos num único painel.",
  },
  {
    icon: <Users size={22} />,
    bg: "linear-gradient(135deg,#fef3c7,#fde68a)",
    color: "#d97706",
    title: "CRM de Clientes",
    desc: "Histórico de compras, perfil de consumo e ações de fidelização integradas.",
  },
  {
    icon: <FileText size={22} />,
    bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
    color: "#7c3aed",
    title: "Notas Fiscais (NF-e)",
    desc: "Emita NF-e e NFC-e diretamente pelo sistema, sem precisar de outro software.",
  },
  {
    icon: <Shield size={22} />,
    bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)",
    color: "#db2777",
    title: "Segurança Bancária",
    desc: "Criptografia ponta a ponta, backups diários automáticos e controle por perfil.",
  },
];
const impactItems = [
  {
    icon: <Clock size={22} />,
    title: "Economize 15h por semana",
    desc: "Automatize tarefas manuais como controle de estoque, fechamento de caixa e emissão de notas.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Aumente seu faturamento em 24%",
    desc: "Lojistas que usam o GestPro reportam aumento médio de 24% nas vendas nos primeiros 90 dias.",
  },
  {
    icon: <HeartHandshake size={22} />,
    title: "Suporte que resolve de verdade",
    desc: "Time 100% brasileiro, disponível por chat e WhatsApp. Tempo médio de resposta: 3 minutos.",
  },
];
const pricingPlans = [
  {
    name: "Grátis",
    price: "0,00",
    period: "7 dias",
    popular: false,
    save: null,
    btnLabel: "Testar grátis",
    features: [
      { text: "Controle de estoque", ok: true },
      { text: "PDV simplificado", ok: true },
      { text: "Até 500 produtos", ok: true },
      { text: "1 usuário", ok: true },
      { text: "Relatórios básicos", ok: true },
      { text: "Suporte por e-mail", ok: true },
      { text: "NF-e e NFC-e", ok: false },
      { text: "CRM de clientes", ok: false },
    ],
  },
  {
    name: "Básico",
    price: "29,90",
    period: "mês",
    popular: false,
    save: null,
    btnLabel: "Assinar plano",
    features: [
      { text: "Controle de estoque", ok: true },
      { text: "PDV simplificado", ok: true },
      { text: "Até 500 produtos", ok: true },
      { text: "1 usuário", ok: true },
      { text: "Relatórios básicos", ok: true },
      { text: "Suporte por e-mail", ok: true },
      { text: "NF-e e NFC-e", ok: false },
      { text: "CRM de clientes", ok: false },
    ],
  },
  {
    name: "Pro",
    price: "49,90",
    period: "mês",
    popular: true,
    save: "Mais popular",
    btnLabel: "Assinar Pro",
    features: [
      { text: "Tudo do Básico", ok: true },
      { text: "Produtos ilimitados", ok: true },
      { text: "Até 5 usuários", ok: true },
      { text: "NF-e e NFC-e", ok: true },
      { text: "CRM de clientes", ok: true },
      { text: "Dashboards avançados", ok: true },
      { text: "Suporte prioritário", ok: true },
      { text: "Integrações (iFood, Shopee)", ok: false },
    ],
  },
  {
    name: "Premium",
    price: "89,90",
    period: "mês",
    popular: false,
    save: "Economize 40% no anual",
    btnLabel: "Falar com vendas",
    features: [
      { text: "Tudo do Pro", ok: true },
      { text: "Usuários ilimitados", ok: true },
      { text: "Multi-lojas", ok: true },
      { text: "Integrações completas", ok: true },
      { text: "API personalizada", ok: true },
      { text: "Relatórios customizados", ok: true },
      { text: "Gerente de conta dedicado", ok: true },
      { text: "Suporte 24/7 via WhatsApp", ok: true },
    ],
  },
];
const navItems = [
  { label: "Funcionalidades", target: "features" },
  { label: "Diferenciais", target: "impact" },
  { label: "Preços", target: "pricing" },
  { label: "Contato", target: "cta" },
];

/* ════════════════════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
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

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const open = (m: "login" | "register") => {
    setModal(m);
    setMobileOpen(false);
  };

  return (
    <div className={s.page}>
      {/* NAVBAR */}
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
            <span className={s.logoDark}>Gest</span>
            <span className={s.logoGreen}>Pro</span>
          </div>
          <div className={s.navLinks}>
            {navItems.map((n) => (
              <button
                key={n.target}
                className={s.navLink}
                onClick={() => scrollTo(n.target)}
              >
                {n.label}
              </button>
            ))}
          </div>
          <div className={s.navActions}>
            <button className={s.navBtnSecondary} onClick={() => open("login")}>
              Entrar
            </button>
            <button
              className={s.navBtnPrimary}
              onClick={() => open("register")}
            >
              Começar grátis <ArrowRight size={14} />
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
        {navItems.map((n) => (
          <button
            key={n.target}
            className={s.mobileMenuLink}
            onClick={() => scrollTo(n.target)}
          >
            {n.label}
          </button>
        ))}
        <div className={s.mobileMenuActions}>
          <button
            className={s.navBtnSecondary}
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => open("login")}
          >
            Entrar
          </button>
          <button
            className={s.navBtnPrimary}
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => open("register")}
          >
            Começar grátis <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className={s.heroSection} id="hero">
        <div className={s.heroGrid}>
          <div className={s.heroLeft}>
            <div className={s.floatWrapper}>
              <StoreIllustration />
            </div>
          </div>
          <div className={s.heroRight}>
            <span className={s.badge}>
              <span className={s.badgeDot} />7 dias grátis — sem cartão de
              crédito
            </span>
            <h1 className={s.heroTitle}>
              Sua loja no controle.
              <br />
              <span className={s.heroHighlight}>Suas vendas nas alturas.</span>
            </h1>
            <p className={s.heroSubtitle}>
              Mais de{" "}
              <strong style={{ color: "#34d399" }}>2.400 lojistas</strong> já
              organizam estoque, vendas e clientes com o GestPro — e faturam
              mais todo mês.
            </p>
            <div className={s.socialRow}>
              <div className={s.avatarStack}>
                {(["#10b981", "#3b82f6", "#f59e0b", "#ec4899"] as const).map(
                  (c, i) => (
                    <div
                      key={i}
                      className={s.avatarBubble}
                      style={{ background: c, marginLeft: i ? "-10px" : 0 }}
                    >
                      {["M", "A", "R", "C"][i]}
                    </div>
                  ),
                )}
              </div>
              <p className={s.socialText}>
                <strong>+2.400</strong> lojistas ativos — 4,9/5
              </p>
            </div>
            <div className={s.heroCta}>
              <button
                className={s.ctaBtnPrimary}
                onClick={() => open("register")}
              >
                Testar 7 dias grátis <ArrowRight size={16} />
              </button>
              <button className={s.ctaBtnGhost} onClick={() => open("login")}>
                Já tenho conta
              </button>
            </div>
            <div className={s.heroGuarantees}>
              {[
                "Sem cartão de crédito",
                "Cancele quando quiser",
                "Suporte em português",
              ].map((t) => (
                <span key={t} className={s.guaranteeItem}>
                  <Check size={12} strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <svg
          className={s.wave}
          viewBox="0 0 1440 72"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 36 C360 72 1080 0 1440 36 L1440 72 L0 72 Z"
            fill="#f0fdf4"
          />
        </svg>
      </section>

      {/* TRUST BAR */}
      <Reveal>
        <div className={s.trustBar}>
          <div className={s.trustInner}>
            {[
              { val: "2.400+", label: "Lojas ativas" },
              { val: "R$ 18M+", label: "Em vendas gerenciadas" },
              { val: "99,9%", label: "Uptime garantido" },
              { val: "4,9/5", label: "Avaliação dos clientes" },
            ].map((t) => (
              <div key={t.label} className={s.trustItem}>
                <span className={s.trustVal}>{t.val}</span>
                <span className={s.trustLabel}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* FEATURES */}
      <section className={s.featuresSection} id="features">
        <div className={s.sectionInner}>
          <Reveal>
            <div className={s.sectionHead}>
              <span className={s.sectionEyebrow}>Funcionalidades</span>
              <h2 className={s.sectionTitle}>Tudo para sua loja crescer</h2>
              <p className={s.sectionSub}>
                Cada recurso foi criado pensando no dia a dia de quem trabalha
                com varejo.
              </p>
            </div>
          </Reveal>
          <div className={s.featureGrid}>
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className={s.impactSection} id="impact">
        <div className={s.sectionInner}>
          <Reveal>
            <div className={s.sectionHead}>
              <span className={s.sectionEyebrow}>Diferenciais</span>
              <h2 className={s.sectionTitle}>
                Por que lojistas escolhem o GestPro?
              </h2>
              <p className={s.sectionSub}>
                Resultados reais de quem já usa o sistema no dia a dia.
              </p>
            </div>
          </Reveal>
          <div className={s.impactGrid}>
            {impactItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div className={s.impactCard}>
                  <div className={s.impactIcon}>{item.icon}</div>
                  <h3 className={s.impactTitle}>{item.title}</h3>
                  <p className={s.impactDesc}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={s.pricingSection} id="pricing">
        <div className={s.sectionInner}>
          <Reveal>
            <div className={s.sectionHead}>
              <span className={s.sectionEyebrow}>Preços</span>
              <h2 className={s.sectionTitle}>
                Escolha o plano ideal para sua loja
              </h2>
              <p className={s.sectionSub}>
                Comece com <strong>7 dias grátis</strong>. Sem cartão. Cancele
                quando quiser.
              </p>
            </div>
          </Reveal>
          <div className={s.pricingGrid}>
            {pricingPlans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 110}>
                <div
                  className={`${s.pricingCard} ${plan.popular ? s.pricingCardPopular : ""}`}
                >
                  {plan.popular && (
                    <div className={s.popularBadge}>Mais Popular</div>
                  )}
                  <p className={s.pricingName}>{plan.name}</p>
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
                        className={`${s.pricingFeatureItem} ${!f.ok ? s.pricingFeatureDisabled : ""}`}
                      >
                        <span className={s.pricingFeatureIcon}>
                          {f.ok ? (
                            <Check size={11} strokeWidth={3} />
                          ) : (
                            <X size={11} strokeWidth={3} />
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
                    onClick={() => open("register")}
                  >
                    {plan.btnLabel} <ArrowRight size={14} />
                  </button>
                  <p className={s.pricingNote}>
                    Sem cartão · Cancele quando quiser
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={s.ctaSection} id="cta">
        <Reveal>
          <div className={s.ctaContent}>
            <span className={s.ctaEyebrow}>Pronto para crescer?</span>
            <h2 className={s.ctaTitle}>
              Pare de perder vendas por falta de controle.
            </h2>
            <p className={s.ctaSub}>
              Cada dia sem um sistema de gestão é dinheiro deixado na mesa.
              Comece agora em menos de 2 minutos.
            </p>
            <button
              className={s.ctaBtnPrimary}
              onClick={() => open("register")}
            >
              Começar grátis agora <ArrowRight size={16} />
            </button>
            <div
              className={s.heroGuarantees}
              style={{ justifyContent: "center", marginTop: 4 }}
            >
              {["7 dias grátis", "Sem cartão", "Suporte 24/7"].map((t) => (
                <span key={t} className={s.guaranteeItemDark}>
                  <Check size={12} strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLogo}>
            <span className={s.logoDark}>Gest</span>
            <span className={s.logoGreen}>Pro</span>
          </div>
          <nav className={s.footerLinks}>
            {[
              { label: "Funcionalidades", target: "features" },
              { label: "Preços", target: "pricing" },
              { label: "Contato", target: "cta" },
            ].map((l) => (
              <button
                key={l.label}
                className={s.footerLink}
                onClick={() => scrollTo(l.target)}
              >
                {l.label}
              </button>
            ))}
            <a href="#" className={s.footerLink}>
              Política de Privacidade
            </a>
            <a href="#" className={s.footerLink}>
              Termos de Uso
            </a>
          </nav>
          <p className={s.footerCopy}>
            © {new Date().getFullYear()} GestPro. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {modal && (
        <Modal
          type={modal}
          onClose={() => setModal(null)}
          onSwitch={(t) => setModal(t)}
        />
      )}
    </div>
  );
}
