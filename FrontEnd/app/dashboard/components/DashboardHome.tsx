"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmpresa } from "../context/Empresacontext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  AlertCircle, ShoppingBag, PlusCircle, DollarSign,
  User, FileText, BarChart3, Package, Users,
  CreditCard, TrendingUp, TrendingDown, Calendar, Store,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import type { Usuario } from "@/lib/api";

interface PlanoDTO {
  tipoPlano: string; diasRestantes: number;
  empresasCriadas: number; limiteEmpresas: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

interface VisaoGeral {
  vendasHoje: number; produtosComEstoque: number;
  produtosSemEstoque: number; clientesAtivos: number;
  vendasSemanais: number; vendasMes: number;
  lucroDia: number; lucroMes: number;
  planoUsuario: PlanoDTO | null; alertas: string[];
}

interface MetodoPagamentoData { metodo: string; total: number; }
interface ProdutoVendasData   { nome: string;   quantidade: number; }
interface VendasDiariasData   { dia: string;    total: number; }

const CHART_COLORS = ["#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#f472b6"];

const fmt = (v?: number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

function ClientOnly({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok ? <>{children}</> : null;
}

function SectionCard({ title, children, fullWidth }: { title: string; children: ReactNode; fullWidth?: boolean }) {
  return (
    <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", marginBottom: 16, textTransform: "uppercase", letterSpacing: ".07em" }}>{title}</p>
      {children}
    </div>
  );
}

export default function DashboardHome({ usuario }: { usuario?: Usuario }) {
  const router = useRouter();
  const { empresaAtiva } = useEmpresa();

  const [visao,         setVisao]         = useState<VisaoGeral | null>(null);
  const [vendasMetodo,  setVendasMetodo]  = useState<MetodoPagamentoData[]>([]);
  const [vendasProduto, setVendasProduto] = useState<ProdutoVendasData[]>([]);
  const [vendasDiarias, setVendasDiarias] = useState<VendasDiariasData[]>([]);
  const [loading,       setLoading]       = useState(true);

  const fetchDados = async (empresaId: number) => {
    setLoading(true);
    setVisao(null);
    setVendasMetodo([]);
    setVendasProduto([]);
    setVendasDiarias([]);

    const base = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}`;
    const opts = { credentials: "include" as const, headers: { "Content-Type": "application/json" } };

    const [v, metodo, produto, diarias] = await Promise.allSettled([
      fetch(`${base}/api/v1/dashboard/visao-geral?empresaId=${empresaId}`, opts).then(r => r.json()),
      fetch(`${base}/api/v1/dashboard/vendas/metodo-pagamento?empresaId=${empresaId}`, opts).then(r => r.json()),
      fetch(`${base}/api/v1/dashboard/vendas/produto?empresaId=${empresaId}`, opts).then(r => r.json()),
      fetch(`${base}/api/v1/dashboard/vendas/diarias?empresaId=${empresaId}`, opts).then(r => r.json()),
    ]);

    if (v.status       === "fulfilled") setVisao(v.value);
    if (metodo.status  === "fulfilled") setVendasMetodo(metodo.value   ?? []);
    if (produto.status === "fulfilled") setVendasProduto(produto.value ?? []);
    if (diarias.status === "fulfilled") setVendasDiarias(diarias.value ?? []);
    setLoading(false);
  };

  // Recarrega quando empresa muda
  useEffect(() => {
    if (empresaAtiva?.id) fetchDados(empresaAtiva.id);
  }, [empresaAtiva?.id]);

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "usuário";
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const statsCards = [
    { title: "Vendas Hoje",   value: loading ? "—" : fmt(visao?.vendasHoje),             icon: <CreditCard size={16} />,  accent: "primary"     as const },
    { title: "Vendas Semana", value: loading ? "—" : fmt(visao?.vendasSemanais),          icon: <BarChart3 size={16} />,   accent: "secondary"   as const },
    { title: "Vendas Mês",    value: loading ? "—" : fmt(visao?.vendasMes),               icon: <Calendar size={16} />,    accent: "primary"     as const },
    { title: "Lucro Hoje",    value: loading ? "—" : fmt(visao?.lucroDia),                icon: <TrendingUp size={16} />,  accent: "secondary"   as const },
    { title: "Lucro Mês",     value: loading ? "—" : fmt(visao?.lucroMes),                icon: <TrendingUp size={16} />,  accent: "primary"     as const },
    { title: "Em Estoque",    value: loading ? "—" : String(visao?.produtosComEstoque ?? 0), icon: <Package size={16} />, accent: "secondary"   as const },
    { title: "Zerados",       value: loading ? "—" : String(visao?.produtosSemEstoque ?? 0), icon: <TrendingDown size={16} />, accent: "destructive" as const },
    { title: "Clientes",      value: loading ? "—" : String(visao?.clientesAtivos ?? 0),  icon: <Users size={16} />,       accent: "warning"     as const },
  ];

  const alertas: string[] = [
    ...(visao?.alertas ?? []),
    ...(visao?.planoUsuario
      ? [`Plano ${visao.planoUsuario.tipoPlano}: ${visao.planoUsuario.diasRestantes} dia(s) restante(s)`]
      : []),
  ];

  const quickActions = [
    { label: "Abrir Caixa",  icon: <DollarSign size={16} />,  href: "/dashboard/caixa" },
    { label: "Nova Venda",   icon: <ShoppingBag size={16} />, href: "/dashboard/venda" },
    { label: "Novo Produto", icon: <PlusCircle size={16} />,  href: "/dashboard/produtos/novo" },
    { label: "Clientes",     icon: <User size={16} />,         href: "/dashboard/clientes" },
    { label: "Relatórios",   icon: <FileText size={16} />,     href: "/dashboard/relatorios" },
  ];

  // Sem empresa selecionada
  if (!empresaAtiva) return (
    <ClientOnly>
      <div style={{ padding: 48, textAlign: "center", color: "var(--foreground-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Store size={48} color="var(--foreground-subtle)" />
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>Nenhuma empresa selecionada</h2>
        <p style={{ fontSize: 14 }}>Selecione ou cadastre uma empresa no menu superior para ver o dashboard.</p>
      </div>
    </ClientOnly>
  );

  return (
    <ClientOnly>
      <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Saudação */}
        <div className="animate-fade-in">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
            Olá, {primeiroNome}! 👋
          </h1>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", textTransform: "capitalize" }}>
            {today} · {empresaAtiva.nomeFantasia}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {statsCards.map((card, i) => <StatsCard key={i} {...card} loading={loading} />)}
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alertas.map((msg, i) => (
              <div key={i} className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--warning-muted)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, color: "var(--warning)", fontSize: 13, fontWeight: 500 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />{msg}
              </div>
            ))}
          </div>
        )}

        {/* Ações Rápidas */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".07em" }}>Ações Rápidas</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {quickActions.map((action, i) => (
              <button key={i} onClick={() => router.push(action.href)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--primary)"; b.style.color = "var(--primary)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--border)"; b.style.color = "var(--foreground)"; }}>
                {action.icon}{action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="animate-fade-in">

          <SectionCard title="Vendas Diárias da Semana (Seg–Dom)">
            {vendasDiarias.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vendasDiarias} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="dia" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} cursor={{ fill: "rgba(96,165,250,0.06)" }} formatter={(v: number) => [fmt(v), "Vendas"]} />
                  <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Vendas (R$)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>Sem dados para exibir</div>
            )}
          </SectionCard>

          <SectionCard title="Formas de Pagamento">
            {vendasMetodo.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={vendasMetodo} dataKey="total" nameKey="metodo" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {vendasMetodo.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} formatter={(v: number) => [v, "vendas"]} />
                  <Legend formatter={v => <span style={{ color: "var(--foreground-muted)", fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>Sem dados para exibir</div>
            )}
          </SectionCard>

          <SectionCard title="Produtos Mais Vendidos" fullWidth>
            {vendasProduto.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={vendasProduto} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }} cursor={{ fill: "rgba(52,211,153,0.06)" }} formatter={(v: number) => [v, "unidades"]} />
                  <Bar dataKey="quantidade" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>Sem dados para exibir</div>
            )}
          </SectionCard>

        </div>
      </div>
    </ClientOnly>
  );
}