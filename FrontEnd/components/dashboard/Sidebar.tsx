"use client";

import {
  Home,
  Package,
  Warehouse,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Section =
  | "dashboard"
  | "produtos"
  | "estoque"
  | "vendas"
  | "clientes"
  | "relatorios"
  | "configuracoes";

interface SidebarProps {
  active: Section;
  onNavigate: (s: Section) => void;
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}

const NAV_ITEMS: { section: Section; icon: React.ReactNode; label: string }[] =
  [
    { section: "dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { section: "produtos", icon: <Package size={18} />, label: "Produtos" },
    { section: "estoque", icon: <Warehouse size={18} />, label: "Estoque" },
    { section: "vendas", icon: <CreditCard size={18} />, label: "Vendas" },
    { section: "clientes", icon: <Users size={18} />, label: "Clientes" },
    {
      section: "relatorios",
      icon: <BarChart3 size={18} />,
      label: "Relatórios",
    },
    {
      section: "configuracoes",
      icon: <Settings size={18} />,
      label: "Configurações",
    },
  ];

export function Sidebar({
  active,
  onNavigate,
  collapsed,
  onCollapse,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? 64 : 220,
        minWidth: collapsed ? 64 : 220,
        background: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 200ms ease, min-width 200ms ease",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 20px",
          borderBottom: "1px solid var(--sidebar-border)",
          gap: 10,
          overflow: "hidden",
        }}
      >
        <img src="/favicon.png" alt="GestPro" width={28} height={28} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--foreground)", whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--foreground)" }}>Gest</span>
            <span style={{ color: "var(--primary)" }}>Pro</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.section;
          return (
            <button
              key={item.section}
              onClick={() => onNavigate(item.section)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8,
                background: isActive ? "var(--sidebar-active-bg)" : "transparent",
                color: isActive ? "var(--sidebar-active-fg)" : "var(--sidebar-muted)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--sidebar-hover-bg)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
              }}
            >
              <span style={{ flexShrink: 0, color: isActive ? "var(--sidebar-active-fg)" : "var(--sidebar-muted)" }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => onCollapse(!collapsed)}
        title={collapsed ? "Expandir menu" : "Recolher menu"}
        style={{
          margin: "0 8px 12px",
          padding: "8px",
          borderRadius: 8,
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--foreground-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "var(--sidebar-hover-bg)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background =
            "transparent")
        }
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
