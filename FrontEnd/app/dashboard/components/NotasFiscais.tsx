"use client";

import { useState, useEffect, useCallback } from "react";
import { useEmpresa } from "../context/Empresacontext";

// ─── Auth ─────────────────────────────────────────────────────────────────────
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
        (Array.isArray(e?.errors)
          ? e.errors.map((x: any) => x.defaultMessage ?? x.message).join("; ")
          : null) ??
        `Erro ${res.status}`,
    );
  }
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────
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
  valorTotal?: number;
}

interface NotaFiscal {
  id: string;
  numero: string;
  tipo: TipoNota;
  status: Status;
  empresaId: string;
  empresaNome: string;
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
  chaveAcesso?: string;
  protocolo?: string;
  dataEmissao?: string;
  createdAt: string;
  itens?: ItemNotaFiscal[];
  motivoCancelamento?: string;
}

interface Estatisticas {
  total: number;
  emitidas: number;
  rascunhos: number;
  canceladas: number;
  valorTotalMes: number;
}

// ─── Validators (gratuitos, sem libs) ────────────────────────────────────────
const V = {
  /** CPF: 11 dígitos, não todos iguais, dígitos verificadores válidos */
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
  /** CNPJ: 14 dígitos, dígitos verificadores válidos */
  cnpj(s: string): boolean {
    const n = s.replace(/\D/g, "");
    if (n.length !== 14 || /^(\d)\1{13}$/.test(n)) return false;
    const calc = (len: number) => {
      let sum = 0,
        pos = len - 7;
      for (let i = len; i >= 1; i--) {
        sum += +n[len - i] * pos--;
        if (pos < 2) pos = 9;
      }
      const r = sum % 11;
      return r < 2 ? 0 : 11 - r;
    };
    return calc(12) === +n[12] && calc(13) === +n[13];
  },
  /** CPF ou CNPJ */
  cpfOuCnpj(s: string): boolean {
    const n = s.replace(/\D/g, "");
    if (n.length === 11) return V.cpf(s);
    if (n.length === 14) return V.cnpj(s);
    return false;
  },
  /** CEP: 8 dígitos */
  cep(s: string): boolean {
    return /^\d{5}-?\d{3}$/.test(s.trim());
  },
  /** E-mail básico */
  email(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
  },
  /** NCM: 8 dígitos (pode ter pontos) */
  ncm(s: string): boolean {
    if (!s.trim()) return true; // opcional
    return (
      /^\d{4}\.\d{2}\.\d{2}$/.test(s.trim()) ||
      /^\d{8}$/.test(s.replace(/\D/g, ""))
    );
  },
  /** CFOP: 4 dígitos */
  cfop(s: string): boolean {
    return /^\d{4}$/.test(s.trim());
  },
  /** Número positivo */
  positivo(n: number): boolean {
    return n > 0;
  },
  /** 0–100 */
  pct(n: number): boolean {
    return n >= 0 && n <= 100;
  },
};

// Formatters de display
const mask = {
  cpfCnpj(v: string): string {
    const n = v.replace(/\D/g, "").slice(0, 14);
    if (n.length <= 11)
      return n
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        .replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3")
        .replace(/(\d{3})(\d{1,3})/, "$1.$2");
    return n
      .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
      .replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4")
      .replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3")
      .replace(/(\d{2})(\d{1,3})/, "$1.$2");
  },
  cep(v: string): string {
    const n = v.replace(/\D/g, "").slice(0, 8);
    return n.replace(/(\d{5})(\d{1,3})/, "$1-$2");
  },
  tel(v: string): string {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10)
      return n.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return n.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v ?? 0,
  );

const tipoLabel: Record<TipoNota, string> = {
  NFe: "NF-e",
  NFS: "NFS-e",
  NFCE: "NFC-e",
};
const pgtoLabel: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro",
  CARTAO_CREDITO: "Crédito",
  CARTAO_DEBITO: "Débito",
  PIX: "PIX",
  BOLETO: "Boleto",
  TRANSFERENCIA: "Transferência",
};

// ─── Design tokens GestPro ────────────────────────────────────────────────────
const g = {
  page: {
    background: "#0b0b0b",
    minHeight: "100vh",
    color: "#e5e7eb",
    fontFamily: "system-ui,-apple-system,sans-serif",
  } as React.CSSProperties,
  wrap: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 24,
  } as React.CSSProperties,
  card: {
    background: "#111111",
    border: "1px solid #1f1f1f",
    borderRadius: 12,
  } as React.CSSProperties,
  inner: {
    background: "#181818",
    border: "1px solid #1f1f1f",
    borderRadius: 10,
  } as React.CSSProperties,
  lbl: {
    fontSize: 10,
    fontWeight: 700,
    color: "#444",
    textTransform: "uppercase" as const,
    letterSpacing: ".09em",
    display: "block" as const,
  },
  muted: { fontSize: 12, color: "#555" } as React.CSSProperties,
  input: (err?: boolean): React.CSSProperties => ({
    width: "100%",
    background: "#0e0e0e",
    border: `1px solid ${err ? "#ef4444" : "#232323"}`,
    borderRadius: 8,
    padding: "9px 12px",
    color: "#e5e7eb",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  }),
  green: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 18px",
    background: "#10b981",
    border: "none",
    borderRadius: 8,
    color: "#000",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  } as React.CSSProperties,
  ghost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid #242424",
    borderRadius: 8,
    color: "#777",
    fontSize: 13,
    cursor: "pointer",
  } as React.CSSProperties,
  danger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 14px",
    background: "rgba(239,68,68,.08)",
    border: "1px solid rgba(239,68,68,.22)",
    borderRadius: 8,
    color: "#f87171",
    fontSize: 13,
    cursor: "pointer",
  } as React.CSSProperties,
  errMsg: {
    fontSize: 10,
    color: "#ef4444",
    marginTop: 3,
  } as React.CSSProperties,
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = {
  receipt: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
      />
    </svg>
  ),
  plus: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  ),
  search: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
      />
    </svg>
  ),
  check: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  ),
  eye: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  x: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  ban: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  ),
  trend: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  ),
  store: (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-3.75a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375z"
      />
    </svg>
  ),
  spinner: (
    <div
      style={{
        width: 18,
        height: 18,
        border: "2px solid #10b981",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin .7s linear infinite",
      }}
    />
  ),
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const statusCfg: Record<Status, { label: string; bg: string; color: string }> =
  {
    RASCUNHO: {
      label: "Rascunho",
      bg: "rgba(245,158,11,.12)",
      color: "#f59e0b",
    },
    EMITIDA: { label: "Emitida", bg: "rgba(16,185,129,.12)", color: "#10b981" },
    CANCELADA: {
      label: "Cancelada",
      bg: "rgba(239,68,68,.12)",
      color: "#ef4444",
    },
  };
