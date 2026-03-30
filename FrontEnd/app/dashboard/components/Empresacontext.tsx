"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

/* ─── Tipos espelhando CaixaResponse do backend ──────────────────────────── */
export interface CaixaInfo {
  id: number;
  valorInicial?: number | null;
  valorFinal?: number | null;
  totalVendas?: number | null;
  status?: string | null; // "ABERTO" | "FECHADO"
  aberto?: boolean | null;
  usuarioId?: number | null;
  empresaId?: number | null;
  empresaNome?: string | null; // adicionado pelo frontend
}

export interface EmpresaAtiva {
  id: number;
  nomeFantasia: string;
}

/* ─── Interface do contexto — COMPLETA e sincronizada ───────────────────── */
interface EmpresaContextType {
  usuarioId: string | null;
  empresaAtiva: EmpresaAtiva | null;
  caixaAtivo: CaixaInfo | null;
  empresas: EmpresaAtiva[];
  inicializarUsuario: (
    id: string,
    empresaAtiva: EmpresaAtiva | null,
    caixaAtivo: CaixaInfo | null,
  ) => void;
  setEmpresaAtiva: (e: EmpresaAtiva | null) => void;
  setCaixaAtivo: (c: CaixaInfo | null) => void;
  setEmpresas: (list: EmpresaAtiva[]) => void;
  resetarContexto: () => void;
}

/* ─── Chaves localStorage por usuário ───────────────────────────────────── */
const keyEmpresa = (uid: string) => `gp_empresa_${uid}`;
const keyCaixa = (uid: string) => `gp_caixa_${uid}`;

function limparChavesLegadas() {
  ["empresa_ativa", "caixa_ativo", "empresaAtiva", "caixaAtivo"].forEach((k) =>
    localStorage.removeItem(k),
  );
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith("empresa_ativa_uid_") || k.startsWith("caixa_ativo_uid_"))
      localStorage.removeItem(k);
  });
}

function salvar(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
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

/* ─── Valor padrão do contexto — TODOS os campos declarados ─────────────── *
 *                                                                             *
 * IMPORTANTE: o valor padrão deve ter EXATAMENTE os mesmos campos            *
 * que EmpresaContextType, caso contrário componentes fora do Provider        *
 * recebem stubs vazios e nada funciona.                                      *
 * ──────────────────────────────────────────────────────────────────────────── */
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

  /* Ref para uid — evita stale closure nos callbacks */
  const uidRef = useRef<string | null>(null);

  /* ── inicializarUsuario ──────────────────────────────────────────────────
   *
   * Chamado UMA VEZ pelo DashboardLoader após buscar o usuário e o caixa.
   * Se o uid mudar (troca de conta) limpa o estado anterior antes de setar.
   * ─────────────────────────────────────────────────────────────────────── */
  const inicializarUsuario = useCallback(
    (
      uid: string,
      novaEmpresa: EmpresaAtiva | null,
      novoCaixa: CaixaInfo | null,
    ) => {
      /* Troca de usuário → limpa estado do usuário anterior */
      if (uidRef.current && uidRef.current !== uid) {
        setEmpresaAtivaState(null);
        setCaixaAtivoState(null);
        setEmpresas([]);
      }

      uidRef.current = uid;
      setUsuarioIdState(uid);
      limparChavesLegadas();

      /* Seta estado React */
      setEmpresaAtivaState(novaEmpresa);
      setCaixaAtivoState(novoCaixa);

      /* Persiste no localStorage */
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

/* ─── Hook ───────────────────────────────────────────────────────────────── */
export function useEmpresa() {
  return useContext(EmpresaContext);
}

/* ─── Leitura do cache sem contexto (usado no DashboardLoader) ───────────── */
export function lerCacheUsuario(uid: string) {
  return {
    empresaAtiva: carregar<EmpresaAtiva>(keyEmpresa(uid)),
    caixaAtivo: carregar<CaixaInfo>(keyCaixa(uid)),
  };
}
