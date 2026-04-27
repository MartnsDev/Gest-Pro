"use client";

import Link from "next/link";
import { JSX, useState } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Section {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: {
    title: string;
    description: string;
  }[];
}

/* ─────────────────────────────────────────────
   DATA (Ortografia Corrigida)
───────────────────────────────────────────── */
const sections: Section[] = [
  {
    id: "dashboard",
    icon: "dashboard",
    title: "Dashboard",
    description: "Visão geral completa do seu negócio em um único painel. Acompanhe métricas importantes em tempo real.",
    features: [
      { title: "Vendas do dia, semana e mês", description: "Veja o total de vendas separado por período, com comparativos automáticos." },
      { title: "Lucro em tempo real", description: "Acompanhe seu lucro bruto e líquido atualizado a cada venda registrada." },
      { title: "Estoque atual", description: "Quantidade de produtos em estoque e alertas de produtos zerados." },
      { title: "Ações rápidas", description: "Botões de atalho para as funções mais usadas: nova venda, novo produto, ver caixa." },
      { title: "Gráficos de vendas", description: "Visualize suas vendas diárias da semana em um gráfico de barras interativo." },
      { title: "Formas de pagamento", description: "Gráfico de pizza mostrando a distribuição entre PIX, dinheiro, cartão de débito e crédito." },
    ],
  },
  {
    id: "produtos",
    icon: "package",
    title: "Produtos",
    description: "Cadastre e gerencie todos os seus produtos com informações detalhadas de preço e estoque.",
    features: [
      { title: "Cadastro completo", description: "Adicione nome, descrição, preço de custo, preço de venda e quantidade em estoque." },
      { title: "Categorias", description: "Organize seus produtos em categorias personalizadas para facilitar a busca." },
      { title: "Código de barras", description: "Cadastre o código de barras do produto para agilizar as vendas no PDV." },
      { title: "Fotos do produto", description: "Adicione imagens para identificar facilmente cada item." },
      { title: "Controle de margem", description: "O sistema calcula automaticamente sua margem de lucro por produto." },
      { title: "Busca rápida", description: "Encontre qualquer produto pelo nome, código ou categoria." },
    ],
  },
  {
    id: "vendas",
    icon: "cart",
    title: "Vendas",
    description: "Registre vendas de forma rápida e intuitiva com suporte a múltiplas formas de pagamento.",
    features: [
      { title: "PDV simplificado", description: "Interface limpa e rápida para registrar vendas em segundos." },
      { title: "Múltiplos pagamentos", description: "Aceite PIX, dinheiro, cartão de débito e crédito na mesma venda." },
      { title: "Desconto por venda", description: "Aplique descontos em porcentagem ou valor fixo em qualquer venda." },
      { title: "Vínculo com cliente", description: "Associe a venda a um cliente cadastrado para histórico e fidelização." },
      { title: "Impressão de recibo", description: "Gere comprovantes para seus clientes com todos os detalhes da compra." },
      { title: "Histórico completo", description: "Consulte todas as vendas realizadas com filtros por data e status." },
    ],
  },
  {
    id: "clientes",
    icon: "users",
    title: "Clientes",
    description: "Mantenha um cadastro completo dos seus clientes e acompanhe o histórico de compras.",
    features: [
      { title: "Cadastro de clientes", description: "Nome, telefone, e-mail, endereço e observações personalizadas." },
      { title: "Histórico de compras", description: "Veja todas as compras que cada cliente já fez na sua loja." },
      { title: "Total gasto", description: "Acompanhe quanto cada cliente já gastou no seu estabelecimento." },
      { title: "Aniversário", description: "Cadastre a data de aniversário para realizar ações de marketing." },
      { title: "Busca rápida", description: "Encontre clientes pelo nome ou telefone durante a venda." },
      { title: "Clientes ativos", description: "Veja quantos clientes compraram nos últimos 30 dias." },
    ],
  },
  {
    id: "caixa",
    icon: "cash",
    title: "Controle de Caixa",
    description: "Abra e feche caixas com controle total de entradas, saídas e saldo.",
    features: [
      { title: "Abertura de caixa", description: "Inicie o dia informando o saldo inicial em dinheiro." },
      { title: "Sangrias e suprimentos", description: "Registre retiradas e adições de dinheiro no caixa durante o expediente." },
      { title: "Fechamento detalhado", description: "Veja o resumo de todas as movimentações ao fechar o caixa." },
      { title: "Conferência de valores", description: "Compare o saldo esperado com o saldo real e registre diferenças." },
      { title: "Histórico de caixas", description: "Consulte todos os caixas anteriores com seus respectivos resumos." },
      { title: "Múltiplos caixas", description: "Gerencie vários caixas simultâneos (planos Pro e Premium)." },
    ],
  },
  {
    id: "relatorios",
    icon: "chart",
    title: "Relatórios",
    description: "Analise seu negócio com relatórios detalhados e tome decisões baseadas em dados.",
    features: [
      { title: "Relatório de vendas", description: "Vendas por período com filtros por data, vendedor e forma de pagamento." },
      { title: "Produtos mais vendidos", description: "Ranking dos produtos que mais vendem na sua loja." },
      { title: "Relatório de estoque", description: "Lista de produtos em estoque, zerados e com estoque baixo." },
      { title: "Relatório de lucro", description: "Analise sua margem de lucro por período e por produto." },
      { title: "Exportação de dados", description: "Exporte seus relatórios em PDF ou Excel para análise externa." },
      { title: "Comparativos", description: "Compare períodos diferentes para identificar tendências de mercado." },
    ],
  },
  {
    id: "empresas",
    icon: "building",
    title: "Multi-empresas",
    description: "Gerencie múltiplas lojas ou filiais em uma única conta (planos Pro e Premium).",
    features: [
      { title: "Cadastro de empresas", description: "Adicione várias empresas com CNPJs e endereços diferentes." },
      { title: "Troca rápida", description: "Alterne entre empresas com um clique no menu superior." },
      { title: "Dados separados", description: "Cada empresa tem seus próprios produtos, clientes e vendas." },
      { title: "Relatórios por empresa", description: "Gere relatórios individuais ou consolidados de todas as empresas." },
      { title: "Usuários por empresa", description: "Defina quais usuários têm acesso a cada filial." },
      { title: "Visão geral", description: "Dashboard unificado com métricas de todas as suas empresas." },
    ],
  },
  {
    id: "configuracoes",
    icon: "settings",
    title: "Configurações",
    description: "Personalize o sistema de acordo com as necessidades do seu negócio.",
    features: [
      { title: "Dados da empresa", description: "Configure nome, logo, endereço e informações de contato." },
      { title: "Categorias de produtos", description: "Crie e edite categorias para organizar seu catálogo." },
      { title: "Formas de pagamento", description: "Habilite ou desabilite formas de pagamento aceitas na loja." },
      { title: "Usuários e permissões", description: "Adicione funcionários com níveis de acesso diferentes." },
      { title: "Notificações", description: "Configure alertas automáticos de estoque baixo e metas de vendas." },
      { title: "Integrações", description: "Conecte com outros sistemas e ferramentas (plano Premium)." },
    ],
  },
];

