"use client";

import { useState, useMemo, useEffect, ReactNode } from "react";
import { 
  Check, X, Search, Plus, Minus, ShoppingCart, 
  Smartphone, DollarSign, CreditCard, Receipt, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { useEmpresa } from "../context/Empresacontext"; // Para pegar o nome da empresa pro cupom

/* ─── Tipos Locais ─── */
interface Produto { id: number; nome: string; preco: number; quantidadeEstoque: number; categoria?: string }
interface ItemCarrinho { produto: Produto; quantidade: number }
interface Venda {
  id: number;
  formaPagamento: string;
  formaPagamento2?: string;
  valorPagamento2?: number;
  valorTotal: number;
  desconto: number;
  valorFinal: number;
  valorRecebido?: number;
  troco?: number;
  observacao?: string;
  dataVenda: string;
  itens: { idProduto: number; nomeProduto?: string; quantidade: number; precoUnitario: number; subtotal: number; }[];
  nomeCliente?: string;
  cancelada?: boolean;
}

type FormaPagamento = "PIX" | "DINHEIRO" | "CARTAO_DEBITO" | "CARTAO_CREDITO";

const FORMAS: { value: FormaPagamento; label: string; icon: ReactNode }[] = [
  { value: "PIX", label: "Pix", icon: <Smartphone size={13} /> },
  { value: "DINHEIRO", label: "Dinheiro", icon: <DollarSign size={13} /> },
  { value: "CARTAO_DEBITO", label: "Débito", icon: <CreditCard size={13} /> },
  { value: "CARTAO_CREDITO", label: "Crédito", icon: <CreditCard size={13} /> },
];

const FORMA_LABEL: Record<string, string> = {
  PIX: "Pix", DINHEIRO: "Dinheiro", CARTAO_DEBITO: "Débito", CARTAO_CREDITO: "Crédito",
};

/* ─── Helpers & Componentes Base ─── */
const fmt = (v?: number | null) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
const esc = (value: unknown) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Formata Data
const fmtData = (s?: any) => {
  if (!s) return "—";
  const d = Array.isArray(s) ? new Date(Date.UTC(s[0], s[1] - 1, s[2], s[3] ?? 0, s[4] ?? 0)) : new Date(typeof s === "string" ? s.replace(" ", "T") : s);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function Overlay({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16
      }}
    >
      {children}
    </div>
  );
}

const inpStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "var(--surface-overlay)",
  border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)",
  fontSize: 13, outline: "none", transition: "border-color 0.2s"
};
const btnG: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
  background: "transparent", border: "1px solid var(--border)", borderRadius: 8,
  color: "var(--foreground-muted)", fontSize: 13, cursor: "pointer", justifyContent: "center"
};

