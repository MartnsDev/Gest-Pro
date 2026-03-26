"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

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

const STORAGE_KEY = "gestpro_empresa_ativa_id";

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

async function fetchAuth<T>(path: string): Promise<T> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json" } },
  );
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);
  const [caixaAtivo, setCaixaAtivo] = useState<CaixaInfo | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  // Flag para não sobrescrever no reload
  const inicializado = useRef(false);

  const carregarCaixa = async (empresa: Empresa) => {
    setCaixaAtivo(null);
    try {
      const caixa = await fetchAuth<CaixaInfo>(
        `/api/v1/caixas/aberto?empresaId=${empresa.id}`,
      );
      caixa.empresaNome = empresa.nomeFantasia;
      setCaixaAtivo(caixa);
    } catch {
      // Sem caixa aberto — comportamento esperado, não faz nada
    }
  };

  // Troca manual de empresa (usuário clicou)
  const setEmpresaAtiva = (empresa: Empresa) => {
    setEmpresaAtivaState(empresa);
    // Persiste no localStorage para sobreviver ao reload
    try {
      localStorage.setItem(STORAGE_KEY, String(empresa.id));
    } catch {}
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
            empParaAtivar = data.find((e) => e.id === Number(idSalvo));
          }
        } catch {}

        // Se não encontrou a salva (ou não tinha no storage), usa a primeira
        if (!empParaAtivar) empParaAtivar = data[0];

        setEmpresaAtivaState(empParaAtivar);
        await carregarCaixa(empParaAtivar);
      }
      // Se já inicializado (recarregarEmpresas chamado manualmente), NÃO muda a empresa ativa
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    }
  };

  // Implementação da função faltante para recarregar o caixa manualmente
  const recarregarCaixa = async () => {
    if (empresaAtiva) {
      await carregarCaixa(empresaAtiva);
    }
  };

  // Implementação da função faltante para limpar os estados e o storage (útil no logout)
  const resetarContexto = () => {
    setEmpresaAtivaState(null);
    setCaixaAtivo(null);
    setEmpresas([]);
    inicializado.current = false;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Executa apenas uma vez quando o Provider é montado
  useEffect(() => {
    recarregarEmpresas();
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
