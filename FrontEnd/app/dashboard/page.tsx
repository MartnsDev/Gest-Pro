"use client";

import { useState, useEffect } from "react";
import {
  Home, Package, Warehouse, CreditCard,
  Users, BarChart3, Settings,
  DollarSign, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsuario, logout, type Usuario } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import styles from "@/app/styles/dashboard.module.css";

import DashboardHome    from "./components/DashboardHome";
import Produtos         from "./components/Produtos";
import Estoque          from "./components/Estoque";
import Vendas           from "./components/Vendas";
import Clientes         from "./components/Clientes";
import Relatorios       from "./components/Relatorios";
import Configuracoes    from "./components/Configuracoes";
import GerenciarEmpresas from "./components/GerenciarEmpresas";
import ModalCaixa       from "./components/Modalcaixa";
import SeletorEmpresa   from "./components/Seletorempresa";

type Secao = "dashboard" | "produtos" | "estoque" | "vendas" | "clientes" | "relatorios" | "configuracoes" | "empresas";

interface Empresa  { id: number; nomeFantasia: string; cnpj: string; planoNome: string; limiteCaixas: number; }
interface CaixaInfo { id: number; empresaId: number; empresaNome?: string; valorInicial: number; totalVendas: number; dataAbertura: string; status: "ABERTO" | "FECHADO"; }

async function fetchAuth<T>(path: string): Promise<T> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export default function DashboardPage() {
  const [usuario,      setUsuario]      = useState<Usuario | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [secao,        setSecao]        = useState<Secao>("dashboard");
  const [empresaAtiva, setEmpresaAtiva] = useState<Empresa | null>(null);
  const [caixaAtivo,   setCaixaAtivo]   = useState<CaixaInfo | null>(null);
  const [modalCaixa,   setModalCaixa]   = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUsuario();
        if (!data) { window.location.href = "/"; return; }
        setUsuario(data);

        // Carrega primeira empresa e caixa aberto automaticamente
        try {
          const empresas = await fetchAuth<Empresa[]>("/api/v1/empresas");
          if (empresas.length > 0) {
            const emp = empresas[0];
            setEmpresaAtiva(emp);
            try {
              const caixa = await fetchAuth<CaixaInfo>(`/api/v1/caixas/aberto?empresaId=${emp.id}`);
              caixa.empresaNome = emp.nomeFantasia;
              setCaixaAtivo(caixa);
            } catch { /* sem caixa aberto */ }
          }
        } catch { /* sem empresas */ }
      } catch {
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    removeToken();
    window.location.href = "/";
  };

  const handleSelecionarEmpresa = async (emp: Empresa) => {
    setEmpresaAtiva(emp);
    setCaixaAtivo(null);
    try {
      const caixa = await fetchAuth<CaixaInfo>(`/api/v1/caixas/aberto?empresaId=${emp.id}`);
      caixa.empresaNome = emp.nomeFantasia;
      setCaixaAtivo(caixa);
    } catch { /* sem caixa */ }
  };

  if (loading) return <div className={styles.loadingContainer}>Carregando...</div>;
  if (!usuario) return null;

  const iniciais = usuario.nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const renderSection = () => {
    switch (secao) {
      case "dashboard":  return <DashboardHome usuario={usuario} />;
      case "produtos":   return <Produtos />;
      case "estoque":    return <Estoque />;
      case "vendas":     return <Vendas />;
      case "clientes":   return <Clientes />;
      case "relatorios": return <Relatorios />;
      case "configuracoes": return <Configuracoes usuario={usuario} />;
      case "empresas":   return <GerenciarEmpresas />;
      default:           return <DashboardHome usuario={usuario} />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>

      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerBrand}>
          <div className={styles.headerLogo}>
            <img src="/favicon.png" alt="GestPro" width={40} height={40} />
          </div>
          <span className={styles.headerTitle}>GestPro</span>

          {/* Subtítulo da seção */}
          <div style={{ marginLeft: 16, paddingLeft: 16, borderLeft: "1px solid #1a3a52" }}>
            <p style={{ fontSize: 10, color: "#4a6a8a", margin: 0, textTransform: "uppercase", letterSpacing: ".06em" }}>GESTPRO</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>
              {secao === "dashboard" ? "Visão Geral" :
               secao === "empresas"  ? "Empresas" :
               secao.charAt(0).toUpperCase() + secao.slice(1)}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Seletor de empresa */}
          <SeletorEmpresa
            empresaAtiva={empresaAtiva}
            onSelecionar={handleSelecionarEmpresa}
            onNova={() => setSecao("empresas")}
          />

          {/* Botão caixa */}
          <button
            onClick={() => setModalCaixa(true)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "7px 14px",
              background: caixaAtivo ? "rgba(16,185,129,0.12)" : "transparent",
              border: `1px solid ${caixaAtivo ? "rgba(16,185,129,0.4)" : "#1a3a52"}`,
              borderRadius: 8,
              color: caixaAtivo ? "#10b981" : "#94a3b8",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              transition: "all .15s",
            }}
          >
            {caixaAtivo ? <DollarSign size={14} /> : <Lock size={14} />}
            {caixaAtivo ? `Caixa Aberto · ${empresaAtiva?.nomeFantasia ?? ""}` : "Abrir Caixa"}
          </button>

          {/* Usuário */}
          <div className={styles.headerUser}>
            <span className={styles.headerUserName}>
              {usuario.nome.split(" ")[0]}!
            </span>
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

      {/* Layout */}
      <div className={styles.dashboardLayout}>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            {[
              { id: "dashboard",     label: "Dashboard",     icon: <Home /> },
              { id: "produtos",      label: "Produtos",      icon: <Package /> },
              { id: "estoque",       label: "Estoque",       icon: <Warehouse /> },
              { id: "vendas",        label: "Vendas",        icon: <CreditCard /> },
              { id: "clientes",      label: "Clientes",      icon: <Users /> },
              { id: "relatorios",    label: "Relatórios",    icon: <BarChart3 /> },
              { id: "empresas",      label: "Empresas",      icon: <Settings /> },
              { id: "configuracoes", label: "Configurações", icon: <Settings /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSecao(item.id as Secao)}
                className={`${styles.sidebarNavItem} ${secao === item.id ? styles.sidebarNavItemActive : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className={styles.mainContent}>
          {renderSection()}
        </main>
      </div>

      {/* Modal de Caixa */}
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