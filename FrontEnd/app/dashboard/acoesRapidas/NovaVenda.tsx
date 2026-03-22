"use client";

import { useEffect, useState, useMemo } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Search, Plus, X, Check, CheckCircle2, Receipt,
  CreditCard, DollarSign, Smartphone,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos (iguais ao Vendas.tsx) ──────────────────────────────────────── */
interface Produto { id: number; nome: string; preco: number; quantidadeEstoque: number; categoria?: string; }
interface Venda {
  id: number; formaPagamento: string; formaPagamento2?: string;
  valorPagamento2?: number; valorTotal: number; desconto: number;
  valorFinal: number; valorRecebido?: number; troco?: number;
  observacao?: string; dataVenda: string; itens: any[];
}

const FORMA_LABEL: Record<string, string> = {
  PIX: "Pix", DINHEIRO: "Dinheiro", CARTAO_DEBITO: "Débito", CARTAO_CREDITO: "Crédito",
};

const fmt = (v?: number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.mensagem ?? `Erro ${res.status}`); }
  return res.json();
}

const inp: React.CSSProperties = { width: "100%", padding: "8px 11px", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 13, outline: "none" };
const btnG: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: "7px 11px", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground-muted)", fontSize: 12, cursor: "pointer" };
const btnP: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "var(--primary)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" };

const FORMAS = [
  { v: "PIX",            l: "Pix",     icon: <Smartphone size={13} /> },
  { v: "DINHEIRO",       l: "Dinheiro", icon: <DollarSign size={13} /> },
  { v: "CARTAO_DEBITO",  l: "Débito",  icon: <CreditCard size={13} /> },
  { v: "CARTAO_CREDITO", l: "Crédito", icon: <CreditCard size={13} /> },
];

function SeletorForma({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div>
      {label && <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>{label}</label>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {FORMAS.map(f => (
          <button key={f.v} type="button" onClick={() => onChange(f.v)}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 9px", borderRadius: 7, border: `1px solid ${value === f.v ? "var(--primary)" : "var(--border)"}`, background: value === f.v ? "var(--primary-muted)" : "var(--surface-overlay)", color: value === f.v ? "var(--primary)" : "var(--foreground-muted)", fontSize: 12, fontWeight: value === f.v ? 600 : 400, cursor: "pointer" }}>
            {f.icon}{f.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Tela sucesso + cupom (igual ao Vendas.tsx) ─────────────────────────── */
function TelaVendaSucesso({ venda, nomeEmpresa, onFechar }: { venda: Venda; nomeEmpresa: string; onFechar: () => void }) {
  const [passo, setPasso] = useState<"sucesso" | "nota">("sucesso");
  useEffect(() => {
    if (passo !== "sucesso") return;
    const t = setTimeout(() => setPasso("nota"), 5000);
    return () => clearTimeout(t);
  }, [passo]);

  const misto = venda.formaPagamento2 && venda.valorPagamento2;

  if (passo === "nota") return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
      <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 20, padding: 36, textAlign: "center", maxWidth: 340, width: "100%" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Receipt size={28} color="#3b82f6" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: "0 0 8px" }}>Deseja o cupom?</h2>
        <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginBottom: 24 }}>Cupom da venda <strong>#{venda.id}</strong></p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onFechar} style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground-muted)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Não</button>
          <button onClick={onFechar} style={{ flex: 2, padding: "11px 0", background: "#3b82f6", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Receipt size={16} /> Sim, imprimir
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
      <div style={{ background: "var(--surface-elevated)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: 36, textAlign: "center", maxWidth: 360, width: "100%" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle2 size={34} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--foreground)", margin: "0 0 4px" }}>Venda Concluída!</h2>
        <p style={{ fontSize: 34, fontWeight: 900, color: "var(--primary)", margin: "0 0 12px" }}>{fmt(venda.valorFinal)}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, padding: "3px 10px", background: "var(--primary-muted)", color: "var(--primary)", borderRadius: 99, fontWeight: 500 }}>
            {FORMA_LABEL[venda.formaPagamento]}{misto && `: ${fmt(venda.valorFinal - (venda.valorPagamento2 ?? 0))}`}
          </span>
          {misto && (
            <span style={{ fontSize: 12, padding: "3px 10px", background: "rgba(59,130,246,0.1)", color: "#3b82f6", borderRadius: 99, fontWeight: 500 }}>
              {FORMA_LABEL[venda.formaPagamento2!]}: {fmt(venda.valorPagamento2)}
            </span>
          )}
        </div>
        {venda.troco != null && venda.troco > 0 && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "0 0 2px" }}>Recebido: {fmt(venda.valorRecebido)}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)", margin: 0 }}>Troco: {fmt(venda.troco)}</p>
          </div>
        )}
        {venda.desconto > 0 && <p style={{ fontSize: 12, color: "var(--foreground-muted)", marginBottom: 8 }}>Desconto: {fmt(venda.desconto)}</p>}
        <p style={{ fontSize: 12, color: "var(--foreground-subtle)", marginBottom: 20 }}>Venda #{venda.id}</p>
        <button onClick={() => setPasso("nota")} style={{ ...btnP, justifyContent: "center", width: "100%", padding: "11px 0" }}>Continuar</button>
      </div>
    </div>
  );
}

