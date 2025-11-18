"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Package,
  Warehouse,
  CreditCard,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUsuario, logout, type Usuario } from "@/lib/api";
import { removeToken } from "@/lib/auth";
import styles from "@/app/styles/dashboard.module.css";

import DashboardHome from "./components/DashboardHome";
import Produtos from "./components/Produtos";
import Estoque from "./components/Estoque";
import Vendas from "./components/Vendas";
import Clientes from "./components/Clientes";
import Relatorios from "./components/Relatorios";
import Configuracoes from "./components/Configuracoes";

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    | "dashboard"
    | "produtos"
    | "estoque"
    | "vendas"
    | "clientes"
    | "relatorios"
    | "configuracoes"
  >("dashboard");

  useEffect(() => {
    async function loadUsuario() {
      try {
        const data = await getUsuario();
        if (!data) {
          window.location.href = "/";
          return;
        }
        setUsuario(data);
      } catch {
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    }
    loadUsuario();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    removeToken();
    window.location.href = "/";
  };

  if (loading)
    return <div className={styles.loadingContainer}>Carregando...</div>;

  if (!usuario) return null;

  const iniciais = usuario.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardHome usuario={usuario} />;
      case "produtos":
        return <Produtos />;
      case "estoque":
        return <Estoque />;
      case "vendas":
        return <Vendas />;
      case "clientes":
        return <Clientes />;
      case "relatorios":
        return <Relatorios />;
      case "configuracoes":
        return <Configuracoes usuario={usuario} />;
      default:
        return <DashboardHome usuario={usuario} />;
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
        </div>
        <div className={styles.headerUser}>
          <span className={styles.headerUserName}>
            Olá, {usuario.nome.split(" ")[0]}!
          </span>
          {usuario.foto ? (
            <img
              src={usuario.foto}
              alt={usuario.nome}
              className={styles.headerUserAvatar}
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
      </header>

      {/* Sidebar e Main Content */}
      <div className={styles.dashboardLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <button
              onClick={() => setActiveSection("dashboard")}
              className={styles.sidebarNavItem}
            >
              <Home /> <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveSection("produtos")}
              className={styles.sidebarNavItem}
            >
              <Package /> <span>Produtos</span>
            </button>
            <button
              onClick={() => setActiveSection("estoque")}
              className={styles.sidebarNavItem}
            >
              <Warehouse /> <span>Estoque</span>
            </button>
            <button
              onClick={() => setActiveSection("vendas")}
              className={styles.sidebarNavItem}
            >
              <CreditCard /> <span>Vendas</span>
            </button>
            <button
              onClick={() => setActiveSection("clientes")}
              className={styles.sidebarNavItem}
            >
              <Users /> <span>Clientes</span>
            </button>
            <button
              onClick={() => setActiveSection("relatorios")}
              className={styles.sidebarNavItem}
            >
              <BarChart3 /> <span>Relatórios</span>
            </button>
            <button
              onClick={() => setActiveSection("configuracoes")}
              className={styles.sidebarNavItem}
            >
              <Settings /> <span>Configurações</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>{renderSection()}</main>
      </div>
    </div>
  );
}
