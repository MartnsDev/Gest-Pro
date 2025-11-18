"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui-dashboard/Card";
import { BarChart } from "./graphs/BarChart";
import { PieChart } from "./graphs/PieChart";
import {
  BarChart3,
  CreditCard,
  Package,
  Users,
  AlertCircle,
  PlusCircle,
  FileText,
  ShoppingCart,
  User,
  DollarSign,
} from "lucide-react";

interface DashboardHomeProps {
  usuario: any;
}

interface Alert {
  message: string;
}

interface CardData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

interface QuickAction {
  label: string;
  icon: React.ReactNode;
}

interface PlanoInfo {
  tipoPlano: string;
  diasRestantes: number;
}

interface DashboardData {
  totalVendasHoje: number;
  produtosEmEstoque: number;
  produtosZerados: number;
  clientesAtivos: number;
  vendasSemana: number;
  planoExperimental?: Record<string, PlanoInfo>;
  alertas?: string[];
}

interface MetodoPagamentoData {
  metodo: string;
  total: number;
}

interface ProdutoVendasData {
  nome: string;
  total: number;
}

interface VendasDiariasData {
  dia: string;
  total: number;
}

export default function DashboardHome({ usuario }: DashboardHomeProps) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [vendasMetodo, setVendasMetodo] = useState<MetodoPagamentoData[]>([]);
  const [vendasProduto, setVendasProduto] = useState<ProdutoVendasData[]>([]);
  const [vendasDiarias, setVendasDiarias] = useState<VendasDiariasData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // ---------------- VISÃO GERAL ----------------
        const res = await fetch(
          "http://localhost:8080/api/dashboard/visao-geral",
          { credentials: "include" }
        );
        const data: DashboardData = res.ok
          ? await res.json()
          : {
              totalVendasHoje: 0,
              produtosEmEstoque: 0,
              produtosZerados: 0,
              clientesAtivos: 0,
              vendasSemana: 0,
              planoExperimental: {},
              alertas: [],
            };

        setCards([
          {
            title: "Total Vendas Hoje",
            value: `R$ ${data.totalVendasHoje}`,
            icon: <CreditCard className="text-white" />,
          },
          {
            title: "Produtos em Estoque",
            value: data.produtosEmEstoque,
            icon: <Package className="text-white" />,
          },
          {
            title: "Clientes Ativos",
            value: data.clientesAtivos,
            icon: <Users className="text-white" />,
          },
          {
            title: "Vendas Semanais",
            value: data.vendasSemana,
            icon: <BarChart3 className="text-white" />,
          },
        ]);

        // ---------------- ALERTAS ----------------
        const alertas: Alert[] = [];

        data.alertas?.forEach((msg) => alertas.push({ message: msg }));

        if (data.planoExperimental) {
          Object.entries(data.planoExperimental)
            .sort(
              ([, a], [, b]) => (a.diasRestantes ?? 0) - (b.diasRestantes ?? 0)
            )
            .forEach(([, planoInfo]) => {
              const dias = Number.isFinite(planoInfo.diasRestantes)
                ? planoInfo.diasRestantes
                : 0;
              alertas.push({
                message: `Plano ${planoInfo.tipoPlano}: ${dias} dia(s) restante(s)`,
              });
            });
        }

        setAlerts(alertas);

        // ---------------- ATALHOS ----------------
        setQuickActions([
          { label: "Registrar Venda", icon: <ShoppingCart size={24} /> },
          { label: "Adicionar Produto", icon: <PlusCircle size={24} /> },
          { label: "Abrir Caixa", icon: <DollarSign size={24} /> },
          { label: "Clientes", icon: <User size={24} /> },
          { label: "Relatórios", icon: <FileText size={24} /> },
        ]);

        // ---------------- GRÁFICOS ----------------
        const fetchData = async <T,>(url: string): Promise<T[]> => {
          try {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) return [];
            return await res.json();
          } catch {
            return [];
          }
        };

        setVendasMetodo(
          await fetchData<MetodoPagamentoData>(
            "http://localhost:8080/api/dashboard/vendas/metodo-pagamento"
          )
        );
        setVendasProduto(
          await fetchData<ProdutoVendasData>(
            "http://localhost:8080/api/dashboard/vendas/produto"
          )
        );
        setVendasDiarias(
          await fetchData<VendasDiariasData>(
            "http://localhost:8080/api/dashboard/vendas/diarias"
          )
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="text-white p-6 text-center">Carregando dashboard...</div>
    );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Visão Geral</h2>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <Card
            key={idx}
            title={card.title}
            value={card.value}
            icon={card.icon}
            className="bg-[rgba(31,41,55,0.7)]"
          />
        ))}
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="bg-blue-900/30 hover:bg-blue-900/50 text-white p-3 rounded-lg shadow flex items-center gap-3 transition transform hover:scale-105"
          >
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="font-medium text-sm">{alert.message}</span>
          </div>
        ))}
      </div>

      {/* Atalhos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            className="bg-blue-900/30 hover:bg-blue-900/50 text-white p-3 rounded-lg flex flex-col items-center justify-center transition"
            onClick={() => console.log(`Ação: ${action.label}`)}
          >
            {action.icon}
            <span className="text-xs mt-1 font-semibold">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-800/60 text-white p-4 rounded shadow">
          <p className="font-medium mb-2">Vendas por método de pagamento</p>
          {vendasMetodo.length > 0 ? (
            <div className="h-40">
              <PieChart
                labels={vendasMetodo.map((v) => v.metodo)}
                data={vendasMetodo.map((v) => v.total)}
              />
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400">
              Sem dados para exibir
            </div>
          )}
        </div>

        <div className="bg-gray-800/60 text-white p-4 rounded shadow">
          <p className="font-medium mb-2">Vendas por produto</p>
          {vendasProduto.length > 0 ? (
            <div className="h-40">
              <BarChart
                labels={vendasProduto.map((v) => v.nome)}
                data={vendasProduto.map((v) => v.total)}
                label="Quantidade Vendida"
              />
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400">
              Sem dados para exibir
            </div>
          )}
        </div>

        <div className="bg-gray-800/60 text-white p-4 rounded shadow md:col-span-2">
          <p className="font-medium mb-2">Vendas diárias da semana</p>
          {vendasDiarias.length > 0 ? (
            <div className="h-40">
              <BarChart
                labels={vendasDiarias.map((v) => v.dia)}
                data={vendasDiarias.map((v) => v.total)}
                label="Vendas R$"
              />
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400">
              Sem dados para exibir
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
