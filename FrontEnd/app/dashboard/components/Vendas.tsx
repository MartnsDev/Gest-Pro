"use client";

import { useEffect, useState, useMemo } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Plus, X, Check, Search, ChevronDown, ChevronUp,
  AlertCircle, CreditCard, DollarSign, Smartphone,
  Receipt, Store, ChevronRight, BarChart3, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface Produto {
  id: number; nome: string; preco: number;
  quantidadeEstoque: number; categoria?: string;
}
interface ItemCarrinho { produto: Produto; quantidade: number; }
interface ItemVendaDTO {
  idProduto: number; nomeProduto: string;
  quantidade: number; precoUnitario: number; subtotal: number;
}
interface Venda {
  id: number; formaPagamento: string;
  valorTotal: number; desconto: number; valorFinal: number;
  observacao?: string; dataVenda: string;
  itens: ItemVendaDTO[]; nomeCliente?: string;
}
interface CaixaInfo {
  id: number; status: string; aberto: boolean;
  valorInicial: number; valorFinal?: number; totalVendas: number;
  dataAbertura: string; dataFechamento?: string;
  empresaId: number;
}
type FormaPagamento = "PIX" | "DINHEIRO" | "CARTAO_DEBITO" | "CARTAO_CREDITO";

const FORMAS: { value: FormaPagamento; label: string; icon: React.ReactNode }[] = [
  { value: "PIX",            label: "Pix",     icon: <Smartphone size={15} /> },
  { value: "DINHEIRO",       label: "Dinheiro", icon: <DollarSign size={15} /> },
  { value: "CARTAO_DEBITO",  label: "Débito",   icon: <CreditCard size={15} /> },
  { value: "CARTAO_CREDITO", label: "Crédito",  icon: <CreditCard size={15} /> },
];
const FORMA_LABEL: Record<string, string> = {
  PIX: "Pix", DINHEIRO: "Dinheiro", CARTAO_DEBITO: "Débito", CARTAO_CREDITO: "Crédito",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?: number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

const fmtData = (s?: string) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return s; }
};
const fmtDia = (s?: string) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }); }
  catch { return s; }
};

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.mensagem ?? `Erro ${res.status}`); }
  return res.json();
}

/* ─── Estilos ────────────────────────────────────────────────────────────── */
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 13, outline: "none" };
const btnP: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "var(--primary)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnG: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground-muted)", fontSize: 13, cursor: "pointer" };

/* ─── Tela de sucesso pós-venda ──────────────────────────────────────────── */
function TelaVendaSucesso({ venda, onFechar }: { venda: Venda; onFechar: () => void }) {
  useEffect(() => {
    const t = setTimeout(onFechar, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 380, width: "100%" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--success-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <CheckCircle2 size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", margin: "0 0 8px" }}>Venda Concluída!</h2>
        <p style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)", margin: "0 0 4px" }}>{fmt(venda.valorFinal)}</p>
        {venda.desconto > 0 && <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "0 0 16px" }}>Desconto aplicado: {fmt(venda.desconto)}</p>}
        <p style={{ fontSize: 14, color: "var(--foreground-muted)", margin: "0 0 6px" }}>{venda.itens.length} item(s) · {FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento}</p>
        <p style={{ fontSize: 12, color: "var(--foreground-subtle)", margin: "0 0 24px" }}>Venda #{venda.id} · {fmtData(venda.dataVenda)}</p>
        <button onClick={onFechar} style={{ ...btnP, justifyContent: "center", width: "100%", padding: "11px 0" }}>
          Continuar
        </button>
        <p style={{ fontSize: 11, color: "var(--foreground-subtle)", marginTop: 12 }}>Fecha automaticamente em 4s</p>
      </div>
    </div>
  );
}

