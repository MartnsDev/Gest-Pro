"use client";

import { useEffect, useState, ReactNode } from "react";
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
  CreditCard,
  Package,
  Users,
  BarChart3,
  AlertCircle,
  ShoppingCart,
  PlusCircle,
  DollarSign,
  User,
  FileText,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { dashboardService } from "@/lib/services/dashboard";
import type {
  VisaoGeral,
  MetodoPagamentoData,
  ProdutoVendasData,
  VendasDiariasData,
} from "@/lib/services/dashboard";
import type { Usuario } from "@/lib/api";

const CHART_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

function SectionCard({
  title,
  children,
  fullWidth,
}: {
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--foreground-muted)",
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

interface DashboardHomeProps {
  usuario?: Usuario;
}

export default function DashboardHome({ usuario }: DashboardHomeProps) {
  const [visao, setVisao] = useState<VisaoGeral | null>(null);
  const [vendasMetodo, setVendasMetodo] = useState<MetodoPagamentoData[]>([]);
  const [vendasProduto, setVendasProduto] = useState<ProdutoVendasData[]>([]);
  const [vendasDiarias, setVendasDiarias] = useState<VendasDiariasData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [v, metodo, produto, diarias] = await Promise.allSettled([
        dashboardService.visaoGeral(),
        dashboardService.vendasPorMetodo(),
        dashboardService.vendasPorProduto(),
        dashboardService.vendasDiarias(),
      ]);

      if (v.status === "fulfilled") setVisao(v.value);
      if (metodo.status === "fulfilled") setVendasMetodo(metodo.value ?? []);
      if (produto.status === "fulfilled") setVendasProduto(produto.value ?? []);
      if (diarias.status === "fulfilled") setVendasDiarias(diarias.value ?? []);

      setLoading(false);
    };
    load();
  }, []);

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "usuário";

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statsCards = [
    {
      title: "Vendas Hoje",
      value: loading ? "—" : (visao?.vendasHoje ?? 0).toString(),
      icon: <CreditCard size={16} />,
      accent: "primary" as const,
    },
    {
      title: "Em Estoque",
      value: loading ? "—" : (visao?.produtosComEstoque ?? 0).toString(),
      icon: <Package size={16} />,
      accent: "secondary" as const,
    },
    {
      title: "Zerados",
      value: loading ? "—" : (visao?.produtosSemEstoque ?? 0).toString(),
      icon: <TrendingUp size={16} />,
      accent: "destructive" as const,
    },
    {
      title: "Clientes Ativos",
      value: loading ? "—" : (visao?.clientesAtivos ?? 0).toString(),
      icon: <Users size={16} />,
      accent: "warning" as const,
    },
    {
      title: "Vendas na Semana",
      value: loading ? "—" : (visao?.vendasSemana ?? 0).toString(),
      icon: <BarChart3 size={16} />,
      accent: "primary" as const,
    },
  ];

  const alertas: string[] = [
    ...(visao?.alertas ?? []),
    ...(visao?.planoUsuario
      ? [
          `Plano ${visao.planoUsuario.tipoPlano}: ${visao.planoUsuario.diasRestantes} dia(s) restante(s)`,
        ]
      : []),
  ];

  const quickActions = [
    { label: "Nova Venda", icon: <ShoppingCart size={20} /> },
    { label: "Produto", icon: <PlusCircle size={20} /> },
    { label: "Caixa", icon: <DollarSign size={20} /> },
    { label: "Clientes", icon: <User size={20} /> },
    { label: "Relatórios", icon: <FileText size={20} /> },
  ];

  return (
    <ClientOnly>
      <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Saudação */}
        <div className="animate-fade-in">
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>
            Olá, {primeiroNome}!
          </h1>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", textTransform: "capitalize" }}>
            {today}
          </p>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 16,
          }}
        >
          {statsCards.map((card, i) => (
            <StatsCard key={i} {...card} loading={loading} />
          ))}
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alertas.map((msg, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "var(--warning-muted)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  borderRadius: 8,
                  color: "var(--warning)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {msg}
              </div>
            ))}
          </div>
        )}

        {/* Charts Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
          className="animate-fade-in"
        >
          {/* Bar Chart - Vendas Diárias */}
          <SectionCard title="Vendas Diárias da Semana" fullWidth={vendasDiarias.length === 0}>
            {vendasDiarias.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vendasDiarias} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="dia" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                    cursor={{ fill: "rgba(16,185,129,0.06)" }}
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

          {/* Pie Chart - Métodos de Pagamento */}
          <SectionCard title="Formas de Pagamento">
            {vendasMetodo.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={vendasMetodo}
                    dataKey="total"
                    nameKey="metodo"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {vendasMetodo.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                  />
                  <Legend
                    formatter={(v) => (
                      <span style={{ color: "var(--foreground-muted)", fontSize: 12 }}>{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>
                Sem dados para exibir
              </div>
            )}
          </SectionCard>

          {/* Bar Chart - Top Produtos */}
          <SectionCard title="Produtos Mais Vendidos" fullWidth>
            {vendasProduto.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={vendasProduto} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="nome" tick={{ fill: "var(--foreground-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 12 }}
                    cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  />
                  <Bar dataKey="total" fill="var(--secondary)" radius={[0, 4, 4, 0]} name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>
                Sem dados para exibir
              </div>
            )}
          </SectionCard>
        </div>

        {/* Ações Rápidas */}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Ações Rápidas
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--primary)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--foreground)";
                }}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