function Badge({ status }: { status: Status }) {
  const c = statusCfg[status] ?? {
    label: status ?? "Desconhecido",
    bg: "rgba(100,100,100,.12)",
    color: "#666",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.color}28`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.color,
        }}
      />
      {c.label}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon,
  ibg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  ibg: string;
}) {
  return (
    <div style={{ ...g.card, padding: "18px 20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ ...g.lbl, marginBottom: 8 }}>{label}</p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </p>
          {sub && <p style={{ ...g.muted, marginTop: 4 }}>{sub}</p>}
        </div>
        <div
          style={{
            padding: 9,
            borderRadius: 9,
            background: ibg,
            color: "#10b981",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Field + inline error ─────────────────────────────────────────────────────
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={g.lbl}>{label}</label>
      {children}
      {error && <span style={g.errMsg}>⚠ {error}</span>}
    </div>
  );
}

// ─── EMPTY ITEM ───────────────────────────────────────────────────────────────
const EMPTY_ITEM: ItemNotaInput = {
  produtoId: "",
  descricao: "",
  codigo: "",
  ncm: "",
  cfop: "5102",
  unidade: "UN",
  quantidade: 1,
  valorUnitario: 0,
  desconto: 0,
  icms: 0,
  pis: 0,
  cofins: 0,
};

// ─── ItemRow com validação por campo ─────────────────────────────────────────
function ItemRow({
  item,
  idx,
  errors,
  onChange,
  onRemove,
  touched,
  onTouch,
}: {
  item: ItemNotaInput;
  idx: number;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onChange: (i: number, f: keyof ItemNotaInput, v: string | number) => void;
  onRemove: (i: number) => void;
  onTouch: (i: number, f: string) => void;
}) {
  const total =
    item.quantidade * item.valorUnitario * (1 - item.desconto / 100);
  const e = (f: string) =>
    touched[`${idx}.${f}`] ? errors[`${idx}.${f}`] : undefined;
  const t = (f: string) => () => onTouch(idx, f);

  return (
    <div style={{ ...g.inner, padding: 16, position: "relative" }}>
      <button
        type="button"
        onClick={() => onRemove(idx)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 26,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#555",
        }}
      >
        {Ico.x}
      </button>

      {/* Row 1 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: 10,
          paddingRight: 32,
          marginBottom: 10,
        }}
      >
        <Field label="Descrição *" error={e("descricao")}>
          <input
            style={g.input(!!e("descricao"))}
            value={item.descricao}
            onChange={(ev) => onChange(idx, "descricao", ev.target.value)}
            onBlur={t("descricao")}
            placeholder="Nome do produto/serviço"
          />
        </Field>
        <Field label="Código">
          <input
            style={g.input()}
            value={item.codigo}
            onChange={(ev) => onChange(idx, "codigo", ev.target.value)}
            placeholder="SKU"
          />
        </Field>
        <Field label="NCM" error={e("ncm")}>
          <input
            style={g.input(!!e("ncm"))}
            value={item.ncm}
            onChange={(ev) => onChange(idx, "ncm", ev.target.value)}
            onBlur={t("ncm")}
            placeholder="0000.00.00"
          />
        </Field>
        <Field label="CFOP *" error={e("cfop")}>
          <input
            style={g.input(!!e("cfop"))}
            value={item.cfop}
            onChange={(ev) => onChange(idx, "cfop", ev.target.value)}
            onBlur={t("cfop")}
            placeholder="5102"
            maxLength={4}
          />
        </Field>
      </div>

      {/* Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 10,
          paddingRight: 32,
        }}
      >
        <Field label="Unidade *" error={e("unidade")}>
          <input
            style={g.input(!!e("unidade"))}
            value={item.unidade}
            onChange={(ev) => onChange(idx, "unidade", ev.target.value)}
            onBlur={t("unidade")}
            placeholder="UN"
            maxLength={6}
          />
        </Field>
        <Field label="Quantidade *" error={e("quantidade")}>
          <input
            style={g.input(!!e("quantidade"))}
            type="number"
            min="0.001"
            step="0.001"
            value={item.quantidade}
            onChange={(ev) =>
              onChange(idx, "quantidade", parseFloat(ev.target.value) || 0)
            }
            onBlur={t("quantidade")}
          />
        </Field>
        <Field label="Valor Unit. *" error={e("valorUnitario")}>
          <input
            style={g.input(!!e("valorUnitario"))}
            type="number"
            min="0.01"
            step="0.01"
            value={item.valorUnitario}
            onChange={(ev) =>
              onChange(idx, "valorUnitario", parseFloat(ev.target.value) || 0)
            }
            onBlur={t("valorUnitario")}
          />
        </Field>
        <Field label="Desconto %" error={e("desconto")}>
          <input
            style={g.input(!!e("desconto"))}
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={item.desconto}
            onChange={(ev) =>
              onChange(idx, "desconto", parseFloat(ev.target.value) || 0)
            }
            onBlur={t("desconto")}
          />
        </Field>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid #1a1a1a",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ ...g.muted, fontSize: 11 }}>Item {idx + 1}</span>
        <span style={{ fontSize: 12, color: "#666" }}>
          Total:{" "}
          <span style={{ color: "#10b981", fontWeight: 700 }}>
            {fmt(total)}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Validate all items, returns map key "idx.field" → message ────────────────
function validateItens(itens: ItemNotaInput[]): Record<string, string> {
  const errs: Record<string, string> = {};
  itens.forEach((item, idx) => {
    if (!item.descricao.trim())
      errs[`${idx}.descricao`] = "Descrição obrigatória";
    if (!item.cfop.trim() || !V.cfop(item.cfop))
      errs[`${idx}.cfop`] = "CFOP inválido (4 dígitos)";
    if (!item.unidade.trim()) errs[`${idx}.unidade`] = "Unidade obrigatória";
    if (!V.positivo(item.quantidade))
      errs[`${idx}.quantidade`] = "Quantidade deve ser > 0";
    if (item.valorUnitario < 0)
      errs[`${idx}.valorUnitario`] = "Valor deve ser ≥ 0";
    if (!V.pct(item.desconto))
      errs[`${idx}.desconto`] = "Desconto deve ser 0–100%";
    if (item.ncm && !V.ncm(item.ncm))
      errs[`${idx}.ncm`] = "NCM inválido (ex: 0000.00.00)";
  });
  return errs;
}

// ─── Step 1 validation ───────────────────────────────────────────────────────
function validateStep1(fields: {
  clienteNome: string;
  cpfCnpj: string;
  email: string;
  tel: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
}): Record<string, string> {
  const e: Record<string, string> = {};
  if (!fields.clienteNome.trim()) e.clienteNome = "Nome do cliente obrigatório";
  if (fields.cpfCnpj.trim()) {
    if (!V.cpfOuCnpj(fields.cpfCnpj)) e.cpfCnpj = "CPF ou CNPJ inválido";
  }
  if (fields.email.trim() && !V.email(fields.email))
    e.email = "E-mail inválido";
  if (fields.cep.trim() && !V.cep(fields.cep))
    e.cep = "CEP inválido (00000-000)";
  if (fields.estado.trim() && fields.estado.trim().length !== 2)
    e.estado = "UF deve ter 2 letras";
  return e;
}

// ─── Step 3 validation ───────────────────────────────────────────────────────
function validateStep3(
  desconto: number,
  impostos: number,
): Record<string, string> {
  const e: Record<string, string> = {};
  if (!V.pct(desconto)) e.desconto = "Desconto deve ser 0–100%";
  if (!V.pct(impostos)) e.impostos = "Impostos deve ser 0–100%";
  return e;
}

// ─── Modal Detalhes ───────────────────────────────────────────────────────────
function ModalDetalhes({
  nota,
  onClose,
  onEmitir,
  onCancelar,
}: {
  nota: NotaFiscal;
  onClose: () => void;
  onEmitir: (id: string) => Promise<void>;
  onCancelar: (id: string, motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState("");
  const [motivoErr, setMotErr] = useState("");
  const [showCancel, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancelar = async () => {
    if (!motivo.trim()) {
      setMotErr("Motivo é obrigatório");
      return;
    }
    if (motivo.trim().length < 5) {
      setMotErr("Mínimo 5 caracteres");
      return;
    }
    setLoading(true);
    try {
      await onCancelar(nota.id, motivo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,.82)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          ...g.card,
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,.7)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid #181818",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                padding: 8,
                background: "rgba(16,185,129,.1)",
                borderRadius: 8,
                color: "#10b981",
              }}
            >
              {Ico.receipt}
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                }}
              >
                {nota.numero}
              </p>
              <p style={{ ...g.muted, margin: 0 }}>
                {tipoLabel[nota.tipo]} · {nota.empresaNome}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge status={nota.status} />
            <button
              onClick={onClose}
              style={{ ...g.ghost, padding: 7, border: "none", color: "#444" }}
            >
              {Ico.x}
            </button>
          </div>
        </div>

        <div
          style={{
            padding: 22,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {/* Emissor / Destinatário */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              { l: "Emissor", n: nota.empresaNome, s: undefined },
              {
                l: "Destinatário",
                n: nota.clienteNome,
                s: nota.clienteCpfCnpj,
              },
            ].map(({ l, n, s }) => (
              <div key={l} style={{ ...g.inner, padding: 14 }}>
                <p style={{ ...g.lbl, marginBottom: 8 }}>{l}</p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#e5e7eb",
                    margin: 0,
                  }}
                >
                  {n}
                </p>
                {s && <p style={{ ...g.muted, marginTop: 3 }}>{s}</p>}
                {l === "Destinatário" && nota.clienteEmail && (
                  <p style={{ ...g.muted, marginTop: 2 }}>
                    {nota.clienteEmail}
                  </p>
                )}
                {l === "Destinatário" && nota.clienteCidade && (
                  <p style={{ ...g.muted, marginTop: 2 }}>
                    {nota.clienteCidade}
                    {nota.clienteEstado ? ` / ${nota.clienteEstado}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Itens */}
          {nota.itens && nota.itens.length > 0 && (
            <div style={{ ...g.inner, overflow: "hidden" }}>
              <div
                style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <p style={{ ...g.lbl, margin: 0 }}>Itens da nota</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    {["Descrição", "Qtd", "Unit.", "Desc%", "Total"].map(
                      (h, i) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 14px",
                            textAlign: i === 0 ? "left" : ("right" as any),
                            ...g.lbl,
                          }}
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {nota.itens.map((item, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom:
                          i < nota.itens!.length - 1
                            ? "1px solid #141414"
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "9px 14px",
                          fontSize: 12,
                          color: "#e5e7eb",
                        }}
                      >
                        {item.descricao}
                        {item.codigo && (
                          <span
                            style={{
                              color: "#333",
                              marginLeft: 6,
                              fontSize: 11,
                            }}
                          >
                            ({item.codigo})
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "9px 14px",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        {item.quantidade}
                      </td>
                      <td
                        style={{
                          padding: "9px 14px",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        {fmt(item.valorUnitario)}
                      </td>
                      <td
                        style={{
                          padding: "9px 14px",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#666",
                        }}
                      >
                        {item.desconto ?? 0}%
                      </td>
                      <td
                        style={{
                          padding: "9px 14px",
                          textAlign: "right",
                          fontSize: 12,
                          color: "#10b981",
                          fontWeight: 700,
                        }}
                      >
                        {fmt(item.valorTotal ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totais */}
          <div style={{ ...g.inner, padding: 16 }}>
            {[
              { l: "Subtotal", v: fmt(nota.subtotal), c: "#666" },
              {
                l: `Desconto (${nota.desconto}%)`,
                v: `-${fmt(nota.valorDesconto)}`,
                c: "#ef4444",
              },
              {
                l: `Impostos (${nota.impostos}%)`,
                v: `+${fmt(nota.valorImpostos)}`,
                c: "#f59e0b",
              },
            ].map((row) => (
              <div
                key={row.l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 12, color: "#444" }}>{row.l}</span>
                <span style={{ fontSize: 12, color: row.c }}>{row.v}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 10,
                borderTop: "1px solid #1e1e1e",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                Total
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>
                {fmt(nota.total)}
              </span>
            </div>
          </div>

          {/* Pagamento + Data */}
          {[
            { l: "Forma de Pagamento", v: pgtoLabel[nota.formaPagamento] },
            ...(nota.dataEmissao
              ? [
                  {
                    l: "Data de Emissão",
                    v: new Date(nota.dataEmissao).toLocaleString("pt-BR"),
                  },
                ]
              : []),
          ].map((row) => (
            <div
              key={row.l}
              style={{
                ...g.inner,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={g.muted}>{row.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>
                {row.v}
              </span>
            </div>
          ))}

          {/* Chave */}
          {nota.chaveAcesso && (
            <div style={{ ...g.inner, padding: 14 }}>
              <p style={{ ...g.lbl, marginBottom: 8 }}>Chave de Acesso</p>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#10b981",
                  wordBreak: "break-all",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {nota.chaveAcesso}
              </p>
              {nota.protocolo && (
                <p style={{ ...g.muted, marginTop: 6 }}>
                  Protocolo: {nota.protocolo}
                </p>
              )}
            </div>
          )}

          {/* Cancelamento */}
          {nota.status === "CANCELADA" && nota.motivoCancelamento && (
            <div
              style={{
                background: "rgba(239,68,68,.06)",
                border: "1px solid rgba(239,68,68,.18)",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <p style={{ ...g.lbl, color: "#ef4444", marginBottom: 6 }}>
                Motivo do Cancelamento
              </p>
              <p style={{ fontSize: 12, color: "#fca5a5", margin: 0 }}>
                {nota.motivoCancelamento}
              </p>
            </div>
          )}

          {/* Ações */}
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}
          >
            {nota.status === "RASCUNHO" && (
              <button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await onEmitir(nota.id);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{ ...g.green, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? Ico.spinner : Ico.check}{" "}
                {loading ? "Emitindo..." : "Emitir Nota"}
              </button>
            )}
            {nota.status === "EMITIDA" && !showCancel && (
              <button onClick={() => setShow(true)} style={g.danger}>
                {Ico.ban} Cancelar Nota
              </button>
            )}
            {showCancel && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...g.input(!!motivoErr), flex: 1 }}
                    placeholder="Informe o motivo do cancelamento (mín. 5 caracteres)..."
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      setMotErr("");
                    }}
                    autoFocus
                  />
                  <button
                    disabled={loading}
                    onClick={handleCancelar}
                    style={{
                      ...g.green,
                      background: "#ef4444",
                      color: "#fff",
                      flexShrink: 0,
                      opacity: loading ? 0.5 : 1,
                    }}
                  >
                    {loading ? "..." : "Confirmar"}
                  </button>
                  <button
                    onClick={() => {
                      setShow(false);
                      setMotivo("");
                      setMotErr("");
                    }}
                    style={{ ...g.ghost, flexShrink: 0 }}
                  >
                    Voltar
                  </button>
                </div>
                {motivoErr && <span style={g.errMsg}>⚠ {motivoErr}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Criar ──────────────────────────────────────────────────────────────
const STEPS = ["Destinatário", "Itens", "Financeiro"];

function ModalCriar({
  empresaId,
  onClose,
  onCreate,
}: {
  empresaId: string;
  onClose: () => void;
  onCreate: () => void;
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoad] = useState(false);
  const [submitErr, setErr] = useState("");

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

  // Step 2
  const [itens, setItens] = useState<ItemNotaInput[]>([{ ...EMPTY_ITEM }]);
  const [itensTouched, setItensTouched] = useState<Record<string, boolean>>({});

  // Step 3
  const [desconto, setDesconto] = useState(0);
  const [impostos, setImpostos] = useState(0);
  const [formaPagamento, setForma] = useState<FormaPagamento>("PIX");
  const [observacoes, setObs] = useState("");

  // Touched (blur-trigger)
  const [touched1, setTouched1] = useState<Record<string, boolean>>({});
  const [touched3, setTouched3] = useState<Record<string, boolean>>({});

  // Real-time errors
  const errs1 = validateStep1({
    clienteNome,
    cpfCnpj,
    email,
    tel,
    cep,
    endereco,
    cidade,
    estado,
  });
  const errsI = validateItens(itens);
  const errs3 = validateStep3(desconto, impostos);

  const e1 = (f: string) => (touched1[f] ? errs1[f] : undefined);
  const e3 = (f: string) => (touched3[f] ? errs3[f] : undefined);
  const t1 = (f: string) => () => setTouched1((p) => ({ ...p, [f]: true }));
  const t3 = (f: string) => () => setTouched3((p) => ({ ...p, [f]: true }));

  const touchAllStep1 = () => {
    const all: Record<string, boolean> = {};
    [
      "clienteNome",
      "cpfCnpj",
      "email",
      "tel",
      "cep",
      "endereco",
      "cidade",
      "estado",
    ].forEach((k) => (all[k] = true));
    setTouched1(all);
  };
  const touchAllItens = () => {
    const all: Record<string, boolean> = {};
    itens.forEach((_, idx) => {
      [
        "descricao",
        "cfop",
        "unidade",
        "quantidade",
        "valorUnitario",
        "desconto",
        "ncm",
      ].forEach((f) => {
        all[`${idx}.${f}`] = true;
      });
    });
    setItensTouched(all);
  };
  const touchAllStep3 = () => setTouched3({ desconto: true, impostos: true });

  // CEP auto-fill
  const buscarCep = async () => {
    const c = cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cep/${c}`);
      setEnd(d.logradouro ?? "");
      setCidade(d.cidade ?? "");
      setEstado(d.estado ?? "");
    } catch {}
  };

  // CNPJ auto-fill
  const buscarCnpj = async () => {
    const cnpj = cpfCnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return;
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cnpj/${cnpj}`);
      if (d.nome) setNome(d.nome);
      if (d.telefone) setTel(mask.tel(d.telefone));
      if (d.email) setEmail(d.email);
      if (d.cep) setCep(mask.cep(d.cep));
      if (d.logradouro)
        setEnd(`${d.logradouro}${d.numero ? ", " + d.numero : ""}`);
      if (d.municipio) setCidade(d.municipio);
      if (d.uf) setEstado(d.uf.toUpperCase());
    } catch {}
  };

  const updateItem = (
    idx: number,
    field: keyof ItemNotaInput,
    value: string | number,
  ) =>
    setItens((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );

  const touchItem = (idx: number, field: string) =>
    setItensTouched((prev) => ({ ...prev, [`${idx}.${field}`]: true }));

  // Totals preview
  const subtotal = itens.reduce(
    (a, it) => a + it.quantidade * it.valorUnitario * (1 - it.desconto / 100),
    0,
  );
  const valorDesc = subtotal * (desconto / 100);
  const valorImp = (subtotal - valorDesc) * (impostos / 100);
  const total = subtotal - valorDesc + valorImp;

  const tryNext = () => {
    if (step === 1) {
      touchAllStep1();
      if (Object.keys(errs1).length > 0) return;
      setStep(2);
    } else if (step === 2) {
      touchAllItens();
      if (itens.length === 0) {
        setErr("Adicione pelo menos 1 item");
        return;
      }
      if (Object.keys(errsI).length > 0) return;
      setStep(3);
    } else {
      touchAllStep3();
      if (Object.keys(errs3).length > 0) return;
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoad(true);
    setErr("");
    try {
      const payload = {
        empresaId,
        tipo,
        clienteNome: clienteNome.trim(),
        clienteCpfCnpj: cpfCnpj.trim() || null,
        clienteEmail: email.trim() || null,
        clienteTelefone: tel.trim() || null,
        clienteEndereco: endereco.trim() || null,
        clienteCidade: cidade.trim() || null,
        clienteEstado: estado.trim().toUpperCase() || null,
        clienteCep: cep.replace(/\D/g, "") || null,
        clienteId: null,
        vendaId: null,
        desconto,
        impostos,
        formaPagamento,
        observacoes: observacoes.trim() || null,
        itens: itens.map((i) => ({
          produtoId: i.produtoId || crypto.randomUUID(),
          descricao: i.descricao.trim(),
          codigo: i.codigo.trim() || null,
          ncm: i.ncm.trim() || null,
          cfop: i.cfop.trim() || "5102",
          unidade: i.unidade.trim() || "UN",
          quantidade: i.quantidade,
          valorUnitario: i.valorUnitario,
          desconto: i.desconto,
          icms: i.icms,
          pis: i.pis,
          cofins: i.cofins,
        })),
      };

      await fetchAuth("/notas-fiscais", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onCreate();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,.82)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          ...g.card,
          width: "100%",
          maxWidth: 780,
          maxHeight: "93vh",
          overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,.7)",
        }}
      >
        {/* Header */}
        <div
          style={{ padding: "20px 24px", borderBottom: "1px solid #181818" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  padding: 8,
                  background: "rgba(16,185,129,.1)",
                  borderRadius: 8,
                  color: "#10b981",
                }}
              >
                {Ico.receipt}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  Nova Nota Fiscal
                </p>
                <p style={{ ...g.muted, margin: 0 }}>
                  Passo {step} de {STEPS.length} — {STEPS[step - 1]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ ...g.ghost, padding: 7, border: "none", color: "#444" }}
            >
              {Ico.x}
            </button>
          </div>

          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < STEPS.length - 1 ? 1 : ("none" as any),
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      transition: "all .2s",
                      border: `2px solid ${i + 1 <= step ? "#10b981" : "#222"}`,
                      background:
                        i + 1 < step
                          ? "#10b981"
                          : i + 1 === step
                            ? "rgba(16,185,129,.12)"
                            : "transparent",
                      color:
                        i + 1 < step
                          ? "#000"
                          : i + 1 === step
                            ? "#10b981"
                            : "#333",
                    }}
                  >
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: i + 1 <= step ? "#e5e7eb" : "#333",
                    }}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: i + 1 < step ? "#10b981" : "#1e1e1e",
                      margin: "0 10px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              {/* Tipo */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                {(["NFe", "NFS", "NFCE"] as TipoNota[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    style={{
                      padding: "14px 0",
                      borderRadius: 10,
                      border: `1px solid ${tipo === t ? "#10b981" : "#1e1e1e"}`,
                      background:
                        tipo === t ? "rgba(16,185,129,.08)" : "#0d0d0d",
                      color: tipo === t ? "#10b981" : "#444",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {tipoLabel[t]}
                    </div>
                    <div style={{ fontSize: 10, marginTop: 3, opacity: 0.55 }}>
                      {t === "NFe"
                        ? "Produtos"
                        : t === "NFS"
                          ? "Serviços"
                          : "Consumidor"}
                    </div>
                  </button>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {/* CPF/CNPJ — com máscara + validação */}
                <Field label="CPF / CNPJ" error={e1("cpfCnpj")}>
                  <input
                    style={g.input(!!e1("cpfCnpj"))}
                    value={cpfCnpj}
                    onChange={(ev) => setCpf(mask.cpfCnpj(ev.target.value))}
                    onBlur={() => {
                      t1("cpfCnpj")();
                      buscarCnpj();
                    }}
                    placeholder="000.000.000-00 ou 00.000.000/0001-00"
                  />
                </Field>

                <Field label="Nome do Cliente *" error={e1("clienteNome")}>
                  <input
                    style={g.input(!!e1("clienteNome"))}
                    value={clienteNome}
                    onChange={(ev) => setNome(ev.target.value)}
                    onBlur={t1("clienteNome")}
                    placeholder="Nome ou Razão Social"
                  />
                </Field>

                <Field label="E-mail" error={e1("email")}>
                  <input
                    style={g.input(!!e1("email"))}
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    onBlur={t1("email")}
                    placeholder="email@exemplo.com"
                  />
                </Field>

                <Field label="Telefone">
                  <input
                    style={g.input()}
                    value={tel}
                    onChange={(ev) => setTel(mask.tel(ev.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </Field>

                <Field label="CEP" error={e1("cep")}>
                  <input
                    style={g.input(!!e1("cep"))}
                    value={cep}
                    onChange={(ev) => setCep(mask.cep(ev.target.value))}
                    onBlur={() => {
                      t1("cep")();
                      buscarCep();
                    }}
                    placeholder="00000-000"
                  />
                </Field>

                <Field label="Endereço">
                  <input
                    style={g.input()}
                    value={endereco}
                    onChange={(ev) => setEnd(ev.target.value)}
                  />
                </Field>

                <Field label="Cidade">
                  <input
                    style={g.input()}
                    value={cidade}
                    onChange={(ev) => setCidade(ev.target.value)}
                  />
                </Field>

                <Field label="UF" error={e1("estado")}>
                  <input
                    style={g.input(!!e1("estado"))}
                    value={estado}
                    onChange={(ev) =>
                      setEstado(ev.target.value.toUpperCase().slice(0, 2))
                    }
                    onBlur={t1("estado")}
                    maxLength={2}
                    placeholder="SP"
                  />
                </Field>
              </div>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              {itens.length === 0 && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#ef4444",
                    fontSize: 12,
                    background: "rgba(239,68,68,.06)",
                    borderRadius: 8,
                    border: "1px solid rgba(239,68,68,.2)",
                  }}
                >
                  ⚠ Adicione pelo menos 1 item para continuar
                </div>
              )}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {itens.map((item, idx) => (
                  <ItemRow
                    key={idx}
                    item={item}
                    idx={idx}
                    errors={errsI}
                    touched={itensTouched}
                    onChange={updateItem}
                    onRemove={(i) =>
                      setItens((prev) => prev.filter((_, j) => j !== i))
                    }
                    onTouch={touchItem}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setItens((prev) => [...prev, { ...EMPTY_ITEM }])}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  border: "1px dashed #222",
                  borderRadius: 10,
                  background: "transparent",
                  color: "#444",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {Ico.plus} Adicionar Item
              </button>
            </>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Desconto Geral %" error={e3("desconto")}>
                  <input
                    style={g.input(!!e3("desconto"))}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={desconto}
                    onChange={(ev) =>
                      setDesconto(parseFloat(ev.target.value) || 0)
                    }
                    onBlur={t3("desconto")}
                  />
                </Field>
                <Field label="Impostos %" error={e3("impostos")}>
                  <input
                    style={g.input(!!e3("impostos"))}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={impostos}
                    onChange={(ev) =>
                      setImpostos(parseFloat(ev.target.value) || 0)
                    }
                    onBlur={t3("impostos")}
                  />
                </Field>
                <Field label="Forma de Pagamento">
                  <select
                    style={{ ...g.input(), cursor: "pointer" }}
                    value={formaPagamento}
                    onChange={(ev) =>
                      setForma(ev.target.value as FormaPagamento)
                    }
                  >
                    {(Object.keys(pgtoLabel) as FormaPagamento[]).map((k) => (
                      <option
                        key={k}
                        value={k}
                        style={{ background: "#0e0e0e" }}
                      >
                        {pgtoLabel[k]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Observações">
                <textarea
                  style={{ ...g.input(), resize: "none", minHeight: 72 }}
                  rows={3}
                  value={observacoes}
                  onChange={(ev) => setObs(ev.target.value)}
                  placeholder="Observações adicionais..."
                />
              </Field>

              {/* Resumo */}
              <div style={{ ...g.inner, overflow: "hidden" }}>
                <div
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #1a1a1a",
                  }}
                >
                  <p style={{ ...g.lbl, margin: 0 }}>Resumo da Nota</p>
                </div>
                <div
                  style={{
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      l: `Subtotal (${itens.length} ${itens.length === 1 ? "item" : "itens"})`,
                      v: fmt(subtotal),
                      c: "#666",
                    },
                    {
                      l: `Desconto (${desconto}%)`,
                      v: `-${fmt(valorDesc)}`,
                      c: "#ef4444",
                    },
                    {
                      l: `Impostos (${impostos}%)`,
                      v: `+${fmt(valorImp)}`,
                      c: "#f59e0b",
                    },
                  ].map((row) => (
                    <div
                      key={row.l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#444" }}>
                        {row.l}
                      </span>
                      <span style={{ fontSize: 12, color: row.c }}>
                        {row.v}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      borderTop: "1px solid #1e1e1e",
                    }}
                  >
                    <span
                      style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}
                    >
                      Total
                    </span>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#10b981",
                      }}
                    >
                      {fmt(total)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Erro global do submit */}
          {submitErr && (
            <div
              style={{
                background: "rgba(239,68,68,.08)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: "#f87171",
              }}
            >
              ⚠ {submitErr}
            </div>
          )}

          {/* Navegação */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 4,
            }}
          >
            <button
              type="button"
              onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose())}
              style={g.ghost}
            >
              {step === 1 ? "Cancelar" : "← Voltar"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={tryNext}
              style={{ ...g.green, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <>{Ico.spinner} Salvando...</>
              ) : step === 3 ? (
                <>{Ico.check} Criar Rascunho</>
              ) : (
                "Próximo →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function NotasFiscaisPage() {
  const { empresaAtiva } = useEmpresa();

  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCriar, setShowCriar] = useState(false);
  const [detalhe, setDetalhe] = useState<NotaFiscal | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");
  const [filterTipo, setFilterTipo] = useState<TipoNota | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hovRow, setHovRow] = useState<string | null>(null);

  const empresaId = empresaAtiva ? String(empresaAtiva.id) : null;

  const fetchNotas = useCallback(async () => {
    if (!empresaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        empresaId,
        page: String(page),
        limit: "15",
        ...(filterStatus && { status: filterStatus }),
        ...(filterTipo && { tipo: filterTipo }),
        ...(search && { clienteNome: search }),
      });
      const d = await fetchAuth<{ data: NotaFiscal[]; pages: number }>(
        `/notas-fiscais?${params}`,
      );
      setNotas(d.data ?? []);
      setTotalPages(d.pages ?? 1);
    } catch {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  }, [empresaId, page, filterStatus, filterTipo, search]);

  const fetchStats = useCallback(async () => {
    if (!empresaId) return;
    try {
      setStats(
        await fetchAuth<Estatisticas>(`/notas-fiscais/stats/${empresaId}`),
      );
    } catch {}
  }, [empresaId]);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleEmitir = async (id: string) => {
    await fetchAuth(`/notas-fiscais/${id}/emitir`, { method: "PATCH" });
    await Promise.all([fetchNotas(), fetchStats()]);
    const d = await fetchAuth<{ nota: NotaFiscal; itens: ItemNotaFiscal[] }>(
      `/notas-fiscais/${id}`,
    );
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  const handleCancelar = async (id: string, motivo: string) => {
    await fetchAuth(`/notas-fiscais/cancelar`, {
      method: "PATCH",
      body: JSON.stringify({ id, motivoCancelamento: motivo }),
    });
    await Promise.all([fetchNotas(), fetchStats()]);
    setDetalhe(null);
  };

  const openDetalhe = async (id: string) => {
    const d = await fetchAuth<{ nota: NotaFiscal; itens: ItemNotaFiscal[] }>(
      `/notas-fiscais/${id}`,
    );
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  const hasFilters = filterStatus || filterTipo || search;

  if (!empresaAtiva) {
    return (
      <div
        style={{
          ...g.page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ color: "#2a2a2a" }}>{Ico.store}</div>
        <p style={{ fontSize: 14, color: "#444" }}>
          Selecione uma empresa para ver as notas fiscais.
        </p>
      </div>
    );
  }

  return (
    <div style={g.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
      <div style={g.wrap}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                margin: 0,
              }}
            >
              Notas Fiscais
            </h1>
            <p style={{ ...g.muted, marginTop: 4 }}>
              {empresaAtiva.nomeFantasia} · NF-e, NFS-e e NFC-e
            </p>
          </div>
          <button onClick={() => setShowCriar(true)} style={g.green}>
            {Ico.plus} Nova Nota
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 12,
            }}
          >
            <StatCard
              label="Total de Notas"
              value={stats.total}
              icon={Ico.receipt}
              ibg="rgba(255,255,255,.04)"
            />
            <StatCard
              label="Emitidas"
              value={stats.emitidas}
              icon={Ico.check}
              ibg="rgba(16,185,129,.1)"
            />
            <StatCard
              label="Rascunhos"
              value={stats.rascunhos}
              icon={Ico.receipt}
              ibg="rgba(245,158,11,.1)"
            />
            <StatCard
              label="Canceladas"
              value={stats.canceladas}
              icon={Ico.ban}
              ibg="rgba(239,68,68,.1)"
            />
            <StatCard
              label="Faturado no Mês"
              value={fmt(stats.valorTotalMes)}
              icon={Ico.trend}
              ibg="rgba(16,185,129,.1)"
              sub="notas emitidas"
            />
          </div>
        )}

        {/* Filtros */}
        <div
          style={{
            ...g.card,
            padding: "12px 16px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}
          >
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#333",
                pointerEvents: "none",
              }}
            >
              {Ico.search}
            </span>
            <input
              style={{ ...g.input(), paddingLeft: 32 }}
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          {[
            {
              value: filterStatus,
              onChange: (v: string) => {
                setFilterStatus(v as any);
                setPage(1);
              },
              options: [
                { v: "", l: "Todos os status" },
                { v: "RASCUNHO", l: "Rascunho" },
                { v: "EMITIDA", l: "Emitida" },
                { v: "CANCELADA", l: "Cancelada" },
              ],
            },
            {
              value: filterTipo,
              onChange: (v: string) => {
                setFilterTipo(v as any);
                setPage(1);
              },
              options: [
                { v: "", l: "Todos os tipos" },
                { v: "NFe", l: "NF-e" },
                { v: "NFS", l: "NFS-e" },
                { v: "NFCE", l: "NFC-e" },
              ],
            },
          ].map((sel, i) => (
            <select
              key={i}
              style={{ ...g.input(), width: "auto", cursor: "pointer" }}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
            >
              {sel.options.map((o) => (
                <option key={o.v} value={o.v} style={{ background: "#0e0e0e" }}>
                  {o.l}
                </option>
              ))}
            </select>
          ))}
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setFilterStatus("");
                setFilterTipo("");
                setPage(1);
              }}
              style={{
                ...g.ghost,
                fontSize: 12,
                color: "#ef4444",
                borderColor: "rgba(239,68,68,.2)",
              }}
            >
              {Ico.x} Limpar
            </button>
          )}
        </div>

        {/* Tabela */}
        <div style={{ ...g.card, overflow: "hidden" }}>
          <div
            style={{ padding: "12px 20px", borderBottom: "1px solid #161616" }}
          >
            <span style={g.lbl}>
              {loading
                ? "Carregando..."
                : `${notas.length} nota${notas.length !== 1 ? "s" : ""} encontrada${notas.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "56px 0",
                color: "#333",
              }}
            >
              {Ico.spinner} <span style={{ fontSize: 13 }}>Carregando...</span>
            </div>
          ) : notas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  background: "#161616",
                  borderRadius: 12,
                  marginBottom: 12,
                  color: "#2a2a2a",
                }}
              >
                {Ico.receipt}
              </div>
              <p style={{ fontSize: 14, color: "#444", margin: 0 }}>
                Nenhuma nota fiscal encontrada
              </p>
              <p style={{ ...g.muted, marginTop: 4, marginBottom: 16 }}>
                {hasFilters
                  ? "Tente ajustar os filtros"
                  : "Crie sua primeira nota fiscal"}
              </p>
              {!hasFilters && (
                <button
                  onClick={() => setShowCriar(true)}
                  style={{ ...g.green, margin: "0 auto" }}
                >
                  {Ico.plus} Nova Nota
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid #161616" }}>
                    {[
                      { h: "Número", r: false },
                      { h: "Tipo", r: false },
                      { h: "Cliente", r: false },
                      { h: "Status", r: false },
                      { h: "Total", r: true },
                      { h: "Pagamento", r: true },
                      { h: "Data", r: true },
                      { h: "", r: true },
                    ].map(({ h, r }, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "10px 18px",
                          textAlign: r ? "right" : "left",
                          ...g.lbl,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notas.map((nota) => {
                    const hov = hovRow === nota.id;
                    return (
                      <tr
                        key={nota.id}
                        onClick={() => openDetalhe(nota.id)}
                        onMouseEnter={() => setHovRow(nota.id)}
                        onMouseLeave={() => setHovRow(null)}
                        style={{
                          borderBottom: "1px solid #141414",
                          background: hov ? "#151515" : "transparent",
                          cursor: "pointer",
                          transition: "background .1s",
                        }}
                      >
                        <td style={{ padding: "13px 18px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 11,
                              color: hov ? "#bbb" : "#333",
                              transition: "color .1s",
                            }}
                          >
                            {nota.numero}
                          </span>
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <span
                            style={{
                              padding: "3px 9px",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 600,
                              background: "#161616",
                              border: "1px solid #1e1e1e",
                              color: "#666",
                            }}
                          >
                            {tipoLabel[nota.tipo]}
                          </span>
                        </td>
                        <td style={{ padding: "13px 18px", maxWidth: 200 }}>
                          <p
                            style={{
                              fontSize: 13,
                              color: "#e5e7eb",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {nota.clienteNome}
                          </p>
                          {nota.clienteCpfCnpj && (
                            <p
                              style={{
                                fontSize: 10,
                                color: "#333",
                                margin: "2px 0 0",
                              }}
                            >
                              {nota.clienteCpfCnpj}
                            </p>
                          )}
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <Badge status={nota.status} />
                        </td>
                        <td
                          style={{ padding: "13px 18px", textAlign: "right" }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#10b981",
                            }}
                          >
                            {fmt(nota.total)}
                          </span>
                        </td>
                        <td
                          style={{ padding: "13px 18px", textAlign: "right" }}
                        >
                          <span style={{ fontSize: 12, color: "#444" }}>
                            {pgtoLabel[nota.formaPagamento]}
                          </span>
                        </td>
                        <td
                          style={{ padding: "13px 18px", textAlign: "right" }}
                        >
                          <span style={{ fontSize: 11, color: "#333" }}>
                            {new Date(nota.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </span>
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetalhe(nota.id);
                            }}
                            style={{
                              ...g.ghost,
                              padding: "5px 10px",
                              fontSize: 11,
                              opacity: hov ? 1 : 0,
                              transition: "opacity .1s",
                            }}
                          >
                            {Ico.eye} Ver
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ ...g.ghost, opacity: page === 1 ? 0.3 : 1 }}
            >
              ← Anterior
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  background: p === page ? "#10b981" : "transparent",
                  color: p === page ? "#000" : "#444",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ ...g.ghost, opacity: page === totalPages ? 0.3 : 1 }}
            >
              Próximo →
            </button>
          </div>
        )}
      </div>

      {showCriar && empresaId && (
        <ModalCriar
          empresaId={empresaId}
          onClose={() => setShowCriar(false)}
          onCreate={() => {
            fetchNotas();
            fetchStats();
          }}
        />
      )}
      {detalhe && (
        <ModalDetalhes
          nota={detalhe}
          onClose={() => setDetalhe(null)}
          onEmitir={handleEmitir}
          onCancelar={handleCancelar}
        />
      )}
    </div>
  );
}
