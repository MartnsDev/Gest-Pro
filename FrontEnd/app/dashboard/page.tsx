"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Home,
  Package,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  DollarSign,
  Lock,
  Zap,
  Building2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getUsuario,
  lerTokenCookie,
  logout,
  removerTokenCookie,
  salvarTokenCookie,
  type Usuario,
} from "@/lib/api-v2";
import styles from "@/app/styles/dashboard.module.css";

import { EmpresaProvider, useEmpresa } from "./context/Empresacontext";

import DashboardHome from "./components/DashboardHome";
import Produtos from "./components/Produtos";
import Vendas from "./components/Vendas";
import Clientes from "./components/Clientes";
import Relatorios from "./components/Relatorios";
import Configuracoes from "./components/Configuracoes";
import GerenciarEmpresas from "./components/GerenciarEmpresas";
import ModalCaixa from "./components/Modalcaixa";
import SeletorEmpresa from "./components/Seletorempresa";
import Planos from "./components/Plano";
import NovoProduto from "./acoesRapidas/NovoProduto";
import NovoCliente from "./acoesRapidas/NovoCliente";
import AbrirCaixa from "./acoesRapidas/AbrirCaixa";
import PaginaAcaoRapida from "./acoesRapidas/PaginaAcaoRapida";

type Secao =
  | "dashboard"
  | "produtos"
  | "estoque"
  | "vendas"
  | "clientes"
  | "relatorios"
  | "configuracoes"
  | "empresas"
  | "planos"
  | "produto-rapido"
  | "cliente-rapido"
  | "caixa-rapido";

/* ─── Toast de pagamento confirmado ─────────────────────────────────────── */
function ToastPagamento({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 18px",
        background: "var(--surface-elevated)",
        border: "1px solid rgba(16,185,129,0.35)",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        animation: "slideIn .35s cubic-bezier(.175,.885,.32,1.275)",
        maxWidth: 340,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          flexShrink: 0,
          background: "rgba(16,185,129,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckCircle2 size={18} color="#10b981" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          Plano ativado com sucesso! 🎉
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--foreground-muted)",
            margin: "2px 0 0",
          }}
        >
          Seu acesso foi atualizado. Aproveite!
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          padding: 4,
          cursor: "pointer",
          color: "var(--foreground-subtle)",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Dashboard interno ──────────────────────────────────────────────────── */
