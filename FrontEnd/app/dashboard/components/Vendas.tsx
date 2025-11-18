"use client";

import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "react-day-picker";

interface Produto {
  id: number;
  nome: string;
  preco: number;
  estoque: number;
}

interface Venda {
  id: number;
  produto: string;
  quantidade: number;
  valorTotal: number;
  metodoPagamento: string;
  dataHora: string;
}

export default function Vendas() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState("Dinheiro");

  useEffect(() => {
    setProdutos([
      { id: 1, nome: "Coca 2L", preco: 10, estoque: 20 },
      { id: 2, nome: "Água 500ml", preco: 3, estoque: 50 },
      { id: 3, nome: "Pão", preco: 2, estoque: 30 },
    ]);

    setVendas([
      {
        id: 1,
        produto: "Coca 2L",
        quantidade: 2,
        valorTotal: 20,
        metodoPagamento: "Dinheiro",
        dataHora: "2025-10-23 14:30",
      },
    ]);
  }, []);

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const registrarVenda = (produto: Produto) => {
    if (quantidade > produto.estoque) {
      alert("Estoque insuficiente!");
      return;
    }

    const novaVenda: Venda = {
      id: vendas.length + 1,
      produto: produto.nome,
      quantidade,
      valorTotal: quantidade * produto.preco,
      metodoPagamento,
      dataHora: new Date().toLocaleString(),
    };

    setProdutos((prev) =>
      prev.map((p) =>
        p.id === produto.id ? { ...p, estoque: p.estoque - quantidade } : p
      )
    );

    setVendas([novaVenda, ...vendas]);
    setQuantidade(1);
    alert(`Venda de ${quantidade}x ${produto.nome} registrada!`);
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Vendas</h2>

      {/* PDV Rápido */}
      <section className="bg-gray-800/70 p-4 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">PDV Rápido</h3>
        <Input
          type="text"
          placeholder="Pesquisar produto..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          className="w-full text-white placeholder-white bg-gray-700/50 border-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="bg-gray-700/50 p-4 rounded-lg text-white flex flex-col gap-2"
            >
              <span className="font-medium">{produto.nome}</span>
              <span>Preço: R$ {produto.preco}</span>
              <span>Estoque: {produto.estoque}</span>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="p-2 rounded w-20 text-white bg-gray-600 border-none"
                />
                <Select
                  value={metodoPagamento}
                  onChange={(e) => setMetodoPagamento(e.target.value)}
                  className="p-2 rounded text-white bg-gray-600 border-none"
                >
                  <option className="bg-gray-600 text-white">Dinheiro</option>
                  <option className="bg-gray-600 text-white">Cartão</option>
                  <option className="bg-gray-600 text-white">Pix</option>
                </Select>
                <button
                  onClick={() => registrarVenda(produto)}
                  className="bg-blue-900/40 hover:bg-blue-900/60 p-2 rounded flex items-center gap-1 transition"
                >
                  <CreditCard size={16} /> Vender
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Histórico de vendas */}
      <section className="bg-gray-800/70 p-4 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">Vendas Recentes</h3>
        <table className="w-full text-left border-collapse text-white">
          <thead>
            <tr className="bg-gray-700/80">
              <th className="p-2">Produto</th>
              <th className="p-2">Quantidade</th>
              <th className="p-2">Valor Total</th>
              <th className="p-2">Método</th>
              <th className="p-2">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr
                key={venda.id}
                className="border-b border-gray-600 hover:bg-gray-800/50"
              >
                <td className="p-2">{venda.produto}</td>
                <td className="p-2">{venda.quantidade}</td>
                <td className="p-2">R$ {venda.valorTotal}</td>
                <td className="p-2">{venda.metodoPagamento}</td>
                <td className="p-2">{venda.dataHora}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
