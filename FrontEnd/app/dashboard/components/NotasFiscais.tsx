"use client";

import { useState, useEffect, useCallback, useRef, DragEvent } from "react";
import { useEmpresa } from "../context/Empresacontext";

// ─── API ───────────────────────────────────────────────────────────────────────
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gestpro-backend-production.up.railway.app";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    sessionStorage.getItem("jwt_token") ??
    document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ??
    null
  );
}

async function fetchAuth<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((opts.headers as Record<string, string>) ?? {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => null);
    throw new Error(
      e?.mensagem ??
        e?.message ??
        e?.erro ??
        (Array.isArray(e?.erros)
          ? e.erros.map((x: any) => x.mensagem ?? x.message).join("; ")
          : null) ??
        `Erro ${res.status}`
    );
  }
  return res.json();
}

// ─── Types ─────────────────────────────────────────────────────────────────────
type Status = "RASCUNHO" | "EMITIDA" | "CANCELADA";
type TipoNota = "NFe" | "NFS" | "NFCE";
type FormaPagamento =
  | "DINHEIRO"
  | "CARTAO_CREDITO"
  | "CARTAO_DEBITO"
  | "PIX"
  | "BOLETO"
  | "TRANSFERENCIA";

interface ItemNotaInput {
  produtoId: string;
  descricao: string;
  codigo: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
  icms: number;
  pis: number;
  cofins: number;
}

interface ItemNotaFiscal {
  id?: string;
  notaFiscalId?: string;
  produtoId: string;
  descricao: string;
  codigo?: string;
  ncm?: string;
  cfop?: string;
  unidade?: string;
  quantidade: number;
  valorUnitario: number;
  desconto?: number;
  icms?: number;
  pis?: number;
  cofins?: number;
  valorTotal?: number;
}

interface NotaFiscal {
  id: string;
  numero: string;
  tipo: TipoNota;
  status: Status;
  empresaId: string;
  empresaNome?: string;
  empresaCnpj?: string;
  empresaInscricaoEstadual?: string;
  empresaEndereco?: string;
  empresaCidade?: string;
  empresaEstado?: string;
  empresaCep?: string;
  empresaTelefone?: string;
  empresaEmail?: string;
  clienteId?: string;
  clienteNome: string;
  clienteCpfCnpj?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  clienteCidade?: string;
  clienteEstado?: string;
  clienteCep?: string;
  subtotal: number;
  desconto: number;
  valorDesconto: number;
  impostos: number;
  valorImpostos: number;
  total: number;
  formaPagamento: FormaPagamento;
  vendaId?: string;
  observacoes?: string;
  chaveAcesso?: string;
  protocolo?: string;
  dataEmissao?: string;
  dataCancelamento?: string;
  motivoCancelamento?: string;
  createdAt: string;
  updatedAt?: string;
  itens?: ItemNotaFiscal[];
}

interface Estatisticas {
  total: number;
  emitidas: number;
  rascunhos: number;
  canceladas: number;
  valorTotalMes: number;
}

interface DanfeData {
  cabecalho: Record<string, any>;
  emitente: Record<string, any>;
  destinatario: Record<string, any>;
  itens: any[];
  totais: Record<string, any>;
  pagamento: Record<string, any>;
  observacoes?: string;
  chaveFormatada?: string;
  urlConsulta?: string;
}

interface Municipio {
  id: number;
  nome: string;
}

// ─── Validators ────────────────────────────────────────────────────────────────
const V = {
  cpf(s: string): boolean {
    const n = s.replace(/\D/g, "");
    if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
    const calc = (len: number) => {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += +n[i] * (len + 1 - i);
      const r = (sum * 10) % 11;
      return r === 10 || r === 11 ? 0 : r;
    };
    return calc(9) === +n[9] && calc(10) === +n[10];
  },
  cnpj(s: string): boolean {
    const n = s.replace(/\D/g, "");
    if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false;
    const calc = (len: number) => {
      let sum = 0, pos = len - 7;
      for (let i = len; i >= 1; i--) { sum += +n[len - i] * pos--; if (pos < 2) pos = 9; }
      const r = sum % 11; return r < 2 ? 0 : 11 - r;
    };
    return calc(12) === +n[12] && calc(13) === +n[13];
  },
  cpfOuCnpj(s: string): boolean {
    const n = s.replace(/\D/g, "");
    if (n.length === 11) return V.cpf(s);
    if (n.length === 14) return V.cnpj(s);
    return false;
  },
  cep: (s: string) => /^\d{5}-?\d{3}$/.test(s.trim()),
  email: (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()),
  ncm: (s: string) => !s.trim() || /^\d{4}\.\d{2}\.\d{2}$/.test(s.trim()) || /^\d{8}$/.test(s.replace(/\D/g, "")),
  cfop: (s: string) => /^\d{4}$/.test(s.trim()),
  positivo: (n: number) => n > 0,
  pct: (n: number) => n >= 0 && n <= 100,
};

const mask = {
  cpfCnpj(v: string): string {
    const n = v.replace(/\D/g, "").slice(0, 14);
    if (n.length <= 11) return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3").replace(/(\d{3})(\d{1,3})/, "$1.$2");
    return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4").replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3").replace(/(\d{2})(\d{1,3})/, "$1.$2");
  },
  cep: (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d{1,3})/, "$1-$2"),
  tel: (v: string) => { const n = v.replace(/\D/g, "").slice(0, 11); return n.length <= 10 ? n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3") : n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3"); },
};

// ─── Formatters ────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
const fmtNum = (v: number, dec = 2) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v ?? 0);
const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString("pt-BR") : "—";
const fmtDateTime = (s?: string) => s ? new Date(s).toLocaleString("pt-BR") : "—";

const tipoLabel: Record<TipoNota, string> = { NFe: "NF-e", NFS: "NFS-e", NFCE: "NFC-e" };
const pgtoLabel: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro", CARTAO_CREDITO: "Crédito", CARTAO_DEBITO: "Débito",
  PIX: "PIX", BOLETO: "Boleto", TRANSFERENCIA: "Transferência",
};

// ─── Tokens ─────────────────────────────────────────────────────────────────────
const t = {
  bg: "#080C10",
  surface: "#0D1117",
  surfaceHover: "#111820",
  border: "#1C2433",
  borderHover: "#253044",
  text: "#E2E8F0",
  textMuted: "#4A5568",
  textDim: "#718096",
  accent: "#3B82F6",
  accentHover: "#2563EB",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#10B981",
  greenGlow: "rgba(16,185,129,0.15)",
  amber: "#F59E0B",
  amberGlow: "rgba(245,158,11,0.12)",
  red: "#EF4444",
  redGlow: "rgba(239,68,68,0.12)",
  purple: "#8B5CF6",
  purpleGlow: "rgba(139,92,246,0.12)",
};

