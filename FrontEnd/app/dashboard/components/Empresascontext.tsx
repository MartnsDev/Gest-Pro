"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

export interface Empresa {
  id: number;
  nomeFantasia: string;
  cnpj?: string;
  planoNome?: string;
  limiteCaixas?: number;
}

export interface CaixaInfo {
  id: number;
  dataAbertura: string;
  dataFechamento?: string;
  valorInicial: number;
  valorFinal?: number;
  totalVendas: number;
  status: "ABERTO" | "FECHADO";
  aberto: boolean;
  usuarioId: number;
  empresaId: number;
  empresaNome?: string;
}

interface EmpresaContextType {
  empresaAtiva:       Empresa | null;
  caixaAtivo:         CaixaInfo | null;
  empresas:           Empresa[];
  setEmpresaAtiva:    (e: Empresa) => void;
  setCaixaAtivo:      (c: CaixaInfo | null) => void;
  recarregarEmpresas: () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresaAtiva:       null,
  caixaAtivo:         null,
  empresas:           [],
  setEmpresaAtiva:    () => {},
  setCaixaAtivo:      () => {},
  recarregarEmpresas: async () => {},
});

const STORAGE_KEY = "gestpro_empresa_ativa_id";

async function fetchAuth<T>(path: string): Promise<T> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);
  const [caixaAtivo,   setCaixaAtivo]        = useState<CaixaInfo | null>(null);
  const [empresas,     setEmpresas]          = useState<Empresa[]>([]);
  // flag para não sobrescrever no reload
  const inicializado = useRef(false);

  const carregarCaixa = async (empresa: Empresa) => {
    setCaixaAtivo(null);
    try {
      const caixa = await fetchAuth<CaixaInfo>(`/api/v1/caixas/aberto?empresaId=${empresa.id}`);
      caixa.empresaNome = empresa.nomeFantasia;
      setCaixaAtivo(caixa);
    } catch {
      // sem caixa aberto — ok
    }
  };

  // Troca manual de empresa (usuário clicou)
  const setEmpresaAtiva = (empresa: Empresa) => {
    setEmpresaAtivaState(empresa);
    // Persiste no localStorage para sobreviver ao reload
    try { localStorage.setItem(STORAGE_KEY, String(empresa.id)); } catch {}
    carregarCaixa(empresa);
  };

  // Carrega lista de empresas — só define empresa ativa na primeira vez (mount)
  const recarregarEmpresas = async () => {
    try {
      const data = await fetchAuth<Empresa[]>("/api/v1/empresas");
      setEmpresas(data);

      if (data.length === 0) return;

      // Na primeira carga, tenta restaurar do localStorage
      if (!inicializado.current) {
        inicializado.current = true;
        let empParaAtivar: Empresa | undefined;

        try {
          const idSalvo = localStorage.getItem(STORAGE_KEY);
          if (idSalvo) {
            empParaAtivar = data.find(e => e.id === Number(idSalvo));
          }
        } catch {}

        // Se não encontrou a salva, usa a primeira
        if (!empParaAtivar) empParaAtivar = data[0];

        setEmpresaAtivaState(empParaAtivar);
        await carregarCaixa(empParaAtivar);
      }
      // Se já inicializado (recarregarEmpresas chamado manualmente), NÃO muda a empresa ativa
    } catch {}
  };

  useEffect(() => { recarregarEmpresas(); }, []);

  return (
    <EmpresaContext.Provider value={{
      empresaAtiva, caixaAtivo, empresas,
      setEmpresaAtiva, setCaixaAtivo, recarregarEmpresas,
    }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export const useEmpresa = () => useContext(EmpresaContext);