/* ─── Overlay de Nova Venda ──────────────────────────────────────────────── */
export default function NovaVendaOverlay({ onClose }: { onClose: () => void }) {
  const { empresaAtiva, caixaAtivo } = useEmpresa();

  const [produtos,   setProdutos]   = useState<Produto[]>([]);
  const [carrinho,   setCarrinho]   = useState<{ produto: Produto; quantidade: number }[]>([]);
  const [busca,      setBusca]      = useState("");
  const [forma,      setForma]      = useState("PIX");
  const [forma2,     setForma2]     = useState("DINHEIRO");
  const [misto,      setMisto]      = useState(false);
  const [valPag2,    setValPag2]    = useState("");
  const [recebido,   setRecebido]   = useState("");
  const [desconto,   setDesconto]   = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando,   setSalvando]   = useState(false);
  const [vendaOk,    setVendaOk]    = useState<Venda | null>(null);

  useEffect(() => {
    if (empresaAtiva?.id)
      fetchAuth<Produto[]>(`/api/v1/produtos?empresaId=${empresaAtiva.id}`)
        .then(setProdutos).catch(() => {});
  }, [empresaAtiva?.id]);

  const filtrados = useMemo(() =>
    produtos.filter(p => p.quantidadeEstoque > 0 && p.nome.toLowerCase().includes(busca.toLowerCase())),
    [produtos, busca]);

  const addItem = (p: Produto) => setCarrinho(prev => {
    const ex = prev.find(i => i.produto.id === p.id);
    if (ex) {
      if (ex.quantidade >= p.quantidadeEstoque) { toast.error(`Máx: ${p.quantidadeEstoque}`); return prev; }
      return prev.map(i => i.produto.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i);
    }
    return [...prev, { produto: p, quantidade: 1 }];
  });

  const setQtd = (id: number, q: number) => {
    if (q <= 0) setCarrinho(p => p.filter(i => i.produto.id !== id));
    else setCarrinho(p => p.map(i => i.produto.id === id ? { ...i, quantidade: q } : i));
  };

  const subtotal      = carrinho.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
  const descontoN     = Math.max(0, parseFloat(desconto) || 0);
  const total         = Math.max(subtotal - descontoN, 0);
  const valPag2N      = misto ? (parseFloat(valPag2) || 0) : 0;
  const valPag1       = misto ? Math.max(total - valPag2N, 0) : total;
  const temDinheiro   = forma === "DINHEIRO" || (misto && forma2 === "DINHEIRO");
  const valorEmDinheiro = misto
    ? (forma === "DINHEIRO" ? valPag1 : forma2 === "DINHEIRO" ? valPag2N : 0)
    : total;
  const recebidoN     = parseFloat(recebido) || 0;
  const troco         = temDinheiro && recebidoN > 0 ? Math.max(recebidoN - valorEmDinheiro, 0) : null;
  const falta         = temDinheiro && recebidoN > 0 && recebidoN < valorEmDinheiro ? valorEmDinheiro - recebidoN : null;

  const registrar = async () => {
    if (!carrinho.length) { toast.error("Adicione pelo menos um produto."); return; }
    if (!caixaAtivo) { toast.error("Nenhum caixa aberto."); return; }
    if (misto && valPag2N <= 0) { toast.error("Informe o valor da 2ª forma."); return; }
    if (misto && valPag2N >= total) { toast.error("2ª forma deve ser menor que o total."); return; }
    setSalvando(true);
    try {
      const body: any = {
        idCaixa: caixaAtivo.id, formaPagamento: forma,
        desconto: descontoN, observacao: observacao || null,
        itens: carrinho.map(i => ({ idProduto: i.produto.id, quantidade: i.quantidade })),
      };
      if (misto) { body.formaPagamento2 = forma2; body.valorPagamento2 = valPag2N; }
      if (temDinheiro && recebidoN > 0) body.valorRecebido = recebidoN;
      const venda = await fetchAuth<Venda>("/api/v1/vendas/registrar", { method: "POST", body: JSON.stringify(body) });
      setVendaOk(venda);
    } catch (e: any) { toast.error(e.message); }
    finally { setSalvando(false); }
  };

  if (vendaOk) return (
    <TelaVendaSucesso venda={vendaOk} nomeEmpresa={empresaAtiva?.nomeFantasia ?? "GestPro"} onFechar={onClose} />
  );

  return (
    /* overlay com blur no fundo — não muda de página */
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, width: "100%", maxWidth: 840, maxHeight: "93vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
            Nova Venda — Caixa #{caixaAtivo?.id}
          </h2>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", flex: 1, minHeight: 0, overflow: "hidden" }}>
          {/* Produtos */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
                <input style={{ ...inp, paddingLeft: 28 }} placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} autoFocus />
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtrados.length === 0
                ? <div style={{ padding: 28, textAlign: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>Nenhum produto disponível</div>
                : filtrados.map(p => {
                  const nc = carrinho.find(i => i.produto.id === p.id);
                  return (
                    <div key={p.id} onClick={() => addItem(p)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 16px", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "var(--surface-overlay)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", margin: 0 }}>{p.nome}</p>
                        <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "1px 0 0" }}>Estoque: {p.quantidadeEstoque}{p.categoria ? ` · ${p.categoria}` : ""}</p>
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

          {/* Carrinho + Pagamento */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 13px" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 }}>Carrinho ({carrinho.length})</p>
              {carrinho.length === 0
                ? <div style={{ textAlign: "center", color: "var(--foreground-subtle)", fontSize: 12, padding: "16px 0" }}>Clique nos produtos</div>
                : carrinho.map(item => (
                  <div key={item.produto.id} style={{ marginBottom: 7, padding: "8px 9px", background: "var(--surface-overlay)", borderRadius: 7, border: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", margin: 0, flex: 1, paddingRight: 6 }}>{item.produto.nome}</p>
                      <button onClick={() => setCarrinho(p => p.filter(i => i.produto.id !== item.produto.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-subtle)", padding: 0 }}><X size={11} /></button>
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

            <div style={{ padding: "10px 13px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Total */}
              <div style={{ background: "var(--surface-overlay)", borderRadius: 8, padding: "8px 11px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--foreground-muted)" }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {descontoN > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--destructive)" }}><span>Desconto</span><span>− {fmt(descontoN)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "var(--primary)", paddingTop: 4, borderTop: "1px solid var(--border)" }}>
                  <span>Total a pagar</span><span>{fmt(total)}</span>
                </div>
              </div>

              {/* Desconto + Obs */}
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>Desconto R$</label>
                  <input style={inp} type="number" min="0" step="0.01" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0,00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>Observação</label>
                  <input style={inp} value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Opcional..." />
                </div>
              </div>

              {/* 1ª Forma */}
              <SeletorForma value={forma} onChange={f => setForma(f)} label={misto ? `1ª Forma — ${fmt(valPag1)}` : "Pagamento"} />

              {/* Toggle misto */}
              <button type="button" onClick={() => { setMisto(v => !v); setValPag2(""); setRecebido(""); }}
                style={{ ...btnG, justifyContent: "center", fontSize: 11, borderColor: misto ? "#3b82f6" : "var(--border)", color: misto ? "#3b82f6" : "var(--foreground-muted)", background: misto ? "rgba(59,130,246,.07)" : "transparent" }}>
                {misto ? <><X size={11} />Remover 2ª forma</> : <><Plus size={11} />Dividir em 2 formas</>}
              </button>

              {/* 2ª Forma */}
              {misto && (
                <div style={{ padding: 10, background: "rgba(59,130,246,.05)", border: "1px solid rgba(59,130,246,.2)", borderRadius: 9, display: "flex", flexDirection: "column", gap: 8 }}>
                  <SeletorForma value={forma2} onChange={f => { setForma2(f); setRecebido(""); }} label="2ª Forma — quanto vai pagar nela?" />
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>Valor na 2ª forma (R$)</label>
                    <input style={inp} type="number" min="0" step="0.01" value={valPag2} onChange={e => setValPag2(e.target.value)} placeholder="Ex: 5,00" />
                  </div>
                  {valPag2N > 0 && valPag2N < total && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[{ l: FORMA_LABEL[forma], v: valPag1 }, { l: FORMA_LABEL[forma2], v: valPag2N }].map(({ l, v }) => (
                        <div key={l} style={{ background: "var(--surface-overlay)", borderRadius: 7, padding: "6px 9px", textAlign: "center" }}>
                          <p style={{ fontSize: 10, color: "var(--foreground-muted)", margin: "0 0 2px", fontWeight: 600 }}>{l}</p>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{fmt(v)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Troco / Falta */}
              {temDinheiro && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Quanto o cliente entregou em dinheiro?
                    {misto && valorEmDinheiro > 0 && <span style={{ fontWeight: 400, marginLeft: 5, textTransform: "none" }}>(esperado: {fmt(valorEmDinheiro)})</span>}
                  </label>
                  <input style={inp} type="number" min="0" step="0.01" value={recebido} onChange={e => setRecebido(e.target.value)} placeholder={fmt(valorEmDinheiro)} />
                  {recebidoN > 0 && troco !== null && troco > 0 && (
                    <div style={{ padding: "10px 13px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div><p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "0 0 1px" }}>Recebeu</p><p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>{fmt(recebidoN)}</p></div>
                      <div style={{ textAlign: "right" }}><p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "0 0 1px" }}>Devolver de troco</p><p style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", margin: 0 }}>{fmt(troco)}</p></div>
                    </div>
                  )}
                  {recebidoN > 0 && recebidoN === valorEmDinheiro && (
                    <div style={{ padding: "8px 12px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>✓ Valor exato — sem troco</span>
                    </div>
                  )}
                  {falta !== null && falta > 0 && (
                    <div style={{ padding: "10px 13px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div><p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "0 0 1px" }}>Recebeu</p><p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>{fmt(recebidoN)}</p></div>
                      <div style={{ textAlign: "right" }}><p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "0 0 1px" }}>Ainda falta</p><p style={{ fontSize: 18, fontWeight: 800, color: "var(--destructive)", margin: 0 }}>{fmt(falta)}</p></div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={registrar} disabled={salvando || !carrinho.length}
                style={{ ...btnP, justifyContent: "center", padding: "11px 0", opacity: (salvando || !carrinho.length) ? 0.6 : 1 }}>
                {salvando ? "Registrando..." : <><Check size={14} />Confirmar · {fmt(total)}</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}