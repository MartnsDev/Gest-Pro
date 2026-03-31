"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Plus, X, Check, Search, ChevronRight, Store, Smartphone,
  DollarSign, CreditCard, ShoppingBag, Truck, CheckCircle2,
  Clock, Ban, Edit2, Package, Trash2, AlertTriangle, Percent,
  Tag, MapPin, Wallet,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
  categoria?: string;
}
interface ItemCarrinho { produto: Produto; quantidade: number }
interface ItemPedidoDTO {
  idProduto: number; nomeProduto: string;
  quantidade: number; precoUnitario: number; subtotal: number;
}
interface Pedido {
  id: number; empresaId: number; nomeEmpresa: string; nomeCliente?: string;
  itens: ItemPedidoDTO[]; valorTotal: number; desconto: number;
  valorFinal: number; custoFrete: number; formaPagamento: string;
  canalVenda: string; status: string; contaDestino?: string;
  enderecoEntrega?: string; dataPedido: string; dataAtualizacao: string;
  observacao?: string; motivoCancelamento?: string;
}

type FormaPagamento = "PIX" | "DINHEIRO" | "CARTAO_DEBITO" | "CARTAO_CREDITO";
type CanalVenda = "WHATSAPP" | "INSTAGRAM" | "MERCADO_LIVRE" | "SHOPEE" | "IFOOD" | "TELEFONE" | "OUTRO";
type StatusPedido = "PENDENTE" | "CONFIRMADO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
type TipoDesconto = "REAIS" | "PORCENTAGEM";

/* ─── Constantes ─────────────────────────────────────────────────────────── */
const FORMAS: { value: FormaPagamento; label: string; icon: React.ReactNode }[] = [
  { value: "PIX",           label: "Pix",     icon: <Smartphone size={13} /> },
  { value: "DINHEIRO",      label: "Dinheiro",icon: <DollarSign size={13} /> },
  { value: "CARTAO_DEBITO", label: "Débito",  icon: <CreditCard size={13} /> },
  { value: "CARTAO_CREDITO",label: "Crédito", icon: <CreditCard size={13} /> },
];
const CANAIS: { value: CanalVenda; label: string; emoji: string }[] = [
  { value: "WHATSAPP",     label: "WhatsApp",      emoji: "💬" },
  { value: "INSTAGRAM",    label: "Instagram",     emoji: "📸" },
  { value: "MERCADO_LIVRE",label: "Mercado Livre", emoji: "🛒" },
  { value: "SHOPEE",       label: "Shopee",        emoji: "🧡" },
  { value: "IFOOD",        label: "iFood",         emoji: "🍔" },
  { value: "TELEFONE",     label: "Telefone",      emoji: "📞" },
  { value: "OUTRO",        label: "Outro",         emoji: "📦" },
];
const STATUS_META: Record<StatusPedido, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDENTE:   { label: "Pendente",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  icon: <Clock size={12} /> },
  CONFIRMADO: { label: "Confirmado", color: "var(--primary)", bg: "var(--primary-muted)", icon: <CheckCircle2 size={12} /> },
  ENVIADO:    { label: "Enviado",    color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  icon: <Truck size={12} /> },
  ENTREGUE:   { label: "Entregue",   color: "#10b981", bg: "rgba(16,185,129,0.12)",  icon: <Check size={12} /> },
  CANCELADO:  { label: "Cancelado",  color: "var(--destructive)", bg: "rgba(239,68,68,0.12)", icon: <Ban size={12} /> },
};
const STATUS_FLOW: StatusPedido[] = ["PENDENTE", "CONFIRMADO", "ENVIADO", "ENTREGUE"];
const FORMA_LABEL: Record<string, string> = {
  PIX: "Pix", DINHEIRO: "Dinheiro", CARTAO_DEBITO: "Débito", CARTAO_CREDITO: "Crédito",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?: number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

const fmtData = (s?: any) => {
  if (!s) return "—";
  const d = Array.isArray(s)
    ? new Date(Date.UTC(s[0], s[1] - 1, s[2], s[3] ?? 0, s[4] ?? 0))
    : new Date(typeof s === "string" ? s.replace(" ", "T") : s);
  return isNaN(d.getTime()) ? "—"
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const token =
    (typeof window !== "undefined"
      ? sessionStorage.getItem("jwt_token") ??
        document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ?? null
      : null) ?? "";
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "https://gestpro-backend-production.up.railway.app"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...opts },
  );
  if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.mensagem ?? `Erro ${res.status}`); }
  return res.json();
}

