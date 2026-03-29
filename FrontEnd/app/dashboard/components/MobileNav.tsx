// ─── MobileNav.tsx ────────────────────────────────────────────────────────
// Adicione este componente ao arquivo page.tsx do dashboard.
// Ele renderiza a barra inferior de navegação apenas no mobile.
// Uso: <MobileNav secao={secao} onChange={setSecao} caixaAtivo={!!caixaAtivo} />

"use client";

import {
  Home,
  Package,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Building2,
  Zap,
} from "lucide-react";

type Secao =
  | "dashboard"
  | "produtos"
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
}

// Itens principais (5 que aparecem sempre)
const ITENS_PRINCIPAIS: { id: Secao; label: string; icon: React.ReactNode }[] =
  [
    { id: "dashboard", label: "Início", icon: <Home size={20} /> },
    { id: "vendas", label: "Vendas", icon: <CreditCard size={20} /> },
    { id: "produtos", label: "Produtos", icon: <Package size={20} /> },
    { id: "clientes", label: "Clientes", icon: <Users size={20} /> },
    { id: "relatorios", label: "Relatórios", icon: <BarChart3 size={20} /> },
  ];

// Itens do "mais" (drawer)
const ITENS_MAIS: { id: Secao; label: string; icon: React.ReactNode }[] = [
  { id: "empresas", label: "Empresas", icon: <Building2 size={18} /> },
  { id: "configuracoes", label: "Configurações", icon: <Settings size={18} /> },
  { id: "planos", label: "Planos", icon: <Zap size={18} /> },
];

export default function MobileNav({
  secao,
  onChange,
  caixaAtivo,
}: MobileNavProps) {
  const [drawerAberto, setDrawerAberto] = React.useState(false);

  // Fecha drawer ao navegar
  const navegar = (s: Secao) => {
    onChange(s);
    setDrawerAberto(false);
  };

  const itensSecundarioAtivo = ITENS_MAIS.some((i) => i.id === secao);

  return (
    <>
      <style>{`
        .mobile-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 50;
            background: #111118;
            border-top: 1px solid rgba(255,255,255,0.07);
            padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
            gap: 0;
          }
          .mobile-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            padding: 6px 2px;
            background: none;
            border: none;
            cursor: pointer;
            color: rgba(241,245,249,0.35);
            font-size: 10px;
            font-family: inherit;
            font-weight: 500;
            transition: color .15s;
            position: relative;
            -webkit-tap-highlight-color: transparent;
          }
          .mobile-nav-item.active {
            color: #10b981;
          }
          .mobile-nav-item.active svg {
            filter: drop-shadow(0 0 6px rgba(16,185,129,0.5));
          }
          .mobile-nav-item-dot {
            position: absolute;
            top: 4px;
            right: calc(50% - 14px);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #10b981;
          }

          /* Drawer dos itens secundários */
          .mobile-drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 49;
            backdrop-filter: blur(4px);
          }
          .mobile-drawer {
            position: fixed;
            bottom: 72px;
            left: 12px;
            right: 12px;
            z-index: 50;
            background: #111118;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 8px;
            animation: drawerUp .2s cubic-bezier(0.16,1,0.3,1);
          }
          @keyframes drawerUp {
            from { opacity:0; transform:translateY(12px); }
            to   { opacity:1; transform:translateY(0); }
          }
          .mobile-drawer-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 14px;
            border-radius: 10px;
            background: none;
            border: none;
            color: rgba(241,245,249,0.6);
            font-size: 14px;
            font-family: inherit;
            font-weight: 500;
            cursor: pointer;
            width: 100%;
            text-align: left;
            transition: all .15s;
            -webkit-tap-highlight-color: transparent;
          }
          .mobile-drawer-item:hover,
          .mobile-drawer-item.active {
            background: rgba(16,185,129,0.1);
            color: #10b981;
          }
          .mobile-drawer-item .drawer-icon {
            width: 34px;
            height: 34px;
            border-radius: 9px;
            background: rgba(255,255,255,0.04);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .mobile-drawer-item.active .drawer-icon {
            background: rgba(16,185,129,0.12);
          }
        }
      `}</style>

      {/* Drawer overlay */}
      {drawerAberto && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setDrawerAberto(false)}
        />
      )}

      {/* Drawer de itens secundários */}
      {drawerAberto && (
        <div className="mobile-drawer">
          {ITENS_MAIS.map((item) => (
            <button
              key={item.id}
              className={`mobile-drawer-item ${secao === item.id ? "active" : ""}`}
              onClick={() => navegar(item.id)}
            >
              <span className="drawer-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Bottom bar */}
      <nav className="mobile-nav">
        {ITENS_PRINCIPAIS.map((item) => (
          <button
            key={item.id}
            className={`mobile-nav-item ${secao === item.id ? "active" : ""}`}
            onClick={() => navegar(item.id)}
          >
            {/* Ponto verde em "Vendas" se caixa aberto */}
            {item.id === "vendas" && caixaAtivo && (
              <span className="mobile-nav-item-dot" />
            )}
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}

        {/* Botão "Mais" */}
        <button
          className={`mobile-nav-item ${itensSecundarioAtivo || drawerAberto ? "active" : ""}`}
          onClick={() => setDrawerAberto((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="19" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
}

// ─── INSTRUÇÕES DE USO ─────────────────────────────────────────────────────
//
// 1. Adicione import React from "react" se não tiver
// 2. Adicione o import no page.tsx:
//    import MobileNav from "./components/MobileNav";
//
// 3. Dentro de DashboardInner, no return(), adicione antes do fechamento de
//    .dashboardContainer:
//
//    <MobileNav
//      secao={secao}
//      onChange={setSecao}
//      caixaAtivo={!!caixaAtivo}
//    />
//
// 4. No dashboard.module.css, adicione padding-bottom no mainContent
//    conforme já está na media query acima (padding-bottom: 72px).
//
// ─────────────────────────────────────────────────────────────────────────
