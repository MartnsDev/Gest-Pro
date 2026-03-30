"use client";

import { useState, useEffect, useRef } from "react";
import {
  Home,
  Package,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Building2,
  Zap,
  MoreHorizontal,
  X,
  LogOut,
} from "lucide-react";

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

interface MobileNavProps {
  secao: Secao;
  onChange: (s: Secao) => void;
  caixaAtivo: boolean;
  onLogout?: () => void;
}

const mainItems: { id: Secao; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Início", icon: <Home size={20} /> },
  { id: "produtos", label: "Produtos", icon: <Package size={20} /> },
  { id: "vendas", label: "Vendas", icon: <CreditCard size={20} /> },
  { id: "clientes", label: "Clientes", icon: <Users size={20} /> },
  { id: "relatorios", label: "Relatórios", icon: <BarChart3 size={20} /> },
];

const moreItems: { id: Secao; label: string; icon: React.ReactNode }[] = [
  { id: "empresas", label: "Empresas", icon: <Building2 size={20} /> },
  { id: "configuracoes", label: "Configurações", icon: <Settings size={20} /> },
  { id: "planos", label: "Planos", icon: <Zap size={20} /> },
];

export default function MobileNav({ secao, onChange, caixaAtivo, onLogout }: MobileNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen]);

  // Fecha o drawer ao navegar
  const navigate = (id: Secao) => {
    onChange(id);
    setDrawerOpen(false);
  };

  const isMoreActive = moreItems.some((i) => i.id === secao);

  return (
    <>
      {/* ── Drawer "Mais" ── */}
      {drawerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          <div
            ref={drawerRef}
            style={{
              position: "absolute",
              bottom: 68,
              left: 12,
              right: 12,
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 18,
              padding: "8px 4px 4px",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
              animation: "slideUp .22s cubic-bezier(.175,.885,.32,1.1)",
            }}
          >
            {/* Header do drawer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 16px 10px",
                borderBottom: "1px solid var(--border)",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Mais opções
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--foreground-muted)",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 8,
                  minHeight: 32,
                  minWidth: 32,
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Itens do drawer */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 8px 8px" }}>
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 16px",
                    borderRadius: 12,
                    border: "none",
                    background: secao === item.id ? "var(--sidebar-active-bg)" : "transparent",
                    color: secao === item.id ? "var(--sidebar-active-fg)" : "var(--foreground)",
                    fontSize: 15,
                    fontWeight: secao === item.id ? 600 : 400,
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    transition: "background 0.12s",
                    minHeight: 50,
                  }}
                >
                  <span style={{ color: secao === item.id ? "var(--sidebar-active-fg)" : "var(--foreground-muted)" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}

              {/* Divider + Logout (só se onLogout for passado) */}
              {onLogout && (
                <>
                  <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                  <button
                    onClick={onLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "13px 16px",
                      borderRadius: 12,
                      border: "none",
                      background: "transparent",
                      color: "#ef4444",
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                      minHeight: 50,
                    }}
                  >
                    <LogOut size={20} color="#ef4444" />
                    Sair da conta
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Nav Bar ── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: 68,
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "stretch",
          zIndex: 900,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {mainItems.map((item) => {
          const active = secao === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                border: "none",
                background: active ? "var(--sidebar-active-bg)" : "transparent",
                color: active ? "var(--sidebar-active-fg)" : "var(--foreground-muted)",
                fontSize: "0.58rem",
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                borderRadius: 10,
                margin: "6px 2px",
                transition: "background 0.12s, color 0.12s, transform 0.1s",
                WebkitTapHighlightColor: "transparent",
                letterSpacing: "0.01em",
              }}
              onTouchStart={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(0.90)";
              }}
              onTouchEnd={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              {item.icon}
              <span style={{ lineHeight: 1 }}>{item.label}</span>
            </button>
          );
        })}

        {/* Botão "Mais" */}
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            border: "none",
            background: (drawerOpen || isMoreActive) ? "var(--sidebar-active-bg)" : "transparent",
            color: (drawerOpen || isMoreActive) ? "var(--sidebar-active-fg)" : "var(--foreground-muted)",
            fontSize: "0.58rem",
            fontWeight: (drawerOpen || isMoreActive) ? 600 : 500,
            cursor: "pointer",
            borderRadius: 10,
            margin: "6px 2px",
            transition: "background 0.12s, color 0.12s, transform 0.1s",
            WebkitTapHighlightColor: "transparent",
            letterSpacing: "0.01em",
          }}
          onTouchStart={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(0.90)";
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          <MoreHorizontal size={20} />
          <span style={{ lineHeight: 1 }}>Mais</span>
        </button>
      </nav>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}