"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Auth helpers (inline, compatible with api-v2.ts pattern) ────────────────
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

// ─── Config ───────────────────────────────────────────────────────────────────
const EMPRESA_ID = "empresa-1";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

const statusCfg: Record<Status, { label: string; cls: string; dot: string }> = {
  RASCUNHO:  { label: "Rascunho",  cls: "text-amber-400 bg-amber-400/10 border border-amber-400/20",        dot: "bg-amber-400" },
  EMITIDA:   { label: "Emitida",   cls: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",  dot: "bg-emerald-400" },
  CANCELADA: { label: "Cancelada", cls: "text-red-400 bg-red-400/10 border border-red-400/20",              dot: "bg-red-400" },
};

const tipoLabel: Record<TipoNota, string> = { NFe: "NF-e", NFS: "NFS-e", NFCE: "NFC-e" };
const pgtoLabel: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro", CARTAO_CREDITO: "Crédito", CARTAO_DEBITO: "Débito",
  PIX: "PIX", BOLETO: "Boleto", TRANSFERENCIA: "Transferência",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IcReceipt = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);
const IcPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const IcSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
  </svg>
);
const IcCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
const IcEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IcTrending = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);
const IcX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IcBan = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

// ─── Shared input style ───────────────────────────────────────────────────────
const IC = "w-full bg-[#0f1117] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all";

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ status }: { status: Status }) {
  const c = statusCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, iconBg }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; iconBg: string;
}) {
  return (
    <div className="bg-[#1a1d27] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1.5">{value}</p>
          {sub && <p className="text-xs text-[#4b5563] mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-[#6b7280] font-medium uppercase tracking-wide mb-1.5">{label}</label>
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
    <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4 relative">
      <button type="button" onClick={() => onRemove(idx)}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-[#6b7280] hover:text-red-400 hover:bg-red-400/10 transition-all">
        <IcX />
      </button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-8">
        <div className="col-span-2">
          <Field label="Descrição *">
            <input className={IC} value={item.descricao}
              onChange={e => onChange(idx, "descricao", e.target.value)} placeholder="Nome do produto/serviço" />
          </Field>
        </div>
        <Field label="Código">
          <input className={IC} value={item.codigo ?? ""} onChange={e => onChange(idx, "codigo", e.target.value)} placeholder="SKU" />
        </Field>
        <Field label="NCM">
          <input className={IC} value={item.ncm ?? ""} onChange={e => onChange(idx, "ncm", e.target.value)} placeholder="0000.00.00" />
        </Field>
        <Field label="Quantidade *">
          <input className={IC} type="number" min="0.001" step="0.001" value={item.quantidade} onChange={e => onChange(idx, "quantidade", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="Valor Unitário *">
          <input className={IC} type="number" min="0" step="0.01" value={item.valorUnitario} onChange={e => onChange(idx, "valorUnitario", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="Desconto %">
          <input className={IC} type="number" min="0" max="100" value={item.desconto ?? 0} onChange={e => onChange(idx, "desconto", parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="ICMS %">
          <input className={IC} type="number" min="0" max="100" value={item.icms ?? 0} onChange={e => onChange(idx, "icms", parseFloat(e.target.value) || 0)} />
        </Field>
      </div>
      <div className="mt-3 pt-3 border-t border-white/[0.05] flex justify-between text-xs">
        <span className="text-[#4b5563]">Item {idx + 1}</span>
        <span className="text-[#9ca3af]">Total: <span className="text-emerald-400 font-semibold">{fmt(total)}</span></span>
      </div>
    </div>
  );
}

// ─── Modal Detalhes ───────────────────────────────────────────────────────────
function ModalDetalhes({ nota, onClose, onEmitir, onCancelar }: {
  nota: NotaFiscal; onClose: () => void;
  onEmitir: (id: string) => void;
  onCancelar: (id: string, motivo: string) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [showCancelar, setShowCancelar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmitir = async () => {
    setLoading(true);
    try { await onEmitir(nota.id); } finally { setLoading(false); }
  };

  const handleCancelar = async () => {
    if (!motivo.trim()) return;
    setLoading(true);
    try { await onCancelar(nota.id, motivo); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#131620] border border-white/[0.08] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><IcReceipt /></div>
            <div>
              <h2 className="text-sm font-semibold text-white">{nota.numero}</h2>
              <p className="text-xs text-[#6b7280] mt-0.5">{tipoLabel[nota.tipo]} · {nota.empresaNome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={nota.status} />
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-white/10 transition-all">
              <IcX />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Emissor / Destinatário */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Emissor",      n: nota.empresaNome,  s: undefined },
              { l: "Destinatário", n: nota.clienteNome,  s: nota.clienteCpfCnpj },
            ].map(({ l, n, s }) => (
              <div key={l} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
                <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">{l}</p>
                <p className="text-sm font-medium text-white">{n}</p>
                {s && <p className="text-xs text-[#6b7280] mt-0.5">{s}</p>}
                {l === "Destinatário" && nota.clienteEmail &&
                  <p className="text-xs text-[#6b7280] mt-0.5">{nota.clienteEmail}</p>}
                {l === "Destinatário" && nota.clienteCidade &&
                  <p className="text-xs text-[#6b7280] mt-0.5">{nota.clienteCidade}{nota.clienteEstado ? ` / ${nota.clienteEstado}` : ""}</p>}
              </div>
            ))}
          </div>

          {/* Itens */}
          {nota.itens && nota.itens.length > 0 && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/[0.06]">
                <p className="text-[10px] text-[#6b7280] uppercase tracking-wider">Itens</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Descrição", "Qtd", "Unit.", "Desc %", "Total"].map((h, i) => (
                      <th key={h} className={`px-4 py-2 text-[#4b5563] font-medium ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nota.itens.map((item, i) => (
                    <tr key={i} className="border-b border-white/[0.03] last:border-0">
                      <td className="px-4 py-2.5 text-white">
                        {item.descricao}
                        {item.codigo && <span className="ml-1 text-[#4b5563]">({item.codigo})</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[#9ca3af]">{item.quantidade} {item.unidade}</td>
                      <td className="px-4 py-2.5 text-right text-[#9ca3af]">{fmt(item.valorUnitario)}</td>
                      <td className="px-4 py-2.5 text-right text-[#9ca3af]">{item.desconto ?? 0}%</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400 font-semibold">{fmt(item.valorTotal ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Totais */}
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-[#6b7280]"><span>Subtotal</span><span className="text-[#9ca3af]">{fmt(nota.subtotal)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#6b7280]">Desconto ({nota.desconto}%)</span><span className="text-red-400">-{fmt(nota.valorDesconto)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-[#6b7280]">Impostos ({nota.impostos}%)</span><span className="text-amber-400">+{fmt(nota.valorImpostos)}</span></div>
            <div className="flex justify-between pt-2.5 border-t border-white/[0.06]">
              <span className="text-sm font-semibold text-white">Total</span>
              <span className="text-base font-bold text-emerald-400">{fmt(nota.total)}</span>
            </div>
          </div>

          {/* Pagamento */}
          <div className="flex items-center justify-between bg-[#0f1117] border border-white/[0.06] rounded-xl px-4 py-3 text-xs">
            <span className="text-[#6b7280]">Forma de Pagamento</span>
            <span className="text-white font-medium">{pgtoLabel[nota.formaPagamento]}</span>
          </div>

          {/* Data emissão */}
          {nota.dataEmissao && (
            <div className="flex items-center justify-between bg-[#0f1117] border border-white/[0.06] rounded-xl px-4 py-3 text-xs">
              <span className="text-[#6b7280]">Data de Emissão</span>
              <span className="text-white font-medium">{new Date(nota.dataEmissao).toLocaleString("pt-BR")}</span>
            </div>
          )}

          {/* Chave de acesso */}
          {nota.chaveAcesso && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
              <p className="text-[10px] text-[#6b7280] uppercase tracking-wider mb-2">Chave de Acesso</p>
              <p className="text-xs font-mono text-emerald-400/80 break-all leading-relaxed">{nota.chaveAcesso}</p>
              {nota.protocolo && <p className="text-[10px] text-[#4b5563] mt-2">Protocolo: {nota.protocolo}</p>}
            </div>
          )}

          {/* Cancelamento */}
          {nota.status === "CANCELADA" && nota.motivoCancelamento && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Motivo do Cancelamento</p>
              <p className="text-xs text-red-300/80">{nota.motivoCancelamento}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-1">
            {nota.status === "RASCUNHO" && (
              <button onClick={handleEmitir} disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-all">
                <IcCheck /> {loading ? "Emitindo..." : "Emitir Nota"}
              </button>
            )}
            {nota.status === "EMITIDA" && !showCancelar && (
              <button onClick={() => setShowCancelar(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 transition-all">
                <IcBan /> Cancelar Nota
              </button>
            )}
            {showCancelar && (
              <div className="w-full flex gap-2">
                <input className={IC + " flex-1"} placeholder="Informe o motivo do cancelamento..."
                  value={motivo} onChange={e => setMotivo(e.target.value)} autoFocus />
                <button onClick={handleCancelar} disabled={loading || !motivo.trim()}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all shrink-0">
                  {loading ? "..." : "Confirmar"}
                </button>
                <button onClick={() => setShowCancelar(false)}
                  className="px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[#9ca3af] text-sm rounded-lg transition-all border border-white/[0.06] shrink-0">
                  Voltar
                </button>
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [tipo, setTipo] = useState<TipoNota>("NFe");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCpfCnpj, setClienteCpfCnpj] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteCep, setClienteCep] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteCidade, setClienteCidade] = useState("");
  const [clienteEstado, setClienteEstado] = useState("");

  // Step 2
  const [itens, setItens] = useState<ItemNota[]>([{ ...EMPTY_ITEM }]);

  // Step 3
  const [desconto, setDesconto] = useState(0);
  const [impostos, setImpostos] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("PIX");
  const [observacoes, setObservacoes] = useState("");

  const buscarCep = async () => {
    const cep = clienteCep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cep/${cep}`);
      setClienteEndereco(d.logradouro ?? "");
      setClienteCidade(d.cidade ?? "");
      setClienteEstado(d.estado ?? "");
    } catch {}
  };

  const buscarCnpj = async () => {
    const cnpj = clienteCpfCnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return;
    try {
      const d = await fetchAuth<any>(`/notas-fiscais/utils/cnpj/${cnpj}`);
      if (d.nome) setClienteNome(d.nome);
      if (d.telefone) setClienteTelefone(d.telefone);
      if (d.email) setClienteEmail(d.email);
      if (d.cep) setClienteCep(d.cep);
      if (d.logradouro) setClienteEndereco(`${d.logradouro}, ${d.numero ?? ""}`);
      if (d.municipio) setClienteCidade(d.municipio);
      if (d.uf) setClienteEstado(d.uf);
    } catch {}
  };

  const updateItem = (idx: number, field: keyof ItemNota, value: string | number) =>
    setItens(prev => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const subtotal = itens.reduce(
    (acc, it) => acc + (it.quantidade ?? 0) * (it.valorUnitario ?? 0) * (1 - (it.desconto ?? 0) / 100), 0);
  const valorDesc = subtotal * (desconto / 100);
  const base = subtotal - valorDesc;
  const valorImp = base * (impostos / 100);
  const total = base + valorImp;

  const canNext = () => {
    if (step === 1) return clienteNome.trim().length > 0;
    if (step === 2) return itens.length > 0 && itens.every(i => i.descricao.trim() && i.quantidade > 0 && i.valorUnitario >= 0);
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      await fetchAuth("/notas-fiscais", {
        method: "POST",
        body: JSON.stringify({
          empresaId: EMPRESA_ID, tipo,
          clienteNome, clienteCpfCnpj, clienteEmail, clienteTelefone,
          clienteCep, clienteEndereco, clienteCidade, clienteEstado,
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
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#131620] border border-white/[0.08] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><IcReceipt /></div>
              <div>
                <h2 className="text-sm font-semibold text-white">Nova Nota Fiscal</h2>
                <p className="text-xs text-[#6b7280]">Passo {step} de {STEPS.length} — {STEPS[step - 1]}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-white/10 transition-all">
              <IcX />
            </button>
          </div>
          {/* Stepper */}
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all
                    ${i + 1 < step ? "bg-emerald-500 border-emerald-500 text-black" :
                      i + 1 === step ? "border-emerald-500 text-emerald-400 bg-emerald-500/10" :
                      "border-white/10 text-[#4b5563]"}`}>
                    {i + 1 < step ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${i + 1 <= step ? "text-white" : "text-[#4b5563]"}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 transition-all ${i + 1 < step ? "bg-emerald-500/50" : "bg-white/[0.06]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Step 1 — Destinatário */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-3 gap-2 mb-1">
                {(["NFe", "NFS", "NFCE"] as TipoNota[]).map(t => (
                  <button key={t} type="button" onClick={() => setTipo(t)}
                    className={`p-3.5 rounded-xl border text-center transition-all
                      ${tipo === t
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-[#0f1117] border-white/[0.06] text-[#6b7280] hover:border-white/20 hover:text-white"}`}>
                    <div className="text-sm font-semibold">{tipoLabel[t]}</div>
                    <div className="text-[10px] mt-0.5 opacity-60">
                      {t === "NFe" ? "Produtos" : t === "NFS" ? "Serviços" : "Consumidor"}
                    </div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="CPF / CNPJ">
                  <input className={IC} value={clienteCpfCnpj} onChange={e => setClienteCpfCnpj(e.target.value)}
                    onBlur={buscarCnpj} placeholder="Auto-preench. CNPJ ao sair" />
                </Field>
                <Field label="Nome do Cliente *">
                  <input className={IC} value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Nome ou Razão Social" />
                </Field>
                <Field label="E-mail">
                  <input className={IC} type="email" value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} placeholder="email@exemplo.com" />
                </Field>
                <Field label="Telefone">
                  <input className={IC} value={clienteTelefone} onChange={e => setClienteTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                </Field>
                <Field label="CEP">
                  <input className={IC} value={clienteCep} onChange={e => setClienteCep(e.target.value)} onBlur={buscarCep} placeholder="Auto-preench. endereço" />
                </Field>
                <Field label="Endereço">
                  <input className={IC} value={clienteEndereco} onChange={e => setClienteEndereco(e.target.value)} />
                </Field>
                <Field label="Cidade">
                  <input className={IC} value={clienteCidade} onChange={e => setClienteCidade(e.target.value)} />
                </Field>
                <Field label="UF">
                  <input className={IC} value={clienteEstado} onChange={e => setClienteEstado(e.target.value)} maxLength={2} placeholder="SP" />
                </Field>
              </div>
            </>
          )}

          {/* Step 2 — Itens */}
          {step === 2 && (
            <>
              <div className="space-y-3">
                {itens.map((item, idx) => (
                  <ItemRow key={idx} item={item} idx={idx} onChange={updateItem}
                    onRemove={i => setItens(prev => prev.filter((_, j) => j !== i))} />
                ))}
              </div>
              <button type="button" onClick={() => setItens(prev => [...prev, { ...EMPTY_ITEM }])}
                className="w-full py-3 border border-dashed border-white/10 rounded-xl text-sm text-[#6b7280] hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/[0.03] transition-all flex items-center justify-center gap-2">
                <IcPlus /> Adicionar Item
              </button>
            </>
          )}

          {/* Step 3 — Financeiro */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Desconto Geral %">
                  <input className={IC} type="number" min="0" max="100" value={desconto} onChange={e => setDesconto(parseFloat(e.target.value) || 0)} />
                </Field>
                <Field label="Impostos %">
                  <input className={IC} type="number" min="0" max="100" value={impostos} onChange={e => setImpostos(parseFloat(e.target.value) || 0)} />
                </Field>
                <Field label="Forma de Pagamento">
                  <select className={IC + " cursor-pointer"} value={formaPagamento} onChange={e => setFormaPagamento(e.target.value as FormaPagamento)}>
                    {(Object.keys(pgtoLabel) as FormaPagamento[]).map(k => (
                      <option key={k} value={k}>{pgtoLabel[k]}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Observações">
                <textarea className={IC + " resize-none"} rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações adicionais..." />
              </Field>
              {/* Resumo */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.05]">
                  <p className="text-[10px] text-[#6b7280] uppercase tracking-wider">Resumo da Nota</p>
                </div>
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Subtotal ({itens.length} {itens.length === 1 ? "item" : "itens"})</span>
                    <span className="text-[#9ca3af]">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Desconto ({desconto}%)</span>
                    <span className="text-red-400">-{fmt(valorDesc)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7280]">Impostos ({impostos}%)</span>
                    <span className="text-amber-400">+{fmt(valorImp)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/[0.06]">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="text-base font-bold text-emerald-400">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-1">
            <button type="button" onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
              className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-[#9ca3af] text-sm rounded-lg transition-all border border-white/[0.06]">
              {step === 1 ? "Cancelar" : "← Voltar"}
            </button>
            <button type="button" disabled={loading || !canNext()}
              onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-all">
              {loading ? "Salvando..." : step === 3 ? <><IcCheck /> Criar Rascunho</> : "Próximo →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function NotasFiscaisPage() {
  const [notas, setNotas]           = useState<NotaFiscal[]>([]);
  const [stats, setStats]           = useState<Estatisticas | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showCriar, setShowCriar]   = useState(false);
  const [detalhe, setDetalhe]       = useState<NotaFiscal | null>(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");
  const [filterTipo, setFilterTipo]     = useState<TipoNota | "">("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    try {
      const s = await fetchAuth<Estatisticas>(`/notas-fiscais/stats/${EMPRESA_ID}`);
      setStats(s);
    } catch {}
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
    await fetchAuth(`/notas-fiscais/cancelar`, {
      method: "PATCH",
      body: JSON.stringify({ id, motivoCancelamento: motivo }),
    });
    await fetchNotas(); await fetchStats(); setDetalhe(null);
  };

  const openDetalhe = async (id: string) => {
    const d = await fetchAuth<{ nota: NotaFiscal; itens: ItemNota[] }>(`/notas-fiscais/${id}`);
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  const hasFilters = filterStatus || filterTipo || search;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Notas Fiscais</h1>
            <p className="text-sm text-[#4b5563] mt-0.5">Gerencie NF-e, NFS-e e NFC-e</p>
          </div>
          <button onClick={() => setShowCriar(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-lg transition-all">
            <IcPlus /> Nova Nota
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Total de Notas"  value={stats.total}             icon={<IcReceipt />}  iconBg="bg-white/[0.04]" />
            <StatCard label="Emitidas"         value={stats.emitidas}          icon={<IcCheck />}    iconBg="bg-emerald-500/10" />
            <StatCard label="Rascunhos"        value={stats.rascunhos}         icon={<IcReceipt />}  iconBg="bg-amber-500/10" />
            <StatCard label="Canceladas"       value={stats.canceladas}        icon={<IcBan />}      iconBg="bg-red-500/10" />
            <StatCard label="Faturado no Mês"  value={fmt(stats.valorTotalMes)} sub="notas emitidas" icon={<IcTrending />} iconBg="bg-emerald-500/10" />
          </div>
        )}

        {/* Filtros */}
        <div className="bg-[#1a1d27] border border-white/[0.06] rounded-xl px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#374151]"><IcSearch /></span>
            <input
              className="w-full bg-[#0f1117] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-[#374151] focus:outline-none focus:border-emerald-500/40 transition-all"
              placeholder="Buscar por cliente..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="bg-[#0f1117] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
            value={filterStatus} onChange={e => { setFilterStatus(e.target.value as Status | ""); setPage(1); }}>
            <option value="">Todos os status</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="EMITIDA">Emitida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          <select
            className="bg-[#0f1117] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/40 transition-all cursor-pointer"
            value={filterTipo} onChange={e => { setFilterTipo(e.target.value as TipoNota | ""); setPage(1); }}>
            <option value="">Todos os tipos</option>
            <option value="NFe">NF-e</option>
            <option value="NFS">NFS-e</option>
            <option value="NFCE">NFC-e</option>
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setFilterStatus(""); setFilterTipo(""); setPage(1); }}
              className="text-xs text-[#6b7280] hover:text-red-400 transition-colors flex items-center gap-1">
              <IcX /> Limpar filtros
            </button>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-[#1a1d27] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
            <p className="text-[10px] text-[#6b7280] uppercase tracking-wider font-medium">
              {loading ? "Carregando..." : `${notas.length} nota${notas.length !== 1 ? "s" : ""} encontrada${notas.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-[#4b5563]">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : notas.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/[0.03] rounded-xl mb-3 text-[#4b5563]">
                <IcReceipt className="w-6 h-6" />
              </div>
              <p className="text-sm text-[#6b7280]">Nenhuma nota fiscal encontrada</p>
              <p className="text-xs text-[#4b5563] mt-1 mb-4">
                {hasFilters ? "Tente ajustar os filtros" : "Crie sua primeira nota fiscal"}
              </p>
              {!hasFilters && (
                <button onClick={() => setShowCriar(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold rounded-lg transition-all mx-auto">
                  <IcPlus /> Nova Nota
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {["Número", "Tipo", "Cliente", "Status", "Total", "Pagamento", "Data", ""].map((h, i) => (
                      <th key={i} className={`px-4 py-3 text-[10px] font-medium text-[#4b5563] uppercase tracking-wider
                        ${i === 4 || i === 5 || i === 6 ? "text-right" : "text-left"}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notas.map(nota => (
                    <tr key={nota.id} onClick={() => openDetalhe(nota.id)}
                      className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] cursor-pointer transition-colors group">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[#6b7280] group-hover:text-white transition-colors">{nota.numero}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-md text-[10px] text-[#9ca3af]">
                          {tipoLabel[nota.tipo]}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="text-sm text-white truncate">{nota.clienteNome}</p>
                        {nota.clienteCpfCnpj && <p className="text-[10px] text-[#4b5563] mt-0.5">{nota.clienteCpfCnpj}</p>}
                      </td>
                      <td className="px-4 py-3"><Badge status={nota.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-emerald-400">{fmt(nota.total)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-[#6b7280]">{pgtoLabel[nota.formaPagamento]}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-[#4b5563]">
                          {new Date(nota.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); openDetalhe(nota.id); }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[#6b7280] hover:text-white hover:bg-white/[0.06] rounded-lg text-xs transition-all opacity-0 group-hover:opacity-100">
                          <IcEye /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-[#9ca3af] text-xs rounded-lg border border-white/[0.06] transition-all">
              ← Anterior
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-lg transition-all
                  ${p === page ? "bg-emerald-500 text-black font-semibold" : "text-[#6b7280] hover:bg-white/[0.06]"}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 text-[#9ca3af] text-xs rounded-lg border border-white/[0.06] transition-all">
              Próximo →
            </button>
          </div>
        )}
      </div>

      {showCriar && (
        <ModalCriar
          onClose={() => setShowCriar(false)}
          onCreate={() => { fetchNotas(); fetchStats(); }}
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