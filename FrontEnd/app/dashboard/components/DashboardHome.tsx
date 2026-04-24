"use client";

import { useEffect, useState, ReactNode } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  AlertCircle, DollarSign, FileText, BarChart3, Package, Users,
  CreditCard, TrendingUp, TrendingDown, Calendar, Store,
  Lock, ShoppingBag, ChevronRight, Receipt, Settings, ShoppingCart
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import type { Usuario } from "@/lib/api-v2";

// ─── IMPORTANDO SERVIÇOS E TIPOS ───
import { 
  dashboardService, 
  type VisaoGeral, 
  type MetodoPagamentoData, 
  type ProdutoVendasData, 
  type VendasDiariasData 
} from "@/lib/services/dashboard";

// ─── IMPORTANDO GRÁFICOS ───
import { BarChart }  from "./graphs/BarChart";
import { PieChart }  from "./graphs/PieChart";

// ─── IMPORTANDO MODAIS (AÇÕES RÁPIDAS) ───
import AbrirCaixa from "../acoesRapidas/AbrirCaixa";
import NovaVenda from "../acoesRapidas/NovaVenda";
import NovoProduto from "../acoesRapidas/NovoProduto";
import NovoCliente from "../acoesRapidas/NovoCliente";
import ModalRelatorioRapido from "../acoesRapidas/ModalRelatorioRapido";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?: number | null) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

/* ─── ClientOnly & UI Components ─────────────────────────────────────────── */
function ClientOnly({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok ? <>{children}</> : null;
}

function ChartCard({ title, subtitle, children, fullWidth, accent }: { title: string; subtitle?: string; children: ReactNode; fullWidth?: boolean; accent?: string; }) {
  return (
    <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", gridColumn: fullWidth ? "1 / -1" : undefined, position: "relative", overflow: "hidden" }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}88, ${accent}00)` }} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: "var(--foreground-subtle)", margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--foreground-subtle)" }}>
      <BarChart3 size={32} style={{ opacity: 0.25 }} />
      <p style={{ fontSize: 13, margin: 0, opacity: 0.5 }}>Sem dados disponíveis</p>
    </div>
  );
}