/* ─── Estilos ────────────────────────────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: "100%", padding: "8px 11px",
  background: "var(--surface-overlay)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--foreground)", fontSize: 13, outline: "none",
};
const btnP: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
  background: "var(--primary)", border: "none", borderRadius: 8,
  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const btnG: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "7px 11px",
  background: "transparent", border: "1px solid var(--border)", borderRadius: 8,
  color: "var(--foreground-muted)", fontSize: 12, cursor: "pointer",
};
const btnDanger: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "7px 11px",
  background: "transparent", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 8,
  color: "var(--destructive)", fontSize: 12, cursor: "pointer",
};

/* ─── Badges ─────────────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status as StatusPedido] ?? { label: status, color: "var(--foreground-muted)", bg: "var(--surface-overlay)", icon: null };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, color: meta.color, background: meta.bg }}>
      {meta.icon} {meta.label}
    </span>
  );
}
function CanalBadge({ canal }: { canal: string }) {
  const meta = CANAIS.find((c) => c.value === canal) ?? { label: canal, emoji: "📦" };
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 500, background: "var(--surface-overlay)", color: "var(--foreground-muted)", border: "1px solid var(--border)" }}>
      {meta.emoji} {meta.label}
    </span>
  );
}

/* ─── Seletor forma pagamento ────────────────────────────────────────────── */
function SeletorForma({ value, onChange }: { value: FormaPagamento; onChange: (v: FormaPagamento) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
      {FORMAS.map((f) => (
        <button key={f.value} onClick={() => onChange(f.value)} style={{
          display: "flex", alignItems: "center", gap: 5, padding: "7px 8px",
          background: value === f.value ? "var(--primary-muted)" : "var(--surface-overlay)",
          border: `1px solid ${value === f.value ? "var(--primary)" : "var(--border)"}`,
          borderRadius: 7, cursor: "pointer",
          color: value === f.value ? "var(--primary)" : "var(--foreground-muted)",
          fontSize: 11, fontWeight: value === f.value ? 600 : 400,
        }}>
          {f.icon} {f.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Modal confirmação de exclusão ─────────────────────────────────────── */
function ModalConfirmarExclusao({
  titulo, descricao, onConfirmar, onCancelar, confirmando,
}: {
  titulo: string; descricao: string;
  onConfirmar: () => void; onCancelar: () => void; confirmando: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertTriangle size={24} color="var(--destructive)" />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: "0 0 8px" }}>{titulo}</h3>
        <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "0 0 24px", lineHeight: 1.5 }}>{descricao}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancelar} style={{ ...btnG, flex: 1, justifyContent: "center" }}>Cancelar</button>
          <button onClick={onConfirmar} disabled={confirmando} style={{
            flex: 2, padding: "9px 0", background: "var(--destructive)", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            opacity: confirmando ? 0.7 : 1,
          }}>
            <Trash2 size={14} /> {confirmando ? "Removendo..." : "Confirmar Exclusão"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal Novo Pedido ─────────────────────────────────────────────────── */
function ModalNovoPedido({
  empresaId, onClose, onSucesso,
}: { empresaId: number; onClose: () => void; onSucesso: (p: Pedido) => void }) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState("");
  const [forma, setForma] = useState<FormaPagamento>("PIX");
  const [canal, setCanal] = useState<CanalVenda>("OUTRO");
  const [contaDestino, setContaDestino] = useState("");
  const [tipoDesconto, setTipoDesconto] = useState<TipoDesconto>("REAIS");
  const [desconto, setDesconto] = useState("");
  const [frete, setFrete] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchAuth<Produto[]>(`/api/v1/produtos?empresaId=${empresaId}`)
      .then(setProdutos)
      .catch(() => toast.error("Erro ao carregar produtos"));
  }, [empresaId]);

  const filtrados = useMemo(
    () => produtos.filter((p) => p.quantidadeEstoque > 0 && p.nome.toLowerCase().includes(busca.toLowerCase())),
    [produtos, busca],
  );

  const addItem = (p: Produto) =>
    setCarrinho((prev) => {
      const ex = prev.find((i) => i.produto.id === p.id);
      if (ex) {
        if (ex.quantidade >= p.quantidadeEstoque) { toast.error(`Máx: ${p.quantidadeEstoque}`); return prev; }
        return prev.map((i) => i.produto.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      }
      return [...prev, { produto: p, quantidade: 1 }];
    });

  const setQtd = (id: number, q: number) => {
    if (q <= 0) setCarrinho((prev) => prev.filter((i) => i.produto.id !== id));
    else setCarrinho((prev) => prev.map((i) => i.produto.id === id ? { ...i, quantidade: q } : i));
  };

  const subtotal = carrinho.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
  const descontoRaw = parseFloat(desconto.replace(",", ".")) || 0;
  const descontoN = tipoDesconto === "PORCENTAGEM"
    ? Math.min(subtotal * (descontoRaw / 100), subtotal)
    : Math.max(0, descontoRaw);
  const freteN = Math.max(0, parseFloat(frete.replace(",", ".")) || 0);
  const total = Math.max(subtotal - descontoN + freteN, 0);

  const registrar = async () => {
    if (!carrinho.length) { toast.error("Adicione pelo menos um produto."); return; }
    setSalvando(true);
    try {
      const body = {
        formaPagamento: forma, canalVenda: canal,
        contaDestino: contaDestino || null, desconto: descontoN,
        custoFrete: freteN, enderecoEntrega: endereco || null,
        observacao: observacao || null,
        itens: carrinho.map((i) => ({ idProduto: i.produto.id, quantidade: i.quantidade })),
      };
      const pedido = await fetchAuth<Pedido>(`/api/v1/pedidos/empresa/${empresaId}`, { method: "POST", body: JSON.stringify(body) });
      onClose();
      onSucesso(pedido);
    } catch (e: any) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, width: "100%", maxWidth: 900, maxHeight: "95vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShoppingBag size={16} color="var(--primary)" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Novo Pedido</h2>
          </div>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* Lista de produtos */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
                <input style={{ ...inp, paddingLeft: 28 }} placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} autoFocus />
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtrados.length === 0
                ? <div style={{ padding: 28, textAlign: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>Nenhum produto disponível</div>
                : filtrados.map((p) => {
                    const nc = carrinho.find((i) => i.produto.id === p.id);
                    return (
                      <div key={p.id} onClick={() => addItem(p)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-overlay)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", margin: 0 }}>{p.nome}</p>
                          <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "2px 0 0" }}>
                            Estoque: {p.quantidadeEstoque}{p.categoria ? ` · ${p.categoria}` : ""}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{fmt(p.preco)}</span>
                          {nc && <span style={{ fontSize: 11, background: "var(--primary-muted)", color: "var(--primary)", padding: "2px 7px", borderRadius: 99, fontWeight: 600 }}>{nc.quantidade}×</span>}
                          <Plus size={13} color="var(--foreground-muted)" />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>

          {/* Painel direito */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Carrinho */}
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 13px" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>
                Carrinho ({carrinho.length})
              </p>
              {carrinho.length === 0
                ? <div style={{ textAlign: "center", color: "var(--foreground-subtle)", fontSize: 12, padding: "16px 0" }}>Clique nos produtos →</div>
                : carrinho.map((item) => (
                    <div key={item.produto.id} style={{ marginBottom: 7, padding: "8px 9px", background: "var(--surface-overlay)", borderRadius: 7, border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", margin: 0, flex: 1, paddingRight: 6 }}>{item.produto.nome}</p>
                        <button onClick={() => setCarrinho((prev) => prev.filter((i) => i.produto.id !== item.produto.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-subtle)", padding: 0 }}><X size={11} /></button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <button onClick={() => setQtd(item.produto.id, item.quantidade - 1)} style={{ width: 20, height: 20, borderRadius: 5, background: "var(--surface-elevated)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>−</button>
                          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: "center" }}>{item.quantidade}</span>
                          <button onClick={() => setQtd(item.produto.id, item.quantidade + 1)} disabled={item.quantidade >= item.produto.quantidadeEstoque} style={{ width: 20, height: 20, borderRadius: 5, background: "var(--primary-muted)", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, opacity: item.quantidade >= item.produto.quantidadeEstoque ? 0.4 : 1 }}>+</button>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(item.produto.preco * item.quantidade)}</span>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Formulário */}
            <div style={{ padding: "10px 13px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 9, overflowY: "auto" }}>
              {/* Resumo */}
              <div style={{ background: "var(--surface-overlay)", borderRadius: 8, padding: "8px 11px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)" }}>
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                {descontoN > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--destructive)" }}>
                    <span>Desconto{tipoDesconto === "PORCENTAGEM" ? ` (${descontoRaw}%)` : ""}</span>
                    <span>− {fmt(descontoN)}</span>
                  </div>
                )}
                {freteN > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)" }}>
                    <span>Frete</span><span>+ {fmt(freteN)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "var(--primary)", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
              </div>

              {/* Canal */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 5 }}>Canal de Venda</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {CANAIS.map((c) => (
                    <button key={c.value} onClick={() => setCanal(c.value as CanalVenda)} style={{
                      padding: "6px 8px", fontSize: 11, display: "flex", alignItems: "center", gap: 5,
                      background: canal === c.value ? "var(--primary-muted)" : "var(--surface-overlay)",
                      border: `1px solid ${canal === c.value ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 7, cursor: "pointer",
                      color: canal === c.value ? "var(--primary)" : "var(--foreground-muted)",
                      fontWeight: canal === c.value ? 600 : 400,
                    }}>
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pagamento */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 5 }}>Pagamento</label>
                <SeletorForma value={forma} onChange={setForma} />
              </div>

              {/* Conta destino */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>
                  <Wallet size={10} style={{ display: "inline", marginRight: 4 }} />Conta Destino
                </label>
                <input style={inp} value={contaDestino} onChange={(e) => setContaDestino(e.target.value)} placeholder="Ex: Mercado Pago, Nubank..." />
              </div>

              {/* Desconto com toggle % / R$ */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>Desconto</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                    {(["REAIS", "PORCENTAGEM"] as TipoDesconto[]).map((t) => (
                      <button key={t} onClick={() => { setTipoDesconto(t); setDesconto(""); }} style={{
                        padding: "7px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                        background: tipoDesconto === t ? "var(--primary)" : "var(--surface-overlay)",
                        color: tipoDesconto === t ? "#fff" : "var(--foreground-muted)",
                      }}>
                        {t === "REAIS" ? "R$" : "%"}
                      </button>
                    ))}
                  </div>
                  <input style={{ ...inp, flex: 1 }} type="number" min="0" step={tipoDesconto === "PORCENTAGEM" ? "1" : "0.01"} max={tipoDesconto === "PORCENTAGEM" ? "100" : undefined} value={desconto} onChange={(e) => setDesconto(e.target.value)} placeholder={tipoDesconto === "PORCENTAGEM" ? "0 – 100" : "0,00"} />
                </div>
              </div>

              {/* Frete + endereço */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>Frete R$</label>
                  <input style={inp} type="number" min="0" step="0.01" value={frete} onChange={(e) => setFrete(e.target.value)} placeholder="0,00" />
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>Observação</label>
                  <input style={inp} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Opcional..." />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>
                  <MapPin size={10} style={{ display: "inline", marginRight: 4 }} />Endereço de Entrega
                </label>
                <input style={inp} value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade..." />
              </div>

              <button onClick={registrar} disabled={salvando || !carrinho.length} style={{ ...btnP, justifyContent: "center", padding: "11px 0", opacity: salvando || !carrinho.length ? 0.6 : 1 }}>
                {salvando ? "Registrando..." : <><ShoppingBag size={14} /> Registrar Pedido · {fmt(total)}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detalhe do Pedido ─────────────────────────────────────────────────── */
function DetalhePedido({
  pedido, onClose, onAtualizado, onRemovido,
}: {
  pedido: Pedido; onClose: () => void;
  onAtualizado: (p: Pedido) => void;
  onRemovido: (id: number) => void;
}) {
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [editandoObs, setEditandoObs] = useState(false);
  const [novaObs, setNovaObs] = useState(pedido.observacao ?? "");
  const [salvando, setSalvando] = useState(false);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  const proximoStatus = STATUS_FLOW[STATUS_FLOW.indexOf(pedido.status as StatusPedido) + 1];

  // Calcula % de desconto para exibição
  const pctDesconto = pedido.valorTotal > 0 && pedido.desconto > 0
    ? ((pedido.desconto / pedido.valorTotal) * 100).toFixed(1)
    : null;

  const avancarStatus = async () => {
    if (!proximoStatus) return;
    setSalvando(true);
    try {
      const updated = await fetchAuth<Pedido>(`/api/v1/pedidos/${pedido.id}/status`, { method: "PATCH", body: JSON.stringify({ status: proximoStatus }) });
      onAtualizado(updated);
      toast.success(`Status → ${STATUS_META[proximoStatus].label}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  const cancelar = async () => {
    setSalvando(true);
    try {
      const updated = await fetchAuth<Pedido>(`/api/v1/pedidos/${pedido.id}/cancelar`, { method: "POST", body: JSON.stringify({ motivo }) });
      onAtualizado(updated);
      setCancelando(false);
      toast.success("Pedido cancelado. Estoque devolvido.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  const salvarObs = async () => {
    setSalvando(true);
    try {
      const updated = await fetchAuth<Pedido>(`/api/v1/pedidos/${pedido.id}/observacao`, { method: "PATCH", body: JSON.stringify({ observacao: novaObs }) });
      onAtualizado(updated);
      setEditandoObs(false);
      toast.success("Observação salva!");
    } catch (e: any) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  const remover = async () => {
    setRemovendo(true);
    try {
      await fetchAuth(`/api/v1/pedidos/${pedido.id}`, { method: "DELETE" });
      onRemovido(pedido.id);
      onClose();
      toast.success(`Pedido #${pedido.id} removido do histórico.`);
    } catch (e: any) { toast.error(e.message); }
    finally { setRemovendo(false); setConfirmandoRemocao(false); }
  };

  const canalMeta = CANAIS.find((c) => c.value === pedido.canalVenda);

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460, maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Pedido #{pedido.id}</h2>
                <StatusBadge status={pedido.status} />
              </div>
              <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: 0 }}>{fmtData(pedido.dataPedido)}</p>
            </div>
            <button onClick={onClose} style={{ ...btnG, padding: 5, border: "none" }}><X size={16} /></button>
          </div>

          {/* Info badges */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <CanalBadge canal={pedido.canalVenda} />
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 500, background: "var(--surface-overlay)", color: "var(--foreground-muted)", border: "1px solid var(--border)" }}>
              💳 {FORMA_LABEL[pedido.formaPagamento] ?? pedido.formaPagamento}
            </span>
            {pedido.contaDestino && (
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)", fontWeight: 500 }}>
                <Wallet size={10} style={{ display: "inline", marginRight: 3 }} />{pedido.contaDestino}
              </span>
            )}
          </div>

          {/* Produtos */}
          <div style={{ background: "var(--surface-overlay)", borderRadius: 10, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".07em", margin: "0 0 10px" }}>Produtos</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pedido.itens.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 13, color: "var(--foreground)", margin: 0, fontWeight: 500 }}>{item.nomeProduto}</p>
                    <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "1px 0 0" }}>
                      {item.quantidade}× {fmt(item.precoUnitario)}
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{fmt(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totais detalhados */}
          <div style={{ background: "var(--surface-overlay)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)" }}>
              <span>Subtotal</span><span>{fmt(pedido.valorTotal)}</span>
            </div>
            {pedido.desconto > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--destructive)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Tag size={11} />
                  Desconto
                  {pctDesconto && (
                    <span style={{ fontSize: 10, background: "rgba(239,68,68,0.1)", padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>
                      {pctDesconto}%
                    </span>
                  )}
                </span>
                <span>− {fmt(pedido.desconto)}</span>
              </div>
            )}
            {pedido.custoFrete > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Truck size={11} />Frete</span>
                <span>+ {fmt(pedido.custoFrete)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "var(--primary)", paddingTop: 6, borderTop: "1px solid var(--border)", marginTop: 2 }}>
              <span>Total</span><span>{fmt(pedido.valorFinal)}</span>
            </div>
          </div>

          {/* Endereço */}
          {pedido.enderecoEntrega && (
            <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "var(--surface-overlay)", borderRadius: 9, fontSize: 12, color: "var(--foreground-muted)" }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: 1 }} color="#3b82f6" />
              <span>{pedido.enderecoEntrega}</span>
            </div>
          )}

          {/* Observação */}
          <div>
            {editandoObs
              ? <div style={{ display: "flex", gap: 6 }}>
                  <input style={{ ...inp, flex: 1 }} value={novaObs} onChange={(e) => setNovaObs(e.target.value)} placeholder="Observação..." autoFocus />
                  <button onClick={salvarObs} disabled={salvando} style={{ ...btnP, padding: "7px 12px" }}><Check size={13} /></button>
                  <button onClick={() => setEditandoObs(false)} style={{ ...btnG, padding: "7px 10px" }}><X size={13} /></button>
                </div>
              : <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: 0, flex: 1, fontStyle: pedido.observacao ? "normal" : "italic" }}>
                    {pedido.observacao || "Sem observação"}
                  </p>
                  {pedido.status !== "CANCELADO" && (
                    <button onClick={() => setEditandoObs(true)} style={{ ...btnG, padding: "4px 8px" }}><Edit2 size={12} /></button>
                  )}
                </div>}
          </div>

          {/* Motivo cancelamento */}
          {pedido.motivoCancelamento && (
            <div style={{ padding: "10px 12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9, fontSize: 12, color: "var(--destructive)" }}>
              <strong>Motivo:</strong> {pedido.motivoCancelamento}
            </div>
          )}

          {/* Avançar status / cancelar */}
          {pedido.status !== "CANCELADO" && !cancelando && !editandoObs && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {proximoStatus && (
                <button onClick={avancarStatus} disabled={salvando} style={{ ...btnP, justifyContent: "center" }}>
                  {STATUS_META[proximoStatus].icon} Marcar como {STATUS_META[proximoStatus].label}
                </button>
              )}
              {pedido.status !== "ENTREGUE" && (
                <button onClick={() => setCancelando(true)} style={{ ...btnDanger, justifyContent: "center" }}>
                  <Ban size={13} /> Cancelar pedido
                </button>
              )}
            </div>
          )}

          {cancelando && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9 }}>
              <p style={{ fontSize: 12, color: "var(--destructive)", fontWeight: 600, margin: 0 }}>Confirmar cancelamento?</p>
              <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: 0 }}>O estoque será devolvido automaticamente.</p>
              <input style={{ ...inp }} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (opcional)..." />
              <div style={{ display: "flex", gap: 7 }}>
                <button onClick={() => setCancelando(false)} style={{ ...btnG, flex: 1, justifyContent: "center" }}>Voltar</button>
                <button onClick={cancelar} disabled={salvando} style={{ flex: 2, padding: "8px 0", background: "var(--destructive)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: salvando ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Ban size={13} /> Confirmar
                </button>
              </div>
            </div>
          )}

          {/* Remover do histórico */}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
            <button onClick={() => setConfirmandoRemocao(true)} style={{ ...btnDanger, width: "100%", justifyContent: "center", fontSize: 12 }}>
              <Trash2 size={13} /> Remover do histórico
            </button>
          </div>
        </div>
      </div>

      {confirmandoRemocao && (
        <ModalConfirmarExclusao
          titulo="Remover pedido do histórico?"
          descricao={`O pedido #${pedido.id} será permanentemente removido. Esta ação não pode ser desfeita.`}
          onConfirmar={remover}
          onCancelar={() => setConfirmandoRemocao(false)}
          confirmando={removendo}
        />
      )}
    </>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function Pedidos() {
  const { empresaAtiva } = useEmpresa();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [detalhe, setDetalhe] = useState<Pedido | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");
  const [confirmandoLimpar, setConfirmandoLimpar] = useState(false);
  const [limpando, setLimpando] = useState(false);

  const carregar = useCallback(async () => {
    if (!empresaAtiva) return;
    setLoading(true);
    try {
      setPedidos(await fetchAuth<Pedido[]>(`/api/v1/pedidos/empresa/${empresaAtiva.id}`));
    } catch { toast.error("Erro ao carregar pedidos"); }
    finally { setLoading(false); }
  }, [empresaAtiva?.id]);

  useEffect(() => { carregar(); }, [carregar]);

  /* Adiciona pedido na lista SEM recarregar */
  const adicionarPedido = useCallback((p: Pedido) => {
    setPedidos((prev) => [p, ...prev]);
    toast.success(`Pedido #${p.id} registrado!`);
  }, []);

  /* Remove um pedido da lista local */
  const removerPedido = useCallback((id: number) => {
    setPedidos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  /* Atualiza pedido na lista local */
  const atualizarPedido = useCallback((updated: Pedido) => {
    setPedidos((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setDetalhe(updated);
  }, []);

  /* Limpar todo histórico */
  const limparTudo = async () => {
    if (!empresaAtiva) return;
    setLimpando(true);
    try {
      await fetchAuth(`/api/v1/pedidos/empresa/${empresaAtiva.id}/historico`, { method: "DELETE" });
      setPedidos([]);
      setConfirmandoLimpar(false);
      toast.success("Histórico de pedidos apagado.");
    } catch (e: any) { toast.error(e.message); }
    finally { setLimpando(false); }
  };

  const pedidosFiltrados = useMemo(() => {
    return pedidos
      .filter((p) => filtroStatus === "TODOS" || p.status === filtroStatus)
      .filter((p) =>
        busca === "" ||
        String(p.id).includes(busca) ||
        (p.nomeCliente ?? "").toLowerCase().includes(busca.toLowerCase()) ||
        (CANAIS.find((c) => c.value === p.canalVenda)?.label ?? "").toLowerCase().includes(busca.toLowerCase()),
      );
  }, [pedidos, filtroStatus, busca]);

  const ativos     = pedidos.filter((p) => p.status !== "CANCELADO");
  const totalBruto = ativos.reduce((s, p) => s + p.valorFinal, 0);
  const pendentes  = pedidos.filter((p) => p.status === "PENDENTE").length;

  if (!empresaAtiva)
    return (
      <div style={{ padding: 48, textAlign: "center", color: "var(--foreground-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Store size={40} color="var(--foreground-subtle)" />
        <p style={{ fontSize: 14 }}>Selecione uma empresa para ver os pedidos.</p>
      </div>
    );

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Pedidos</h2>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 3 }}>
            {empresaAtiva.nomeFantasia} · vendas remotas &amp; online
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {pedidos.length > 0 && (
            <button onClick={() => setConfirmandoLimpar(true)} style={btnDanger}>
              <Trash2 size={14} /> Limpar histórico
            </button>
          )}
          <button style={btnP} onClick={() => setModalNovo(true)}>
            <Plus size={15} /> Novo Pedido
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {[
          { label: "Total Faturado",   value: fmt(totalBruto), destaque: true },
          { label: "Total de Pedidos", value: String(ativos.length) },
          { label: "Pendentes",        value: String(pendentes), warn: pendentes > 0 },
          { label: "Cancelados",       value: String(pedidos.filter((p) => p.status === "CANCELADO").length) },
        ].map((k, i) => (
          <div key={i} style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>{k.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: k.destaque ? "var(--primary)" : k.warn ? "#f59e0b" : "var(--foreground)" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros + busca */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {["TODOS", ...Object.keys(STATUS_META)].map((s) => (
          <button key={s} onClick={() => setFiltroStatus(s)} style={{
            padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: "pointer",
            background: filtroStatus === s ? "var(--primary-muted)" : "transparent",
            border: `1px solid ${filtroStatus === s ? "var(--primary)" : "var(--border)"}`,
            color: filtroStatus === s ? "var(--primary)" : "var(--foreground-muted)",
          }}>
            {s === "TODOS" ? "Todos" : STATUS_META[s as StatusPedido].label}
          </button>
        ))}
        <div style={{ position: "relative", marginLeft: "auto" }}>
          <Search size={11} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
          <input style={{ ...inp, paddingLeft: 26, padding: "6px 9px 6px 26px", fontSize: 12, maxWidth: 220 }} placeholder="Buscar pedido..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </div>

      {/* Lista */}
      {loading
        ? <div style={{ textAlign: "center", color: "var(--foreground-muted)", fontSize: 13, padding: 32 }}>Carregando...</div>
        : pedidosFiltrados.length === 0
          ? <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--foreground-subtle)" }}>
              <Package size={40} />
              <p style={{ fontSize: 14 }}>{pedidos.length === 0 ? "Nenhum pedido registrado." : "Sem resultados para este filtro."}</p>
            </div>
          : <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pedidosFiltrados.map((p) => (
                <div key={p.id} onClick={() => setDetalhe(p)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", transition: "border-color .1s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--primary)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", minWidth: 32 }}>#{p.id}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <StatusBadge status={p.status} />
                        <CanalBadge canal={p.canalVenda} />
                        {p.contaDestino && <span style={{ fontSize: 11, color: "var(--foreground-muted)" }}>💳 {p.contaDestino}</span>}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "3px 0 0" }}>
                        {fmtData(p.dataPedido)} · {p.itens?.length ?? 0} item(s)
                        {p.nomeCliente ? ` · ${p.nomeCliente}` : ""}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: p.status === "CANCELADO" ? "var(--foreground-subtle)" : "var(--primary)", textDecoration: p.status === "CANCELADO" ? "line-through" : "none" }}>
                      {fmt(p.valorFinal)}
                    </span>
                    <ChevronRight size={14} color="var(--foreground-subtle)" />
                  </div>
                </div>
              ))}
            </div>}

      {/* Modais */}
      {modalNovo && (
        <ModalNovoPedido
          empresaId={empresaAtiva.id}
          onClose={() => setModalNovo(false)}
          onSucesso={adicionarPedido}
        />
      )}
      {detalhe && (
        <DetalhePedido
          pedido={detalhe}
          onClose={() => setDetalhe(null)}
          onAtualizado={atualizarPedido}
          onRemovido={removerPedido}
        />
      )}
      {confirmandoLimpar && (
        <ModalConfirmarExclusao
          titulo="Limpar todo o histórico?"
          descricao="Todos os pedidos desta empresa serão permanentemente removidos. Esta ação não pode ser desfeita."
          onConfirmar={limparTudo}
          onCancelar={() => setConfirmandoLimpar(false)}
          confirmando={limpando}
        />
      )}
    </div>
  );
}