/* ─── Gerador de Cupom Não Fiscal ─── */
function gerarCupom(venda: Venda, nomeEmpresa: string) {
  const misto = venda.formaPagamento2 && venda.valorPagamento2;
  const pagamento = misto
    ? `${esc(FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento)}: ${esc(fmt(venda.valorFinal - (venda.valorPagamento2 ?? 0)))} + ${esc(FORMA_LABEL[venda.formaPagamento2!] ?? venda.formaPagamento2)}: ${esc(fmt(venda.valorPagamento2))}`
    : esc(FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento);

  const itensHtml = venda.itens.map((item) => `
    <tr>
      <td style="padding:3px 0;font-size:12px;color:#1a1a2e">${esc(item.nomeProduto || `Item #${item.idProduto}`)} × ${item.quantidade}</td>
      <td style="padding:3px 0;font-size:12px;color:#1a1a2e;text-align:right;font-weight:600">${esc(fmt(item.subtotal))}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Cupom #${venda.id} — ${esc(nomeEmpresa)}</title><style>
  @page { size: 80mm auto; margin: 4mm; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .no-print { display: none !important; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', Courier, monospace; background: #f5f5f5; display: flex; flex-direction: column; align-items: center; padding: 16px; }
  .cupom { background: #fff; width: 80mm; padding: 12px 10px; border-radius: 4px; box-shadow: 0 1px 6px rgba(0,0,0,.12); }
  .center { text-align: center; }
  .empresa { font-size: 16px; font-weight: 900; color: #1a1a2e; letter-spacing: .03em; }
  .doc { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: .12em; margin: 3px 0 8px; }
  .dash { border-top: 1px dashed #cbd5e1; margin: 8px 0; }
  .row { display: flex; justify-content: space-between; font-size: 11px; color: #334155; padding: 2px 0; }
  .total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; color: #0f172a; padding: 4px 0; }
  .green { color: #059669 !important; }
  .red { color: #dc2626 !important; }
  .footer { text-align: center; margin-top: 8px; font-size: 9px; color: #94a3b8; line-height: 1.5; }
  .print-btn { margin: 16px 0 0; padding: 10px 24px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; }
  </style></head><body>
  <div class="cupom">
    <div class="center"><div class="empresa">${esc(nomeEmpresa)}</div><div class="doc">Cupom Não Fiscal</div></div>
    <div class="dash"></div>
    <div class="row"><span>Nº da Venda:</span><span><b>#${venda.id}</b></span></div>
    <div class="row"><span>Data/Hora:</span><span>${esc(fmtData(venda.dataVenda))}</span></div>
    ${venda.nomeCliente ? `<div class="row"><span>Cliente:</span><span>${esc(venda.nomeCliente)}</span></div>` : ""}
    <div class="dash"></div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th style="font-size:9px;color:#64748b;text-align:left;padding:2px 0;text-transform:uppercase;border-bottom:1px solid #e2e8f0">Produto</th><th style="font-size:9px;color:#64748b;text-align:right;padding:2px 0;text-transform:uppercase;border-bottom:1px solid #e2e8f0">Valor</th></tr></thead>
      <tbody>${itensHtml}</tbody>
    </table>
    <div class="dash"></div>
    <div class="row"><span>Subtotal:</span><span>${esc(fmt(venda.valorTotal))}</span></div>
    ${venda.desconto > 0 ? `<div class="row red"><span>Desconto:</span><span>− ${esc(fmt(venda.desconto))}</span></div>` : ""}
    <div class="total-row"><span>TOTAL:</span><span class="green">${esc(fmt(venda.valorFinal))}</span></div>
    <div class="dash"></div>
    <div class="row"><span>Pagamento:</span><span style="text-align:right;max-width:55%;font-weight:600">${pagamento}</span></div>
    ${venda.valorRecebido && venda.valorRecebido > 0 ? `<div class="row"><span>Recebido:</span><span>${esc(fmt(venda.valorRecebido))}</span></div>` : ""}
    ${venda.troco && venda.troco > 0 ? `<div class="row green"><span>Troco:</span><span><b>${esc(fmt(venda.troco))}</b></span></div>` : ""}
    ${venda.observacao ? `<div class="dash"></div><div class="row"><span>Obs:</span><span>${esc(venda.observacao)}</span></div>` : ""}
    <div class="dash"></div><div class="footer">Obrigado pela preferência!<br>Este documento não tem valor fiscal.<br>Emitido via GestPro</div>
  </div>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <script>window.onload = () => setTimeout(() => { window.focus(); window.print(); }, 400);</script>
  </body></html>`;

  const janela = window.open("", "_blank", "width=500,height=700");
  if (!janela) { alert("Permita pop-ups para imprimir o cupom."); return; }
  janela.document.write(html);
  janela.document.close();
}

function SeletorForma({ value, onChange, label }: { value: FormaPagamento; onChange: (v: FormaPagamento) => void; label?: string; }) {
  return (
    <div>
      {label && <p style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{label}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {FORMAS.map((f) => (
          <button key={f.value} onClick={() => onChange(f.value)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 8px", background: value === f.value ? "var(--primary-muted)" : "var(--surface-overlay)", border: `1px solid ${value === f.value ? "var(--primary)" : "var(--border)"}`, borderRadius: 7, cursor: "pointer", color: value === f.value ? "var(--primary)" : "var(--foreground-muted)", fontSize: 11, fontWeight: value === f.value ? 600 : 400 }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Tela de Sucesso e Impressão ─── */
function TelaVendaSucesso({ venda, nomeEmpresa, onFechar }: { venda: Venda; nomeEmpresa: string; onFechar: () => void; }) {
  const [passo, setPasso] = useState<"sucesso" | "nota">("sucesso");
  const misto = venda.formaPagamento2 && venda.valorPagamento2;

  useEffect(() => {
    if (passo !== "sucesso") return;
    const t = setTimeout(() => setPasso("nota"), 5000);
    return () => clearTimeout(t);
  }, [passo]);

  if (passo === "nota") {
    return (
      <Overlay>
        <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 20, padding: 36, textAlign: "center", maxWidth: 340, width: "100%" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Receipt size={28} color="#3b82f6" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: "0 0 8px" }}>Deseja o cupom?</h2>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginBottom: 24 }}>Imprimir cupom não fiscal da venda <strong style={{ color: "var(--foreground)" }}>#{venda.id}</strong></p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onFechar} style={{ flex: 1, padding: "11px 0", background: "transparent", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground-muted)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Não</button>
            <button onClick={() => { gerarCupom(venda, nomeEmpresa); onFechar(); }} style={{ flex: 2, padding: "11px 0", background: "#3b82f6", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Receipt size={16} /> Sim, imprimir
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: 36, textAlign: "center", maxWidth: 360, width: "100%" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <CheckCircle2 size={34} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)", margin: "0 0 6px" }}>Venda Concluída!</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: "var(--primary)", margin: "0 0 6px" }}>{fmt(venda.valorFinal)}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, padding: "3px 10px", background: "var(--primary-muted)", color: "var(--primary)", borderRadius: 99, fontWeight: 500 }}>
            {FORMA_LABEL[venda.formaPagamento] ?? venda.formaPagamento} {misto && `: ${fmt(venda.valorFinal - (venda.valorPagamento2 ?? 0))}`}
          </span>
          {misto && (
            <span style={{ fontSize: 12, padding: "3px 10px", background: "var(--secondary-muted)", color: "var(--secondary)", borderRadius: 99, fontWeight: 500 }}>
              {FORMA_LABEL[venda.formaPagamento2!] ?? venda.formaPagamento2}: {fmt(venda.valorPagamento2)}
            </span>
          )}
        </div>

        {venda.troco != null && venda.troco > 0 && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 16px", marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "0 0 2px" }}>Recebido: {fmt(venda.valorRecebido)}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", margin: 0 }}>Troco: {fmt(venda.troco)}</p>
          </div>
        )}

        {venda.desconto > 0 && <p style={{ fontSize: 12, color: "var(--foreground-muted)", marginBottom: 8 }}>Desconto: {fmt(venda.desconto)}</p>}
        <p style={{ fontSize: 12, color: "var(--foreground-subtle)", marginBottom: 20 }}>Venda #{venda.id} · {venda.itens.length} item(s)</p>
        <button onClick={() => setPasso("nota")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "11px 0", background: "var(--primary)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Continuar</button>
        <p style={{ fontSize: 11, color: "var(--foreground-subtle)", marginTop: 10 }}>Perguntará sobre o cupom em 5s</p>
      </div>
    </Overlay>
  );
}


/* ─── Componente Principal ─── */
interface Props {
  caixaId: number;
  empresaId: number;
  onClose: () => void;
  onConcluido: (venda?: Venda) => void;
}

export default function NovaVenda({ caixaId, empresaId, onClose, onConcluido }: Props) {
  const { empresaAtiva } = useEmpresa();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState("");
  
  // Estado Financeiro
  const [forma, setForma] = useState<FormaPagamento>("PIX");
  const [misto, setMisto] = useState(false);
  const [forma2, setForma2] = useState<FormaPagamento>("DINHEIRO");
  const [valPag2, setValPag2] = useState("");
  const [desconto, setDesconto] = useState("");
  const [recebido, setRecebido] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  
  // Estado de Sucesso
  const [vendaSucesso, setVendaSucesso] = useState<Venda | null>(null);

  // Busca do Catálogo
  useEffect(() => {
    const fetchProdutos = async () => {
      const token = sessionStorage.getItem("jwt_token") ?? document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ?? "";
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      
      try {
        const res = await fetch(`${base}/api/v1/produtos?empresaId=${empresaId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (res.ok) setProdutos(await res.json());
      } catch (e) {
        toast.error("Erro ao carregar catálogo.");
      }
    };
    fetchProdutos();
  }, [empresaId]);

  const filtrados = useMemo(() =>
    produtos.filter(p => p.quantidadeEstoque > 0 && p.nome.toLowerCase().includes(busca.toLowerCase())),
  [produtos, busca]);

  // Ações do Carrinho
  const addItem = (p: Produto) => setCarrinho(prev => {
    const ex = prev.find(i => i.produto.id === p.id);
    if (ex) {
      if (ex.quantidade >= p.quantidadeEstoque) { toast.error(`Máximo em estoque: ${p.quantidadeEstoque}`); return prev; }
      return prev.map(i => i.produto.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i);
    }
    return [...prev, { produto: p, quantidade: 1 }];
  });

  const setQtd = (id: number, q: number) => {
    if (q <= 0) setCarrinho(prev => prev.filter(i => i.produto.id !== id));
    else setCarrinho(prev => prev.map(i => i.produto.id === id ? { ...i, quantidade: q } : i));
  };

  // Cálculos Financeiros Dinâmicos
  const subtotal = carrinho.reduce((s, i) => s + i.produto.preco * i.quantidade, 0);
  const descontoN = Math.max(0, parseFloat(desconto.replace(",", ".")) || 0);
  const total = Math.max(subtotal - descontoN, 0);
  
  const recebidoN = parseFloat(recebido.replace(",", ".")) || 0;
  const valPag2N = misto ? parseFloat(valPag2.replace(",", ".")) || 0 : 0;
  const valPag1 = misto ? Math.max(total - valPag2N, 0) : total;

  const temDinheiro = forma === "DINHEIRO" || (misto && forma2 === "DINHEIRO");
  const valorEmDinheiro = misto ? (forma === "DINHEIRO" ? valPag1 : forma2 === "DINHEIRO" ? valPag2N : 0) : total;
  
  const troco = temDinheiro && recebidoN > 0 ? Math.max(recebidoN - valorEmDinheiro, 0) : null;
  const falta = temDinheiro && recebidoN > 0 && recebidoN < valorEmDinheiro ? valorEmDinheiro - recebidoN : null;

  const registrar = async () => {
    if (!carrinho.length) { toast.error("Adicione produtos ao pedido."); return; }
    if (misto && valPag2N <= 0) { toast.error("Informe o valor da segunda forma de pagamento."); return; }
    if (misto && valPag2N >= total) { toast.error("O valor da 2ª forma deve ser menor que o total."); return; }
    
    setSalvando(true);
    try {
      const token = sessionStorage.getItem("jwt_token") ?? document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ?? "";
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      
      const body: any = {
        idCaixa: caixaId,
        formaPagamento: forma,
        desconto: descontoN,
        observacao: observacao || null,
        itens: carrinho.map((i) => ({ idProduto: i.produto.id, quantidade: i.quantidade })),
      };
      
      if (misto) {
        body.formaPagamento2 = forma2;
        body.valorPagamento2 = valPag2N;
      }
      if (temDinheiro && recebidoN > 0) body.valorRecebido = recebidoN;

      const res = await fetch(`${base}/api/v1/vendas/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erro ao finalizar venda.");
      const vendaConcluida = await res.json();
      
      toast.success("Venda finalizada com sucesso!");
      
      // Adiciona o nome do produto de volta aos itens para o cupom não quebrar
      const itensComNome = vendaConcluida.itens.map((iv: any) => {
        const p = produtos.find(prod => prod.id === iv.idProduto);
        return { ...iv, nomeProduto: p ? p.nome : `Produto #${iv.idProduto}` };
      });
      vendaConcluida.itens = itensComNome;

      setVendaSucesso(vendaConcluida); // Ativa a tela de sucesso do próprio componente
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const fecharTudo = () => {
    onConcluido(vendaSucesso || undefined);
    onClose();
  };

  // Se tem venda sucesso, intercepta e mostra a telinha do cupom ao invés do PDV
  if (vendaSucesso) {
    return (
      <TelaVendaSucesso 
        venda={vendaSucesso} 
        nomeEmpresa={empresaAtiva?.nomeFantasia || "Empresa"} 
        onFechar={fecharTudo} 
      />
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div className="animate-fade-in" style={{
        background: "var(--surface-elevated)", border: "1px solid var(--border)",
        borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "95vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
      }}>
        
        {/* Header Modal */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(16,185,129,0.15)", padding: 8, borderRadius: 10 }}>
              <ShoppingCart size={18} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Nova Venda Rápida</h2>
              <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "2px 0 0" }}>Caixa Aberto #{caixaId}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 8, padding: 6, cursor: "pointer", color: "var(--foreground-muted)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Layout em 2 Colunas */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", flex: 1, minHeight: 0 }}>
          
          {/* COLUNA ESQUERDA: Busca e Carrinho */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--surface-main)" }}>
            
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
                <input 
                  style={{ ...inpStyle, paddingLeft: 34, background: "var(--surface-elevated)" }} 
                  placeholder="Pesquisar produto..." 
                  value={busca} 
                  onChange={e => setBusca(e.target.value)} 
                  autoFocus 
                />
              </div>
            </div>

            {/* Catálogo de Produtos */}
            <div style={{ overflowY: "auto", flex: 1, borderBottom: "1px solid var(--border)" }}>
              {filtrados.length === 0 ? (
                 <div style={{ padding: 40, textAlign: "center", color: "var(--foreground-subtle)" }}>Nenhum produto encontrado.</div>
              ) : (
                filtrados.map(p => {
                  const noCarrinho = carrinho.find(i => i.produto.id === p.id);
                  return (
                    <div key={p.id} onClick={() => addItem(p)}
                      style={{ 
                        display: "flex", alignItems: "center", justifyContent: "space-between", 
                        padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid var(--border-subtle)",
                        transition: "background 0.1s"
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "var(--surface-overlay)")}
                      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>{p.nome}</p>
                        <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "4px 0 0" }}>
                          Em estoque: <span style={{ color: "var(--foreground-muted)" }}>{p.quantidadeEstoque} un.</span>
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{fmt(p.preco)}</span>
                        {noCarrinho ? (
                          <div style={{ background: "var(--primary)", color: "#000", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                            {noCarrinho.quantidade}×
                          </div>
                        ) : (
                          <div style={{ background: "var(--surface-overlay)", border: "1px solid var(--border)", padding: 4, borderRadius: 6 }}>
                            <Plus size={14} color="var(--foreground-muted)" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mini-carrinho inferior */}
            <div style={{ height: "180px", overflowY: "auto", padding: "12px 20px", background: "var(--surface-overlay)" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>Carrinho de Venda</p>
              {carrinho.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--foreground-subtle)", fontStyle: "italic" }}>Clique nos produtos acima para adicionar.</p>
              ) : (
                carrinho.map(item => (
                  <div key={item.produto.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, background: "var(--surface-elevated)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>{item.produto.nome}</p>
                      <p style={{ fontSize: 11, color: "var(--foreground-muted)", margin: "2px 0 0" }}>{fmt(item.produto.preco)} un.</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", background: "var(--surface-main)", border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
                        <button onClick={() => setQtd(item.produto.id, item.quantidade - 1)} style={{ width: 24, height: 24, background: "transparent", border: "none", cursor: "pointer", color: "var(--foreground-muted)" }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.quantidade}</span>
                        <button onClick={() => setQtd(item.produto.id, item.quantidade + 1)} disabled={item.quantidade >= item.produto.quantidadeEstoque} style={{ width: 24, height: 24, background: "transparent", border: "none", cursor: item.quantidade >= item.produto.quantidadeEstoque ? "not-allowed" : "pointer", color: "var(--primary)" }}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => setCarrinho(prev => prev.filter(i => i.produto.id !== item.produto.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-subtle)" }}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* COLUNA DIREITA: Pagamento e Finalização */}
          <div style={{ display: "flex", flexDirection: "column", background: "var(--surface-elevated)" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Formas de Pagamento */}
              <div>
                <SeletorForma label={misto ? `1ª Forma (Paga: ${fmt(valPag1)})` : "Forma de Pagamento Principal"} value={forma} onChange={setForma} />
                
                <button
                  onClick={() => { setMisto(v => !v); setValPag2(""); setRecebido(""); }}
                  style={{ ...btnG, width: "100%", marginTop: 8, background: misto ? "rgba(59,130,246,0.05)" : "transparent", borderColor: misto ? "#3b82f6" : "var(--border)", color: misto ? "#3b82f6" : "var(--foreground-muted)" }}
                >
                  {misto ? <><X size={13} /> Remover Pagamento Misto</> : <><Plus size={13} /> Pagamento Misto (Dividir em 2 Cartões/Formas)</>}
                </button>
              </div>

              {/* Pagamento Secundário (Misto) */}
              {misto && (
                <div style={{ padding: 14, background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10 }}>
                  <SeletorForma label="2ª Forma de Pagamento" value={forma2} onChange={f => { setForma2(f); setRecebido(""); }} />
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Valor Pago na 2ª Forma</label>
                    <input style={inpStyle} type="number" min="0" step="0.01" value={valPag2} onChange={e => setValPag2(e.target.value)} placeholder="0,00" />
                  </div>
                  {valPag2N >= total && valPag2N > 0 && (
                    <p style={{ fontSize: 11, color: "var(--destructive)", marginTop: 6, fontWeight: 500 }}>⚠ O valor secundário deve ser menor que o total.</p>
                  )}
                </div>
              )}

              {/* Dinheiro / Troco Dinâmico */}
              {temDinheiro && (
                <div>
                  <label style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Valor recebido em Dinheiro {misto && valorEmDinheiro > 0 && <span style={{ textTransform: "none", fontWeight: 400 }}>(Esperado: {fmt(valorEmDinheiro)})</span>}
                  </label>
                  <input style={inpStyle} type="number" min="0" step="0.01" value={recebido} onChange={e => setRecebido(e.target.value)} placeholder="Quanto o cliente deu em nota?" />
                  
                  {recebidoN > 0 && recebidoN >= valorEmDinheiro && troco !== null && troco > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(16,185,129,0.1)", padding: "10px 14px", borderRadius: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--success)" }}>Devolver Troco:</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--success)" }}>{fmt(troco)}</span>
                    </div>
                  )}
                  {falta !== null && falta > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(239,68,68,0.1)", padding: "10px 14px", borderRadius: 8, marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--destructive)" }}>Falta receber:</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "var(--destructive)" }}>{fmt(falta)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Desconto & Obs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Desconto R$</label>
                  <input style={inpStyle} type="number" min="0" step="0.01" value={desconto} onChange={e => setDesconto(e.target.value)} placeholder="0,00" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Observação (Opcional)</label>
                  <input style={inpStyle} value={observacao} onChange={e => setObservacao(e.target.value)} placeholder="Detalhes da venda..." />
                </div>
              </div>

            </div>

            {/* Rodapé de Resumo e Botão */}
            <div style={{ padding: "20px 24px", borderTop: "1px solid var(--border)", background: "var(--surface-overlay)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--foreground-muted)", marginBottom: 6 }}>
                <span>Subtotal dos Itens</span><span>{fmt(subtotal)}</span>
              </div>
              {descontoN > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--destructive)", marginBottom: 6 }}>
                  <span>Desconto Aplicado</span><span>− {fmt(descontoN)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 800, color: "var(--primary)", marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--border)", marginBottom: 16 }}>
                <span>Total a Pagar</span><span>{fmt(total)}</span>
              </div>

              <button 
                onClick={registrar} 
                disabled={salvando || !carrinho.length}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 10, background: "var(--primary)", border: "none",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: salvando || !carrinho.length ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: salvando || !carrinho.length ? 0.5 : 1, transition: "all 0.2s"
                }}
              >
                {salvando ? "Processando Pagamento..." : <><Check size={16} /> Finalizar Venda</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}