/* ─── Componente Principal ───────────────────────────────────────────────── */
export default function DashboardHome({ usuario, onNavegar }: { usuario?: Usuario; onNavegar?: (secao: string) => void; }) {
  const { empresaAtiva, caixaAtivo } = useEmpresa();

  const [visao, setVisao] = useState<VisaoGeral | null>(null);
  const [vendasMetodo, setVendasMetodo] = useState<MetodoPagamentoData[]>([]);
  const [vendasProduto, setVendasProduto] = useState<ProdutoVendasData[]>([]);
  const [vendasDiarias, setVendasDiarias] = useState<VendasDiariasData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar qual Modal de Ação Rápida está aberto
  const [modalAtivo, setModalAtivo] = useState<"venda" | "produto" | "caixa" | "cliente" | "relatorio" | null>(null);
  const [alertasExpandido, setAlertasExpandido] = useState(false);

  // Helper para navegação lateral
  const nav = (s: string) => onNavegar?.(s);

  // Busca de dados utilizando o dashboardService centralizado
  const fetchDados = async (id: number) => {
    setLoading(true);
    try {
      const [v, metodo, produto, diarias] = await Promise.allSettled([
        dashboardService.visaoGeral(id),
        dashboardService.vendasPorMetodo(id),
        dashboardService.vendasPorProduto(id),
        dashboardService.vendasDiarias(id),
      ]);
      
      if (v.status === "fulfilled") setVisao(v.value);
      if (metodo.status === "fulfilled") setVendasMetodo(metodo.value ?? []);
      if (produto.status === "fulfilled") setVendasProduto(produto.value ?? []);
      if (diarias.status === "fulfilled") setVendasDiarias(diarias.value ?? []);
    } catch (err) { 
      console.error("Erro ao buscar dados do dashboard:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (empresaAtiva?.id) fetchDados(empresaAtiva.id);
    return () => setLoading(false);
  }, [empresaAtiva?.id]);

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "usuário";
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const statsCards = [
    { title: "Vendas Hoje", value: loading ? "—" : fmt(visao?.vendasHoje), icon: <CreditCard size={16} />, accent: "primary" as const },
    { title: "Vendas Semana", value: loading ? "—" : fmt(visao?.vendasSemanais), icon: <BarChart3 size={16} />, accent: "secondary" as const },
    { title: "Vendas Mês", value: loading ? "—" : fmt(visao?.vendasMes), icon: <Calendar size={16} />, accent: "primary" as const },
    { title: "Lucro Hoje", value: loading ? "—" : fmt(visao?.lucroDia), icon: <TrendingUp size={16} />, accent: "secondary" as const },
    { title: "Lucro Mês", value: loading ? "—" : fmt(visao?.lucroMes), icon: <TrendingUp size={16} />, accent: "primary" as const },
    { title: "Em Estoque", value: loading ? "—" : String(visao?.produtosComEstoque ?? 0), icon: <Package size={16} />, accent: "secondary" as const },
    { title: "Zerados", value: loading ? "—" : String(visao?.produtosSemEstoque ?? 0), icon: <TrendingDown size={16} />, accent: "destructive" as const },
    { title: "Clientes", value: loading ? "—" : String(visao?.clientesAtivos ?? 0), icon: <Users size={16} />, accent: "warning" as const },
    { title: "Custo Estoque", value: loading ? "—" : fmt(visao?.custos), icon: <Receipt size={16} />, accent: "warning" as const },
  ];

  const todosAlertas = [
    ...(visao?.alertas ?? []),
    ...(visao?.planoUsuario && visao.planoUsuario.diasRestantes < 7 ? [`Plano ${visao.planoUsuario.tipoPlano}: ${visao.planoUsuario.diasRestantes} dia(s) restante(s)`] : []),
  ];
  const alertasProduto = todosAlertas.filter(a => a.startsWith("Estoque esgotado:"));
  const alertasOutros = todosAlertas.filter(a => !a.startsWith("Estoque esgotado:"));

  // ─── AÇÕES RÁPIDAS (Configuradas para Modais ou Navegação) ───
  const acoes = [
    {
      label: caixaAtivo ? "Ver Caixa" : "Abrir Caixa",
      desc: caixaAtivo ? `${fmt(caixaAtivo.totalVendas)} em vendas` : "Nenhum caixa aberto",
      icon: caixaAtivo ? <DollarSign size={20} /> : <Lock size={20} />,
      cor: caixaAtivo ? "#34d399" : "var(--foreground-muted)",
      bg: caixaAtivo ? "rgba(52,211,153,0.08)" : "var(--surface-overlay)",
      borda: caixaAtivo ? "rgba(52,211,153,0.3)" : "var(--border)",
      acao: () => caixaAtivo ? nav("caixa-rapido") : setModalAtivo("caixa"),
    },
    {
      label: "Nova Venda",
      desc: caixaAtivo ? `Caixa #${caixaAtivo.id} aberto` : "Abra o caixa primeiro",
      icon: <ShoppingCart size={20} />,
      cor: caixaAtivo ? "var(--foreground)" : "var(--foreground-subtle)",
      bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => caixaAtivo ? setModalAtivo("venda") : setModalAtivo("caixa"),
    },
    {
      label: "Registrar Pedido",
      desc: "Registrar um pedido de venda",
      icon: <ShoppingBag size={20} />,
      cor: "var(--foreground)", bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => nav("pedidos"),
    },
    {
      label: "Novo Produto",
      desc: `${visao?.produtosComEstoque ?? 0} com estoque`,
      icon: <Package size={20} />,
      cor: "var(--foreground)", bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => setModalAtivo("produto"),
    },
    {
      label: "Novo Cliente",
      desc: `${visao?.clientesAtivos ?? 0} ativos`,
      icon: <Users size={20} />,
      cor: "var(--foreground)", bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => setModalAtivo("cliente"),
    },
    {
      label: "Resumo do Dia",
      desc: "Ver métricas rápidas",
      icon: <BarChart3 size={20} />,
      cor: "var(--foreground)", bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => setModalAtivo("relatorio"),
    },
    {
      label: "Relatórios",
      desc: "Exportar dados completos",
      icon: <FileText size={20} />,
      cor: "var(--foreground)", bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => nav("relatorios"),
    },
    {
      label: "Emitir nota fiscal",
      desc: "Emitir NF-e / NFC-e",
      icon: <Receipt size={20} />,
      cor: "var(--foreground)", bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => nav("notafiscal"),
    },
    {
      label: "Configurações",
      desc: "Alterar configurações",
      icon: <Settings size={20} />,
      cor: "var(--foreground)", bg: "var(--surface-overlay)", borda: "var(--border)",
      acao: () => nav("configuracoes"),
    },
  ];

  if (!empresaAtiva)
    return (
      <ClientOnly>
        <div style={{ padding: 48, textAlign: "center", color: "var(--foreground-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Store size={48} color="var(--foreground-subtle)" />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Nenhuma empresa selecionada</h2>
          <p style={{ fontSize: 14 }}>Selecione ou cadastre uma empresa no menu superior.</p>
        </div>
      </ClientOnly>
    );

  return (
    <ClientOnly>
      {/* ── RENDERIZAÇÃO DOS MODAIS EXTRAÍDOS ── */}
      {modalAtivo === "caixa" && <AbrirCaixa onClose={() => setModalAtivo(null)} onConcluido={() => fetchDados(empresaAtiva.id)} />}
      
      {modalAtivo === "venda" && caixaAtivo && <NovaVenda empresaId={empresaAtiva.id} caixaId={caixaAtivo.id} onClose={() => setModalAtivo(null)} onConcluido={() => fetchDados(empresaAtiva.id)} />}
      
      {modalAtivo === "produto" && <NovoProduto empresaId={empresaAtiva.id} onClose={() => setModalAtivo(null)} onConcluido={() => fetchDados(empresaAtiva.id)} />}
      
      {modalAtivo === "cliente" && <NovoCliente empresaId={empresaAtiva.id} onClose={() => setModalAtivo(null)} onConcluido={() => fetchDados(empresaAtiva.id)} />}
      
      {modalAtivo === "relatorio" && <ModalRelatorioRapido empresaId={empresaAtiva.id} onClose={() => setModalAtivo(null)} onIrRelatorios={() => nav("relatorios")} />}

      <div style={{ padding: "28px 28px 48px", display: "flex", flexDirection: "column", gap: 26 }}>

        {/* ── Saudação ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Olá, {primeiroNome}! 👋
            </h1>
            <p style={{ fontSize: 13, color: "var(--foreground-muted)", textTransform: "capitalize", margin: 0 }}>
              {today} · <span style={{ color: "var(--primary)" }}>{empresaAtiva.nomeFantasia}</span>
            </p>
          </div>
          {caixaAtivo && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 10, fontSize: 13, color: "#34d399", fontWeight: 500 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px rgba(52,211,153,0.8)" }} />
              Caixa aberto · {fmt(caixaAtivo.totalVendas ?? 0)} em vendas
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px,1fr))", gap: 12 }}>
          {statsCards.map((c, i) => <StatsCard key={i} {...c} loading={loading} />)}
        </div>

        {/* ── Alertas ── */}
        {todosAlertas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alertasOutros.map((msg, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, color: "#f59e0b", fontSize: 13, fontWeight: 500 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />{msg}
              </div>
            ))}
            {alertasProduto.length > 0 && (
              <div style={{ border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, overflow: "hidden" }}>
                <button onClick={() => setAlertasExpandido(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(245,158,11,0.08)", border: "none", cursor: "pointer", color: "#f59e0b", fontSize: 13, fontWeight: 500, textAlign: "left" }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{alertasProduto.length} produto{alertasProduto.length > 1 ? "s" : ""} sem estoque</span>
                  <ChevronRight size={15} style={{ flexShrink: 0, transition: "transform .2s", transform: alertasExpandido ? "rotate(90deg)" : "none" }} />
                </button>
                {alertasExpandido && (
                  <div style={{ background: "var(--surface-elevated)", borderTop: "1px solid rgba(245,158,11,0.15)" }}>
                    {alertasProduto.map((msg, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 12, color: "var(--foreground-muted)", borderBottom: i < alertasProduto.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                        <Package size={13} style={{ flexShrink: 0, color: "#f59e0b" }} />
                        {msg.replace("Estoque esgotado: ", "")}
                      </div>
                    ))}
                    <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border-subtle)" }}>
                      <button onClick={() => nav("produtos")} style={{ background: "none", border: "none", cursor: "pointer", color: "#f59e0b", fontSize: 12, fontWeight: 600, padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
                        <ChevronRight size={13} /> Ver todos os produtos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Ações Rápidas ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Ações Rápidas
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px,1fr))", gap: 10 }}>
            {acoes.map((a, i) => (
              <button key={i} onClick={a.acao} style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 11,
                padding: "16px 15px", background: a.bg, border: `1px solid ${a.borda}`,
                borderRadius: 12, cursor: "pointer", transition: "all .16s", textAlign: "left",
              }}
                onMouseEnter={e => {
                  const b = e.currentTarget;
                  b.style.borderColor = "var(--primary)"; b.style.transform = "translateY(-2px)";
                  b.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget;
                  b.style.borderColor = a.borda; b.style.transform = "translateY(0)";
                  b.style.boxShadow = "none";
                }}
              >
                <span style={{ color: a.cor }}>{a.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: a.cor, margin: 0 }}>{a.label}</p>
                  <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "3px 0 0" }}>{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Gráficos ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: ".08em" }}>
            Análise Visual
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <ChartCard title="Vendas Diárias" subtitle="Seg → Dom desta semana" accent="#60a5fa">
              {vendasDiarias.length > 0 ? (
                <BarChart labels={vendasDiarias.map(d => d.dia)} data={vendasDiarias.map(d => d.total)} label="Receita Diária" color="blue" formatValue={v => fmt(v)} height={240} />
              ) : <EmptyChart />}
            </ChartCard>

            <ChartCard title="Formas de Pagamento" subtitle="Distribuição por método" accent="#34d399">
              {vendasMetodo.length > 0 ? (
                <PieChart labels={vendasMetodo.map(m => m.metodo)} data={vendasMetodo.map(m => m.total)} formatValue={v => `${v} venda${v !== 1 ? "s" : ""}`} />
              ) : <EmptyChart />}
            </ChartCard>
          </div>

          <ChartCard title="Produtos Mais Vendidos" subtitle="Ranking por unidades vendidas" accent="#c084fc">
            {vendasProduto.length > 0 ? (
              <BarChart labels={vendasProduto.map(p => p.nome)} data={vendasProduto.map(p => p.quantidade)} label="Unidades Vendidas" color="purple" formatValue={v => `${v} un.`} height={240} />
            ) : <EmptyChart />}
          </ChartCard>
        </div>
      </div>
    </ClientOnly>
  );
}