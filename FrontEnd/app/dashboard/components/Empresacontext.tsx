"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { fetchAuth, hasToken } from "@/lib/api-v2";

// ─── Tipos ────────────────────────────────────────────────────────────────────

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
  recarregarCaixa:    () => Promise<void>;
}

const EmpresaContext = createContext<EmpresaContextType>({
  empresaAtiva:       null,
  caixaAtivo:         null,
  empresas:           [],
  setEmpresaAtiva:    () => {},
  setCaixaAtivo:      () => {},
  recarregarEmpresas: async () => {},
  recarregarCaixa:    async () => {},
});

const STORAGE_KEY = "gestpro_empresa_ativa_id";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);
  const [caixaAtivo,   setCaixaAtivo]        = useState<CaixaInfo | null>(null);
  const [empresas,     setEmpresas]          = useState<Empresa[]>([]);
  const inicializado = useRef(false);

  // ── Carrega caixa aberto da empresa ────────────────────────────────────────
  const carregarCaixa = async (empresa: Empresa) => {
    if (!hasToken()) return;
    
    setCaixaAtivo(null);
    try {
      const response = await fetchAuth(`/api/v1/caixas/aberto?empresaId=${empresa.id}`);
      
      if (!response.ok) {
        // 404 = sem caixa aberto (normal), 401 = token invalido
        return;
      }
      
      const caixa: CaixaInfo = await response.json();
      setCaixaAtivo({ ...caixa, empresaNome: empresa.nomeFantasia });
    } catch {
      // sem caixa aberto — normal
    }
  };

  // ── Recarrega o caixa da empresa ativa ──────────────────────────────────────
  const recarregarCaixa = async () => {
    if (empresaAtiva) {
      await carregarCaixa(empresaAtiva);
    }
  };

  // ── Troca manual de empresa (usuário clicou) ────────────────────────────────
  const setEmpresaAtiva = (empresa: Empresa) => {
    setEmpresaAtivaState(empresa);
    try { localStorage.setItem(STORAGE_KEY, String(empresa.id)); } catch {}
    carregarCaixa(empresa);
  };

  // ── Carrega lista de empresas ───────────────────────────────────────────────
  const recarregarEmpresas = async () => {
    if (!hasToken()) return;
    
    try {
      const response = await fetchAuth("/api/v1/empresas");
      
      if (!response.ok) return;
      
      const data: Empresa[] = await response.json();
      setEmpresas(data);

      if (data.length === 0) return;

      // Só define empresa ativa na primeira carga
      if (!inicializado.current) {
        inicializado.current = true;

        let empParaAtivar: Empresa | undefined;

        try {
          const idSalvo = localStorage.getItem(STORAGE_KEY);
          if (idSalvo) {
            empParaAtivar = data.find(e => e.id === Number(idSalvo));
          }
        } catch {}

        if (!empParaAtivar) empParaAtivar = data[0];

        setEmpresaAtivaState(empParaAtivar);
        await carregarCaixa(empParaAtivar);
      }
    } catch {
      // erro ao carregar empresas
    }
  };

  useEffect(() => {
    const tentarCarregar = async () => {
      // Primeira tentativa imediata
      if (hasToken()) {
        await recarregarEmpresas();
        return;
      }
      
      // Se não há token, espera um pouco e tenta novamente (caso seja redirect do OAuth)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (hasToken()) {
        await recarregarEmpresas();
      }
    };
    
    tentarCarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EmpresaContext.Provider value={{
      empresaAtiva,
      caixaAtivo,
      empresas,
      setEmpresaAtiva,
      setCaixaAtivo,
      recarregarEmpresas,
      recarregarCaixa,
    }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export const useEmpresa = () => useContext(EmpresaContext);