/* ─── Modal Nova Venda ───────────────────────────────────────────────────── */
function ModalNovaVenda({ caixaId, empresaId, onClose, onSucesso }: {
  caixaId: number; empresaId: number;
  onClose: () => void; onSucesso: (v: Venda) => void;
}) {
  const [produtos,   setProdutos]   = useState<Produto[]>([]);
  const [carrinho,   setCarrinho]   = useState<ItemCarrinho[]>([]);
  const [busca,      setBusca]      = useState("");
  const [forma,      setForma]      = useState<FormaPagamento>("PIX");
  const [desconto,   setDesconto]   = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando,   setSalvando]   = useState(false);

  useEffect(() => {
    fetchAuth<Produto[]>(`/api/v1/produtos?empresaId=${empresaId}`).then(setProdutos).catch(() => toast.error("Erro ao carregar produtos"));
  }, [empresaId]);

  const filtrados = useMemo(() => produtos.filter(p => p.quantidadeEstoque > 0 && p.nome.toLowerCase().includes(busca.toLowerCase())), [produtos, busca]);

  const addItem = (p: Produto) => setCarrinho(prev => {
    const ex = prev.find(i => i.produto.id === p.id);
    if (ex) {
      if (ex.quantidade >= p.quantidadeEstoque) { toast.error(`Máx: ${p.quantidadeEstoque}`); return prev; }
      return prev.map(i => i.produto.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i);
    }
    return [...prev, { produto: p, quantidade: 1 }];
  });

  const setQtd = (id: number, q: number) => {
    if (q <= 0) setCarrinho(prev => prev.filter(i => i.produto.id !== id));
    else setCarrinho(prev => prev.map(i => i.produto.id === id ? { ...i, quantidade: q } : i));
  };

  const subtotal  = carrinho.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
  const descontoN = Math.max(0, parseFloat(desconto.replace(",", ".")) || 0);
  const total     = Math.max(subtotal - descontoN, 0);

  const registrar = async () => {
    if (!carrinho.length) { toast.error("Adicione pelo menos um produto."); return; }
    setSalvando(true);
    try {
      const venda = await fetchAuth<Venda>("/api/v1/vendas/registrar", {
        method: "POST",
        body: JSON.stringify({
          idCaixa: caixaId, formaPagamento: forma,
          desconto: descontoN, observacao: observacao || null,
          itens: carrinho.map(i => ({ idProduto: i.produto.id, quantidade: i.quantidade })),
        }),
      });
      onClose();
      onSucesso(venda);
    } catch (e: any) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, width: "100%", maxWidth: 820, maxHeight: "92vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Nova Venda — Caixa #{caixaId}</h2>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* Produtos */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
                <input style={{ ...inp, paddingLeft: 32 }} placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} autoFocus />
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtrados.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>Nenhum produto disponível</div>
              ) : filtrados.map(p => {
                const nc = carrinho.find(i => i.produto.id === p.id);
                return (
                  <div key={p.id} onClick={() => addItem(p)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-overlay)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", margin: 0 }}>{p.nome}</p>
                      <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "2px 0 0" }}>Estoque: {p.quantidadeEstoque}{p.categoria ? ` · ${p.categoria}` : ""}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{fmt(p.preco)}</span>
                      {nc && <span style={{ fontSize: 11, background: "var(--primary-muted)", color: "var(--primary)", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>{nc.quantidade}×</span>}
                      <Plus size={14} color="var(--foreground-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Carrinho */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10 }}>Carrinho ({carrinho.length})</p>
              {carrinho.length === 0
                ? <div style={{ textAlign: "center", color: "var(--foreground-subtle)", fontSize: 13, padding: "20px 0" }}>Clique nos produtos para adicionar</div>
                : carrinho.map(item => (
                  <div key={item.produto.id} style={{ marginBottom: 8, padding: "9px 10px", background: "var(--surface-overlay)", borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", margin: 0, flex: 1, paddingRight: 6 }}>{item.produto.nome}</p>
                      <button onClick={() => setCarrinho(prev => prev.filter(i => i.produto.id !== item.produto.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-subtle)", padding: 0 }}><X size={12} /></button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => setQtd(item.produto.id, item.quantidade - 1)} style={{ width: 22, height: 22, borderRadius: 5, background: "var(--surface-elevated)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.quantidade}</span>
                        <button onClick={() => setQtd(item.produto.id, item.quantidade + 1)} disabled={item.quantidade >= item.produto.quantidadeEstoque} style={{ width: 22, height: 22, borderRadius: 5, background: "var(--primary-muted)", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", opacity: item.quantidade >= item.produto.quantidadeEstoque ? 0.4 : 1 }}>+</button>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(item.produto.preco * item.quantidade)}</span>
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                {FORMAS.map(f => (
                  <button key={f.value} onClick={() => setForma(f.value)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 8px", background: forma === f.value ? "var(--primary-muted)" : "var(--surface-overlay)", border: `1px solid ${forma === f.value ? "var(--primary)" : "var(--border)"}`, borderRadius: 7, cursor: "pointer", color: forma === f.value ? "var(--primary)" : "var(--foreground-muted)", fontSize: 11, fontWeight: forma === f.value ? 600 : 400 }}>
                    {f.icon}{f.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 5 }}>Desconto R$</label>
                  <input style={inp} type="number" min="0" step="0.01" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0,00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 5 }}>Observação</label>
                  <input style={inp} value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Opcional..." />
                </div>
              </div>
              <div style={{ background: "var(--surface-overlay)", borderRadius: 8, padding: "9px 11px", display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)" }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {descontoN > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--destructive)" }}><span>Desconto</span><span>− {fmt(descontoN)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, color: "var(--primary)", paddingTop: 5, borderTop: "1px solid var(--border)" }}><span>Total</span><span>{fmt(total)}</span></div>
              </div>
              <button onClick={registrar} disabled={salvando || !carrinho.length} style={{ ...btnP, justifyContent: "center", padding: "11px 0", opacity: (salvando || !carrinho.length) ? 0.6 : 1 }}>
                {salvando ? "Registrando..." : <><Check size={14} />Confirmar · {fmt(total)}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detalhe da Venda ───────────────────────────────────────────────────── */
function DetalheVenda({ venda, onClose }: { venda: Venda; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 26, width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Venda #{venda.id}</h2>
            <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "3px 0 0" }}>{fmtData(venda.dataVenda)}</p>
          </div>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
          {venda.itens.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--foreground)" }}>{item.nomeProduto} <span style={{ color: "var(--foreground-muted)" }}>× {item.quantidade}</span></span>
              <span style={{ fontWeight: 500 }}>{fmt(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: "var(--surface-overlay)", borderRadius: 8, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)" }}><span>Subtotal</span><span>{fmt(venda.valorTotal)}</span></div>
          {venda.desconto > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--destructive)" }}><span>Desconto</span><span>− {fmt(venda.desconto)}</span></div>}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, color: "var(--primary)", paddingTop: 6, borderTop: "1px solid var(--border)" }}><span>Total</span><span>{fmt(venda.valorFinal)}</span></div>
        </div>
        <div style={{ fontSize: 12, color: "var(--foreground-muted)" }}>
          Pagamento: <strong style={{ color: "var(--foreground)" }}>{FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento}</strong>
          {venda.nomeCliente && <> · Cliente: <strong style={{ color: "var(--foreground)" }}>{venda.nomeCliente}</strong></>}
        </div>
        {venda.observacao && <p style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 8 }}>Obs: {venda.observacao}</p>}
      </div>
    </div>
  );
}

/* ─── Card de Caixa com suas vendas ─────────────────────────────────────── */
function CaixaCard({ caixa, empresaId, onNovaVenda }: {
  caixa: CaixaInfo; empresaId: number; onNovaVenda?: () => void;
}) {
  const [vendas,    setVendas]    = useState<Venda[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [aberto,    setAberto]    = useState(caixa.aberto); // começa aberto se for o ativo
  const [detalhe,   setDetalhe]   = useState<Venda | null>(null);
  const [filtro,    setFiltro]    = useState("");

  useEffect(() => {
    setLoading(true);
    fetchAuth<Venda[]>(`/api/v1/vendas/caixa/${caixa.id}`)
      .then(setVendas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [caixa.id]);

  // Resumo por forma de pagamento
  const resumoPagamento = useMemo(() => {
    const map: Record<string, number> = {};
    vendas.forEach(v => {
      const k = FORMA_LABEL[v.formaPagamento] ?? v.formaPagamento;
      map[k] = (map[k] ?? 0) + v.valorFinal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [vendas]);

  const vendasFiltradas = useMemo(() =>
    vendas.filter(v =>
      String(v.id).includes(filtro) ||
      (FORMA_LABEL[v.formaPagamento] ?? v.formaPagamento).toLowerCase().includes(filtro.toLowerCase())
    ).sort((a, b) => new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime()),
    [vendas, filtro]);

  const totalCaixa = vendas.reduce((s, v) => s + (v.valorFinal ?? 0), 0);

  return (
    <div style={{ background: "var(--surface-elevated)", border: `1px solid ${caixa.aberto ? "rgba(16,185,129,0.3)" : "var(--border)"}`, borderRadius: 14, overflow: "hidden" }}>

      {/* Header do caixa */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
        onClick={() => setAberto(v => !v)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: caixa.aberto ? "var(--primary-muted)" : "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Receipt size={16} color={caixa.aberto ? "var(--primary)" : "var(--foreground-muted)"} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>Caixa #{caixa.id}</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, background: caixa.aberto ? "var(--primary-muted)" : "var(--surface-overlay)", color: caixa.aberto ? "var(--primary)" : "var(--foreground-muted)" }}>
                {caixa.aberto ? "● ABERTO" : "FECHADO"}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "2px 0 0" }}>
              Aberto em {fmtData(caixa.dataAbertura)}
              {caixa.dataFechamento && ` · Fechado em ${fmtData(caixa.dataFechamento)}`}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", margin: 0 }}>{fmt(totalCaixa)}</p>
            <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: 0 }}>{vendas.length} venda(s)</p>
          </div>
          {caixa.aberto && onNovaVenda && (
            <button onClick={e => { e.stopPropagation(); onNovaVenda(); }} style={{ ...btnP, padding: "7px 12px", fontSize: 12 }}>
              <Plus size={13} /> Nova
            </button>
          )}
          {aberto ? <ChevronUp size={16} color="var(--foreground-muted)" /> : <ChevronDown size={16} color="var(--foreground-muted)" />}
        </div>
      </div>

      {/* Conteúdo expandido */}
      {aberto && (
        <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Resumo financeiro */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {[
              { label: "Saldo Inicial", value: fmt(caixa.valorInicial) },
              { label: "Total Vendas",  value: fmt(totalCaixa), destaque: true },
              { label: "Ticket Médio",  value: vendas.length > 0 ? fmt(totalCaixa / vendas.length) : "—" },
              ...(caixa.dataFechamento ? [{ label: "Saldo Final", value: fmt(caixa.valorFinal) }] : []),
            ].map((c, i) => (
              <div key={i} style={{ background: "var(--surface-overlay)", borderRadius: 8, padding: "10px 12px" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>{c.label}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: (c as any).destaque ? "var(--primary)" : "var(--foreground)", margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Resumo por forma de pagamento */}
          {resumoPagamento.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                <BarChart3 size={12} /> Formas de Pagamento
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {resumoPagamento.map(([forma, valor]) => (
                  <div key={forma} style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 11, color: "var(--foreground-muted)", fontWeight: 500 }}>{forma}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{fmt(valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filtro */}
          {vendas.length > 0 && (
            <div style={{ position: "relative", maxWidth: 300 }}>
              <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
              <input style={{ ...inp, paddingLeft: 28, padding: "7px 10px 7px 28px", fontSize: 12 }} placeholder="Filtrar vendas..." value={filtro} onChange={e => setFiltro(e.target.value)} />
            </div>
          )}

          {/* Lista de vendas */}
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--foreground-muted)", fontSize: 13, padding: 16 }}>Carregando vendas...</div>
          ) : vendasFiltradas.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--foreground-subtle)", fontSize: 13, padding: 16 }}>
              {vendas.length === 0 ? "Nenhuma venda neste caixa." : "Nenhuma venda encontrada."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {vendasFiltradas.map(v => (
                <div key={v.id} onClick={() => setDetalhe(v)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--surface-overlay)", borderRadius: 8, cursor: "pointer", border: "1px solid transparent", transition: "all .12s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground-muted)" }}>#{v.id}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, padding: "2px 7px", background: "var(--primary-muted)", color: "var(--primary)", borderRadius: 99, fontWeight: 500 }}>
                          {FORMA_LABEL[v.formaPagamento] ?? v.formaPagamento}
                        </span>
                        {v.desconto > 0 && <span style={{ fontSize: 11, color: "var(--destructive)" }}>− {fmt(v.desconto)}</span>}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "3px 0 0" }}>
                        {fmtData(v.dataVenda)} · {v.itens?.length ?? 0} item(s)
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{fmt(v.valorFinal)}</span>
                    <ChevronRight size={14} color="var(--foreground-subtle)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {detalhe && <DetalheVenda venda={detalhe} onClose={() => setDetalhe(null)} />}
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function Vendas() {
  const { empresaAtiva, caixaAtivo } = useEmpresa();

  const [caixas,       setCaixas]       = useState<CaixaInfo[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [modalNova,    setModalNova]    = useState(false);
  const [vendaSucesso, setVendaSucesso] = useState<Venda | null>(null);

  const carregar = async () => {
    if (!empresaAtiva) return;
    setLoading(true);
    try {
      const data = await fetchAuth<CaixaInfo[]>(`/api/v1/caixas/empresa/${empresaAtiva.id}`);
      setCaixas(data);
    } catch { toast.error("Erro ao carregar caixas"); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [empresaAtiva?.id]);

  if (!empresaAtiva) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--foreground-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Store size={40} color="var(--foreground-subtle)" />
      <p style={{ fontSize: 14 }}>Selecione uma empresa para ver as vendas.</p>
    </div>
  );

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Vendas</h2>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 3 }}>{empresaAtiva.nomeFantasia} · {caixas.length} caixa(s)</p>
        </div>
        {caixaAtivo && (
          <button style={btnP} onClick={() => setModalNova(true)}>
            <Plus size={15} /> Nova Venda
          </button>
        )}
        {!caixaAtivo && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "var(--warning-muted)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, fontSize: 13, color: "var(--warning)" }}>
            <AlertCircle size={14} /> Abra o caixa para registrar vendas
          </div>
        )}
      </div>

      {/* Lista de caixas */}
      {loading ? (
        <div style={{ textAlign: "center", color: "var(--foreground-muted)", fontSize: 13, padding: 32 }}>Carregando...</div>
      ) : caixas.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--foreground-subtle)" }}>
          <Receipt size={40} />
          <p style={{ fontSize: 14 }}>Nenhum caixa encontrado para esta empresa.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {caixas.map(c => (
            <CaixaCard
              key={c.id}
              caixa={c}
              empresaId={empresaAtiva.id}
              onNovaVenda={caixaAtivo?.id === c.id ? () => setModalNova(true) : undefined}
            />
          ))}
        </div>
      )}

      {/* Modal nova venda */}
      {modalNova && caixaAtivo && (
        <ModalNovaVenda
          caixaId={caixaAtivo.id}
          empresaId={empresaAtiva.id}
          onClose={() => setModalNova(false)}
          onSucesso={venda => { carregar(); setVendaSucesso(venda); }}
        />
      )}

      {/* Tela de sucesso */}
      {vendaSucesso && (
        <TelaVendaSucesso
          venda={vendaSucesso}
          onFechar={() => setVendaSucesso(null)}
        />
      )}
    </div>
  );
}