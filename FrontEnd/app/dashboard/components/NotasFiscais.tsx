"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Auth helpers ─────────────────────────────────────────────────────────────
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://gestpro-backend-production.up.railway.app";

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
      ...(opts.headers as Record<string, string> ?? {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => null);
    throw new Error(e?.mensagem ?? e?.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "RASCUNHO" | "EMITIDA" | "CANCELADA";
type TipoNota = "NFe" | "NFS" | "NFCE";
type FormaPagamento =
  | "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO"
  | "PIX" | "BOLETO" | "TRANSFERENCIA";

interface ItemNota {
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
  itens?: ItemNota[];
  motivoCancelamento?: string;
}

interface Estatisticas {
  total: number;
  emitidas: number;
  rascunhos: number;
  canceladas: number;
  valorTotalMes: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const EMPRESA_ID = "empresa-1";
const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
const tipoLabel: Record<TipoNota, string> = { NFe: "NF-e", NFS: "NFS-e", NFCE: "NFC-e" };
const pgtoLabel: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro", CARTAO_CREDITO: "Crédito", CARTAO_DEBITO: "Débito",
  PIX: "PIX", BOLETO: "Boleto", TRANSFERENCIA: "Transferência",
};

// ─── Design tokens ─────────────────────────────────────────────────────────
// Exact GestPro palette from screenshots:
// page bg:     #0b0b0b
// card bg:     #111111
// card inner:  #181818
// border:      #1f1f1f
// green:       #10b981
// text:        #e5e7eb / #888 / #444

const g = {
  page:   { background: "#0b0b0b", minHeight: "100vh", color: "#e5e7eb", fontFamily: "system-ui, -apple-system, sans-serif" } as React.CSSProperties,
  wrap:   { maxWidth: 1400, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 24 } as React.CSSProperties,
  card:   { background: "#111111", border: "1px solid #1f1f1f", borderRadius: 12 } as React.CSSProperties,
  inner:  { background: "#181818", border: "1px solid #1f1f1f", borderRadius: 10 } as React.CSSProperties,
  lbl:    { fontSize: 10, fontWeight: 700, color: "#444", textTransform: "uppercase" as const, letterSpacing: ".09em", display: "block" as const },
  muted:  { fontSize: 12, color: "#555" } as React.CSSProperties,
  input:  {
    width: "100%", background: "#0e0e0e", border: "1px solid #232323",
    borderRadius: 8, padding: "9px 12px", color: "#e5e7eb", fontSize: 13,
    outline: "none", boxSizing: "border-box" as const,
  } as React.CSSProperties,
  green:  {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "9px 18px", background: "#10b981", border: "none",
    borderRadius: 8, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer",
  } as React.CSSProperties,
  ghost:  {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "8px 14px", background: "transparent",
    border: "1px solid #242424", borderRadius: 8,
    color: "#777", fontSize: 13, cursor: "pointer",
  } as React.CSSProperties,
  danger: {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "8px 14px", background: "rgba(239,68,68,.08)",
    border: "1px solid rgba(239,68,68,.22)", borderRadius: 8,
    color: "#f87171", fontSize: 13, cursor: "pointer",
  } as React.CSSProperties,
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = {
  receipt: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>,
  plus:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>,
  search:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"/></svg>,
  check:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  eye:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  x:       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  ban:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>,
  trend:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>,
};

// ─── Badge ────────────────────────────────────────────────────────────────────
const statusCfg: Record<Status, { label: string; bg: string; color: string }> = {
  RASCUNHO:  { label: "Rascunho",  bg: "rgba(245,158,11,.12)",  color: "#f59e0b" },
  EMITIDA:   { label: "Emitida",   bg: "rgba(16,185,129,.12)",  color: "#10b981" },
  CANCELADA: { label: "Cancelada", bg: "rgba(239,68,68,.12)",   color: "#ef4444" },
};
function Badge({ status }: { status: Status }) {
  const c = statusCfg[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.color}28`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
      {c.label}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, ibg }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; ibg: string; }) {
  return (
    <div style={{ ...g.card, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...g.lbl, marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</p>
          {sub && <p style={{ ...g.muted, marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ padding: 9, borderRadius: 9, background: ibg, color: "#10b981", flexShrink: 0 }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={g.lbl}>{label}</label>
      {children}
    </div>
  );
}

// ─── ItemRow ──────────────────────────────────────────────────────────────────
const EMPTY_ITEM: ItemNota = {
  produtoId: "", descricao: "", codigo: "", ncm: "", cfop: "5102",
  unidade: "UN", quantidade: 1, valorUnitario: 0, desconto: 0, icms: 0, pis: 0, cofins: 0,
};

function ItemRow({ item, idx, onChange, onRemove }: {
  item: ItemNota; idx: number;
  onChange: (i: number, f: keyof ItemNota, v: string | number) => void;
  onRemove: (i: number) => void;
}) {
  const total = (item.quantidade ?? 0) * (item.valorUnitario ?? 0) * (1 - (item.desconto ?? 0) / 100);
  return (
    <div style={{ ...g.inner, padding: 16, position: "relative" }}>
      <button type="button" onClick={() => onRemove(idx)} style={{
        position: "absolute", top: 10, right: 10, width: 26, height: 26,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: "#444",
      }}>{Ico.x}</button>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, paddingRight: 32 }}>
        <Field label="Descrição *">
          <input style={g.input} value={item.descricao}
            onChange={e => onChange(idx, "descricao", e.target.value)} placeholder="Nome do produto/serviço" />
        </Field>
        <Field label="Código">
          <input style={g.input} value={item.codigo ?? ""} onChange={e => onChange(idx, "codigo", e.target.value)} placeholder="SKU" />
        </Field>
        <Field label="NCM">
          <input style={g.input} value={item.ncm ?? ""} onChange={e => onChange(idx, "ncm", e.target.value)} placeholder="0000.00.00" />
        </Field>
        <Field label="CFOP">
          <input style={g.input} value={item.cfop ?? "5102"} onChange={e => onChange(idx, "cfop", e.target.value)} placeholder="5102" />
        </Field>
        <Field label="Quantidade *">
          <input style={g.input} type="number" min="0.001" step="0.001" value={item.quantidade} onChange={e => onChange(idx, "quantidade", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="Valor Unit. *">
          <input style={g.input} type="number" min="0" step="0.01" value={item.valorUnitario} onChange={e => onChange(idx, "valorUnitario", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="Desconto %">
          <input style={g.input} type="number" min="0" max="100" value={item.desconto ?? 0} onChange={e => onChange(idx, "desconto", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="ICMS %">
          <input style={g.input} type="number" min="0" max="100" value={item.icms ?? 0} onChange={e => onChange(idx, "icms", parseFloat(e.target.value) || 0)} />
        </Field>
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between" }}>
        <span style={{ ...g.muted, fontSize: 11 }}>Item {idx + 1}</span>
        <span style={{ fontSize: 12, color: "#666" }}>Total: <span style={{ color: "#10b981", fontWeight: 700 }}>{fmt(total)}</span></span>
      </div>
    </div>
  );
}

// ─── Modal Detalhes ───────────────────────────────────────────────────────────
function ModalDetalhes({ nota, onClose, onEmitir, onCancelar }: {
  nota: NotaFiscal; onClose: () => void;
  onEmitir: (id: string) => Promise<void>;
  onCancelar: (id: string, motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo]         = useState("");
  const [showCancelar, setShow]     = useState(false);
  const [loading, setLoading]       = useState(false);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, background: "rgba(0,0,0,.8)", backdropFilter: "blur(8px)",
    }}>
      <div style={{
        ...g.card, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,.7)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #181818" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ padding: 8, background: "rgba(16,185,129,.1)", borderRadius: 8, color: "#10b981" }}>{Ico.receipt}</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{nota.numero}</p>
              <p style={{ ...g.muted, margin: 0 }}>{tipoLabel[nota.tipo]} · {nota.empresaNome}</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge status={nota.status} />
            <button onClick={onClose} style={{ ...g.ghost, padding: 7, border: "none", color: "#444" }}>{Ico.x}</button>
          </div>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Emissor / Destinatário */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {([
              { l: "Emissor",      n: nota.empresaNome, s: undefined },
              { l: "Destinatário", n: nota.clienteNome, s: nota.clienteCpfCnpj },
            ] as const).map(({ l, n, s }) => (
              <div key={l} style={{ ...g.inner, padding: 14 }}>
                <p style={{ ...g.lbl, marginBottom: 8 }}>{l}</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb", margin: 0 }}>{n}</p>
                {s && <p style={{ ...g.muted, marginTop: 3 }}>{s}</p>}
                {l === "Destinatário" && nota.clienteEmail && <p style={{ ...g.muted, marginTop: 2 }}>{nota.clienteEmail}</p>}
                {l === "Destinatário" && nota.clienteCidade && (
                  <p style={{ ...g.muted, marginTop: 2 }}>{nota.clienteCidade}{nota.clienteEstado ? ` / ${nota.clienteEstado}` : ""}</p>
                )}
              </div>
            ))}
          </div>

          {/* Itens */}
          {nota.itens && nota.itens.length > 0 && (
            <div style={{ ...g.inner, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
                <p style={{ ...g.lbl, margin: 0 }}>Itens da nota</p>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    {["Descrição", "Qtd", "Unit.", "Desc%", "Total"].map((h, i) => (
                      <th key={h} style={{ padding: "8px 14px", textAlign: i === 0 ? "left" : "right" as any, ...g.lbl }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nota.itens.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < nota.itens!.length - 1 ? "1px solid #141414" : "none" }}>
                      <td style={{ padding: "9px 14px", fontSize: 12, color: "#e5e7eb" }}>
                        {item.descricao}
                        {item.codigo && <span style={{ color: "#333", marginLeft: 6, fontSize: 11 }}>({item.codigo})</span>}
                      </td>
                      <td style={{ padding: "9px 14px", textAlign: "right", fontSize: 12, color: "#666" }}>{item.quantidade}</td>
                      <td style={{ padding: "9px 14px", textAlign: "right", fontSize: 12, color: "#666" }}>{fmt(item.valorUnitario)}</td>
                      <td style={{ padding: "9px 14px", textAlign: "right", fontSize: 12, color: "#666" }}>{item.desconto ?? 0}%</td>
                      <td style={{ padding: "9px 14px", textAlign: "right", fontSize: 12, color: "#10b981", fontWeight: 700 }}>{fmt(item.valorTotal ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totais */}
          <div style={{ ...g.inner, padding: 16 }}>
            {[
              { l: `Subtotal`,            v: fmt(nota.subtotal),      c: "#666" },
              { l: `Desconto (${nota.desconto}%)`, v: `-${fmt(nota.valorDesconto)}`, c: "#ef4444" },
              { l: `Impostos (${nota.impostos}%)`, v: `+${fmt(nota.valorImpostos)}`, c: "#f59e0b" },
            ].map(row => (
              <div key={row.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#444" }}>{row.l}</span>
                <span style={{ fontSize: 12, color: row.c }}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #1e1e1e" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>{fmt(nota.total)}</span>
            </div>
          </div>

          {/* Pagamento + Data */}
          {[
            { l: "Forma de Pagamento", v: pgtoLabel[nota.formaPagamento] },
            ...(nota.dataEmissao ? [{ l: "Data de Emissão", v: new Date(nota.dataEmissao).toLocaleString("pt-BR") }] : []),
          ].map(row => (
            <div key={row.l} style={{ ...g.inner, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ ...g.muted }}>{row.l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb" }}>{row.v}</span>
            </div>
          ))}

          {/* Chave de acesso */}
          {nota.chaveAcesso && (
            <div style={{ ...g.inner, padding: 14 }}>
              <p style={{ ...g.lbl, marginBottom: 8 }}>Chave de Acesso</p>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: "#10b981", wordBreak: "break-all", lineHeight: 1.7, margin: 0 }}>{nota.chaveAcesso}</p>
              {nota.protocolo && <p style={{ ...g.muted, marginTop: 6 }}>Protocolo: {nota.protocolo}</p>}
            </div>
          )}

          {/* Cancelamento */}
          {nota.status === "CANCELADA" && nota.motivoCancelamento && (
            <div style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.18)", borderRadius: 10, padding: 14 }}>
              <p style={{ ...g.lbl, color: "#ef4444", marginBottom: 6 }}>Motivo do Cancelamento</p>
              <p style={{ fontSize: 12, color: "#fca5a5", margin: 0 }}>{nota.motivoCancelamento}</p>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }}>
            {nota.status === "RASCUNHO" && (
              <button disabled={loading}
                onClick={async () => { setLoading(true); try { await onEmitir(nota.id); } finally { setLoading(false); } }}
                style={{ ...g.green, opacity: loading ? .6 : 1 }}>
                {Ico.check} {loading ? "Emitindo..." : "Emitir Nota"}
              </button>
            )}
            {nota.status === "EMITIDA" && !showCancelar && (
              <button onClick={() => setShow(true)} style={g.danger}>{Ico.ban} Cancelar Nota</button>
            )}
            {showCancelar && (
              <div style={{ width: "100%", display: "flex", gap: 8 }}>
                <input style={{ ...g.input, flex: 1 }} placeholder="Informe o motivo do cancelamento..."
                  value={motivo} onChange={e => setMotivo(e.target.value)} autoFocus />
                <button disabled={loading || !motivo.trim()}
                  onClick={async () => { setLoading(true); try { await onCancelar(nota.id, motivo); } finally { setLoading(false); } }}
                  style={{ ...g.green, background: "#ef4444", color: "#fff", flexShrink: 0, opacity: loading || !motivo.trim() ? .5 : 1 }}>
                  {loading ? "..." : "Confirmar"}
                </button>
                <button onClick={() => setShow(false)} style={{ ...g.ghost, flexShrink: 0 }}>Voltar</button>
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

function ModalCriar({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [step, setStep]     = useState(1);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState("");

  const [tipo, setTipo]         = useState<TipoNota>("NFe");
  const [clienteNome, setNome]  = useState("");
  const [cpfCnpj, setCpf]       = useState("");
  const [email, setEmail]        = useState("");
  const [tel, setTel]            = useState("");
  const [cep, setCep]            = useState("");
  const [endereco, setEnd]       = useState("");
  const [cidade, setCidade]      = useState("");
  const [estado, setEstado]      = useState("");

  const [itens, setItens]               = useState<ItemNota[]>([{ ...EMPTY_ITEM }]);
  const [desconto, setDesconto]         = useState(0);
  const [impostos, setImpostos]         = useState(0);
  const [formaPagamento, setForma]      = useState<FormaPagamento>("PIX");
  const [observacoes, setObs]           = useState("");

  const buscarCep = async () => {
    const c = cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cep/${c}`);
      setEnd(d.logradouro ?? ""); setCidade(d.cidade ?? ""); setEstado(d.estado ?? "");
    } catch {}
  };

  const buscarCnpj = async () => {
    const cnpj = cpfCnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return;
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cnpj/${cnpj}`);
      if (d.nome) setNome(d.nome);
      if (d.telefone) setTel(d.telefone);
      if (d.email) setEmail(d.email);
      if (d.cep) setCep(d.cep);
      if (d.logradouro) setEnd(`${d.logradouro}, ${d.numero ?? ""}`);
      if (d.municipio) setCidade(d.municipio);
      if (d.uf) setEstado(d.uf);
    } catch {}
  };

  const updateItem = (idx: number, field: keyof ItemNota, value: string | number) =>
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const subtotal = itens.reduce((a, it) => a + (it.quantidade ?? 0) * (it.valorUnitario ?? 0) * (1 - (it.desconto ?? 0) / 100), 0);
  const valorDesc = subtotal * (desconto / 100);
  const valorImp  = (subtotal - valorDesc) * (impostos / 100);
  const total     = subtotal - valorDesc + valorImp;

  const canNext = step === 1 ? clienteNome.trim().length > 0
    : step === 2 ? itens.length > 0 && itens.every(i => i.descricao.trim() && i.quantidade > 0)
    : true;

  const handleSubmit = async () => {
    setLoad(true); setError("");
    try {
      await fetchAuth("/notas-fiscais", {
        method: "POST",
        body: JSON.stringify({
          empresaId: EMPRESA_ID, tipo,
          clienteNome, clienteCpfCnpj: cpfCnpj, clienteEmail: email, clienteTelefone: tel,
          clienteCep: cep, clienteEndereco: endereco, clienteCidade: cidade, clienteEstado: estado,
          itens: itens.map(i => ({
            produtoId: i.produtoId || crypto.randomUUID(),
            descricao: i.descricao, codigo: i.codigo, ncm: i.ncm,
            cfop: i.cfop || "5102", unidade: i.unidade || "UN",
            quantidade: i.quantidade, valorUnitario: i.valorUnitario,
            desconto: i.desconto, icms: i.icms, pis: i.pis, cofins: i.cofins,
          })),
          desconto, impostos, formaPagamento, observacoes,
        }),
      });
      onCreate(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoad(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, background: "rgba(0,0,0,.8)", backdropFilter: "blur(8px)",
    }}>
      <div style={{
        ...g.card, width: "100%", maxWidth: 760, maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 32px 80px rgba(0,0,0,.7)",
      }}>
        {/* Header + Stepper */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #181818" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ padding: 8, background: "rgba(16,185,129,.1)", borderRadius: 8, color: "#10b981" }}>{Ico.receipt}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Nova Nota Fiscal</p>
                <p style={{ ...g.muted, margin: 0 }}>Passo {step} de {STEPS.length} — {STEPS[step - 1]}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ ...g.ghost, padding: 7, border: "none", color: "#444" }}>{Ico.x}</button>
          </div>
          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" as any }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, transition: "all .2s",
                    border: `2px solid ${i + 1 <= step ? "#10b981" : "#222"}`,
                    background: i + 1 < step ? "#10b981" : i + 1 === step ? "rgba(16,185,129,.12)" : "transparent",
                    color: i + 1 < step ? "#000" : i + 1 === step ? "#10b981" : "#333",
                  }}>{i + 1 < step ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: i + 1 <= step ? "#e5e7eb" : "#333" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: i + 1 < step ? "#10b981" : "#1e1e1e", margin: "0 10px" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ── Step 1 ── */}
          {step === 1 && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {(["NFe", "NFS", "NFCE"] as TipoNota[]).map(t => (
                <button key={t} type="button" onClick={() => setTipo(t)} style={{
                  padding: "14px 0", borderRadius: 10,
                  border: `1px solid ${tipo === t ? "#10b981" : "#1e1e1e"}`,
                  background: tipo === t ? "rgba(16,185,129,.08)" : "#0d0d0d",
                  color: tipo === t ? "#10b981" : "#444", cursor: "pointer", textAlign: "center",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{tipoLabel[t]}</div>
                  <div style={{ fontSize: 10, marginTop: 3, opacity: .55 }}>
                    {t === "NFe" ? "Produtos" : t === "NFS" ? "Serviços" : "Consumidor"}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="CPF / CNPJ"><input style={g.input} value={cpfCnpj} onChange={e => setCpf(e.target.value)} onBlur={buscarCnpj} placeholder="Auto-preench. CNPJ ao sair" /></Field>
              <Field label="Nome do Cliente *"><input style={g.input} value={clienteNome} onChange={e => setNome(e.target.value)} placeholder="Nome ou Razão Social" /></Field>
              <Field label="E-mail"><input style={g.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.com" /></Field>
              <Field label="Telefone"><input style={g.input} value={tel} onChange={e => setTel(e.target.value)} placeholder="(00) 00000-0000" /></Field>
              <Field label="CEP"><input style={g.input} value={cep} onChange={e => setCep(e.target.value)} onBlur={buscarCep} placeholder="Auto-preench. endereço" /></Field>
              <Field label="Endereço"><input style={g.input} value={endereco} onChange={e => setEnd(e.target.value)} /></Field>
              <Field label="Cidade"><input style={g.input} value={cidade} onChange={e => setCidade(e.target.value)} /></Field>
              <Field label="UF"><input style={{ ...g.input, maxWidth: 80 }} value={estado} onChange={e => setEstado(e.target.value)} maxLength={2} placeholder="SP" /></Field>
            </div>
          </>}

          {/* ── Step 2 ── */}
          {step === 2 && <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {itens.map((item, idx) => (
                <ItemRow key={idx} item={item} idx={idx} onChange={updateItem}
                  onRemove={i => setItens(prev => prev.filter((_, j) => j !== i))} />
              ))}
            </div>
            <button type="button" onClick={() => setItens(prev => [...prev, { ...EMPTY_ITEM }])} style={{
              width: "100%", padding: "12px 0", border: "1px dashed #222", borderRadius: 10,
              background: "transparent", color: "#444", fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>{Ico.plus} Adicionar Item</button>
          </>}

          {/* ── Step 3 ── */}
          {step === 3 && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Field label="Desconto Geral %"><input style={g.input} type="number" min="0" max="100" value={desconto} onChange={e => setDesconto(parseFloat(e.target.value) || 0)} /></Field>
              <Field label="Impostos %"><input style={g.input} type="number" min="0" max="100" value={impostos} onChange={e => setImpostos(parseFloat(e.target.value) || 0)} /></Field>
              <Field label="Forma de Pagamento">
                <select style={{ ...g.input, cursor: "pointer" }} value={formaPagamento} onChange={e => setForma(e.target.value as FormaPagamento)}>
                  {(Object.keys(pgtoLabel) as FormaPagamento[]).map(k => (
                    <option key={k} value={k} style={{ background: "#0e0e0e" }}>{pgtoLabel[k]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Observações">
              <textarea style={{ ...g.input, resize: "none", minHeight: 72 }} rows={3}
                value={observacoes} onChange={e => setObs(e.target.value)} placeholder="Observações adicionais..." />
            </Field>
            {/* Resumo */}
            <div style={{ ...g.inner, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
                <p style={{ ...g.lbl, margin: 0 }}>Resumo da Nota</p>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { l: `Subtotal (${itens.length} ${itens.length === 1 ? "item" : "itens"})`, v: fmt(subtotal),   c: "#666" },
                  { l: `Desconto (${desconto}%)`,   v: `-${fmt(valorDesc)}`, c: "#ef4444" },
                  { l: `Impostos (${impostos}%)`,   v: `+${fmt(valorImp)}`,  c: "#f59e0b" },
                ].map(row => (
                  <div key={row.l} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#444" }}>{row.l}</span>
                    <span style={{ fontSize: 12, color: row.c }}>{row.v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #1e1e1e" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#10b981" }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </>}

          {error && (
            <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#f87171" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
            <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} style={g.ghost}>
              {step === 1 ? "Cancelar" : "← Voltar"}
            </button>
            <button type="button" disabled={loading || !canNext}
              onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
              style={{ ...g.green, opacity: loading || !canNext ? .5 : 1 }}>
              {loading ? "Salvando..." : step === 3 ? <>{Ico.check} Criar Rascunho</> : "Próximo →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function NotasFiscaisPage() {
  const [notas, setNotas]               = useState<NotaFiscal[]>([]);
  const [stats, setStats]               = useState<Estatisticas | null>(null);
  const [loading, setLoading]           = useState(true);
  const [showCriar, setShowCriar]       = useState(false);
  const [detalhe, setDetalhe]           = useState<NotaFiscal | null>(null);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");
  const [filterTipo, setFilterTipo]     = useState<TipoNota | "">("");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [hoveredRow, setHovRow]         = useState<string | null>(null);

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        empresaId: EMPRESA_ID, page: String(page), limit: "15",
        ...(filterStatus && { status: filterStatus }),
        ...(filterTipo   && { tipo: filterTipo }),
        ...(search       && { clienteNome: search }),
      });
      const d = await fetchAuth<{ data: NotaFiscal[]; pages: number }>(`/notas-fiscais?${params}`);
      setNotas(d.data ?? []); setTotalPages(d.pages ?? 1);
    } catch { setNotas([]); }
    finally { setLoading(false); }
  }, [page, filterStatus, filterTipo, search]);

  const fetchStats = useCallback(async () => {
    try { setStats(await fetchAuth<Estatisticas>(`/notas-fiscais/stats/${EMPRESA_ID}`)); } catch {}
  }, []);

  useEffect(() => { fetchNotas(); }, [fetchNotas]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleEmitir = async (id: string) => {
    await fetchAuth(`/notas-fiscais/${id}/emitir`, { method: "PATCH" });
    await fetchNotas(); await fetchStats();
    const d = await fetchAuth<{ nota: NotaFiscal; itens: ItemNota[] }>(`/notas-fiscais/${id}`);
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  const handleCancelar = async (id: string, motivo: string) => {
    await fetchAuth(`/notas-fiscais/cancelar`, { method: "PATCH", body: JSON.stringify({ id, motivoCancelamento: motivo }) });
    await fetchNotas(); await fetchStats(); setDetalhe(null);
  };

  const openDetalhe = async (id: string) => {
    const d = await fetchAuth<{ nota: NotaFiscal; itens: ItemNota[] }>(`/notas-fiscais/${id}`);
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  const hasFilters = filterStatus || filterTipo || search;

  return (
    <div style={g.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
      <div style={g.wrap}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>Notas Fiscais</h1>
            <p style={{ ...g.muted, marginTop: 4 }}>Gerencie NF-e, NFS-e e NFC-e</p>
          </div>
          <button onClick={() => setShowCriar(true)} style={g.green}>
            {Ico.plus} Nova Nota
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
            <StatCard label="Total de Notas"  value={stats.total}              icon={Ico.receipt} ibg="rgba(255,255,255,.04)" />
            <StatCard label="Emitidas"         value={stats.emitidas}           icon={Ico.check}   ibg="rgba(16,185,129,.1)" />
            <StatCard label="Rascunhos"        value={stats.rascunhos}          icon={Ico.receipt} ibg="rgba(245,158,11,.1)" />
            <StatCard label="Canceladas"       value={stats.canceladas}         icon={Ico.ban}     ibg="rgba(239,68,68,.1)" />
            <StatCard label="Faturado no Mês"  value={fmt(stats.valorTotalMes)} icon={Ico.trend}   ibg="rgba(16,185,129,.1)" sub="notas emitidas" />
          </div>
        )}

        {/* Filtros */}
        <div style={{ ...g.card, padding: "12px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#333", pointerEvents: "none" }}>
              {Ico.search}
            </span>
            <input style={{ ...g.input, paddingLeft: 32 }} placeholder="Buscar por cliente..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          {[
            {
              value: filterStatus, onChange: (v: string) => { setFilterStatus(v as Status | ""); setPage(1); },
              options: [
                { v: "", l: "Todos os status" }, { v: "RASCUNHO", l: "Rascunho" },
                { v: "EMITIDA", l: "Emitida" }, { v: "CANCELADA", l: "Cancelada" },
              ],
            },
            {
              value: filterTipo, onChange: (v: string) => { setFilterTipo(v as TipoNota | ""); setPage(1); },
              options: [
                { v: "", l: "Todos os tipos" }, { v: "NFe", l: "NF-e" },
                { v: "NFS", l: "NFS-e" }, { v: "NFCE", l: "NFC-e" },
              ],
            },
          ].map((sel, i) => (
            <select key={i} style={{ ...g.input, width: "auto", cursor: "pointer" }}
              value={sel.value} onChange={e => sel.onChange(e.target.value)}>
              {sel.options.map(o => <option key={o.v} value={o.v} style={{ background: "#0e0e0e" }}>{o.l}</option>)}
            </select>
          ))}
          {hasFilters && (
            <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterTipo(""); setPage(1); }}
              style={{ ...g.ghost, fontSize: 12, color: "#ef4444", borderColor: "rgba(239,68,68,.2)" }}>
              {Ico.x} Limpar
            </button>
          )}
        </div>

        {/* Tabela */}
        <div style={{ ...g.card, overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #161616", display: "flex", justifyContent: "space-between" }}>
            <span style={g.lbl}>{loading ? "Carregando..." : `${notas.length} nota${notas.length !== 1 ? "s" : ""} encontrada${notas.length !== 1 ? "s" : ""}`}</span>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "56px 0", color: "#333" }}>
              <div style={{ width: 18, height: 18, border: "2px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              <span style={{ fontSize: 13 }}>Carregando...</span>
            </div>
          ) : notas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, background: "#161616", borderRadius: 12, marginBottom: 12, color: "#2a2a2a" }}>{Ico.receipt}</div>
              <p style={{ fontSize: 14, color: "#444", margin: 0 }}>Nenhuma nota fiscal encontrada</p>
              <p style={{ ...g.muted, marginTop: 4, marginBottom: 16 }}>{hasFilters ? "Tente ajustar os filtros" : "Crie sua primeira nota fiscal"}</p>
              {!hasFilters && (
                <button onClick={() => setShowCriar(true)} style={{ ...g.green, margin: "0 auto" }}>{Ico.plus} Nova Nota</button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #161616" }}>
                    {[
                      { h: "Número",    r: false },
                      { h: "Tipo",      r: false },
                      { h: "Cliente",   r: false },
                      { h: "Status",    r: false },
                      { h: "Total",     r: true  },
                      { h: "Pagamento", r: true  },
                      { h: "Data",      r: true  },
                      { h: "",          r: true  },
                    ].map(({ h, r }, i) => (
                      <th key={i} style={{ padding: "10px 18px", textAlign: r ? "right" : "left", ...g.lbl }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notas.map(nota => {
                    const hov = hoveredRow === nota.id;
                    return (
                      <tr key={nota.id}
                        onClick={() => openDetalhe(nota.id)}
                        onMouseEnter={() => setHovRow(nota.id)}
                        onMouseLeave={() => setHovRow(null)}
                        style={{ borderBottom: "1px solid #141414", background: hov ? "#151515" : "transparent", cursor: "pointer", transition: "background .1s" }}>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: hov ? "#bbb" : "#333", transition: "color .1s" }}>{nota.numero}</span>
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: "#161616", border: "1px solid #1e1e1e", color: "#666" }}>
                            {tipoLabel[nota.tipo]}
                          </span>
                        </td>
                        <td style={{ padding: "13px 18px", maxWidth: 200 }}>
                          <p style={{ fontSize: 13, color: "#e5e7eb", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nota.clienteNome}</p>
                          {nota.clienteCpfCnpj && <p style={{ fontSize: 10, color: "#333", margin: "2px 0 0" }}>{nota.clienteCpfCnpj}</p>}
                        </td>
                        <td style={{ padding: "13px 18px" }}><Badge status={nota.status} /></td>
                        <td style={{ padding: "13px 18px", textAlign: "right" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>{fmt(nota.total)}</span>
                        </td>
                        <td style={{ padding: "13px 18px", textAlign: "right" }}>
                          <span style={{ fontSize: 12, color: "#444" }}>{pgtoLabel[nota.formaPagamento]}</span>
                        </td>
                        <td style={{ padding: "13px 18px", textAlign: "right" }}>
                          <span style={{ fontSize: 11, color: "#333" }}>{new Date(nota.createdAt).toLocaleDateString("pt-BR")}</span>
                        </td>
                        <td style={{ padding: "13px 18px" }}>
                          <button onClick={e => { e.stopPropagation(); openDetalhe(nota.id); }}
                            style={{ ...g.ghost, padding: "5px 10px", fontSize: 11, opacity: hov ? 1 : 0, transition: "opacity .1s" }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ ...g.ghost, opacity: page === 1 ? .3 : 1 }}>← Anterior</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                background: p === page ? "#10b981" : "transparent", color: p === page ? "#000" : "#444",
              }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ ...g.ghost, opacity: page === totalPages ? .3 : 1 }}>Próximo →</button>
          </div>
        )}
      </div>

      {showCriar && <ModalCriar onClose={() => setShowCriar(false)} onCreate={() => { fetchNotas(); fetchStats(); }} />}
      {detalhe   && <ModalDetalhes nota={detalhe} onClose={() => setDetalhe(null)} onEmitir={handleEmitir} onCancelar={handleCancelar} />}
    </div>
  );
}