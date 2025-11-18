"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search } from "lucide-react";

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  totalCompras: number;
  historico: Compra[];
}

interface Compra {
  produto: string;
  quantidade: number;
  valorTotal: number;
  dataHora: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  useEffect(() => {
    setClientes([
      {
        id: 1,
        nome: "Maria Silva",
        email: "maria@email.com",
        telefone: "(11) 98888-7777",
        totalCompras: 120,
        historico: [
          {
            produto: "Coca 2L",
            quantidade: 2,
            valorTotal: 20,
            dataHora: "2025-10-23 14:30",
          },
          {
            produto: "Pão",
            quantidade: 5,
            valorTotal: 10,
            dataHora: "2025-10-22 11:20",
          },
        ],
      },
      {
        id: 2,
        nome: "João Souza",
        email: "joao@email.com",
        telefone: "(11) 97777-6666",
        totalCompras: 50,
        historico: [
          {
            produto: "Água 500ml",
            quantidade: 10,
            valorTotal: 30,
            dataHora: "2025-10-21 10:15",
          },
        ],
      },
    ]);
  }, []);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      c.email.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const adicionarCliente = () => {
    if (!novoCliente.nome || !novoCliente.email) {
      alert("Nome e email são obrigatórios!");
      return;
    }
    const id = clientes.length + 1;
    setClientes([
      ...clientes,
      { ...novoCliente, id, totalCompras: 0, historico: [] },
    ]);
    setNovoCliente({ nome: "", email: "", telefone: "" });
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Clientes</h2>

      {/* Busca */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          className="p-2 rounded w-full text-white placeholder-white bg-gray-700 border-none"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
        <Search className="text-white mt-2" />
      </div>

      {/* Lista de clientes */}
      <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="bg-gray-700/80">
            <th className="p-2">Nome</th>
            <th className="p-2">Email</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">Total Compras</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map((cliente) => (
            <tr
              key={cliente.id}
              className="border-b border-gray-600 hover:bg-gray-800/50 cursor-pointer"
            >
              <td className="p-2">{cliente.nome}</td>
              <td className="p-2">{cliente.email}</td>
              <td className="p-2">{cliente.telefone}</td>
              <td className="p-2">R$ {cliente.totalCompras}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Adicionar cliente */}
      <section className="bg-gray-800/70 p-4 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">Adicionar Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome"
            className="p-2 rounded w-full text-white placeholder-white bg-gray-700 border-none"
            value={novoCliente.nome}
            onChange={(e) =>
              setNovoCliente({ ...novoCliente, nome: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded w-full text-white placeholder-white bg-gray-700 border-none"
            value={novoCliente.email}
            onChange={(e) =>
              setNovoCliente({ ...novoCliente, email: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Telefone"
            className="p-2 rounded w-full text-white placeholder-white bg-gray-700 border-none"
            value={novoCliente.telefone}
            onChange={(e) =>
              setNovoCliente({ ...novoCliente, telefone: e.target.value })
            }
          />
        </div>
        <button
          onClick={adicionarCliente}
          className="bg-blue-900/40 hover:bg-blue-900/60 p-2 rounded flex items-center gap-2 transition"
        >
          <PlusCircle size={16} /> Adicionar Cliente
        </button>
      </section>

      {/* Histórico de compras por cliente */}
      <section className="bg-gray-800/70 p-4 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">
          Histórico de Compras (Cliente Selecionado)
        </h3>
        <p>Clique em um cliente na lista para ver o histórico.</p>
        {/* Futuramente aqui exibe as compras do cliente selecionado */}
      </section>
    </div>
  );
}
