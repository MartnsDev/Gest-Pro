"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

/* ─── Tipos — espelham exatamente o CaixaResponse do backend ─────────────── */
export interface CaixaInfo {
  id: number;
  // BigDecimal do Java chega como number no JSON
  valorInicial?: number | null;
  valorFinal?: number | null;
  totalVendas?: number | null;
  status?: string | null; // "ABERTO" | "FECHADO"
  aberto?: boolean | null;
  usuarioId?: number | null;
  empresaId?: number | null;
  // campo extra adicionado pelo frontend para exibição no header
  empresaNome?: string | null;
}

export interface EmpresaAtiva {
  id: number;
  nomeFantasia: string;
}

interface EmpresaContextType {
  usuarioId: string | null;
  empresaAtiva: EmpresaAtiva | null;
  caixaAtivo: CaixaInfo | null;
  empresas: EmpresaAtiva[];
  /** Ponto de entrada único após autenticação — recebe dados já resolvidos pela API. */
  inicializarUsuario: (
    id: string,
    empresaAtiva: EmpresaAtiva | null,
    caixaAtivo: CaixaInfo | null,
  ) => void;
  setEmpresaAtiva: (e: EmpresaAtiva | null) => void;
  setCaixaAtivo: (c: CaixaInfo | null) => void;
  setEmpresas: (list: EmpresaAtiva[]) => void;
  /** Chame no logout — limpa contexto + localStorage deste usuário. */
  resetarContexto: () => void;
}

/* ─── Chaves de localStorage por usuário ─────────────────────────────────── */
const keyEmpresa = (uid: string) => `gp_empresa_${uid}`;
const keyCaixa = (uid: string) => `gp_caixa_${uid}`;

function limparChavesLegadas() {
  // Chaves de versões anteriores
  ["empresa_ativa", "caixa_ativo", "empresaAtiva", "caixaAtivo"].forEach((k) =>
    localStorage.removeItem(k),
  );
  // Prefixos antigos "empresa_ativa_uid_*" e "caixa_ativo_uid_*"
  Object.keys(localStorage).forEach((k) => {
    if (
      k.startsWith("empresa_ativa_uid_") ||
      k.startsWith("caixa_ativo_uid_")
    ) {
      localStorage.removeItem(k);
    }
  });
}

function salvar(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage cheio — ignora silenciosamente
  }
}

function carregar<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/* ─── Context ────────────────────────────────────────────────────────────── */
const EmpresaContext = createContext<EmpresaContextType>({
  usuarioId: null,
  empresaAtiva: null,
  caixaAtivo: null,
  empresas: [],
  inicializarUsuario: () => {},
  setEmpresaAtiva: () => {},
  setCaixaAtivo: () => {},
  setEmpresas: () => {},
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

  // UID em ref — acessível em callbacks sem depender de estado (evita closures stale)
  const uidRef = useRef<string | null>(null);

  /**
   * Chamado UMA VEZ após a API resolver empresa e caixa.
   * Detecta troca de conta (UID diferente) e limpa estado anterior antes de
   * carregar os dados do novo usuário.
   */
  const inicializarUsuario = useCallback(
    (
      uid: string,
      novaEmpresa: EmpresaAtiva | null,
      novoCaixa: CaixaInfo | null,
    ) => {
      // Troca de conta no mesmo navegador — zera estado em memória ANTES de carregar
      if (uidRef.current && uidRef.current !== uid) {
        setEmpresaAtivaState(null);
        setCaixaAtivoState(null);
        setEmpresas([]);
      }

      uidRef.current = uid;
      setUsuarioIdState(uid);
      limparChavesLegadas();

      // Grava estado que veio da API
      setEmpresaAtivaState(novaEmpresa);
      setCaixaAtivoState(novoCaixa);

      if (novaEmpresa) salvar(keyEmpresa(uid), novaEmpresa);
      else localStorage.removeItem(keyEmpresa(uid));

      if (novoCaixa) salvar(keyCaixa(uid), novoCaixa);
      else localStorage.removeItem(keyCaixa(uid));
    },
    [],
  );

  const setEmpresaAtiva = useCallback((e: EmpresaAtiva | null) => {
    setEmpresaAtivaState(e);
    const uid = uidRef.current;
    if (!uid) return;
    if (e) salvar(keyEmpresa(uid), e);
    else localStorage.removeItem(keyEmpresa(uid));
  }, []);

  const setCaixaAtivo = useCallback((c: CaixaInfo | null) => {
    setCaixaAtivoState(c);
    const uid = uidRef.current;
    if (!uid) return;
    if (c) salvar(keyCaixa(uid), c);
    else localStorage.removeItem(keyCaixa(uid));
  }, []);

  const resetarContexto = useCallback(() => {
    const uid = uidRef.current;
    if (uid) {
      localStorage.removeItem(keyEmpresa(uid));
      localStorage.removeItem(keyCaixa(uid));
    }
    limparChavesLegadas();
    uidRef.current = null;
    setUsuarioIdState(null);
    setEmpresaAtivaState(null);
    setCaixaAtivoState(null);
    setEmpresas([]);
  }, []);

  return (
    <EmpresaContext.Provider
      value={{
        usuarioId,
        empresaAtiva,
        caixaAtivo,
        empresas,
        inicializarUsuario,
        setEmpresaAtiva,
        setCaixaAtivo,
        setEmpresas,
        resetarContexto,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}

/* ─── Helper exportado ───────────────────────────────────────────────────── */
export function lerCacheUsuario(uid: string): {
  empresaAtiva: EmpresaAtiva | null;
  caixaAtivo: CaixaInfo | null;
} {
  return {
    empresaAtiva: carregar<EmpresaAtiva>(keyEmpresa(uid)),
    caixaAtivo: carregar<CaixaInfo>(keyCaixa(uid)),
  };
}
