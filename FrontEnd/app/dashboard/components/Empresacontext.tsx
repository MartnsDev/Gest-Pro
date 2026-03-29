"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
export interface CaixaInfo {
  id: number;
  valorInicial?: number;
  totalVendas?: number;
  status?: string;
  empresaNome?: string;
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
  /** Chame SEMPRE antes de qualquer outra operação ao logar. */
  inicializarUsuario: (
    id: string,
    empresaAtiva: EmpresaAtiva | null,
    caixaAtivo: CaixaInfo | null,
  ) => void;
  setEmpresaAtiva: (e: EmpresaAtiva | null) => void;
  setCaixaAtivo: (c: CaixaInfo | null) => void;
  setEmpresas: (list: EmpresaAtiva[]) => void;
  /** Chame no logout. Limpa contexto + localStorage do usuário atual. */
  resetarContexto: () => void;
}

/* ─── Chaves de localStorage vinculadas ao usuário ───────────────────────── */
const keyEmpresa = (uid: string) => `gp_empresa_${uid}`;
const keyCaixa = (uid: string) => `gp_caixa_${uid}`;

/** Chaves legadas de versões antigas — removidas no primeiro acesso */
const CHAVES_LEGADAS = [
  "empresa_ativa",
  "caixa_ativo",
  "empresaAtiva",
  "caixaAtivo",
];

function limparChavesLegadas() {
  CHAVES_LEGADAS.forEach((k) => localStorage.removeItem(k));
}

function salvar(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota excedida — ignora silenciosamente
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

  /**
   * UID do usuário atualmente carregado — guardado em ref para ser acessível
   * dentro de callbacks sem precisar de dependência no array do useCallback.
   */
  const uidRef = useRef<string | null>(null);

  /**
   * Ponto de entrada único após autenticação.
   *
   * Recebe empresa e caixa já resolvidos pela API (vindos do DashboardLoader).
   * NÃO lê localStorage aqui — quem decide o estado verdadeiro é sempre a API.
   * O localStorage serve apenas como cache persistente ENTRE sessões; a API
   * sempre tem precedência e corrige qualquer divergência.
   */
  const inicializarUsuario = useCallback(
    (
      id: string,
      novaEmpresa: EmpresaAtiva | null,
      novoCaixa: CaixaInfo | null,
    ) => {
      // Se estava logado com outro usuário, limpa o estado DESSE usuário antes.
      if (uidRef.current && uidRef.current !== id) {
        // NÃO apaga o localStorage do usuário anterior — os dados dele
        // continuam lá para quando ele logar de novo. Apenas resetamos o estado
        // em memória.
        setEmpresaAtivaState(null);
        setCaixaAtivoState(null);
        setEmpresas([]);
      }

      uidRef.current = id;
      setUsuarioIdState(id);

      // Remove chaves de versões antigas (migração única, sem custo)
      limparChavesLegadas();

      // Estado vem da API — salva/atualiza o cache local
      setEmpresaAtivaState(novaEmpresa);
      setCaixaAtivoState(novoCaixa);

      if (novaEmpresa) {
        salvar(keyEmpresa(id), novaEmpresa);
      } else {
        localStorage.removeItem(keyEmpresa(id));
      }

      if (novoCaixa) {
        salvar(keyCaixa(id), novoCaixa);
      } else {
        localStorage.removeItem(keyCaixa(id));
      }
    },
    [],
  );

  const setEmpresaAtiva = useCallback((e: EmpresaAtiva | null) => {
    setEmpresaAtivaState(e);
    const uid = uidRef.current;
    if (!uid) return;
    if (e) {
      salvar(keyEmpresa(uid), e);
    } else {
      localStorage.removeItem(keyEmpresa(uid));
    }
  }, []);

  const setCaixaAtivo = useCallback((c: CaixaInfo | null) => {
    setCaixaAtivoState(c);
    const uid = uidRef.current;
    if (!uid) return;
    if (c) {
      salvar(keyCaixa(uid), c);
    } else {
      localStorage.removeItem(keyCaixa(uid));
    }
  }, []);

  /**
   * Logout: limpa o estado em memória E o cache local deste usuário.
   */
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

/* ─── Helpers exportados (usados fora do contexto, ex: DashboardLoader) ─── */

/**
 * Lê o cache do localStorage para um usuário específico.
 * Usado APENAS como sugestão inicial — a API sempre tem a palavra final.
 */
export function lerCacheUsuario(uid: string): {
  empresaAtiva: EmpresaAtiva | null;
  caixaAtivo: CaixaInfo | null;
} {
  limparChavesLegadas();
  return {
    empresaAtiva: carregar<EmpresaAtiva>(keyEmpresa(uid)),
    caixaAtivo: carregar<CaixaInfo>(keyCaixa(uid)),
  };
}
