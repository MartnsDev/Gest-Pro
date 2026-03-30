"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
export interface CaixaInfo {
  id: number;
  valorInicial?: number | null;
  valorFinal?: number | null;
  totalVendas?: number | null;
  status?: string | null;
  aberto?: boolean | null;
  usuarioId?: number | null;
  empresaId?: number | null;
  empresaNome?: string | null;
}

export interface EmpresaAtiva {
  id: number;
  nomeFantasia: string;
}

interface EmpresaContextType {
  usuarioId: string | null;
  setUsuarioId: (id: string) => void;
  empresaAtiva: EmpresaAtiva | null;
  setEmpresaAtiva: (e: EmpresaAtiva | null) => void;
  caixaAtivo: CaixaInfo | null;
  setCaixaAtivo: (c: CaixaInfo | null) => void;
  empresas: EmpresaAtiva[];
  setEmpresas: (list: EmpresaAtiva[]) => void;
  resetarContexto: () => void;
  inicializarUsuario: (usuarioId: string) => void;
}

/* ─── Chaves de localStorage vinculadas ao usuário ───────────────────────── */
const keyEmpresa = (uid: string) => `empresa_ativa_uid_${uid}`;
const keyCaixa = (uid: string) => `caixa_ativo_uid_${uid}`;

/* ─── Context ────────────────────────────────────────────────────────────── */
const EmpresaContext = createContext<EmpresaContextType>({
  usuarioId: null,
  setUsuarioId: () => {},
  empresaAtiva: null,
  setEmpresaAtiva: () => {},
  caixaAtivo: null,
  setCaixaAtivo: () => {},
  empresas: [],
  setEmpresas: () => {},
  inicializarUsuario: () => {},
  resetarContexto: () => {},
});

/* ─── Provider ───────────────────────────────────────────────────────────── */
export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioIdState] = useState<string | null>(null);
  const [empresaAtiva, setEmpresaAtivaState] = useState<EmpresaAtiva | null>(
    null,
  );
  const [caixaAtivo, setCaixaAtivoState] = useState<CaixaInfo | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaAtiva[]>([]);

  /**
   * Chamado logo após o login/carregamento do usuário.
   * Vincula o contexto ao ID do usuário e restaura os dados DELE do localStorage.
   */
  const setUsuarioId = useCallback((id: string) => {
    setUsuarioIdState(id);

    try {
      const empRaw = localStorage.getItem(keyEmpresa(id));
      const caixaRaw = localStorage.getItem(keyCaixa(id));
      setEmpresaAtivaState(empRaw ? JSON.parse(empRaw) : null);
      setCaixaAtivoState(caixaRaw ? JSON.parse(caixaRaw) : null);
    } catch {
      setEmpresaAtivaState(null);
      setCaixaAtivoState(null);
    }
  }, []);

  const setEmpresaAtiva = useCallback(
    (e: EmpresaAtiva | null) => {
      setEmpresaAtivaState(e);
      if (!usuarioId) return;
      if (e) {
        localStorage.setItem(keyEmpresa(usuarioId), JSON.stringify(e));
      } else {
        localStorage.removeItem(keyEmpresa(usuarioId));
      }
    },
    [usuarioId],
  );

  const setCaixaAtivo = useCallback(
    (c: CaixaInfo | null) => {
      setCaixaAtivoState(c);
      if (!usuarioId) return;
      if (c) {
        localStorage.setItem(keyCaixa(usuarioId), JSON.stringify(c));
      } else {
        localStorage.removeItem(keyCaixa(usuarioId));
      }
    },
    [usuarioId],
  );

  /**
   * Limpa TUDO do contexto e do localStorage deste usuário.
   * Chamado obrigatoriamente no logout.
   */
  const resetarContexto = useCallback(() => {
    if (usuarioId) {
      localStorage.removeItem(keyEmpresa(usuarioId));
      localStorage.removeItem(keyCaixa(usuarioId));
    }

    // Remove chaves legadas (sem userId) que possam existir de versões antigas
    localStorage.removeItem("empresa_ativa");
    localStorage.removeItem("caixa_ativo");
    localStorage.removeItem("empresaAtiva");
    localStorage.removeItem("caixaAtivo");

    setEmpresaAtivaState(null);
    setCaixaAtivoState(null);
    setEmpresas([]);
    setUsuarioIdState(null);
  }, [usuarioId]);

  return (
    <EmpresaContext.Provider
      value={{
        usuarioId,
        setUsuarioId,
        empresaAtiva,
        setEmpresaAtiva,
        caixaAtivo,
        setCaixaAtivo,
        empresas,
        setEmpresas,
        resetarContexto,
        inicializarUsuario,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}
