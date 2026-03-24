"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { fetchAuth, lerTokenCookie } from "@/lib/api-v2";

// Verifica se há um token disponível
function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  const localStorageToken = localStorage.getItem("jwt_token");
  const cookieToken = lerTokenCookie();
  return !!(localStorageToken || cookieToken);
}

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
    console.log("[v0] carregarCaixa - Iniciando para empresa:", empresa.id, empresa.nomeFantasia);
    
    // Verifica se há token antes de fazer a chamada
    if (!hasToken()) {
      console.log("[v0] carregarCaixa - Sem token, pulando...");
      return;
    }
    
    setCaixaAtivo(null);
    try {
      // Usa a função fetchAuth do api-v2.ts que já gerencia token corretamente
      const response = await fetchAuth(`/api/v1/caixas/aberto?empresaId=${empresa.id}`);
      
      console.log("[v0] carregarCaixa - Response status:", response.status);
      
      if (!response.ok) {
        // 404 significa que não há caixa aberto - é normal
        if (response.status === 404) {
          console.log(`[v0] Nenhum caixa aberto para empresa ${empresa.id}`);
          return;
        }
        // 401 significa que o token não está sendo enviado corretamente
        if (response.status === 401) {
          console.error("[v0] Token inválido ou não enviado para caixa aberto");
          return;
        }
        throw new Error(`Erro ${response.status}`);
      }
      
      const caixa: CaixaInfo = await response.json();
      console.log("[v0] carregarCaixa - Caixa encontrado:", caixa);
      setCaixaAtivo({ ...caixa, empresaNome: empresa.nomeFantasia });
    } catch (err) {
      // sem caixa aberto — normal
      console.error("[v0] Erro ao carregar caixa:", err);
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
    console.log("[v0] recarregarEmpresas - Iniciando...");
    
    // Verifica se há token antes de fazer a chamada
    if (!hasToken()) {
      console.log("[v0] recarregarEmpresas - Sem token, pulando...");
      return;
    }
    
    try {
      // Usa a função fetchAuth do api-v2.ts
      const response = await fetchAuth("/api/v1/empresas");
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }
      
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
    } catch (err) {
      console.error("Erro ao carregar empresas:", err);
    }
  };

  useEffect(() => {
    // Pequeno delay para garantir que o token já esteja disponível após login/redirect
    const tentarCarregar = async () => {
      // Primeira tentativa imediata
      if (hasToken()) {
        console.log("[v0] useEffect - Token encontrado, carregando empresas...");
        await recarregarEmpresas();
        return;
      }
      
      // Se não há token, espera um pouco e tenta novamente (caso seja redirect do OAuth)
      console.log("[v0] useEffect - Sem token, aguardando 500ms...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (hasToken()) {
        console.log("[v0] useEffect - Token encontrado após delay, carregando empresas...");
        await recarregarEmpresas();
      } else {
        console.log("[v0] useEffect - Ainda sem token após delay");
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
