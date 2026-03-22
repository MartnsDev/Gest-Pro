"use client";

import { useState } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Tag, Ruler, Barcode, ShoppingCart, DollarSign, Check, X,
} from "lucide-react";
import { toast } from "sonner";

const UNIDADES = ["UN","KG","G","L","ML","CX","PCT","PAR","M","CM"];
const FORM_VAZIO = {
  nome:"", categoria:"", descricao:"", unidade:"UN",
  codigoBarras:"", preco:"", precoCusto:"",
  quantidadeEstoque:"0", estoqueMinimo:"0", ativo: true,
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR",{ style:"currency", currency:"BRL" }).format(v);

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials:"include", headers:{"Content-Type":"application/json"}, ...opts });
  if (!res.ok){ const e = await res.json().catch(()=>null); throw new Error(e?.mensagem ?? `Erro ${res.status}`); }
  return res.json();
}

const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", background:"var(--surface-overlay)", border:"1px solid var(--border)", borderRadius:8, color:"var(--foreground)", fontSize:13, outline:"none" };
const btnPrimary: React.CSSProperties = { display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:"var(--primary)", border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" };
const btnGhost: React.CSSProperties = { display:"flex", alignItems:"center", gap:6, padding:"8px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, color:"var(--foreground-muted)", fontSize:13, cursor:"pointer" };

export default function NovoProduto({ onConcluido }: { onConcluido?: () => void }) {
  const { empresaAtiva } = useEmpresa();
  const [form, setForm] = useState({ ...FORM_VAZIO });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const precoNum = parseFloat(form.preco.replace(",",".")) || 0;
  const custoNum = parseFloat(form.precoCusto.replace(",",".")) || 0;
  const lucro    = precoNum > 0 && custoNum > 0 ? precoNum - custoNum : null;
  const margem   = lucro != null && precoNum > 0 ? (lucro / precoNum) * 100 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()){ toast.error("Nome é obrigatório"); return; }
    if (precoNum <= 0){ toast.error("Preço de venda é obrigatório"); return; }
    if (!empresaAtiva){ toast.error("Selecione uma empresa"); return; }
    setSaving(true);
    try {
      await fetchAuth("/api/v1/produtos",{ method:"POST", body:JSON.stringify({
        empresaId: empresaAtiva.id, nome: form.nome,
        categoria: form.categoria || null, descricao: form.descricao || null,
        unidade: form.unidade, codigoBarras: form.codigoBarras || null,
        preco: precoNum, precoCusto: custoNum > 0 ? custoNum : null,
        quantidadeEstoque: parseInt(form.quantidadeEstoque) || 0,
        estoqueMinimo: parseInt(form.estoqueMinimo) || 0, ativo: form.ativo,
      })});
      toast.success(`"${form.nome}" cadastrado!`);
      setForm({ ...FORM_VAZIO });
      onConcluido?.();
    } catch(e: any){ toast.error(e.message); }
    finally{ setSaving(false); }
  };

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(5px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}
      onClick={e => e.target === e.currentTarget && onConcluido?.()}
    >
    <div style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)", borderRadius:14, padding:28, width:"100%", maxWidth:560, maxHeight:"92vh", overflowY:"auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <h2 style={{ fontSize:16, fontWeight:700, color:"var(--foreground)", margin:0 }}>Novo Produto</h2>
        {onConcluido && (
          <button onClick={onConcluido} style={{ ...btnGhost, padding:6, border:"none" }}><X size={16}/></button>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
        <div>
          <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}>Nome *</label>
          <input style={inp} value={form.nome} onChange={e=>set("nome",e.target.value)} placeholder="Ex: Coca-Cola 350ml" autoFocus required/>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}><Tag size={11} style={{ marginRight:4 }}/>Categoria</label>
            <input style={inp} value={form.categoria} onChange={e=>set("categoria",e.target.value)} placeholder="Ex: Bebidas"/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}><Ruler size={11} style={{ marginRight:4 }}/>Unidade</label>
            <select style={{ ...inp, cursor:"pointer" }} value={form.unidade} onChange={e=>set("unidade",e.target.value)}>
              {UNIDADES.map(u=><option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}><Barcode size={11} style={{ marginRight:4 }}/>Código de Barras</label>
          <input style={inp} value={form.codigoBarras} onChange={e=>set("codigoBarras",e.target.value)} placeholder="EAN-13, EAN-8..."/>
        </div>
        <div>
          <p style={{ fontSize:12, color:"var(--foreground-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>Precificação</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}><ShoppingCart size={11} style={{ marginRight:4 }}/>Preço de Custo (R$)</label>
              <input style={inp} type="number" step="0.01" min="0" value={form.precoCusto} onChange={e=>set("precoCusto",e.target.value)} placeholder="0,00"/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}><DollarSign size={11} style={{ marginRight:4 }}/>Preço de Venda (R$) *</label>
              <input style={inp} type="number" step="0.01" min="0" value={form.preco} onChange={e=>set("preco",e.target.value)} placeholder="0,00" required/>
            </div>
          </div>
          {lucro != null && (
            <div style={{ marginTop:10, padding:"10px 14px", background:lucro>=0?"rgba(16,185,129,.08)":"rgba(239,68,68,.08)", border:`1px solid ${lucro>=0?"rgba(16,185,129,.2)":"rgba(239,68,68,.2)"}`, borderRadius:8, display:"flex", justifyContent:"space-between", fontSize:13 }}>
              <span style={{ color:"var(--foreground-muted)" }}>Lucro unitário</span>
              <div style={{ display:"flex", gap:16 }}>
                <span style={{ fontWeight:700, color:lucro>=0?"var(--primary)":"var(--destructive)" }}>{fmt(lucro)}</span>
                {margem!=null && <span style={{ color:"var(--foreground-muted)" }}>({margem.toFixed(1)}%)</span>}
              </div>
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize:12, color:"var(--foreground-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>Estoque</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}>Quantidade Atual</label>
              <input style={inp} type="number" min="0" value={form.quantidadeEstoque} onChange={e=>set("quantidadeEstoque",e.target.value)}/>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}>Estoque Mínimo (alerta)</label>
              <input style={inp} type="number" min="0" value={form.estoqueMinimo} onChange={e=>set("estoqueMinimo",e.target.value)}/>
            </div>
          </div>
        </div>
        <div>
          <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6, fontWeight:500 }}>Descrição</label>
          <textarea style={{ ...inp, resize:"vertical", minHeight:68 }} value={form.descricao} onChange={e=>set("descricao",e.target.value)} placeholder="Observações opcionais..."/>
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <input type="checkbox" checked={form.ativo} onChange={e=>set("ativo",e.target.checked)} style={{ accentColor:"var(--primary)", width:15, height:15 }}/>
          <span style={{ fontSize:13, color:"var(--foreground-muted)" }}>Produto ativo</span>
        </label>
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button type="button" onClick={()=>setForm({...FORM_VAZIO})} style={{ ...btnGhost, flex:1, justifyContent:"center" }}>Limpar</button>
          <button type="submit" disabled={saving} style={{ ...btnPrimary, flex:2, justifyContent:"center", opacity:saving?.7:1 }}>
            {saving?"Salvando...":<><Check size={14}/>Cadastrar produto</>}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}