"use client";

import { useState, useEffect } from "react";
import {
  Home, Package, CreditCard, Users,
  BarChart3, Settings, DollarSign, Lock,
  Zap, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsuario, logout, type Usuario } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import styles from "@/app/styles/dashboard.module.css";

// ✅ Path correto — contexto está em app/dashboard/context/
import { EmpresaProvider, useEmpresa } from "./context/Empresacontext";

import DashboardHome     from "./components/DashboardHome";
import Produtos          from "./components/Produtos";
import Estoque           from "./components/Estoque";
import Vendas            from "./components/Vendas";
import Clientes          from "./components/Clientes";
import Relatorios        from "./components/Relatorios";
import Configuracoes     from "./components/Configuracoes";
import GerenciarEmpresas from "./components/GerenciarEmpresas";
import ModalCaixa        from "./components/Modalcaixa";
import SeletorEmpresa    from "./components/Seletorempresa";
import Planos            from "./components/Plano";
import NovaVendaRapida   from "../dashboard/acoesRapidas/NovaVenda";
import NovoProduto       from "../dashboard/acoesRapidas/NovoProduto";
import NovoCliente       from "../dashboard/acoesRapidas/NovoCliente";
import AbrirCaixa        from "../dashboard/acoesRapidas/AbrirCaixa";
import PaginaAcaoRapida  from "../dashboard/acoesRapidas/PaginaAcaoRapida"

type Secao = "dashboard" | "produtos" | "estoque" | "vendas" | "clientes"
           | "relatorios" | "configuracoes" | "empresas" | "planos"
           | "venda-rapida" | "produto-rapido" | "cliente-rapido" | "caixa-rapido";

function DashboardInner({ usuario }: { usuario: Usuario }) {
  const { empresaAtiva, caixaAtivo, setCaixaAtivo, setEmpresaAtiva } = useEmpresa();
  const [secao,      setSecao]      = useState<Secao>("dashboard");
  const [modalCaixa, setModalCaixa] = useState(false);

  const iniciais = usuario.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    removeToken();
    window.location.href = "/";
  };

  const renderSection = () => {
    switch (secao) {
      case "dashboard":     return <DashboardHome usuario={usuario} onNavegar={s => setSecao(s as any)} />;
      case "produtos":      return <Produtos />;
      case "estoque":       return <Estoque />;
      case "vendas":        return <Vendas />;
      case "clientes":      return <Clientes />;
      case "relatorios":    return <Relatorios />;
      case "configuracoes": return <Configuracoes usuario={usuario} />;
      case "empresas":      return <GerenciarEmpresas />;
      case "planos":        return <Planos />;
      case "venda-rapida":  return <DashboardHome usuario={usuario} onNavegar={s => setSecao(s as any)} />;
      case "produto-rapido":return <PaginaAcaoRapida onVoltar={()=>setSecao("dashboard")}><NovoProduto onConcluido={()=>setSecao("dashboard")} /></PaginaAcaoRapida>;
      case "cliente-rapido":return <PaginaAcaoRapida onVoltar={()=>setSecao("dashboard")}><NovoCliente onConcluido={()=>setSecao("dashboard")} /></PaginaAcaoRapida>;
      case "caixa-rapido":  return <PaginaAcaoRapida onVoltar={()=>setSecao("dashboard")}><AbrirCaixa onConcluido={()=>setSecao("dashboard")} /></PaginaAcaoRapida>;
      default:              return <DashboardHome usuario={usuario} onNavegar={s => setSecao(s as any)} />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerBrand}>
          <div className={styles.headerLogo}>
            <img src="/favicon.png" alt="GestPro" width={40} height={40} />
          </div>
          <span className={styles.headerTitle}>GestPro</span>
          <div style={{ marginLeft: 16, paddingLeft: 16, borderLeft: "1px solid var(--border)" }}>
            <p style={{ fontSize: 10, color: "var(--foreground-subtle)", margin: 0, textTransform: "uppercase", letterSpacing: ".06em" }}>GESTPRO</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>
              {secao === "dashboard" ? "Visão Geral" :
               secao === "empresas"  ? "Empresas"    :
               secao.charAt(0).toUpperCase() + secao.slice(1)}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SeletorEmpresa
            empresaAtiva={empresaAtiva}
            onSelecionar={setEmpresaAtiva}
            onNova={() => setSecao("empresas")}
          />
          <button onClick={() => setModalCaixa(true)} style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "7px 14px",
            background: caixaAtivo ? "rgba(16,185,129,0.12)" : "transparent",
            border: `1px solid ${caixaAtivo ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
            borderRadius: 8,
            color: caixaAtivo ? "var(--primary)" : "var(--foreground-muted)",
            fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .15s",
          }}>
            {caixaAtivo ? <DollarSign size={14} /> : <Lock size={14} />}
            {caixaAtivo ? `Caixa Aberto · ${empresaAtiva?.nomeFantasia ?? ""}` : "Abrir Caixa"}
          </button>
          <div className={styles.headerUser}>
            <span className={styles.headerUserName}>{usuario.nome.split(" ")[0]}!</span>
            {usuario.foto
              ? <img src={usuario.foto} alt={usuario.nome} className={styles.headerUserAvatar} />
              : <div className={styles.headerUserInitials}>{iniciais}</div>
            }
            <Button onClick={handleLogout} variant="ghost" className="text-white hover:text-gray-300 hover:bg-[#1a3a52]">
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.dashboardLayout}>
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            {[
              { id: "dashboard",     label: "Dashboard",     icon: <Home /> },
              { id: "produtos",      label: "Produtos",      icon: <Package /> },
              { id: "vendas",        label: "Vendas",        icon: <CreditCard /> },
              { id: "clientes",      label: "Clientes",      icon: <Users /> },
              { id: "relatorios",    label: "Relatórios",    icon: <BarChart3 /> },
              { id: "empresas",      label: "Empresas",      icon: <Building2 /> },
              { id: "configuracoes", label: "Configurações", icon: <Settings /> },
              { id: "planos",        label: "Planos",        icon: <Zap /> },
            ].map(item => (
              <button key={item.id} onClick={() => setSecao(item.id as Secao)}
                className={`${styles.sidebarNavItem} ${secao === item.id ? styles.sidebarNavItemActive : ""}`}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className={styles.mainContent}>{renderSection()}</main>
      </div>

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

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUsuario();
        if (!data) { window.location.href = "/"; return; }
        setUsuario(data);
      } catch {
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className={styles.loadingContainer}>Carregando...</div>;
  if (!usuario) return null;

  return (
    <EmpresaProvider>
      <DashboardInner usuario={usuario} />
    </EmpresaProvider>
  );
}