const styles = {
  page: { background: t.bg, minHeight: "100vh", color: t.text, fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" } as React.CSSProperties,
  card: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12 } as React.CSSProperties,
  inner: { background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10 } as React.CSSProperties,
  label: { fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase" as const, letterSpacing: ".1em" },
  muted: { fontSize: 12, color: t.textDim } as React.CSSProperties,
  input: (err?: boolean): React.CSSProperties => ({
    width: "100%", background: "#050810", border: `1px solid ${err ? t.red : t.border}`,
    borderRadius: 8, padding: "9px 12px", color: t.text, fontSize: 13, outline: "none", boxSizing: "border-box",
    transition: "border-color .15s",
  }),
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: t.accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background .15s" } as React.CSSProperties,
  btnSuccess: { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", background: t.green, border: "none", borderRadius: 8, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" } as React.CSSProperties,
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, color: t.textDim, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  btnDanger: { display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", background: t.redGlow, border: `1px solid rgba(239,68,68,.25)`, borderRadius: 8, color: "#F87171", fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  errMsg: { fontSize: 11, color: t.red, marginTop: 3 } as React.CSSProperties,
};

// ─── Icons ──────────────────────────────────────────────────────────────────────
const Icon = {
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>,
  search: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"/></svg>,
  x: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  eye: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  ban: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>,
  receipt: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>,
  download: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>,
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>,
  doc: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
  location: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
  danfe: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75h-1.5m-6.75 16.5v-9m0 0l-3 3m3-3l3 3m-3-12v.75M12 3.75a.75.75 0 00-1.5 0v.75h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H12V3.75z"/></svg>,
  csv: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125h.001M21.375 19.5h-1.5c-.621 0-1.125-.504-1.125-1.125M21.375 19.5h-.001m-16.5 0a1.125 1.125 0 000-2.25h-.004M3.375 17.25h17.25M8.25 6.75l3 3-3 3m6 0h-3"/></svg>,
  spinner: <div style={{ width: 16, height: 16, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", opacity: .7 }} />,
  copy: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.375"/></svg>,
  link: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>,
};

// ─── Badge ──────────────────────────────────────────────────────────────────────
const statusCfg = {
  RASCUNHO: { label: "Rascunho", bg: t.amberGlow, color: t.amber, border: "rgba(245,158,11,.2)" },
  EMITIDA: { label: "Emitida", bg: t.greenGlow, color: t.green, border: "rgba(16,185,129,.2)" },
  CANCELADA: { label: "Cancelada", bg: t.redGlow, color: t.red, border: "rgba(239,68,68,.2)" },
};

function Badge({ status }: { status: Status }) {
  const c = statusCfg[status] ?? { label: status, bg: "rgba(100,100,100,.1)", color: t.textDim, border: t.border };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ─── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ ...styles.label, marginBottom: 2 }}>
        {label}{required && <span style={{ color: t.red, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <span style={styles.errMsg}>⚠ {error}</span>}
    </div>
  );
}

// ─── StatCard ───────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ ...styles.card, padding: "16px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ ...styles.label, marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>{value}</p>
          {sub && <p style={{ ...styles.muted, marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ padding: 9, borderRadius: 9, background: `${color}18`, color }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error" | "info"; onClose: () => void }) {
  const colors = { success: t.green, error: t.red, info: t.accent };
  const c = colors[type];
  useEffect(() => { const id = setTimeout(onClose, 4000); return () => clearTimeout(id); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: t.surface, border: `1px solid ${c}40`, borderLeft: `3px solid ${c}`, borderRadius: 10, padding: "12px 16px", minWidth: 300, maxWidth: 420, display: "flex", alignItems: "center", gap: 10, boxShadow: `0 8px 32px rgba(0,0,0,.5)`, animation: "slideIn .25s ease" }}>
      <span style={{ color: c, flexShrink: 0 }}>{type === "success" ? Icon.check : type === "error" ? Icon.ban : Icon.receipt}</span>
      <span style={{ fontSize: 13, color: t.text, flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", padding: 2 }}>{Icon.x}</button>
    </div>
  );
}

// ─── EMPTY ITEM ─────────────────────────────────────────────────────────────────
const EMPTY_ITEM: ItemNotaInput = { produtoId: "", descricao: "", codigo: "", ncm: "", cfop: "5102", unidade: "UN", quantidade: 1, valorUnitario: 0, desconto: 0, icms: 0, pis: 0, cofins: 0 };

// ─── CSV Parser ─────────────────────────────────────────────────────────────────
function parseCsv(text: string): ItemNotaInput[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (...keys: string[]) => { for (const k of keys) { const i = header.indexOf(k); if (i >= 0) return i; } return -1; };
  const iDesc = find("descricao", "descricao", "produto", "nome", "item");
  const iQty = find("quantidade", "qty", "qtd", "quant");
  const iUnit = find("valorunitario", "preco", "valor", "price", "unitario");
  const iCod = find("codigo", "cod", "sku", "code");
  const iNcm = find("ncm");
  const iCfop = find("cfop");
  const iUnd = find("unidade", "und", "un", "unit");
  const iDesc2 = find("desconto", "discount", "desc");
  const iIcms = find("icms");
  const iPis = find("pis");
  const iCofins = find("cofins");

  return lines.slice(1).filter(l => l.trim()).map((line, idx) => {
    const cols = line.split(/[;,]/).map(c => c.trim().replace(/^["']|["']$/g, ""));
    const get = (i: number) => i >= 0 ? cols[i] ?? "" : "";
    const getNum = (i: number) => parseFloat(get(i).replace(",", ".")) || 0;
    return {
      produtoId: `csv-${idx + 1}-${Date.now()}`,
      descricao: get(iDesc) || `Item ${idx + 1}`,
      codigo: get(iCod),
      ncm: get(iNcm),
      cfop: get(iCfop) || "5102",
      unidade: get(iUnd) || "UN",
      quantidade: getNum(iQty) || 1,
      valorUnitario: getNum(iUnit),
      desconto: getNum(iDesc2),
      icms: getNum(iIcms),
      pis: getNum(iPis),
      cofins: getNum(iCofins),
    };
  }).filter(i => i.descricao);
}

// ─── Upload Panel ───────────────────────────────────────────────────────────────
function UploadPanel({ onItems }: { onItems: (items: ItemNotaInput[]) => void }) {
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<ItemNotaInput[]>([]);
  const ref = useRef<HTMLInputElement>(null);

  const process = (file: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "txt"].includes(ext ?? "")) {
      setStatus("error"); setMsg("Formato não suportado. Use CSV ou TXT."); return;
    }
    setStatus("processing"); setMsg("Processando arquivo...");
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      try {
        const items = parseCsv(text);
        if (!items.length) { setStatus("error"); setMsg("Nenhum item encontrado. Verifique o formato do arquivo."); return; }
        setPreview(items);
        setStatus("done");
        setMsg(`${items.length} ${items.length === 1 ? "item encontrado" : "itens encontrados"} — clique em "Usar Itens" para continuar`);
      } catch (err) {
        setStatus("error"); setMsg("Erro ao processar o arquivo.");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) process(f); };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDrag(true); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDrag(false)}
        onClick={() => ref.current?.click()}
        style={{ border: `2px dashed ${drag ? t.accent : t.border}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: drag ? t.accentGlow : "transparent", transition: "all .2s" }}
      >
        <input ref={ref} type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) process(f); e.target.value = ""; }} />
        <div style={{ color: drag ? t.accent : t.textDim, marginBottom: 8 }}>{Icon.upload}</div>
        <p style={{ fontSize: 13, color: drag ? t.accent : t.textDim, margin: 0 }}>
          {drag ? "Solte o arquivo aqui" : "Arraste um CSV ou clique para selecionar"}
        </p>
        <p style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>Suporte: CSV e TXT com separador ; ou ,</p>
      </div>

      {/* Modelo CSV */}
      <div style={{ ...styles.inner, padding: 12 }}>
        <p style={{ ...styles.label, marginBottom: 6, color: t.accent }}>Modelo de CSV aceito</p>
        <code style={{ fontSize: 10, color: t.textDim, display: "block", lineHeight: 1.8, fontFamily: "monospace" }}>
          descricao;quantidade;valorUnitario;codigo;ncm;cfop;unidade;desconto;icms;pis;cofins<br />
          Produto A;2;150.00;SKU001;8471.30.12;5102;UN;0;12;0.65;3<br />
          Serviço B;1;500.00;;;;SV;;5;0.65;3
        </code>
      </div>

      {/* Status */}
      {status !== "idle" && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: status === "done" ? t.greenGlow : status === "error" ? t.redGlow : t.accentGlow, border: `1px solid ${status === "done" ? "rgba(16,185,129,.25)" : status === "error" ? "rgba(239,68,68,.25)" : "rgba(59,130,246,.25)"}`, fontSize: 12, color: status === "done" ? t.green : status === "error" ? "#F87171" : t.accent, display: "flex", alignItems: "center", gap: 8 }}>
          {status === "processing" ? Icon.spinner : status === "done" ? Icon.check : Icon.ban}
          {msg}
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div style={{ ...styles.inner, overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ ...styles.label, margin: 0 }}>Pré-visualização ({preview.length} itens)</p>
            <button onClick={() => { onItems(preview); setPreview([]); setStatus("idle"); setMsg(""); }}
              style={{ ...styles.btnSuccess, padding: "5px 12px", fontSize: 12 }}>
              {Icon.check} Usar Itens
            </button>
          </div>
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  {["Descrição", "Qtd", "Valor Unit.", "Desconto%", "Total"].map(h => (
                    <th key={h} style={{ padding: "6px 10px", textAlign: "left", ...styles.label }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((item, i) => {
                  const total = item.quantidade * item.valorUnitario * (1 - item.desconto / 100);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${t.border}20` }}>
                      <td style={{ padding: "6px 10px", color: t.text }}>{item.descricao}</td>
                      <td style={{ padding: "6px 10px", color: t.textDim }}>{item.quantidade}</td>
                      <td style={{ padding: "6px 10px", color: t.textDim }}>{fmt(item.valorUnitario)}</td>
                      <td style={{ padding: "6px 10px", color: t.textDim }}>{item.desconto}%</td>
                      <td style={{ padding: "6px 10px", color: t.green, fontWeight: 600 }}>{fmt(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Item Row ───────────────────────────────────────────────────────────────────
function ItemRow({ item, idx, errors, touched, onChange, onRemove, onTouch }: {
  item: ItemNotaInput; idx: number; errors: Record<string, string>; touched: Record<string, boolean>;
  onChange: (i: number, f: keyof ItemNotaInput, v: string | number) => void;
  onRemove: (i: number) => void; onTouch: (i: number, f: string) => void;
}) {
  const total = item.quantidade * item.valorUnitario * (1 - item.desconto / 100);
  const e = (f: string) => touched[`${idx}.${f}`] ? errors[`${idx}.${f}`] : undefined;
  const blur = (f: string) => () => onTouch(idx, f);

  return (
    <div style={{ ...styles.inner, padding: 14, position: "relative" }}>
      <button type="button" onClick={() => onRemove(idx)} style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: t.textMuted }}>
        {Icon.x}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, paddingRight: 28, marginBottom: 8 }}>
        <Field label="Descrição" required error={e("descricao")}>
          <input style={styles.input(!!e("descricao"))} value={item.descricao} onChange={ev => onChange(idx, "descricao", ev.target.value)} onBlur={blur("descricao")} placeholder="Nome do produto/serviço" />
        </Field>
        <Field label="Código">
          <input style={styles.input()} value={item.codigo} onChange={ev => onChange(idx, "codigo", ev.target.value)} placeholder="SKU" />
        </Field>
        <Field label="NCM" error={e("ncm")}>
          <input style={styles.input(!!e("ncm"))} value={item.ncm} onChange={ev => onChange(idx, "ncm", ev.target.value)} onBlur={blur("ncm")} placeholder="0000.00.00" />
        </Field>
        <Field label="CFOP" required error={e("cfop")}>
          <input style={styles.input(!!e("cfop"))} value={item.cfop} onChange={ev => onChange(idx, "cfop", ev.target.value)} onBlur={blur("cfop")} placeholder="5102" maxLength={4} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: 8, paddingRight: 28 }}>
        <Field label="Unidade" required error={e("unidade")}>
          <input style={styles.input(!!e("unidade"))} value={item.unidade} onChange={ev => onChange(idx, "unidade", ev.target.value)} onBlur={blur("unidade")} placeholder="UN" maxLength={6} />
        </Field>
        <Field label="Qtd" required error={e("quantidade")}>
          <input style={styles.input(!!e("quantidade"))} type="number" min="0.001" step="0.001" value={item.quantidade} onChange={ev => onChange(idx, "quantidade", parseFloat(ev.target.value) || 0)} onBlur={blur("quantidade")} />
        </Field>
        <Field label="Valor Unit." required error={e("valorUnitario")}>
          <input style={styles.input(!!e("valorUnitario"))} type="number" min="0" step="0.01" value={item.valorUnitario} onChange={ev => onChange(idx, "valorUnitario", parseFloat(ev.target.value) || 0)} onBlur={blur("valorUnitario")} />
        </Field>
        <Field label="Desc. %">
          <input style={styles.input()} type="number" min="0" max="100" step="0.01" value={item.desconto} onChange={ev => onChange(idx, "desconto", parseFloat(ev.target.value) || 0)} />
        </Field>
        <Field label="ICMS %">
          <input style={styles.input()} type="number" min="0" max="100" step="0.01" value={item.icms} onChange={ev => onChange(idx, "icms", parseFloat(ev.target.value) || 0)} />
        </Field>
        <Field label="PIS % / COFINS %">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <input style={styles.input()} type="number" min="0" max="100" step="0.01" value={item.pis} onChange={ev => onChange(idx, "pis", parseFloat(ev.target.value) || 0)} placeholder="PIS" />
            <input style={styles.input()} type="number" min="0" max="100" step="0.01" value={item.cofins} onChange={ev => onChange(idx, "cofins", parseFloat(ev.target.value) || 0)} placeholder="COF" />
          </div>
        </Field>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
        <span style={{ fontSize: 11, color: t.textMuted }}>Item {idx + 1}</span>
        <span style={{ fontSize: 12, color: t.textDim }}>Total: <strong style={{ color: t.green }}>{fmt(total)}</strong></span>
      </div>
    </div>
  );
}

// ─── Validate ───────────────────────────────────────────────────────────────────
function validateItens(itens: ItemNotaInput[]): Record<string, string> {
  const errs: Record<string, string> = {};
  itens.forEach((item, idx) => {
    if (!item.descricao.trim()) errs[`${idx}.descricao`] = "Obrigatório";
    if (!V.cfop(item.cfop)) errs[`${idx}.cfop`] = "4 dígitos";
    if (!item.unidade.trim()) errs[`${idx}.unidade`] = "Obrigatório";
    if (!V.positivo(item.quantidade)) errs[`${idx}.quantidade`] = "> 0";
    if (item.valorUnitario < 0) errs[`${idx}.valorUnitario`] = "≥ 0";
    if (!V.pct(item.desconto)) errs[`${idx}.desconto`] = "0–100%";
    if (item.ncm && !V.ncm(item.ncm)) errs[`${idx}.ncm`] = "Formato inválido";
  });
  return errs;
}

function validateStep1(f: { clienteNome: string; cpfCnpj: string; email: string; cep: string; estado: string }): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.clienteNome.trim()) e.clienteNome = "Nome obrigatório";
  if (f.cpfCnpj.trim() && !V.cpfOuCnpj(f.cpfCnpj)) e.cpfCnpj = "CPF/CNPJ inválido";
  if (f.email.trim() && !V.email(f.email)) e.email = "E-mail inválido";
  if (f.cep.trim() && !V.cep(f.cep)) e.cep = "CEP inválido";
  if (f.estado.trim() && f.estado.trim().length !== 2) e.estado = "2 letras";
  return e;
}

