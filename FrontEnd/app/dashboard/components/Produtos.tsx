"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Star } from "lucide-react";
import { Select } from "react-day-picker";
import { Button } from "@/components/ui/button";

interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  destaque?: boolean;
}

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);

  // Simula carregar produtos do backend
  useEffect(() => {
    const produtosMock: Produto[] = [
      { id: 1, nome: "Camiseta", categoria: "Roupas", preco: 50, estoque: 20 },
      {
        id: 2,
        nome: "Smartphone",
        categoria: "Eletrônicos",
        preco: 2000,
        estoque: 5,
        destaque: true,
      },
      { id: 3, nome: "Arroz", categoria: "Alimentos", preco: 10, estoque: 50 },
    ];
    setProdutos(produtosMock);

    // Extrai categorias únicas
    const cats = Array.from(new Set(produtosMock.map((p) => p.categoria)));
    setCategorias(cats);
  }, []);

  // Filtra produtos por nome ou categoria
  const produtosFiltrados = produtos.filter(
    (p) =>
      p.nome.toLowerCase().includes(filtro.toLowerCase()) &&
      (categoriaFiltro ? p.categoria === categoriaFiltro : true)
  );

  const adicionarProduto = () => console.log("Adicionar produto");
  const editarProduto = (id: number) => console.log("Editar produto", id);
  const excluirProduto = (id: number) => console.log("Excluir produto", id);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Produtos</h2>

      {/* Filtros e botão adicionar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome"
          className="p-2 rounded w-full md:w-1/3"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <Select
          className="p-2 rounded w-full md:w-1/4"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
        <button
          onClick={adicionarProduto}
          className="bg-blue-900/30 hover:bg-blue-900/50 text-white p-2 rounded flex items-center gap-2 transition"
        >
          <PlusCircle size={20} /> Adicionar Produto
        </button>
      </div>

      {/* Tabela de produtos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/70 text-white">
              <th className="p-2">Nome</th>
              <th className="p-2">Categoria</th>
              <th className="p-2">Preço</th>
              <th className="p-2">Estoque</th>
              <th className="p-2">Destaque</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtosFiltrados.map((produto) => (
              <tr
                key={produto.id}
                className="border-b border-gray-700 hover:bg-gray-800/50 text-white"
              >
                <td className="p-2">{produto.nome}</td>
                <td className="p-2">{produto.categoria}</td>
                <td className="p-2">R$ {produto.preco.toFixed(2)}</td>
                <td className="p-2">{produto.estoque}</td>
                <td className="p-2">
                  {produto.destaque && (
                    <Star className="text-yellow-400" size={16} />
                  )}
                </td>
                <td className="p-2 flex gap-2">
                  <Button
                    onClick={() => editarProduto(produto.id)}
                    className="bg-blue-900/30 hover:bg-blue-900/50 p-1 rounded transition"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    onClick={() => excluirProduto(produto.id)}
                    className="bg-red-900/30 hover:bg-red-900/50 p-1 rounded transition"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
            {produtosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-300">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