/* ─────────────────────────────────────────────
   ICON COMPONENT
───────────────────────────────────────────── */
const Icon = ({ name, size = 24 }: { name: string; size?: number }) => {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
      </svg>
    ),
    cart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    cash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
    chart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>
      </svg>
    ),
    building: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    arrow: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

/* ─────────────────────────────────────────────
   LOGO COMPONENT
───────────────────────────────────────────── */
const Logo = () => (
  <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
    <img 
      src="/images/logo.png" 
      alt="GestPro" 
      style={{ width: 32, height: 32, objectFit: "contain" }} 
    />
    <span style={{ fontFamily: "var(--font-syne), 'Syne', 'Inter', sans-serif", fontWeight: 800, fontSize: 18, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
      Gest<span style={{ color: "#10b981" }}>Pro</span>
    </span>
  </Link>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ComoUsarPage() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  const currentSection = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <main style={{ background: "#050608", minHeight: "100vh", color: "#f1f5f9" }}>
      {/* Styles */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(16,185,129,0.28); color: #e2fef4; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050608; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.35); border-radius: 2px; }
        
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px; border-radius: 12px;
          font-family: var(--font-manrope), 'Manrope', 'Inter', sans-serif;
          font-size: 14px; font-weight: 600;
          color: rgba(241,245,249,0.6);
          background: transparent;
          border: none; cursor: pointer; width: 100%;
          text-align: left;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.04);
          color: rgba(241,245,249,0.9);
        }
        .nav-item.active {
          background: rgba(16,185,129,0.12);
          color: #10b981;
          border-left: 3px solid #10b981;
          box-shadow: inset 20px 0 40px -20px rgba(16,185,129,0.1);
        }
        
        .feature-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(16,185,129,0.3);
          transform: translateY(-4px);
          box-shadow: 0 10px 30px -10px rgba(16,185,129,0.1);
        }
        
        .cta-btn {
          display: inline-flex;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; padding: 14px 32px; border-radius: 12px;
          font-family: var(--font-manrope), 'Manrope', 'Inter', sans-serif;
          font-size: 15px; font-weight: 700; text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(16,185,129,0.25);
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.4);
        }

        @media(max-width:900px) {
          .sidebar { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 30px 20px !important; }
          .mobile-nav { display: flex !important; }
        }
        @media(min-width:901px) {
          .mobile-nav { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(5,6,8,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 28px",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/" style={{
              fontFamily: "var(--font-manrope), 'Manrope', 'Inter', sans-serif",
              fontSize: 14, fontWeight: 600, color: "rgba(241,245,249,0.6)",
              textDecoration: "none", transition: "color 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#f1f5f9"}
            onMouseOut={(e) => e.currentTarget.style.color = "rgba(241,245,249,0.6)"}
            >
              Voltar ao site
            </Link>
            <Link href="/auth/cadastro" className="cta-btn" style={{ padding: "10px 20px", fontSize: 14 }}>
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", paddingTop: 64 }}>
        {/* Sidebar */}
        <aside className="sidebar" style={{
          position: "fixed", top: 64, left: 0, bottom: 0,
          width: 280, padding: "32px 16px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflowY: "auto",
        }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: "var(--font-dm-mono), 'DM Mono', monospace",
              fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase",
              color: "rgba(241,245,249,0.35)", marginBottom: 16, padding: "0 18px", fontWeight: 700
            }}>Funcionalidades</h2>
            <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sections.map(s => (
                <button
                  key={s.id}
                  className={`nav-item ${activeSection === s.id ? "active" : ""}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <Icon name={s.icon} size={20} />
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="mobile-nav" style={{
          position: "fixed", top: 64, left: 0, right: 0, zIndex: 50,
          background: "rgba(5,6,8,0.95)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "12px 20px",
          display: "none",
          gap: 10, overflowX: "auto",
        }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                padding: "8px 16px", borderRadius: 99, whiteSpace: "nowrap",
                background: activeSection === s.id ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                border: activeSection === s.id ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: activeSection === s.id ? "#10b981" : "rgba(241,245,249,0.6)",
                fontFamily: "var(--font-manrope), 'Manrope', 'Inter', sans-serif",
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="main-content" style={{ flex: 1, marginLeft: 280, padding: "56px 64px" }}>
          <div style={{ maxWidth: 900 }}>
            
            {/* Section Header */}
            <div style={{ marginBottom: 56 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#10b981", marginBottom: 24,
                boxShadow: "0 8px 32px rgba(16,185,129,0.15)"
              }}>
                <Icon name={currentSection.icon} size={28} />
              </div>
              <h1 style={{
                fontFamily: "var(--font-syne), 'Syne', 'Inter', sans-serif",
                fontWeight: 800, fontSize: "clamp(36px, 5vw, 48px)",
                color: "#f1f5f9", letterSpacing: "-0.03em", marginBottom: 16,
              }}>
                {currentSection.title}
              </h1>
              <p style={{
                fontFamily: "var(--font-manrope), 'Manrope', 'Inter', sans-serif",
                fontSize: 18, lineHeight: 1.7, color: "rgba(241,245,249,0.65)",
                maxWidth: 650,
              }}>
                {currentSection.description}
              </p>
            </div>

            {/* Features Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}>
              {currentSection.features.map((feature, i) => (
                <div key={i} className="feature-card">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{
                      minWidth: 32, height: 32, borderRadius: 10,
                      background: "rgba(16,185,129,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#10b981",
                    }}>
                      <Icon name="check" size={18} />
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: "var(--font-syne), 'Syne', 'Inter', sans-serif",
                        fontWeight: 700, fontSize: 17, color: "#f1f5f9", marginBottom: 8,
                      }}>
                        {feature.title}
                      </h3>
                      <p style={{
                        fontFamily: "var(--font-manrope), 'Manrope', 'Inter', sans-serif",
                        fontSize: 14, lineHeight: 1.6, color: "rgba(241,245,249,0.55)",
                      }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation between sections */}
            <div style={{
              marginTop: 64, paddingTop: 40,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: 16,
            }}>
              {sections.findIndex(s => s.id === activeSection) > 0 && (
                <button
                  onClick={() => {
                    const idx = sections.findIndex(s => s.id === activeSection);
                    setActiveSection(sections[idx - 1].id);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "14px 24px", borderRadius: 12,
                    color: "rgba(241,245,249,0.7)",
                    fontFamily: "var(--font-manrope), 'Manrope', 'Inter', sans-serif",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(241,245,249,0.7)"; }}
                >
                  <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon name="arrow" size={16} /></span>
                  {sections[sections.findIndex(s => s.id === activeSection) - 1].title}
                </button>
              )}
              {sections.findIndex(s => s.id === activeSection) < sections.length - 1 && (
                <button
                  onClick={() => {
                    const idx = sections.findIndex(s => s.id === activeSection);
                    setActiveSection(sections[idx + 1].id);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    padding: "14px 24px", borderRadius: 12,
                    color: "#10b981",
                    fontFamily: "var(--font-manrope), 'Manrope', 'Inter', sans-serif",
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    marginLeft: "auto",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.15)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.25)"; }}
                >
                  {sections[sections.findIndex(s => s.id === activeSection) + 1].title}
                  <Icon name="arrow" size={16} />
                </button>
              )}
            </div>

            {/* CTA */}
            <div style={{
              marginTop: 64,
              background: "linear-gradient(145deg, rgba(16,185,129,0.08), rgba(5,150,105,0.02))",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 24, padding: "48px 40px",
              textAlign: "center",
            }}>
              <h2 style={{
                fontFamily: "var(--font-syne), 'Syne', 'Inter', sans-serif",
                fontWeight: 800, fontSize: 32, color: "#f1f5f9", marginBottom: 12,
              }}>
                Pronto para começar?
              </h2>
              <p style={{
                fontFamily: "var(--font-manrope), 'Manrope', 'Inter', sans-serif",
                fontSize: 16, color: "rgba(241,245,249,0.6)", marginBottom: 32,
              }}>
                Crie sua conta grátis e comece a transformar a gestão do seu negócio agora mesmo.
              </p>
              <Link href="/auth/cadastro" className="cta-btn">
                Criar conta grátis
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}