function DashboardInner({
  usuario,
  mostrarToast,
  secaoInicial,
  cancelado,
}: {
  usuario: Usuario;
  mostrarToast: boolean;
  secaoInicial: Secao;
  cancelado: boolean;
}) {
  const {
    empresaAtiva,
    caixaAtivo,
    setCaixaAtivo,
    setEmpresaAtiva,
    resetarContexto,
  } = useEmpresa();

  const [secao, setSecao] = useState<Secao>(secaoInicial);
  const [modalCaixa, setModalCaixa] = useState(false);
  const [toast, setToast] = useState(mostrarToast);

  const API =
    process.env.NEXT_PUBLIC_API_URL ??
    "https://gestpro-backend-production.up.railway.app";

  const resolverFoto = (url?: string | null) => {
    if (!url || url.trim() === "") return null;
    if (
      url.startsWith("http") ||
      url.startsWith("blob:") ||
      url.startsWith("data:")
    )
      return url;
    return `${API}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const [fotoAtual, setFotoAtual] = useState<string | null>(
    resolverFoto(usuario.fotoUpload || usuario.foto || null),
  );
  const [nomeAtual, setNomeAtual] = useState(usuario.nome);

  const iniciais = nomeAtual
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    resetarContexto(); // limpa empresa/caixa vinculados a este usuário
    await logout(); // limpa cookies e storage
    globalThis.location.href = "/";
  };

  const tituloSecao: Record<Secao, string> = {
    dashboard: "Visão Geral",
    produtos: "Produtos",
    estoque: "Estoque",
    vendas: "Vendas",
    clientes: "Clientes",
    relatorios: "Relatórios",
    configuracoes: "Configurações",
    empresas: "Empresas",
    planos: "Planos",
    "produto-rapido": "Novo Produto",
    "cliente-rapido": "Novo Cliente",
    "caixa-rapido": "Abrir Caixa",
  };

  const renderSection = () => {
    switch (secao) {
      case "dashboard":
        return (
          <DashboardHome
            usuario={usuario}
            onNavegar={(s) => setSecao(s as Secao)}
          />
        );
      case "produtos":
        return <Produtos />;
      case "vendas":
        return <Vendas />;
      case "clientes":
        return <Clientes />;
      case "relatorios":
        return <Relatorios />;
      case "configuracoes":
        return (
          <Configuracoes
            usuario={usuario}
            onFotoAtualizada={(url) => setFotoAtual(resolverFoto(url))}
            onNomeAtualizado={(nome) => setNomeAtual(nome)}
          />
        );
      case "empresas":
        return <GerenciarEmpresas />;
      case "planos":
        return <Planos />;
      case "produto-rapido":
        return (
          <PaginaAcaoRapida onVoltar={() => setSecao("dashboard")}>
            <NovoProduto onConcluido={() => setSecao("dashboard")} />
          </PaginaAcaoRapida>
        );
      case "cliente-rapido":
        return (
          <PaginaAcaoRapida onVoltar={() => setSecao("dashboard")}>
            <NovoCliente onConcluido={() => setSecao("dashboard")} />
          </PaginaAcaoRapida>
        );
      case "caixa-rapido":
        return (
          <PaginaAcaoRapida onVoltar={() => setSecao("dashboard")}>
            <AbrirCaixa onConcluido={() => setSecao("dashboard")} />
          </PaginaAcaoRapida>
        );
      default:
        return (
          <DashboardHome
            usuario={usuario}
            onNavegar={(s) => setSecao(s as Secao)}
          />
        );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {toast && <ToastPagamento onClose={() => setToast(false)} />}

      {cancelado && secao === "planos" && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 18px",
            background: "var(--surface-elevated)",
            border: "1px solid rgba(245,158,11,0.35)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            fontSize: 13,
            color: "#d97706",
            animation: "slideIn .3s ease",
            whiteSpace: "nowrap",
          }}
        >
          Pagamento cancelado. Você pode assinar quando quiser.
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerBrand}>
          <div className={styles.headerLogo}>
            <img src="/favicon.png" alt="GestPro" width={40} height={40} />
          </div>
          <span className={styles.headerTitle}>GestPro</span>
          <div
            style={{
              marginLeft: 16,
              paddingLeft: 16,
              borderLeft: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "var(--foreground-subtle)",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              GESTPRO
            </p>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              {tituloSecao[secao]}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SeletorEmpresa
            empresaAtiva={empresaAtiva}
            onSelecionar={setEmpresaAtiva}
            onNova={() => setSecao("empresas")}
          />
          <button
            onClick={() => setModalCaixa(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 14px",
              background: caixaAtivo ? "rgba(16,185,129,0.12)" : "transparent",
              border: `1px solid ${caixaAtivo ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
              borderRadius: 8,
              color: caixaAtivo ? "var(--primary)" : "var(--foreground-muted)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {caixaAtivo ? <DollarSign size={14} /> : <Lock size={14} />}
            {caixaAtivo
              ? `Caixa Aberto · ${empresaAtiva?.nomeFantasia ?? ""}`
              : "Abrir Caixa"}
          </button>
          <div className={styles.headerUser}>
            <span className={styles.headerUserName}>
              {nomeAtual.split(" ")[0]}!
            </span>
            {fotoAtual ? (
              <img
                key={fotoAtual}
                src={fotoAtual}
                alt={nomeAtual}
                className={styles.headerUserAvatar}
                onError={() => setFotoAtual(null)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.headerUserInitials}>{iniciais}</div>
            )}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:text-gray-300 hover:bg-[#1a3a52]"
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* ── Layout ─────────────────────────────────────────────────────── */}
      <div className={styles.dashboardLayout}>
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            {(
              [
                { id: "dashboard", label: "Dashboard", icon: <Home /> },
                { id: "produtos", label: "Produtos", icon: <Package /> },
                { id: "vendas", label: "Vendas", icon: <CreditCard /> },
                { id: "clientes", label: "Clientes", icon: <Users /> },
                { id: "relatorios", label: "Relatórios", icon: <BarChart3 /> },
                { id: "empresas", label: "Empresas", icon: <Building2 /> },
                {
                  id: "configuracoes",
                  label: "Configurações",
                  icon: <Settings />,
                },
                { id: "planos", label: "Planos", icon: <Zap /> },
              ] as { id: Secao; label: string; icon: React.ReactNode }[]
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setSecao(item.id)}
                className={`${styles.sidebarNavItem} ${
                  secao === item.id ? styles.sidebarNavItemActive : ""
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className={styles.mainContent}>{renderSection()}</main>
      </div>

      {/* ── Modal Caixa ────────────────────────────────────────────────── */}
      {modalCaixa && (
        <ModalCaixa
          onClose={() => setModalCaixa(false)}
          caixaAtivo={caixaAtivo}
          empresaAtiva={empresaAtiva}
          onCaixaAtualizado={(caixa, empresa) => {
            setCaixaAtivo(caixa);
            if (empresa) setEmpresaAtiva(empresa);
          }}
        />
      )}
    </div>
  );
}

/* ─── DashboardLoader ────────────────────────────────────────────────────── */
function DashboardLoader() {
  const searchParams = useSearchParams();

  // ✅ Agora o EmpresaProvider está FORA (em DashboardPage),
  //    então useEmpresa() funciona aqui dentro.
  const { setUsuarioId } = useEmpresa();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const mostrarToast = searchParams.get("payment") === "success";
  const cancelado = searchParams.get("canceled") === "true";
  const secaoInicial = (searchParams.get("section") as Secao) ?? "dashboard";

  useEffect(() => {
    async function inicializarDashboard() {
      const tokenDaUrl = searchParams.get("token");

      if (tokenDaUrl) {
        salvarTokenCookie(tokenDaUrl);
        localStorage.setItem("jwt_token", tokenDaUrl);
        globalThis.history.replaceState({}, "", "/dashboard");
      }

      const tokenFinal = lerTokenCookie() || localStorage.getItem("jwt_token");

      if (!tokenFinal) {
        globalThis.location.href = "/auth/login";
        return;
      }

      try {
        const data = await getUsuario();
        if (!data) throw new Error("Usuário inválido");

        setUsuario(data);

        // ✅ CORREÇÃO PRINCIPAL:
        // Vincula o contexto ao ID deste usuário específico.
        // Isso garante que cada conta tenha seu próprio localStorage isolado.
        setUsuarioId(String(data.id));
      } catch {
        // Token inválido/expirado — limpa tudo e redireciona
        localStorage.clear();
        sessionStorage.clear();
        removerTokenCookie();
        globalThis.location.href = "/auth/login";
      } finally {
        setLoading(false);
      }
    }

    inicializarDashboard();
  }, [searchParams, setUsuarioId]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background, #0a0a0a)",
        }}
      >
        <p style={{ color: "var(--foreground-muted, #888)", fontSize: 14 }}>
          Carregando GestPro...
        </p>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <DashboardInner
      usuario={usuario}
      mostrarToast={mostrarToast}
      secaoInicial={secaoInicial}
      cancelado={cancelado}
    />
  );
}

/* ─── Página raiz ────────────────────────────────────────────────────────── */
// Isso permite que DashboardLoader use useEmpresa() para chamar setUsuarioId().
export default function DashboardPage() {
  return (
    <EmpresaProvider>
      <Suspense
        fallback={
          <div
            style={{
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--background, #0a0a0a)",
            }}
          >
            <p style={{ color: "var(--foreground-muted, #888)", fontSize: 14 }}>
              Carregando...
            </p>
          </div>
        }
      >
        <DashboardLoader />
      </Suspense>
    </EmpresaProvider>
  );
}
