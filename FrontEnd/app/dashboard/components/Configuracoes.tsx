"use client";

import { useState, useEffect } from "react";
import { checkAuth, type Usuario } from "@/lib/auth";
import { Input } from "@/components/ui/input";

export default function Configuracoes() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [novaFoto, setNovaFoto] = useState<File | null>(null);

  const [loja, setLoja] = useState({ nome: "", endereco: "", telefone: "" });
  const [categorias, setCategorias] = useState<string[]>([]);
  const [preferenciasPDV, setPreferenciasPDV] = useState({
    imprimirRecibo: true,
    descontoMaximo: 20,
  });
  const [alertas, setAlertas] = useState({
    estoqueBaixo: true,
    vendaAbaixoMeta: true,
  });
  const [plano, setPlano] = useState({ tipo: "", diasRestantes: 0 });

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const u = await checkAuth();
        setUsuario(u);

        // Mock de dados
        setLoja({
          nome: "Minha Loja",
          endereco: "Rua Exemplo, 123",
          telefone: "(11) 99999-9999",
        });
        setCategorias(["Eletrônicos", "Roupas", "Alimentos"]);
        setPlano({ tipo: usuario.tipoPlano, diasRestantes: 3 });
      } catch (error) {
        console.error(error);
      }
    }
    carregarUsuario();
  }, []);

  const salvarLoja = () => console.log("Salvar dados da loja", loja);
  const salvarUsuario = () =>
    console.log("Salvar perfil do usuário", usuario, novaFoto);
  const salvarSistema = () =>
    console.log("Salvar configurações do sistema", {
      categorias,
      preferenciasPDV,
      alertas,
    });
  const renovarPlano = () => console.log("Renovar plano");

  if (!usuario) return <p className="text-white p-6">Carregando...</p>;

  return (
    <div className="p-6 space-y-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Configurações</h2>

      {/* Dados da Loja */}
      <section className="bg-gray-800/70 p-4 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">Dados da Loja</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome da Loja"
            className="p-2 rounded w-full bg-gray-700 text-white"
            value={loja.nome}
            onChange={(e) => setLoja({ ...loja, nome: e.target.value })}
          />
          <input
            type="text"
            placeholder="Endereço"
            className="p-2 rounded w-full bg-gray-700 text-white"
            value={loja.endereco}
            onChange={(e) => setLoja({ ...loja, endereco: e.target.value })}
          />
          <input
            type="text"
            placeholder="Telefone"
            className="p-2 rounded w-full bg-gray-700 text-white"
            value={loja.telefone}
            onChange={(e) => setLoja({ ...loja, telefone: e.target.value })}
          />
        </div>
        <button
          onClick={salvarLoja}
          className="bg-blue-900/40 hover:bg-blue-900/60 p-2 rounded transition"
        >
          Salvar Dados da Loja
        </button>
      </section>

      {/* Perfil do Usuário */}
      {/* Perfil do Usuário */}
      <section className="bg-gray-800/70 p-6 rounded-2xl shadow-md space-y-6">
        <h3 className="text-lg font-semibold mb-4">Perfil do Usuário</h3>

        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Foto do Usuário */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-blue-900">
              <img
                src={usuario.foto || "/placeholder-user.jpg"}
                alt="Foto do usuário"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="mt-3 cursor-pointer bg-gray-700/50 px-4 py-2 rounded text-white hover:bg-gray-700/70 transition">
              Alterar Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setNovaFoto(e.target.files?.[0] || null)}
              />
            </label>
            <button
              onClick={salvarUsuario}
              className="mt-2 bg-blue-900/40 hover:bg-blue-900/60 text-white p-2 rounded transition w-full"
            >
              Salvar Perfil
            </button>
          </div>

          {/* Dados do Usuário */}
          <div className="flex flex-col gap-1 w-full md:w-2/3">
            <div className="flex flex-col">
              <label className="font-medium mb-1">Nome</label>
              <Input
                type="text"
                value={usuario.nome}
                onChange={(e) =>
                  setUsuario({ ...usuario, nome: e.target.value })
                }
                className="p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Email</label>
              <Input
                type="email"
                value={usuario.email}
                onChange={(e) =>
                  setUsuario({ ...usuario, email: e.target.value })
                }
                className="p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-medium mb-1">Senha</label>
              <input
                type="password"
                placeholder="********"
                className="p-2 rounded bg-gray-700 text-white w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Configurações do Sistema */}
      <section className="bg-gray-800/70 p-4 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">Configurações do Sistema</h3>

        {/* Categorias */}
        <div className="space-y-2">
          <p className="font-medium">Categorias de Produtos</p>
          <div className="flex flex-wrap gap-2">
            {categorias.map((cat, idx) => (
              <span key={idx} className="bg-gray-700/50 px-3 py-1 rounded">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Preferências PDV */}
        <div className="space-y-2">
          <p className="font-medium">Preferências de PDV</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={preferenciasPDV.imprimirRecibo}
              onChange={(e) =>
                setPreferenciasPDV({
                  ...preferenciasPDV,
                  imprimirRecibo: e.target.checked,
                })
              }
            />
            Imprimir Recibo
          </label>
          <label className="flex items-center gap-2">
            Desconto Máximo:
            <input
              type="number"
              className="p-1 rounded w-16 bg-gray-700 text-white"
              value={preferenciasPDV.descontoMaximo}
              onChange={(e) =>
                setPreferenciasPDV({
                  ...preferenciasPDV,
                  descontoMaximo: Number(e.target.value),
                })
              }
            />
            %
          </label>
        </div>

        {/* Alertas Automáticos */}
        <div className="space-y-2">
          <p className="font-medium">Alertas Automáticos</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={alertas.estoqueBaixo}
              onChange={(e) =>
                setAlertas({ ...alertas, estoqueBaixo: e.target.checked })
              }
            />
            Estoque Baixo
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={alertas.vendaAbaixoMeta}
              onChange={(e) =>
                setAlertas({ ...alertas, vendaAbaixoMeta: e.target.checked })
              }
            />
            Vendas Abaixo da Meta
          </label>
        </div>

        <button
          onClick={salvarSistema}
          className="bg-blue-900/40 hover:bg-blue-900/60 p-2 rounded transition"
        >
          Salvar Configurações do Sistema
        </button>
      </section>

      {/* Gerenciamento de Planos */}
      <section className="bg-gray-800/70 p-4 rounded-2xl shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-2">Gerenciamento de Plano</h3>
        <p>
          Plano atual: <span className="font-medium">{plano.tipo}</span>
        </p>
        <p>
          Dias restantes:{" "}
          <span className="font-medium">{plano.diasRestantes}</span>
        </p>
        <button
          onClick={renovarPlano}
          className="bg-blue-900/40 hover:bg-blue-900/60 p-2 rounded transition"
        >
          Renovar Plano
        </button>
      </section>
    </div>
  );
}
