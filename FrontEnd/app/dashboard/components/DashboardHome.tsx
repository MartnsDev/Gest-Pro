"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  AlertCircle,
  ShoppingBag,
  PlusCircle,
  DollarSign,
  User,
  FileText,
  BarChart3,
  Package,
  Users,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import type { Usuario } from "@/lib/api";

// ─── Tipos alinhados com o backend (/api/v1/dashboard/...) ─────────────────
interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
  empresasCriadas: number;
  limiteEmpresas: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

interface VisaoGeral {
  vendasHoje: number;
  produtosComEstoque: number;
  produtosSemEstoque: number;
  clientesAtivos: number;
  vendasSemanais: number;        // backend retorna "vendasSemanais"
  planoUsuario: PlanoDTO | null;
  alertas: string[];
}

interface MetodoPagamentoData { metodo: string; total: number; }
interface ProdutoVendasData   { nome: string;   quantidade: number; } // "quantidade" não "total"
interface VendasDiariasData   { dia: string;    total: number; }

// ─── Serviço local — aponta para /api/v1/ ──────────────────────────────────
async function fetchAuth<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.mensagem ?? `Erro ${res.status} em ${path}`);
  }
  return res.json();
}

const dashboardApi = {
  visaoGeral:      () => fetchAuth<VisaoGeral>            ("/api/v1/dashboard/visao-geral"),
  vendasPorMetodo: () => fetchAuth<MetodoPagamentoData[]> ("/api/v1/dashboard/vendas/metodo-pagamento"),
  vendasPorProduto:() => fetchAuth<ProdutoVendasData[]>   ("/api/v1/dashboard/vendas/produto"),
  vendasDiarias:   () => fetchAuth<VendasDiariasData[]>   ("/api/v1/dashboard/vendas/diarias"),
};

// ─── Cores dos gráficos ────────────────────────────────────────────────────
const CHART_COLORS = ["#60a5fa", "#34d399", "#a78bfa", "#fb923c", "#f472b6"];

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function ClientOnly({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok ? <>{children}</> : null;
}

function SectionCard({ title, children, fullWidth }: {
  title: string; children: ReactNode; fullWidth?: boolean;
}) {
  return (
    <div style={{
      background: "var(--surface-elevated)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "20px",
      gridColumn: fullWidth ? "1 / -1" : undefined,
    }}>
      <p style={{
        fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)",
        marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.07em",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function DashboardHome({ usuario }: { usuario?: Usuario }) {
  const router = useRouter();

  const [visao,         setVisao]         = useState<VisaoGeral | null>(null);
  const [vendasMetodo,  setVendasMetodo]  = useState<MetodoPagamentoData[]>([]);
  const [vendasProduto, setVendasProduto] = useState<ProdutoVendasData[]>([]);
  const [vendasDiarias, setVendasDiarias] = useState<VendasDiariasData[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      const [v, metodo, produto, diarias] = await Promise.allSettled([
        dashboardApi.visaoGeral(),
        dashboardApi.vendasPorMetodo(),
        dashboardApi.vendasPorProduto(),
        dashboardApi.vendasDiarias(),
      ]);
      if (v.status       === "fulfilled") setVisao(v.value);
      if (metodo.status  === "fulfilled") setVendasMetodo(metodo.value  ?? []);
      if (produto.status === "fulfilled") setVendasProduto(produto.value ?? []);
      if (diarias.status === "fulfilled") setVendasDiarias(diarias.value ?? []);
      setLoading(false);
    })();
  }, []);

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "usuário";
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Cards de métricas
  const statsCards = [
    { title: "Vendas Hoje",    value: loading ? "—" : fmt(visao?.vendasHoje ?? 0),      icon: <CreditCard size={16} />,  accent: "primary"     as const },
    { title: "Em Estoque",     value: loading ? "—" : String(visao?.produtosComEstoque ?? 0), icon: <Package size={16} />,     accent: "secondary"   as const },
    { title: "Zerados",        value: loading ? "—" : String(visao?.produtosSemEstoque ?? 0), icon: <TrendingUp size={16} />,  accent: "destructive" as const },
    { title: "Clientes Ativos",value: loading ? "—" : String(visao?.clientesAtivos ?? 0),    icon: <Users size={16} />,       accent: "warning"     as const },
    { title: "Vendas Semana",  value: loading ? "—" : fmt(visao?.vendasSemanais ?? 0),  icon: <BarChart3 size={16} />,   accent: "primary"     as const },
  ];

  // Alertas + plano
  const alertas: string[] = [
    ...(visao?.alertas ?? []),
    ...(visao?.planoUsuario
      ? [`Plano ${visao.planoUsuario.tipoPlano}: ${visao.planoUsuario.diasRestantes} dia(s) restante(s)`]
      : []),
  ];

  // Ações rápidas com navegação
  const quickActions = [
    { label: "Abrir Caixa",  icon: <DollarSign size={16} />,  href: "/dashboard/caixa" },
    { label: "Nova Venda",   icon: <ShoppingBag size={16} />, href: "/dashboard/venda" },
    { label: "Novo Produto", icon: <PlusCircle size={16} />,  href: "/dashboard/produtos/novo" },
    { label: "Clientes",     icon: <User size={16} />,         href: "/dashboard/clientes" },
    { label: "Relatórios",   icon: <FileText size={16} />,     href: "/dashboard/relatorios" },
  ];

  return (
    <ClientOnly>
      <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Saudação */}
        <div className="animate-fade-in">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
            Olá, {primeiroNome}! 👋
          </h1>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", textTransform: "capitalize" }}>
            {today}
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
          {statsCards.map((card, i) => (
            <StatsCard key={i} {...card} loading={loading} />
          ))}
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alertas.map((msg, i) => (
              <div key={i} className="animate-fade-in" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: "var(--warning-muted)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 8,
                color: "var(--warning)",
                fontSize: 13, fontWeight: 500,
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {msg}
              </div>
            ))}
          </div>
        )}

        {/* Ações Rápidas */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Ações Rápidas
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {quickActions.map((action, i) => (
              <button key={i}
                onClick={() => router.push(action.href)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 16px",
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  fontSize: 13, fontWeight: 500,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                }}
              >
                {action.icon}{action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="animate-fade-in">

          {/* Vendas Diárias */}
          <SectionCard title="Vendas Diárias da Semana">
            {vendasDiarias.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vendasDiarias} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="dia" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                    cursor={{ fill: "rgba(96,165,250,0.06)" }}
                    formatter={(v: number) => [fmt(v), "Vendas"]}
                  />
                  <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Vendas (R$)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>
                Sem dados para exibir
              </div>
            )}
          </SectionCard>

          {/* Métodos de Pagamento */}
          <SectionCard title="Formas de Pagamento">
            {vendasMetodo.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={vendasMetodo} dataKey="total" nameKey="metodo"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                    {vendasMetodo.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                    formatter={(v: number) => [v, "vendas"]}
                  />
                  <Legend formatter={v => <span style={{ color: "var(--foreground-muted)", fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>
                Sem dados para exibir
              </div>
            )}
          </SectionCard>

          {/* Top Produtos — largura total */}
          <SectionCard title="Produtos Mais Vendidos" fullWidth>
            {vendasProduto.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={vendasProduto} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                    cursor={{ fill: "rgba(52,211,153,0.06)" }}
                    formatter={(v: number) => [v, "unidades"]}
                  />
                  {/* dataKey="quantidade" — campo correto do backend */}
                  <Bar dataKey="quantidade" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>
                Sem dados para exibir
              </div>
            )}
          </SectionCard>

        </div>
      </div>
    </ClientOnly>
  );
}