// ─── Modal DANFE ─────────────────────────────────────────────────────────────────
function ModalDanfe({ danfe, onClose }: { danfe: DanfeData; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyChave = () => {
    if (danfe.cabecalho?.chaveAcesso) { navigator.clipboard.writeText(danfe.cabecalho.chaveAcesso); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const { cabecalho: cab, emitente: emit, destinatario: dest, itens, totais, pagamento: pgto } = danfe;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,.88)", backdropFilter: "blur(8px)" }}>
      <div style={{ ...styles.card, width: "100%", maxWidth: 800, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,.7)" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${t.accent}18, ${t.purple}12)`, borderBottom: `1px solid ${t.border}`, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: 8, background: `${t.accent}20`, borderRadius: 8, color: t.accent }}>{Icon.danfe}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{cab?.titulo ?? "DANFE"}</p>
              <p style={{ ...styles.muted, margin: 0 }}>Nº {cab?.numero} · Modelo {cab?.modelo} · Série {cab?.serie}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Badge status={cab?.status as Status} />
            {danfe.urlConsulta && (
              <a href={danfe.urlConsulta} target="_blank" rel="noopener noreferrer" style={{ ...styles.btnGhost, padding: "6px 10px", textDecoration: "none", fontSize: 11 }}>
                {Icon.link} SEFAZ
              </a>
            )}
            <button onClick={onClose} style={{ ...styles.btnGhost, padding: 7, border: "none", color: t.textMuted }}>{Icon.x}</button>
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Emitente / Destinatário */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[{ title: "Emitente", d: emit, fields: [["Razão Social", "razaoSocial"], ["CNPJ", "cnpj"], ["IE", "inscricaoEstadual"], ["Endereço", "endereco"], ["Cidade/UF", (d: any) => d.cidade && d.estado ? `${d.cidade} / ${d.estado}` : d.cidade], ["CEP", "cep"], ["Telefone", "telefone"], ["E-mail", "email"]] },
              { title: "Destinatário", d: dest, fields: [["Nome", "nome"], ["CPF/CNPJ", "cpfCnpj"], ["E-mail", "email"], ["Telefone", "telefone"], ["Endereço", "endereco"], ["Cidade/UF", (d: any) => d.cidade && d.estado ? `${d.cidade} / ${d.estado}` : d.cidade], ["CEP", "cep"]] }
            ].map(({ title, d, fields }) => (
              <div key={title} style={{ ...styles.inner, padding: 14 }}>
                <p style={{ ...styles.label, color: t.accent, marginBottom: 10 }}>{title}</p>
                {fields.map(([label, key]) => {
                  const val = typeof key === "function" ? key(d) : d?.[key as string];
                  if (!val) return null;
                  return (
                    <div key={label as string} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: t.textMuted, minWidth: 80, flexShrink: 0 }}>{label as string}:</span>
                      <span style={{ fontSize: 11, color: t.text, wordBreak: "break-all" }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Itens */}
          {itens?.length > 0 && (
            <div style={{ ...styles.inner, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between" }}>
                <p style={{ ...styles.label, margin: 0 }}>Itens da Nota ({itens.length})</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                      {["#", "Descrição", "NCM", "CFOP", "Un", "Qtd", "V.Unit.", "Desc%", "ICMS%", "Total"].map((h, i) => (
                        <th key={h} style={{ padding: "7px 10px", textAlign: i > 4 ? "right" : "left", ...styles.label, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map((item: any, i: number) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${t.border}20` }}>
                        <td style={{ padding: "7px 10px", color: t.textMuted }}>{item.sequencia}</td>
                        <td style={{ padding: "7px 10px", color: t.text, maxWidth: 160 }}>
                          <div style={{ fontWeight: 500 }}>{item.descricao}</div>
                          {item.codigo && <div style={{ color: t.textMuted, fontSize: 10 }}>{item.codigo}</div>}
                        </td>
                        <td style={{ padding: "7px 10px", color: t.textDim, fontFamily: "monospace" }}>{item.ncm ?? "—"}</td>
                        <td style={{ padding: "7px 10px", color: t.textDim, fontFamily: "monospace" }}>{item.cfop}</td>
                        <td style={{ padding: "7px 10px", color: t.textDim }}>{item.unidade}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: t.textDim }}>{fmtNum(item.quantidade, 3)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: t.textDim }}>{fmt(item.valorUnitario)}</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: item.desconto > 0 ? t.amber : t.textMuted }}>{fmtNum(item.desconto)}%</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: t.textDim }}>{fmtNum(item.icms)}%</td>
                        <td style={{ padding: "7px 10px", textAlign: "right", color: t.green, fontWeight: 700 }}>{fmt(item.valorTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tributos + Totais */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ ...styles.inner, padding: 14 }}>
              <p style={{ ...styles.label, color: t.amber, marginBottom: 10 }}>Resumo de Tributos</p>
              {[["Base ICMS", fmt(totais?.totalIcms ?? 0)], ["Total PIS", fmt(totais?.totalPis ?? 0)], ["Total COFINS", fmt(totais?.totalCofins ?? 0)]].map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: t.textDim }}>{l}</span>
                  <span style={{ fontSize: 12, color: t.amber }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ ...styles.inner, padding: 14 }}>
              <p style={{ ...styles.label, marginBottom: 10 }}>Totais da Nota</p>
              {[["Subtotal", fmt(totais?.subtotal ?? 0), t.textDim], [`Desconto (${fmtNum(totais?.pctDesconto ?? 0)}%)`, `-${fmt(totais?.valorDesconto ?? 0)}`, t.red], [`Impostos (${fmtNum(totais?.pctImpostos ?? 0)}%)`, `+${fmt(totais?.valorImpostos ?? 0)}`, t.amber]].map(([l, v, c]) => (
                <div key={l as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: t.textDim }}>{l}</span>
                  <span style={{ fontSize: 12, color: c as string }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: t.green }}>{fmt(totais?.totalNota ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div style={{ ...styles.inner, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...styles.muted }}>Forma de Pagamento</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{pgto?.formaLabel}</span>
          </div>

          {/* Chave de acesso */}
          {danfe.chaveFormatada && (
            <div style={{ ...styles.inner, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ ...styles.label, margin: 0, color: t.accent }}>Chave de Acesso (44 dígitos)</p>
                <button onClick={copyChave} style={{ ...styles.btnGhost, padding: "4px 8px", fontSize: 11, gap: 4 }}>
                  {copied ? Icon.check : Icon.copy} {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
              <code style={{ fontFamily: "monospace", fontSize: 11, color: t.green, wordBreak: "break-all", lineHeight: 1.8, display: "block", letterSpacing: ".05em" }}>
                {danfe.chaveFormatada}
              </code>
              {cab?.protocolo && (
                <p style={{ ...styles.muted, marginTop: 6 }}>Protocolo: <strong style={{ color: t.text }}>{cab.protocolo}</strong></p>
              )}
              {cab?.dataEmissao && (
                <p style={{ ...styles.muted, marginTop: 4 }}>Data de Emissão: <strong style={{ color: t.text }}>{cab.dataEmissao}</strong></p>
              )}
            </div>
          )}

          {/* Observações */}
          {danfe.observacoes && (
            <div style={{ ...styles.inner, padding: 14 }}>
              <p style={{ ...styles.label, marginBottom: 6 }}>Informações Complementares</p>
              <p style={{ fontSize: 12, color: t.textDim, margin: 0, lineHeight: 1.6 }}>{danfe.observacoes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal Detalhes ─────────────────────────────────────────────────────────────
function ModalDetalhes({ nota, onClose, onEmitir, onCancelar, onVerDanfe }: {
  nota: NotaFiscal; onClose: () => void;
  onEmitir: (id: string) => Promise<void>;
  onCancelar: (id: string, motivo: string) => Promise<void>;
  onVerDanfe: (id: string) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [motivoErr, setMotErr] = useState("");
  const [showCancel, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancelar = async () => {
    if (!motivo.trim() || motivo.trim().length < 5) { setMotErr("Mínimo 5 caracteres"); return; }
    setLoading(true);
    try { await onCancelar(nota.id, motivo); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,.85)", backdropFilter: "blur(6px)" }}>
      <div style={{ ...styles.card, width: "100%", maxWidth: 660, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,.7)" }}>

        {/* Header */}
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: 8, background: t.accentGlow, borderRadius: 8, color: t.accent }}>{Icon.receipt}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{nota.numero}</p>
              <p style={{ ...styles.muted, margin: 0 }}>{tipoLabel[nota.tipo]} · {nota.empresaNome ?? nota.empresaId}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge status={nota.status} />
            <button onClick={onClose} style={{ ...styles.btnGhost, padding: 6, border: "none", color: t.textMuted }}>{Icon.x}</button>
          </div>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Emissor / Destinatário */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[{ l: "Emissor", name: nota.empresaNome ?? nota.empresaId, sub: nota.empresaCnpj, city: nota.empresaCidade && nota.empresaEstado ? `${nota.empresaCidade} / ${nota.empresaEstado}` : undefined },
              { l: "Destinatário", name: nota.clienteNome, sub: nota.clienteCpfCnpj, city: nota.clienteCidade && nota.clienteEstado ? `${nota.clienteCidade} / ${nota.clienteEstado}` : undefined }
            ].map(({ l, name, sub, city }) => (
              <div key={l} style={{ ...styles.inner, padding: 14 }}>
                <p style={{ ...styles.label, color: t.accent, marginBottom: 8 }}>{l}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0 }}>{name}</p>
                {sub && <p style={{ ...styles.muted, marginTop: 3 }}>{sub}</p>}
                {city && <p style={{ ...styles.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: t.textMuted }}>{Icon.location}</span>{city}</p>}
              </div>
            ))}
          </div>

          {/* Itens */}
          {nota.itens && nota.itens.length > 0 && (
            <div style={{ ...styles.inner, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", borderBottom: `1px solid ${t.border}` }}>
                <p style={{ ...styles.label, margin: 0 }}>Itens ({nota.itens.length})</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    {["Descrição", "Qtd", "Unit.", "Desc%", "Total"].map((h, i) => (
                      <th key={h} style={{ padding: "7px 12px", textAlign: i > 0 ? "right" : "left", ...styles.label }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nota.itens.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < nota.itens!.length - 1 ? `1px solid ${t.border}20` : "none" }}>
                      <td style={{ padding: "8px 12px", fontSize: 12, color: t.text }}>
                        {item.descricao}
                        {item.codigo && <span style={{ color: t.textMuted, marginLeft: 6, fontSize: 10 }}>({item.codigo})</span>}
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: t.textDim }}>{fmtNum(item.quantidade, 3)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: t.textDim }}>{fmt(item.valorUnitario)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: t.textDim }}>{item.desconto ?? 0}%</td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 12, color: t.green, fontWeight: 700 }}>{fmt(item.valorTotal ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totais */}
          <div style={{ ...styles.inner, padding: 14 }}>
            {[["Subtotal", fmt(nota.subtotal), t.textDim], [`Desconto (${nota.desconto}%)`, `-${fmt(nota.valorDesconto)}`, t.red], [`Impostos (${nota.impostos}%)`, `+${fmt(nota.valorImpostos)}`, t.amber]].map(([l, v, c]) => (
              <div key={l as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: t.textDim }}>{l}</span>
                <span style={{ fontSize: 12, color: c as string }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: t.green }}>{fmt(nota.total)}</span>
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[{ l: "Pagamento", v: pgtoLabel[nota.formaPagamento] }, { l: "Criado em", v: fmtDateTime(nota.createdAt) }, ...(nota.dataEmissao ? [{ l: "Emitido em", v: fmtDateTime(nota.dataEmissao) }] : []), ...(nota.vendaId ? [{ l: "Venda Ref.", v: nota.vendaId }] : [])].map(row => (
              <div key={row.l} style={{ ...styles.inner, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={styles.muted}>{row.l}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: t.text }}>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Chave de acesso */}
          {nota.chaveAcesso && (
            <div style={{ ...styles.inner, padding: 14 }}>
              <p style={{ ...styles.label, color: t.accent, marginBottom: 6 }}>Chave de Acesso</p>
              <code style={{ fontFamily: "monospace", fontSize: 10, color: t.green, wordBreak: "break-all", lineHeight: 1.8 }}>
                {nota.chaveAcesso.match(/.{1,4}/g)?.join(" ")}
              </code>
              {nota.protocolo && <p style={{ ...styles.muted, marginTop: 4 }}>Protocolo: {nota.protocolo}</p>}
            </div>
          )}

          {/* Cancelamento */}
          {nota.status === "CANCELADA" && nota.motivoCancelamento && (
            <div style={{ background: t.redGlow, border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: 14 }}>
              <p style={{ ...styles.label, color: t.red, marginBottom: 6 }}>Motivo do Cancelamento</p>
              <p style={{ fontSize: 12, color: "#FCA5A5", margin: 0 }}>{nota.motivoCancelamento}</p>
              {nota.dataCancelamento && <p style={{ ...styles.muted, marginTop: 4 }}>Cancelado em: {fmtDateTime(nota.dataCancelamento)}</p>}
            </div>
          )}

          {/* Ações */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
            {nota.status === "EMITIDA" && (
              <button onClick={() => onVerDanfe(nota.id)} style={{ ...styles.btnGhost, borderColor: `${t.accent}40`, color: t.accent }}>
                {Icon.danfe} Ver DANFE
              </button>
            )}
            {nota.status === "RASCUNHO" && (
              <button disabled={loading} onClick={async () => { setLoading(true); try { await onEmitir(nota.id); } finally { setLoading(false); } }}
                style={{ ...styles.btnSuccess, opacity: loading ? .6 : 1 }}>
                {loading ? Icon.spinner : Icon.check} {loading ? "Emitindo..." : "Emitir Nota"}
              </button>
            )}
            {nota.status === "EMITIDA" && !showCancel && (
              <button onClick={() => setShow(true)} style={styles.btnDanger}>{Icon.ban} Cancelar</button>
            )}
            {showCancel && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input style={{ ...styles.input(!!motivoErr), flex: 1 }} placeholder="Motivo do cancelamento (mín. 5 caracteres)…" value={motivo}
                    onChange={e => { setMotivo(e.target.value); setMotErr(""); }} autoFocus />
                  <button disabled={loading} onClick={handleCancelar}
                    style={{ ...styles.btnDanger, background: t.red, color: "#fff", border: "none", opacity: loading ? .5 : 1, flexShrink: 0 }}>
                    {loading ? Icon.spinner : "Confirmar"}
                  </button>
                  <button onClick={() => { setShow(false); setMotivo(""); setMotErr(""); }} style={{ ...styles.btnGhost, flexShrink: 0 }}>Voltar</button>
                </div>
                {motivoErr && <span style={styles.errMsg}>⚠ {motivoErr}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Criar ─────────────────────────────────────────────────────────────────
const STEPS = ["Destinatário", "Itens", "Financeiro"];

function ModalCriar({ empresaId, onClose, onCreate, showToast }: {
  empresaId: string; onClose: () => void; onCreate: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoad] = useState(false);
  const [submitErr, setErr] = useState("");
  const [activeTab, setActiveTab] = useState<"manual" | "upload">("manual");

  // Step 1
  const [tipo, setTipo] = useState<TipoNota>("NFe");
  const [clienteNome, setNome] = useState("");
  const [cpfCnpj, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEnd] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [loadingCnpj, setLoadingCnpj] = useState(false);

  // Step 2
  const [itens, setItens] = useState<ItemNotaInput[]>([{ ...EMPTY_ITEM }]);
  const [itensTouched, setItensTouched] = useState<Record<string, boolean>>({});

  // Step 3
  const [desconto, setDesconto] = useState(0);
  const [impostos, setImpostos] = useState(0);
  const [formaPagamento, setForma] = useState<FormaPagamento>("PIX");
  const [observacoes, setObs] = useState("");

  const [touched1, setTouched1] = useState<Record<string, boolean>>({});

  const errs1 = validateStep1({ clienteNome, cpfCnpj, email, cep, estado });
  const errsI = validateItens(itens);
  const e1 = (f: string) => touched1[f] ? errs1[f] : undefined;
  const t1 = (f: string) => () => setTouched1(p => ({ ...p, [f]: true }));

  const touchAllStep1 = () => { const a: any = {}; ["clienteNome", "cpfCnpj", "email", "cep", "estado"].forEach(k => a[k] = true); setTouched1(a); };
  const touchAllItens = () => { const a: any = {}; itens.forEach((_, idx) => ["descricao", "cfop", "unidade", "quantidade", "valorUnitario", "desconto", "ncm"].forEach(f => { a[`${idx}.${f}`] = true; })); setItensTouched(a); };

  const buscarCep = async () => {
    const c = cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    setLoadingCep(true);
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cep/${c}`);
      setEnd(d.logradouro ?? ""); setCidade(d.cidade ?? ""); setEstado(d.estado ?? "");
      showToast("Endereço preenchido pelo CEP", "success");
    } catch { showToast("CEP não encontrado", "error"); }
    finally { setLoadingCep(false); }
  };

  const buscarCnpj = async () => {
    const cn = cpfCnpj.replace(/\D/g, "");
    if (cn.length !== 14) return;
    setLoadingCnpj(true);
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cnpj/${cn}`);
      if (d.nome) setNome(d.nome);
      if (d.telefone) setTel(mask.tel(d.telefone));
      if (d.email) setEmail(d.email);
      if (d.cep) setCep(mask.cep(d.cep));
      if (d.logradouro) setEnd(`${d.logradouro}${d.numero ? ", " + d.numero : ""}`);
      if (d.municipio) setCidade(d.municipio);
      if (d.uf) setEstado(d.uf.toUpperCase());
      showToast("Dados do CNPJ preenchidos", "success");
    } catch { showToast("CNPJ não encontrado", "error"); }
    finally { setLoadingCnpj(false); }
  };

  const updateItem = (idx: number, field: keyof ItemNotaInput, value: string | number) =>
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const subtotal = itens.reduce((a, it) => a + it.quantidade * it.valorUnitario * (1 - it.desconto / 100), 0);
  const valorDesc = subtotal * (desconto / 100);
  const valorImp = (subtotal - valorDesc) * (impostos / 100);
  const total = subtotal - valorDesc + valorImp;

  const tryNext = () => {
    if (step === 1) { touchAllStep1(); if (Object.keys(errs1).length > 0) return; setStep(2); }
    else if (step === 2) { touchAllItens(); if (!itens.length || Object.keys(errsI).length > 0) return; setStep(3); }
    else { handleSubmit(); }
  };

  const handleSubmit = async () => {
    setLoad(true); setErr("");
    try {
      await fetchAuth("/notas-fiscais", {
        method: "POST",
        body: JSON.stringify({
          empresaId, tipo,
          clienteNome: clienteNome.trim(),
          clienteCpfCnpj: cpfCnpj.trim() || null,
          clienteEmail: email.trim() || null,
          clienteTelefone: tel.trim() || null,
          clienteEndereco: endereco.trim() || null,
          clienteCidade: cidade.trim() || null,
          clienteEstado: estado.trim().toUpperCase() || null,
          clienteCep: cep.replace(/\D/g, "") || null,
          clienteId: null, vendaId: null,
          desconto, impostos, formaPagamento,
          observacoes: observacoes.trim() || null,
          itens: itens.map(i => ({
            produtoId: i.produtoId || crypto.randomUUID(),
            descricao: i.descricao.trim(), codigo: i.codigo.trim() || null,
            ncm: i.ncm.trim() || null, cfop: i.cfop.trim() || "5102",
            unidade: i.unidade.trim() || "UN", quantidade: i.quantidade,
            valorUnitario: i.valorUnitario, desconto: i.desconto,
            icms: i.icms, pis: i.pis, cofins: i.cofins,
          })),
        }),
      });
      showToast("Nota criada como rascunho", "success");
      onCreate(); onClose();
    } catch (e: any) { setErr(e.message); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,.85)", backdropFilter: "blur(6px)" }}>
      <div style={{ ...styles.card, width: "100%", maxWidth: 820, maxHeight: "94vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,.7)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: 8, background: t.accentGlow, borderRadius: 8, color: t.accent }}>{Icon.receipt}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Nova Nota Fiscal</p>
                <p style={{ ...styles.muted, margin: 0 }}>Passo {step} de {STEPS.length} — {STEPS[step - 1]}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ ...styles.btnGhost, padding: 6, border: "none", color: t.textMuted }}>{Icon.x}</button>
          </div>

          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, border: `2px solid ${i + 1 <= step ? t.accent : t.border}`, background: i + 1 < step ? t.accent : i + 1 === step ? t.accentGlow : "transparent", color: i + 1 < step ? "#fff" : i + 1 === step ? t.accent : t.textMuted }}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: i + 1 <= step ? t.text : t.textMuted }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i + 1 < step ? t.accent : t.border, margin: "0 10px" }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              {/* Tipo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {(["NFe", "NFS", "NFCE"] as TipoNota[]).map(tp => (
                  <button key={tp} type="button" onClick={() => setTipo(tp)} style={{ padding: "14px 0", borderRadius: 10, border: `1px solid ${tipo === tp ? t.accent : t.border}`, background: tipo === tp ? t.accentGlow : t.bg, color: tipo === tp ? t.accent : t.textMuted, cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{tipoLabel[tp]}</div>
                    <div style={{ fontSize: 10, marginTop: 3, opacity: .6 }}>{tp === "NFe" ? "Produtos" : tp === "NFS" ? "Serviços" : "Consumidor"}</div>
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="CPF / CNPJ" error={e1("cpfCnpj")}>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...styles.input(!!e1("cpfCnpj")), paddingRight: loadingCnpj ? 36 : 12 }}
                      value={cpfCnpj} onChange={ev => setCpf(mask.cpfCnpj(ev.target.value))}
                      onBlur={() => { t1("cpfCnpj")(); buscarCnpj(); }}
                      placeholder="000.000.000-00 ou CNPJ" />
                    {loadingCnpj && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: t.accent }}>{Icon.spinner}</span>}
                  </div>
                </Field>
                <Field label="Nome / Razão Social" required error={e1("clienteNome")}>
                  <input style={styles.input(!!e1("clienteNome"))} value={clienteNome}
                    onChange={ev => setNome(ev.target.value)} onBlur={t1("clienteNome")} placeholder="Nome do cliente" />
                </Field>
                <Field label="E-mail" error={e1("email")}>
                  <input style={styles.input(!!e1("email"))} type="email" value={email}
                    onChange={ev => setEmail(ev.target.value)} onBlur={t1("email")} placeholder="email@exemplo.com" />
                </Field>
                <Field label="Telefone">
                  <input style={styles.input()} value={tel} onChange={ev => setTel(mask.tel(ev.target.value))} placeholder="(00) 00000-0000" />
                </Field>
                <Field label="CEP" error={e1("cep")}>
                  <div style={{ position: "relative" }}>
                    <input style={{ ...styles.input(!!e1("cep")), paddingRight: loadingCep ? 36 : 12 }}
                      value={cep} onChange={ev => setCep(mask.cep(ev.target.value))}
                      onBlur={() => { t1("cep")(); buscarCep(); }} placeholder="00000-000" />
                    {loadingCep && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: t.accent }}>{Icon.spinner}</span>}
                  </div>
                </Field>
                <Field label="Endereço">
                  <input style={styles.input()} value={endereco} onChange={ev => setEnd(ev.target.value)} placeholder="Rua, número, bairro" />
                </Field>
                <Field label="Cidade">
                  <input style={styles.input()} value={cidade} onChange={ev => setCidade(ev.target.value)} />
                </Field>
                <Field label="UF" error={e1("estado")}>
                  <input style={styles.input(!!e1("estado"))} value={estado}
                    onChange={ev => setEstado(ev.target.value.toUpperCase().slice(0, 2))} onBlur={t1("estado")} maxLength={2} placeholder="SP" />
                </Field>
              </div>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              {/* Tabs Manual/Upload */}
              <div style={{ display: "flex", gap: 0, background: t.bg, borderRadius: 8, padding: 3, border: `1px solid ${t.border}` }}>
                {([["manual", Icon.doc, "Adicionar manualmente"], ["upload", Icon.csv, "Importar CSV"]] as const).map(([tab, icon, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "8px 0", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeTab === tab ? t.surface : "transparent", color: activeTab === tab ? t.text : t.textMuted, transition: "all .15s" }}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              {activeTab === "upload" ? (
                <UploadPanel onItems={items => { setItens(items); setActiveTab("manual"); }} />
              ) : (
                <>
                  {!itens.length && (
                    <div style={{ padding: 20, textAlign: "center", color: t.red, fontSize: 12, background: t.redGlow, borderRadius: 8, border: "1px solid rgba(239,68,68,.2)" }}>
                      ⚠ Adicione pelo menos 1 item
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {itens.map((item, idx) => (
                      <ItemRow key={idx} item={item} idx={idx} errors={errsI} touched={itensTouched}
                        onChange={updateItem} onRemove={i => setItens(prev => prev.filter((_, j) => j !== i))}
                        onTouch={(i, f) => setItensTouched(p => ({ ...p, [`${i}.${f}`]: true }))} />
                    ))}
                  </div>
                  <button type="button" onClick={() => setItens(prev => [...prev, { ...EMPTY_ITEM }])}
                    style={{ width: "100%", padding: "12px 0", border: `1px dashed ${t.border}`, borderRadius: 10, background: "transparent", color: t.textDim, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {Icon.plus} Adicionar Item
                  </button>
                </>
              )}
            </>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Desconto Geral %">
                  <input style={styles.input()} type="number" min="0" max="100" step="0.01" value={desconto} onChange={ev => setDesconto(parseFloat(ev.target.value) || 0)} />
                </Field>
                <Field label="Impostos %">
                  <input style={styles.input()} type="number" min="0" max="100" step="0.01" value={impostos} onChange={ev => setImpostos(parseFloat(ev.target.value) || 0)} />
                </Field>
                <Field label="Forma de Pagamento">
                  <select style={{ ...styles.input(), cursor: "pointer" }} value={formaPagamento} onChange={ev => setForma(ev.target.value as FormaPagamento)}>
                    {(Object.keys(pgtoLabel) as FormaPagamento[]).map(k => <option key={k} value={k} style={{ background: t.bg }}>{pgtoLabel[k]}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Observações">
                <textarea style={{ ...styles.input(), resize: "none", minHeight: 72 }} rows={3} value={observacoes} onChange={ev => setObs(ev.target.value)} placeholder="Informações complementares…" />
              </Field>

              {/* Resumo */}
              <div style={{ ...styles.inner, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.border}` }}>
                  <p style={{ ...styles.label, margin: 0 }}>Resumo da Nota ({itens.length} {itens.length === 1 ? "item" : "itens"})</p>
                </div>
                <div style={{ padding: 14 }}>
                  {[[`Subtotal`, fmt(subtotal), t.textDim], [`Desconto (${desconto}%)`, `-${fmt(valorDesc)}`, t.red], [`Impostos (${impostos}%)`, `+${fmt(valorImp)}`, t.amber]].map(([l, v, c]) => (
                    <div key={l as string} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: 12, color: t.textDim }}>{l}</span>
                      <span style={{ fontSize: 12, color: c as string }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Total</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: t.green }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {submitErr && (
            <div style={{ background: t.redGlow, border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#F87171" }}>
              ⚠ {submitErr}
            </div>
          )}

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
            <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} style={styles.btnGhost}>
              {step === 1 ? "Cancelar" : "← Voltar"}
            </button>
            <button type="button" disabled={loading} onClick={tryNext} style={{ ...styles.btnPrimary, opacity: loading ? .6 : 1 }}>
              {loading ? <>{Icon.spinner} Salvando…</> : step === 3 ? <>{Icon.check} Criar Rascunho</> : "Próximo →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function NotasFiscaisPage() {
  const { empresaAtiva } = useEmpresa();

  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCriar, setShowCriar] = useState(false);
  const [detalhe, setDetalhe] = useState<NotaFiscal | null>(null);
  const [danfeData, setDanfeData] = useState<DanfeData | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");
  const [filterTipo, setFilterTipo] = useState<TipoNota | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hovRow, setHovRow] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const empresaId = empresaAtiva ? String(empresaAtiva.id) : null;

  const showToast = useCallback((msg: string, type: "success" | "error" | "info") => {
    setToast({ msg, type });
  }, []);

  const fetchNotas = useCallback(async () => {
    if (!empresaId) { setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ empresaId, page: String(page), limit: "15", ...(filterStatus && { status: filterStatus }), ...(filterTipo && { tipo: filterTipo }), ...(search && { clienteNome: search }) });
      const d = await fetchAuth<{ data: NotaFiscal[]; pages: number; total: number }>(`/notas-fiscais?${params}`);
      setNotas(d.data ?? []); setTotalPages(d.pages ?? 1); setTotalCount(d.total ?? 0);
    } catch { setNotas([]); }
    finally { setLoading(false); }
  }, [empresaId, page, filterStatus, filterTipo, search]);

  const fetchStats = useCallback(async () => {
    if (!empresaId) return;
    try { setStats(await fetchAuth<Estatisticas>(`/notas-fiscais/stats/${empresaId}`)); } catch {}
  }, [empresaId]);

  useEffect(() => { fetchNotas(); }, [fetchNotas]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleEmitir = async (id: string) => {
    await fetchAuth(`/notas-fiscais/${id}/emitir`, { method: "PATCH" });
    showToast("Nota emitida com sucesso!", "success");
    await Promise.all([fetchNotas(), fetchStats()]);
    const d = await fetchAuth<{ nota: NotaFiscal; itens: ItemNotaFiscal[] }>(`/notas-fiscais/${id}`);
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  const handleCancelar = async (id: string, motivo: string) => {
    await fetchAuth(`/notas-fiscais/cancelar`, { method: "PATCH", body: JSON.stringify({ id, motivoCancelamento: motivo }) });
    showToast("Nota cancelada", "info");
    await Promise.all([fetchNotas(), fetchStats()]);
    setDetalhe(null);
  };

  const openDetalhe = async (id: string) => {
    try {
      const d = await fetchAuth<{ nota: NotaFiscal; itens: ItemNotaFiscal[] }>(`/notas-fiscais/${id}`);
      setDetalhe({ ...d.nota, itens: d.itens });
    } catch (e: any) { showToast(e.message, "error"); }
  };

  const openDanfe = async (id: string) => {
    try {
      const d = await fetchAuth<DanfeData>(`/notas-fiscais/${id}/danfe`);
      setDanfeData(d);
    } catch (e: any) { showToast("Erro ao carregar DANFE: " + e.message, "error"); }
  };

  const hasFilters = filterStatus || filterTipo || search;

  if (!empresaAtiva) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ color: t.border, fontSize: 48 }}>📄</div>
        <p style={{ fontSize: 14, color: t.textMuted }}>Selecione uma empresa para acessar as notas fiscais.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1C2433; border-radius: 3px; }
        input:focus, select:focus, textarea:focus { border-color: #3B82F6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-.02em" }}>Notas Fiscais</h1>
            <p style={{ ...styles.muted, marginTop: 4 }}>{empresaAtiva.nomeFantasia} · NF-e, NFS-e e NFC-e</p>
          </div>
          <button onClick={() => setShowCriar(true)} style={styles.btnPrimary}>
            {Icon.plus} Nova Nota
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            <StatCard label="Total de Notas" value={stats.total} color={t.textDim} icon={Icon.receipt} />
            <StatCard label="Emitidas" value={stats.emitidas} color={t.green} icon={Icon.check} />
            <StatCard label="Rascunhos" value={stats.rascunhos} color={t.amber} icon={Icon.doc} />
            <StatCard label="Canceladas" value={stats.canceladas} color={t.red} icon={Icon.ban} />
            <StatCard label="Faturado no Mês" value={fmt(stats.valorTotalMes)} sub="notas emitidas" color={t.accent} icon={Icon.chart} />
          </div>
        )}

        {/* Filtros */}
        <div style={{ ...styles.card, padding: "12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 340 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }}>{Icon.search}</span>
            <input style={{ ...styles.input(), paddingLeft: 32 }} placeholder="Buscar por cliente…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select style={{ ...styles.input(), width: "auto", cursor: "pointer" }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value as any); setPage(1); }}>
            {[["", "Todos os status"], ["RASCUNHO", "Rascunho"], ["EMITIDA", "Emitida"], ["CANCELADA", "Cancelada"]].map(([v, l]) => <option key={v} value={v} style={{ background: t.bg }}>{l}</option>)}
          </select>
          <select style={{ ...styles.input(), width: "auto", cursor: "pointer" }} value={filterTipo} onChange={e => { setFilterTipo(e.target.value as any); setPage(1); }}>
            {[["", "Todos os tipos"], ["NFe", "NF-e"], ["NFS", "NFS-e"], ["NFCE", "NFC-e"]].map(([v, l]) => <option key={v} value={v} style={{ background: t.bg }}>{l}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterTipo(""); setPage(1); }}
              style={{ ...styles.btnGhost, fontSize: 12, color: t.red, borderColor: "rgba(239,68,68,.25)" }}>
              {Icon.x} Limpar
            </button>
          )}
          <span style={{ marginLeft: "auto", ...styles.muted }}>
            {loading ? "…" : `${totalCount} nota${totalCount !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Tabela */}
        <div style={{ ...styles.card, overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "64px 0", color: t.textMuted }}>
              {Icon.spinner} <span style={{ fontSize: 13 }}>Carregando…</span>
            </div>
          ) : notas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ fontSize: 14, color: t.textMuted, margin: 0 }}>Nenhuma nota fiscal encontrada</p>
              <p style={{ ...styles.muted, marginTop: 4, marginBottom: 20 }}>{hasFilters ? "Tente ajustar os filtros" : "Crie sua primeira nota fiscal"}</p>
              {!hasFilters && (
                <button onClick={() => setShowCriar(true)} style={{ ...styles.btnPrimary, margin: "0 auto" }}>{Icon.plus} Nova Nota</button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                    {[["Número", false], ["Tipo", false], ["Cliente", false], ["Status", false], ["Total", true], ["Pagamento", true], ["Data", true], ["", true]].map(([h, r], i) => (
                      <th key={i} style={{ padding: "11px 16px", textAlign: r ? "right" as any : "left" as any, ...styles.label }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notas.map(nota => {
                    const hov = hovRow === nota.id;
                    return (
                      <tr key={nota.id} onClick={() => openDetalhe(nota.id)}
                        onMouseEnter={() => setHovRow(nota.id)} onMouseLeave={() => setHovRow(null)}
                        style={{ borderBottom: `1px solid ${t.border}`, background: hov ? t.surfaceHover : "transparent", cursor: "pointer", transition: "background .1s" }}>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: hov ? t.accent : t.textMuted }}>{nota.numero}</span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700, background: t.accentGlow, border: `1px solid ${t.accent}30`, color: t.accent }}>{tipoLabel[nota.tipo]}</span>
                        </td>
                        <td style={{ padding: "13px 16px", maxWidth: 220 }}>
                          <p style={{ fontSize: 13, color: t.text, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nota.clienteNome}</p>
                          {nota.clienteCpfCnpj && <p style={{ fontSize: 10, color: t.textMuted, margin: "2px 0 0" }}>{nota.clienteCpfCnpj}</p>}
                        </td>
                        <td style={{ padding: "13px 16px" }}><Badge status={nota.status} /></td>
                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: t.green }}>{fmt(nota.total)}</span>
                        </td>
                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                          <span style={{ fontSize: 12, color: t.textDim }}>{pgtoLabel[nota.formaPagamento]}</span>
                        </td>
                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                          <span style={{ fontSize: 11, color: t.textMuted }}>{fmtDate(nota.createdAt)}</span>
                        </td>
                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                          <button onClick={e => { e.stopPropagation(); openDetalhe(nota.id); }}
                            style={{ ...styles.btnGhost, padding: "4px 10px", fontSize: 11, opacity: hov ? 1 : 0, transition: "opacity .1s" }}>
                            {Icon.eye} Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ ...styles.btnGhost, opacity: page === 1 ? .3 : 1 }}>← Anterior</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: p === page ? t.accent : "transparent", color: p === page ? "#fff" : t.textDim }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ ...styles.btnGhost, opacity: page === totalPages ? .3 : 1 }}>Próximo →</button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCriar && empresaId && (
        <ModalCriar empresaId={empresaId} onClose={() => setShowCriar(false)} showToast={showToast}
          onCreate={() => { fetchNotas(); fetchStats(); }} />
      )}
      {detalhe && (
        <ModalDetalhes nota={detalhe} onClose={() => setDetalhe(null)}
          onEmitir={handleEmitir} onCancelar={handleCancelar}
          onVerDanfe={id => { setDetalhe(null); openDanfe(id); }} />
      )}
      {danfeData && <ModalDanfe danfe={danfeData} onClose={() => setDanfeData(null)} />}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}