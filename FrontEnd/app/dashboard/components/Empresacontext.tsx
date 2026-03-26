"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { fetchAuth, hasToken } from "@/lib/api-v2";

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
  empresaAtiva: Empresa | null;
  caixaAtivo: CaixaInfo | null;
  empresas: Empresa[];
  setEmpresaAtiva: (e: Empresa) => void;
  setCaixaAtivo: (c: CaixaInfo | null) => void;
  recarregarEmpresas: () => Promise<void>;
  recarregarCaixa: () => Promise<void>;
  resetarContexto: () => void;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresaAtiva: null,
  caixaAtivo: null,
  empresas: [],
  setEmpresaAtiva: () => {},
  setCaixaAtivo: () => {},
  recarregarEmpresas: async () => {},
  recarregarCaixa: async () => {},
  resetarContexto: () => {},
});

const STORAGE_KEY = "gestpro_empresa_ativa_id";

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);
  const [caixaAtivo, setCaixaAtivo] = useState<CaixaInfo | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const inicializado = useRef(false);

  const carregarCaixa = async (empresa: Empresa) => {
    if (!hasToken()) return;
    setCaixaAtivo(null);
    try {
      const response = await fetchAuth(
        `/api/v1/caixas/aberto?empresaId=${empresa.id}`,
      );
      if (!response.ok) return;
      const caixa: CaixaInfo = await response.json();
      setCaixaAtivo({ ...caixa, empresaNome: empresa.nomeFantasia });
    } catch {}
  };

  const recarregarCaixa = async () => {
    if (empresaAtiva) await carregarCaixa(empresaAtiva);
  };

  const setEmpresaAtiva = (empresa: Empresa) => {
    setEmpresaAtivaState(empresa);
    try {
      localStorage.setItem(STORAGE_KEY, String(empresa.id));
    } catch {}
    carregarCaixa(empresa);
  };

  const resetarContexto = () => {
    setEmpresaAtivaState(null);
    setCaixaAtivo(null);
    setEmpresas([]);
    inicializado.current = false;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("jwt_token");
      sessionStorage.clear();
    } catch {}
  };

  const recarregarEmpresas = async () => {
    if (!hasToken()) return;
    try {
      const response = await fetchAuth("/api/v1/empresas");
      if (!response.ok) return;

      const data: Empresa[] = await response.json();
      setEmpresas(data);
      if (data.length === 0) return;

      if (!inicializado.current) {
        inicializado.current = true;

        let empParaAtivar: Empresa | undefined;
        try {
          const idSalvo = localStorage.getItem(STORAGE_KEY);
          if (idSalvo)
            empParaAtivar = data.find((e) => e.id === Number(idSalvo));
        } catch {}

        if (!empParaAtivar) empParaAtivar = data[0];

        setEmpresaAtivaState(empParaAtivar);
        await carregarCaixa(empParaAtivar);
      }
    } catch {}
  };

  useEffect(() => {
    const tentarCarregar = async () => {
      if (hasToken()) {
        await recarregarEmpresas();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (hasToken()) await recarregarEmpresas();
    };
    tentarCarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EmpresaContext.Provider
      value={{
        empresaAtiva,
        caixaAtivo,
        empresas,
        setEmpresaAtiva,
        setCaixaAtivo,
        recarregarEmpresas,
        recarregarCaixa,
        resetarContexto,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export const useEmpresa = () => useContext(EmpresaContext);
