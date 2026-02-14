"use client";

import { useEffect, useState, ReactNode } from "react";
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

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ------------------ COMPONENTE CLIENT ONLY ------------------
interface ClientOnlyProps {
  children: ReactNode;
}
function ClientOnly({ children }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;
  return <>{children}</>;
}

// ------------------ TIPAGENS (ALINHADAS COM O BACKEND) ------------------
interface DashboardHomeProps {
  usuario?: any;
}

interface Alert {
  message: string;
}
interface CardData {
  title: string | number;
  value: string | number;
  icon: React.ReactNode;
}
interface QuickAction {
  label: string;
  icon: React.ReactNode;
}
interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
}

// Response vindas do backend
interface DashboardVisaoGeralResponse {
  vendasHoje?: number; // long
  produtosComEstoque?: number;
  produtosSemEstoque?: number;
  clientesAtivos?: number;
  vendasSemana?: number;
  planoUsuario?: PlanoDTO | null; // backend retorna PlanoDTO
  alertas?: string[] | null;
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

// ------------------ COMPONENTE DASHBOARD ------------------
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
        // helper genérico que devolve um objeto ou array; retorna null em erro
        const fetchData = async <T,>(url: string): Promise<T | null> => {
          try {
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) return null;
            return (await res.json()) as T;
          } catch {
            return null;
          }
        };

        // VISÃO GERAL (objeto)
        const visaoUrl = `${API_BASE_URL}/api/dashboard/visao-geral`;
        const visao = await fetchData<DashboardVisaoGeralResponse>(visaoUrl);

        // garantir valores padrão
        const vendasHoje = visao?.vendasHoje ?? 0;
        const produtosComEstoque = visao?.produtosComEstoque ?? 0;
        const produtosZerados = visao?.produtosSemEstoque ?? 0;
        const clientesAtivos = visao?.clientesAtivos ?? 0;
        const vendasSemana = visao?.vendasSemana ?? 0;
        const planoUsuario = visao?.planoUsuario ?? null;
        const alertasBackend = visao?.alertas ?? [];

        // Cards (ajusta título/valor do jeito que preferir)
        setCards([
          {
            title: "Vendas Hoje",
            // se for valor monetário mudar para formatação; aqui assumimos número
            value: vendasHoje,
            icon: <CreditCard className="text-white" />,
          },
          {
            title: "Produtos em Estoque",
            value: produtosComEstoque,
            icon: <Package className="text-white" />,
          },
          {
            title: "Produtos Zerados",
            value: produtosZerados,
            icon: <Users className="text-white" />,
          },
          {
            title: "Vendas Semana",
            value: vendasSemana,
            icon: <BarChart3 className="text-white" />,
          },
        ]);

        // ALERTAS (concat backend + aviso de plano)
        const alertas: Alert[] = [];
        (alertasBackend || []).forEach((msg) => alertas.push({ message: msg }));

        if (planoUsuario) {
          const dias = Number.isFinite(planoUsuario.diasRestantes)
            ? planoUsuario.diasRestantes
            : 0;
          alertas.push({
            message: `Plano ${planoUsuario.tipoPlano}: ${dias} dia(s) restante(s)`,
          });
        }

        setAlerts(alertas);

        // ATALHOS (estáticos)
        setQuickActions([
          { label: "Registrar Venda", icon: <ShoppingCart size={24} /> },
          { label: "Adicionar Produto", icon: <PlusCircle size={24} /> },
          { label: "Abrir Caixa", icon: <DollarSign size={24} /> },
          { label: "Clientes", icon: <User size={24} /> },
          { label: "Relatórios", icon: <FileText size={24} /> },
        ]);

        // GRÁFICOS (listas)
        const metodos =
          (await fetchData<MetodoPagamentoData[]>(
            `${API_BASE_URL}/dashboard/vendas/metodo-pagamento`,
          )) ?? [];
        const produtos =
          (await fetchData<ProdutoVendasData[]>(
            `${API_BASE_URL}/api/dashboard/vendas/produto`,
          )) ?? [];
        const diarias =
          (await fetchData<VendasDiariasData[]>(
            `${API_BASE_URL}/api/dashboard/vendas/diarias`,
          )) ?? [];

        setVendasMetodo(metodos);
        setVendasProduto(produtos);
        setVendasDiarias(diarias);
      } catch (err) {
        console.error("Erro ao buscar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <ClientOnly>
      {loading ? (
        <div className="text-white p-6 text-center">
          Carregando dashboard...
        </div>
      ) : (
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
                <span className="text-xs mt-1 font-semibold">
                  {action.label}
                </span>
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
      )}
    </ClientOnly>
  );
}
