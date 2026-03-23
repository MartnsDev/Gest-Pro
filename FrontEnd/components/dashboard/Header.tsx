"use client";

import { useState } from "react";
import { LogOut, Bell } from "lucide-react";
import { logout } from "@/lib/api-v2";
import { removeToken } from "@/lib/auth-v2";
import type { Usuario } from "@/lib/api-v2";

interface HeaderProps {
  usuario: Usuario;
  section: string;
}

const SECTION_LABELS: Record<string, string> = {
  dashboard: "Visão Geral",
  produtos: "Produtos",
  estoque: "Estoque",
  vendas: "Vendas / PDV",
  clientes: "Clientes",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
};

function Avatar({ usuario }: { usuario: Usuario }) {
  const iniciais = usuario.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return usuario.foto && !usuario.foto.includes("placeholder") ? (
    <img
      src={usuario.foto}
      alt={usuario.nome}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid var(--border)",
      }}
    />
  ) : (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "var(--primary-muted)",
        border: "2px solid var(--primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        color: "var(--primary)",
        flexShrink: 0,
      }}
    >
      {iniciais}
    </div>
  );
}

export function Header({ usuario, section }: HeaderProps) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch {}
    removeToken();
    window.location.href = "/";
  };

  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <header
      style={{
        height: 60,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Breadcrumb / Título */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 11, color: "var(--foreground-subtle)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
          GestPro
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.2 }}>
          {SECTION_LABELS[section] ?? "Dashboard"}
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Notifications (visual) */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--foreground-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          title="Notificações"
        >
          <Bell size={16} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }} />

        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar usuario={usuario} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.2 }}>
              {primeiroNome}
            </span>
            <span style={{ fontSize: 11, color: "var(--foreground-muted)", lineHeight: 1.2 }}>
              {usuario.tipoPlano}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sair"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--foreground-muted)",
            cursor: loggingOut ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: loggingOut ? 0.5 : 1,
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
