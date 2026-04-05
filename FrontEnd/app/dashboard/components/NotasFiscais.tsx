"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────
type Status = "RASCUNHO" | "EMITIDA" | "CANCELADA";
type TipoNota = "NFe" | "NFS" | "NFCE";
type FormaPagamento = "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA";

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

// ─── Config ───────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const EMPRESA_ID = "empresa-1"; // ajuste conforme auth

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

const statusColor: Record<Status, string> = {
  RASCUNHO:  "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  EMITIDA:   "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  CANCELADA: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const tipoLabel: Record<TipoNota, string> = { NFe: "NF-e", NFS: "NFS-e", NFCE: "NFC-e" };
const pgtoLabel: Record<FormaPagamento, string> = {
  DINHEIRO: "Dinheiro", CARTAO_CREDITO: "Crédito", CARTAO_DEBITO: "Débito",
  PIX: "PIX", BOLETO: "Boleto", TRANSFERENCIA: "Transferência",
};

// ─── Componentes auxiliares ───────────────────────────────
function Badge({ status }: { status: Status }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor[status]}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-[#1a1f2e] border border-white/5 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-bold ${accent ?? "text-white"}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

// ─── Formulário de item ───────────────────────────────────
function ItemRow({ item, idx, onChange, onRemove }: {
  item: ItemNota;
  idx: number;
  onChange: (idx: number, field: keyof ItemNota, value: string | number) => void;
  onRemove: (idx: number) => void;
}) {
  const total = (item.quantidade ?? 0) * (item.valorUnitario ?? 0) *
    (1 - (item.desconto ?? 0) / 100);

  return (
    <div className="bg-[#1a1f2e] border border-white/5 rounded-xl p-4 relative">
      <button
        type="button"
        onClick={() => onRemove(idx)}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-400 text-lg leading-none"
      >×</button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2">
          <label className="label">Descrição *</label>
          <input className="input" value={item.descricao}
            onChange={e => onChange(idx, "descricao", e.target.value)} placeholder="Nome do produto/serviço" />
        </div>
        <div>
          <label className="label">Código</label>
          <input className="input" value={item.codigo ?? ""}
            onChange={e => onChange(idx, "codigo", e.target.value)} placeholder="SKU" />
        </div>
        <div>
          <label className="label">NCM</label>
          <input className="input" value={item.ncm ?? ""}
            onChange={e => onChange(idx, "ncm", e.target.value)} placeholder="0000.00.00" />
        </div>
        <div>
          <label className="label">Qtd *</label>
          <input className="input" type="number" min="0.001" step="0.001" value={item.quantidade}
            onChange={e => onChange(idx, "quantidade", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Vlr Unitário *</label>
          <input className="input" type="number" min="0" step="0.01" value={item.valorUnitario}
            onChange={e => onChange(idx, "valorUnitario", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">Desconto %</label>
          <input className="input" type="number" min="0" max="100" value={item.desconto ?? 0}
            onChange={e => onChange(idx, "desconto", parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="label">ICMS %</label>
          <input className="input" type="number" min="0" max="100" value={item.icms ?? 0}
            onChange={e => onChange(idx, "icms", parseFloat(e.target.value) || 0)} />
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <span className="text-sm text-gray-400">
          Total: <span className="text-emerald-400 font-semibold">{fmt(total)}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Modal Detalhes ───────────────────────────────────────
function ModalDetalhes({ nota, onClose, onEmitir, onCancelar }: {
  nota: NotaFiscal;
  onClose: () => void;
  onEmitir: (id: string) => void;
  onCancelar: (id: string) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [showCancelar, setShowCancelar] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12161f] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">{nota.numero}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={nota.status} />
              <span className="text-xs text-gray-400">{tipoLabel[nota.tipo]}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Emissor / Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1a1f2e] rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase mb-2">Emissor</p>
              <p className="text-white font-medium">{nota.empresaNome}</p>
            </div>
            <div className="bg-[#1a1f2e] rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase mb-2">Destinatário</p>
              <p className="text-white font-medium">{nota.clienteNome}</p>
              {nota.clienteCpfCnpj && <p className="text-sm text-gray-400">{nota.clienteCpfCnpj}</p>}
              {nota.clienteEmail && <p className="text-sm text-gray-400">{nota.clienteEmail}</p>}
            </div>
          </div>

          {/* Itens */}
          {nota.itens && nota.itens.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase mb-2">Itens</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/5">
                      <th className="text-left pb-2">Descrição</th>
                      <th className="text-right pb-2">Qtd</th>
                      <th className="text-right pb-2">Unit.</th>
                      <th className="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nota.itens.map((item, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0">
                        <td className="py-2 text-white">{item.descricao}</td>
                        <td className="py-2 text-right text-gray-300">{item.quantidade}</td>
                        <td className="py-2 text-right text-gray-300">{fmt(item.valorUnitario)}</td>
                        <td className="py-2 text-right text-emerald-400 font-medium">{fmt(item.valorTotal ?? 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totais */}
          <div className="bg-[#1a1f2e] rounded-xl p-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span><span>{fmt(nota.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Desconto ({nota.desconto}%)</span><span>-{fmt(nota.valorDesconto)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Impostos ({nota.impostos}%)</span><span>+{fmt(nota.valorImpostos)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
              <span>Total</span><span className="text-emerald-400">{fmt(nota.total)}</span>
            </div>
          </div>

          {/* Chave / Protocolo */}
          {nota.chaveAcesso && (
            <div className="bg-[#1a1f2e] rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase mb-1">Chave de Acesso</p>
              <p className="text-xs font-mono text-gray-300 break-all">{nota.chaveAcesso}</p>
              {nota.protocolo && <p className="text-xs text-gray-500 mt-1">Protocolo: {nota.protocolo}</p>}
            </div>
          )}

          {/* Cancelamento */}
          {nota.status === "CANCELADA" && nota.motivoCancelamento && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-xs text-red-400 uppercase mb-1">Motivo do Cancelamento</p>
              <p className="text-sm text-red-300">{nota.motivoCancelamento}</p>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-2">
            {nota.status === "RASCUNHO" && (
              <button
                onClick={() => onEmitir(nota.id)}
                className="btn-primary"
              >
                ✓ Emitir Nota
              </button>
            )}
            {nota.status === "EMITIDA" && !showCancelar && (
              <button onClick={() => setShowCancelar(true)} className="btn-danger">
                ✕ Cancelar Nota
              </button>
            )}
            {showCancelar && (
              <div className="w-full flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Motivo do cancelamento..."
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                />
                <button
                  onClick={() => { if (motivo.trim()) onCancelar(nota.id); }}
                  className="btn-danger shrink-0"
                >Confirmar</button>
                <button onClick={() => setShowCancelar(false)} className="btn-ghost shrink-0">Voltar</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Wizard de Criação ────────────────────────────────────
const EMPTY_ITEM: ItemNota = {
  produtoId: "", descricao: "", codigo: "", ncm: "", cfop: "5102",
  unidade: "UN", quantidade: 1, valorUnitario: 0, desconto: 0, icms: 0, pis: 0, cofins: 0,
};

function ModalCriar({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [tipo, setTipo] = useState<TipoNota>("NFe");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteCpfCnpj, setClienteCpfCnpj] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteCep, setClienteCep] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [clienteCidade, setClienteCidade] = useState("");
  const [clienteEstado, setClienteEstado] = useState("");
  const [itens, setItens] = useState<ItemNota[]>([{ ...EMPTY_ITEM }]);
  const [desconto, setDesconto] = useState(0);
  const [impostos, setImpostos] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("PIX");
  const [observacoes, setObservacoes] = useState("");

  // CEP auto-fill
  const buscarCep = async () => {
    const cep = clienteCep.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const r = await fetch(`${API}/notas-fiscais/utils/cep/${cep}`);
      if (!r.ok) return;
      const d = await r.json();
      setClienteEndereco(d.logradouro ?? "");
      setClienteCidade(d.cidade ?? "");
      setClienteEstado(d.estado ?? "");
    } catch {}
  };

  // CNPJ auto-fill
  const buscarCnpj = async () => {
    const cnpj = clienteCpfCnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return;
    try {
      const r = await fetch(`${API}/notas-fiscais/utils/cnpj/${cnpj}`);
      if (!r.ok) return;
      const d = await r.json();
      if (d.nome) setClienteNome(d.nome);
      if (d.telefone) setClienteTelefone(d.telefone);
      if (d.email) setClienteEmail(d.email);
      if (d.cep) { setClienteCep(d.cep); }
      if (d.logradouro) setClienteEndereco(`${d.logradouro}, ${d.numero ?? ""}`);
      if (d.municipio) setClienteCidade(d.municipio);
      if (d.uf) setClienteEstado(d.uf);
    } catch {}
  };

  const updateItem = (idx: number, field: keyof ItemNota, value: string | number) => {
    setItens(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const subtotal = itens.reduce((acc, it) =>
    acc + (it.quantidade ?? 0) * (it.valorUnitario ?? 0) * (1 - (it.desconto ?? 0) / 100), 0);
  const valorDesc = subtotal * (desconto / 100);
  const base = subtotal - valorDesc;
  const valorImp = base * (impostos / 100);
  const total = base + valorImp;

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const payload = {
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
      };
      const r = await fetch(`${API}/notas-fiscais`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.message ?? "Erro ao criar nota"); }
      onCreate();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#12161f] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white">Nova Nota Fiscal</h2>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-16 rounded-full transition-colors ${s <= step ? "bg-emerald-500" : "bg-white/10"}`} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Step 1: Tipo + Cliente */}
          {step === 1 && (
            <>
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Tipo & Destinatário</h3>
              <div className="grid grid-cols-3 gap-2">
                {(["NFe", "NFS", "NFCE"] as TipoNota[]).map(t => (
                  <button key={t} type="button"
                    onClick={() => setTipo(t)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all
                      ${tipo === t ? "bg-emerald-500/20 border-emerald-500 text-emerald-300" : "bg-[#1a1f2e] border-white/5 text-gray-400 hover:border-white/20"}`}>
                    {tipoLabel[t]}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="label">CPF / CNPJ</label>
                  <input className="input" value={clienteCpfCnpj}
                    onChange={e => setClienteCpfCnpj(e.target.value)}
                    onBlur={buscarCnpj} placeholder="Auto-preenchimento CNPJ" />
                </div>
                <div>
                  <label className="label">Nome do Cliente *</label>
                  <input className="input" value={clienteNome}
                    onChange={e => setClienteNome(e.target.value)} placeholder="Nome ou Razão Social" />
                </div>
                <div>
                  <label className="label">E-mail</label>
                  <input className="input" type="email" value={clienteEmail}
                    onChange={e => setClienteEmail(e.target.value)} />
                </div>
                <div>
                  <label className="label">Telefone</label>
                  <input className="input" value={clienteTelefone}
                    onChange={e => setClienteTelefone(e.target.value)} />
                </div>
                <div>
                  <label className="label">CEP</label>
                  <input className="input" value={clienteCep}
                    onChange={e => setClienteCep(e.target.value)}
                    onBlur={buscarCep} placeholder="Auto-preenchimento" />
                </div>
                <div>
                  <label className="label">Endereço</label>
                  <input className="input" value={clienteEndereco}
                    onChange={e => setClienteEndereco(e.target.value)} />
                </div>
                <div>
                  <label className="label">Cidade</label>
                  <input className="input" value={clienteCidade}
                    onChange={e => setClienteCidade(e.target.value)} />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <input className="input" value={clienteEstado}
                    onChange={e => setClienteEstado(e.target.value)} maxLength={2} placeholder="UF" />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Itens */}
          {step === 2 && (
            <>
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Itens da Nota</h3>
              <div className="space-y-3">
                {itens.map((item, idx) => (
                  <ItemRow key={idx} item={item} idx={idx}
                    onChange={updateItem} onRemove={i => setItens(prev => prev.filter((_, j) => j !== i))} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setItens(prev => [...prev, { ...EMPTY_ITEM }])}
                className="w-full py-2.5 border border-dashed border-white/20 rounded-xl text-sm text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
              >
                + Adicionar Item
              </button>
            </>
          )}

          {/* Step 3: Financeiro */}
          {step === 3 && (
            <>
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Financeiro & Confirmação</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="label">Desconto Geral %</label>
                  <input className="input" type="number" min="0" max="100" value={desconto}
                    onChange={e => setDesconto(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="label">Impostos %</label>
                  <input className="input" type="number" min="0" max="100" value={impostos}
                    onChange={e => setImpostos(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="label">Forma de Pagamento</label>
                  <select className="input" value={formaPagamento}
                    onChange={e => setFormaPagamento(e.target.value as FormaPagamento)}>
                    {(Object.keys(pgtoLabel) as FormaPagamento[]).map(k => (
                      <option key={k} value={k}>{pgtoLabel[k]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea className="input resize-none" rows={2} value={observacoes}
                  onChange={e => setObservacoes(e.target.value)} />
              </div>

              {/* Resumo */}
              <div className="bg-[#1a1f2e] rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Desconto ({desconto}%)</span><span>-{fmt(valorDesc)}</span></div>
                <div className="flex justify-between text-gray-400"><span>Impostos ({impostos}%)</span><span>+{fmt(valorImp)}</span></div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                  <span>Total</span><span className="text-emerald-400 text-base">{fmt(total)}</span>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
              className="btn-ghost"
            >{step === 1 ? "Cancelar" : "← Voltar"}</button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (step < 3) setStep(s => s + 1);
                else handleSubmit();
              }}
              className="btn-primary"
            >
              {loading ? "Salvando..." : step === 3 ? "Criar Rascunho ✓" : "Próximo →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página Principal ─────────────────────────────────────
export default function NotasFiscaisPage() {
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

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        empresaId: EMPRESA_ID, page: String(page), limit: "15",
        ...(filterStatus && { status: filterStatus }),
        ...(filterTipo && { tipo: filterTipo }),
        ...(search && { clienteNome: search }),
      });
      const r = await fetch(`${API}/notas-fiscais?${params}`);
      const d = await r.json();
      setNotas(d.data ?? []);
      setTotalPages(d.pages ?? 1);
    } catch { setNotas([]); } finally { setLoading(false); }
  }, [page, filterStatus, filterTipo, search]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch(`${API}/notas-fiscais/stats/${EMPRESA_ID}`);
      setStats(await r.json());
    } catch {}
  }, []);

  useEffect(() => { fetchNotas(); }, [fetchNotas]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleEmitir = async (id: string) => {
    await fetch(`${API}/notas-fiscais/${id}/emitir`, { method: "PATCH" });
    await fetchNotas(); await fetchStats();
    const r = await fetch(`${API}/notas-fiscais/${id}`);
    const d = await r.json();
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  const handleCancelar = async (id: string) => {
    const motivo = (document.querySelector('input[placeholder="Motivo do cancelamento..."]') as HTMLInputElement)?.value;
    await fetch(`${API}/notas-fiscais/cancelar`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, motivoCancelamento: motivo }),
    });
    await fetchNotas(); await fetchStats();
    setDetalhe(null);
  };

  const openDetalhe = async (id: string) => {
    const r = await fetch(`${API}/notas-fiscais/${id}`);
    const d = await r.json();
    setDetalhe({ ...d.nota, itens: d.itens });
  };

  return (
    <>
      <style>{`
        .input { @apply w-full bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors; }
        .label { @apply block text-xs text-gray-400 mb-1; }
        .btn-primary { @apply px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-50; }
        .btn-danger  { @apply px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition-colors; }
        .btn-ghost   { @apply px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-lg text-sm transition-colors; }
      `}</style>

      <div className="min-h-screen bg-[#0d1117] text-white p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🧾 Notas Fiscais</h1>
            <p className="text-sm text-gray-400 mt-0.5">Gerencie NFe, NFS-e e NFC-e</p>
          </div>
          <button onClick={() => setShowCriar(true)} className="btn-primary">
            + Nova Nota
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Emitidas" value={stats.emitidas} accent="text-emerald-400" />
            <StatCard label="Rascunhos" value={stats.rascunhos} accent="text-yellow-400" />
            <StatCard label="Canceladas" value={stats.canceladas} accent="text-red-400" />
            <StatCard label="Faturado (mês)" value={fmt(stats.valorTotalMes)} accent="text-emerald-400" sub="notas emitidas" />
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <input
            className="input w-48"
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select className="input w-36" value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value as Status | ""); setPage(1); }}>
            <option value="">Todos status</option>
            <option value="RASCUNHO">Rascunho</option>
            <option value="EMITIDA">Emitida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          <select className="input w-32" value={filterTipo}
            onChange={e => { setFilterTipo(e.target.value as TipoNota | ""); setPage(1); }}>
            <option value="">Todos tipos</option>
            <option value="NFe">NF-e</option>
            <option value="NFS">NFS-e</option>
            <option value="NFCE">NFC-e</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="bg-[#1a1f2e] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
              Carregando...
            </div>
          ) : notas.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-2">🧾</p>
              <p>Nenhuma nota encontrada</p>
              <button onClick={() => setShowCriar(true)} className="btn-primary mt-4">Criar Primeira Nota</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b border-white/5">
                    <th className="text-left px-4 py-3">Número</th>
                    <th className="text-left px-4 py-3">Tipo</th>
                    <th className="text-left px-4 py-3">Cliente</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Pagamento</th>
                    <th className="text-left px-4 py-3">Data</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map(nota => (
                    <tr key={nota.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => openDetalhe(nota.id)}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-300">{nota.numero}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-gray-300">
                          {tipoLabel[nota.tipo]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium truncate max-w-[150px]">{nota.clienteNome}</td>
                      <td className="px-4 py-3"><Badge status={nota.status} /></td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{fmt(nota.total)}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{pgtoLabel[nota.formaPagamento]}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(nota.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); openDetalhe(nota.id); }}
                          className="text-gray-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10"
                        >Ver →</button>
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">← Anterior</button>
            <span className="text-sm text-gray-400">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30">Próximo →</button>
          </div>
        )}
      </div>

      {/* Modais */}
      {showCriar && (
        <ModalCriar onClose={() => setShowCriar(false)} onCreate={() => { fetchNotas(); fetchStats(); }} />
      )}
      {detalhe && (
        <ModalDetalhes nota={detalhe} onClose={() => setDetalhe(null)}
          onEmitir={handleEmitir} onCancelar={handleCancelar} />
      )}
    </>
  );
}