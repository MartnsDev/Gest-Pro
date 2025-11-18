"use client";

import { useState, useEffect } from "react";
import { FileText, BarChart3, Download } from "lucide-react";
import { Select } from "react-day-picker";

interface ProdutoVenda {
  nome: string;
  quantidadeVendida: number;
}

interface Venda {
  produto: string;
  metodoPagamento: string;
  valorTotal: number;
  data: string;
}

export default function Relatorios() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState<
    ProdutoVenda[]
  >([]);
  const [filtroPeriodo, setFiltroPeriodo] = useState("semana"); // dia | semana | mês

  useEffect(() => {
    // Mock de vendas
    setVendas([
      {
        produto: "Coca 2L",
        metodoPagamento: "Dinheiro",
        valorTotal: 10,
        data: "2025-10-20",
      },
      {
        produto: "Água 500ml",
        metodoPagamento: "Pix",
        valorTotal: 5,
        data: "2025-10-21",
      },
      {
        produto: "Pão",
        metodoPagamento: "Cartão",
        valorTotal: 7,
        data: "2025-10-21",
      },
      {
        produto: "Coca 2L",
        metodoPagamento: "Cartão",
        valorTotal: 10,
        data: "2025-10-22",
      },
    ]);

    // Mock produtos mais vendidos
    setProdutosMaisVendidos([
      { nome: "Coca 2L", quantidadeVendida: 50 },
      { nome: "Pão", quantidadeVendida: 40 },
      { nome: "Água 500ml", quantidadeVendida: 35 },
    ]);
  }, []);

  const exportarCSV = () => {
    // Futuramente integrar com backend para exportação real
    const header = [
      "Produto",
      "Quantidade Vendida",
      "Método de Pagamento",
      "Valor Total",
      "Data",
    ];
    const rows = vendas.map((v) => [
      v.produto,
      "",
      v.metodoPagamento,
      v.valorTotal,
      v.data,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_vendas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Relatórios</h2>

      {/* Filtro por período */}
      <div className="flex gap-2 items-center mb-4">
        <span className="text-blue font-medium">Filtrar por período:</span>
        <Select
          className="p-2 rounded text-white"
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
        >
          <option value="dia">Dia</option>
          <option value="semana">Semana</option>
          <option value="mes">Mês</option>
        </Select>
      </div>

      {/* Gráficos de vendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/60 p-4 rounded shadow text-white">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <BarChart3 size={20} /> Vendas por Produto
          </h3>
          <div className="h-40 bg-gray-700/30 rounded flex items-center justify-center">
            {/* Futuramente aqui colocar gráfico real */}
            Gráfico de barras
          </div>
        </div>

        <div className="bg-gray-800/60 p-4 rounded shadow text-white">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <BarChart3 size={20} /> Vendas por Método de Pagamento
          </h3>
          <div className="h-40 bg-gray-700/30 rounded flex items-center justify-center">
            Gráfico de pizza
          </div>
        </div>

        <div className="bg-gray-800/60 p-4 rounded shadow text-white md:col-span-2">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <BarChart3 size={20} /> Comparativo de Períodos
          </h3>
          <div className="h-40 bg-gray-700/30 rounded flex items-center justify-center">
            Gráfico comparativo
          </div>
        </div>
      </div>

      {/* Produtos mais vendidos */}
      <div className="bg-gray-800/60 p-4 rounded shadow text-white">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <FileText size={20} /> Produtos Mais Vendidos
        </h3>
        <ul className="space-y-1">
          {produtosMaisVendidos.map((p, idx) => (
            <li key={idx}>
              {p.nome} - {p.quantidadeVendida} vendidos
            </li>
          ))}
        </ul>
      </div>

      {/* Botão exportar */}
      <button
        onClick={exportarCSV}
        className="bg-blue-900/30 hover:bg-blue-900/50 text-white p-2 rounded flex items-center gap-2 transition"
      >
        <Download size={16} /> Exportar CSV
      </button>
    </div>
  );
}
