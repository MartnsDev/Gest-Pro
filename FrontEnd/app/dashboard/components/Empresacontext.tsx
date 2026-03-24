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
const API_BASE    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ─── fetchAuth com Authorization header ──────────────────────────────────────
async function fetchAuth<T>(path: string): Promise<T> {
  const token =
    (typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null) ?? "";

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);
  const [caixaAtivo,   setCaixaAtivo]        = useState<CaixaInfo | null>(null);
  const [empresas,     setEmpresas]          = useState<Empresa[]>([]);
  const inicializado = useRef(false);

  // ── Carrega caixa aberto da empresa ────────────────────────────────────────
  const carregarCaixa = async (empresa: Empresa) => {
    setCaixaAtivo(null);
    try {
      const caixa = await fetchAuth<CaixaInfo>(
        `/api/v1/caixas/aberto?empresaId=${empresa.id}`
      );
      setCaixaAtivo({ ...caixa, empresaNome: empresa.nomeFantasia });
    } catch {
      // sem caixa aberto — normal
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
    try {
      const data = await fetchAuth<Empresa[]>("/api/v1/empresas");
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
    recarregarEmpresas();
  }, []);

  return (
    <EmpresaContext.Provider value={{
      empresaAtiva,
      caixaAtivo,
      empresas,
      setEmpresaAtiva,
      setCaixaAtivo,
      recarregarEmpresas,
    }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export const useEmpresa = () => useContext(EmpresaContext);