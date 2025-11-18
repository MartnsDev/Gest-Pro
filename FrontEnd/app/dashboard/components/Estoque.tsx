"use client";

import { useState, useEffect } from "react";
import { PlusCircle, AlertCircle } from "lucide-react";

interface ProdutoEstoque {
  id: number;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

interface Movimentacao {
  id: number;
  produto: string;
  quantidade: number;
  usuario: string;
  data: string;
}

export default function Estoque() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  useEffect(() => {
    // Mock de produtos
    const produtosMock: ProdutoEstoque[] = [
      { id: 1, nome: "Camiseta", estoqueAtual: 5, estoqueMinimo: 10 },
      { id: 2, nome: "Smartphone", estoqueAtual: 3, estoqueMinimo: 5 },
      { id: 3, nome: "Arroz", estoqueAtual: 50, estoqueMinimo: 20 },
    ];
    setProdutos(produtosMock);

    // Mock de movimentações
    const movimentacoesMock: Movimentacao[] = [
      {
        id: 1,
        produto: "Camiseta",
        quantidade: -2,
        usuario: "João",
        data: "2025-10-23",
      },
      {
        id: 2,
        produto: "Smartphone",
        quantidade: -1,
        usuario: "Maria",
        data: "2025-10-22",
      },
      {
        id: 3,
        produto: "Arroz",
        quantidade: 30,
        usuario: "João",
        data: "2025-10-20",
      },
    ];
    setMovimentacoes(movimentacoesMock);
  }, []);

  const reabastecerEstoque = (produtoId: number) => {
    console.log("Reabastecer estoque do produto", produtoId);
    // Aqui futuramente integraria com backend
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Estoque</h2>

      {/* Lista de produtos */}
      <div className="bg-gray-800/60 p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold text-white mb-2">Produtos</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="p-2">Produto</th>
              <th className="p-2">Estoque Atual</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr
                key={produto.id}
                className="border-b border-gray-700 hover:bg-gray-800/50 text-white"
              >
                <td className="p-2">{produto.nome}</td>
                <td className="p-2 flex items-center gap-2">
                  {produto.estoqueAtual <= produto.estoqueMinimo && (
                    <AlertCircle className="text-yellow-400" size={16} />
                  )}
                  {produto.estoqueAtual}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => reabastecerEstoque(produto.id)}
                    className="bg-blue-900/30 hover:bg-blue-900/50 text-white p-1 rounded flex items-center gap-1 transition"
                  >
                    <PlusCircle size={16} /> Reabastecer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Histórico de movimentações */}
      <div className="bg-gray-800/60 p-4 rounded shadow space-y-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          Histórico de Movimentações
        </h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="p-2">Produto</th>
              <th className="p-2">Quantidade</th>
              <th className="p-2">Usuário</th>
              <th className="p-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((mov) => (
              <tr
                key={mov.id}
                className="border-b border-gray-700 hover:bg-gray-800/50 text-white"
              >
                <td className="p-2">{mov.produto}</td>
                <td
                  className={`p-2 ${
                    mov.quantidade < 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {mov.quantidade > 0 ? `+${mov.quantidade}` : mov.quantidade}
                </td>
                <td className="p-2">{mov.usuario}</td>
                <td className="p-2">{mov.data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
