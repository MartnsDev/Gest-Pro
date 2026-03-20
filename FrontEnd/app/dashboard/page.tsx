"use client";

import { useState, useEffect } from "react";
import { getUsuario, type Usuario } from "@/lib/api";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

import DashboardHome from "./components/DashboardHome";
import Produtos from "./components/Produtos";
import Estoque from "./components/Estoque";
import Vendas from "./components/Vendas";
import Clientes from "./components/Clientes";
import Relatorios from "./components/Relatorios";
import Configuracoes from "./components/Configuracoes";

type Section =
  | "dashboard"
  | "produtos"
  | "estoque"
  | "vendas"
  | "clientes"
  | "relatorios"
  | "configuracoes";

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <img src="/favicon.png" alt="GestPro" width={32} height={32} />
        <span
          style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}
        >
          Gest<span style={{ color: "var(--primary)" }}>Pro</span>
        </span>
      </div>
      <div
        style={{
          width: 200,
          height: 3,
          background: "var(--surface-elevated)",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "40%",
            background: "var(--primary)",
            borderRadius: 999,
            animation: "shimmer 1.2s ease-in-out infinite",
            backgroundImage:
              "linear-gradient(90deg, var(--primary) 0%, #34d399 50%, var(--primary) 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
      <span
        style={{ fontSize: 13, color: "var(--foreground-muted)" }}
      >
        Carregando...
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    getUsuario()
      .then((data) => {
        if (!data) {
          window.location.href = "/";
          return;
        }
        setUsuario(data);
      })
      .catch(() => {
        window.location.href = "/";
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (!usuario) return null;

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
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        background: "var(--background)",
        overflow: "hidden",
      }}
    >
      <Sidebar
        active={activeSection}
        onNavigate={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Header usuario={usuario} section={activeSection} />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--background)",
          }}
        >
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
