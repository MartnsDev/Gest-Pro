"use client";

import { useState } from "react";
import { X, Tag, Ruler, Barcode, ShoppingCart, DollarSign, Check, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import React from "react";

export interface ProdutoForm {
  nome: string;
  categoria: string;
  descricao: string;
  unidade: string;
  codigoBarras: string;
  preco: string;
  precoCusto: string;
  quantidadeEstoque: string;
  estoqueMinimo: string;
  ativo: boolean;
}

const FORM_VAZIO: ProdutoForm = {
  nome: "", categoria: "", descricao: "", unidade: "UN",
  codigoBarras: "", preco: "0,00", precoCusto: "0,00",
  quantidadeEstoque: "0", estoqueMinimo: "0", ativo: true,
};

const fmt = (v?: number | null) =>
  v != null ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) : "—";

const labelStyle: React.CSSProperties = {
  fontSize: "12px", color: "#ffffff", marginBottom: "6px", display: "flex", alignItems: "center", gap: "5px", fontWeight: 500
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", background: "#1a1a1a", border: "1px solid #333",
  borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none"
};

const sectionHeader: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, color: "#888", marginTop: "8px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em"
};

export default function FormularioProduto({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<ProdutoForm>(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // NOVO ESTADO

  const set = (k: keyof ProdutoForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const precoNum = parseFloat(form.preco.replace(",", ".")) || 0;
  const custoNum = parseFloat(form.precoCusto.replace(",", ".")) || 0;
  const lucro = (precoNum > 0 && custoNum > 0) ? precoNum - custoNum : null;
  const margem = (lucro != null && precoNum > 0) ? (lucro / precoNum) * 100 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { 
      toast.error("O nome é obrigatório"); 
      return; 
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        preco: precoNum,
        precoCusto: custoNum,
        quantidadeEstoque: parseInt(form.quantidadeEstoque) || 0,
        estoqueMinimo: parseInt(form.estoqueMinimo) || 0,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      // MOSTRA O MODAL DE SUCESSO
      setShowSuccessModal(true);
      
      // AGUARDA 3 SEGUNDOS E RECARREGA
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (err) {
      toast.error("Erro ao conectar com o servidor.");
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "15px" }}>
      
      {/* MODAL DE SUCESSO (Aparece por cima de tudo) */}
      {showSuccessModal && (
        <div style={{ position: "absolute", inset: 0, background: "#111", zInternal: 10000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "14px", textAlign: "center", animation: "fadeIn 0.3s ease" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "20px", borderRadius: "50%", marginBottom: "16px" }}>
            <CheckCircle2 size={64} color="#10b981" />
          </div>
          <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Produto Adicionado!</h2>
          <p style={{ color: "#888", fontSize: "14px" }}>Atualizando seu estoque em instantes...</p>
        </div>
      )}

      {/* FORMULÁRIO PRINCIPAL */}
      <div style={{ background: "#111", borderRadius: "14px", width: "100%", maxWidth: "460px", padding: "24px", border: "1px solid #222", maxHeight: "95vh", overflowY: "auto", display: showSuccessModal ? "none" : "block" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: 0 }}>Novo Produto</h2>
          <X size={18} color="#888" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Nome *</label>
            <input style={inputStyle} placeholder="Ex: Coca-Cola 350ml" value={form.nome} onChange={e => set("nome", e.target.value)} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}><Tag size={13} color="#888"/> Categoria</label>
              <input style={inputStyle} placeholder="Ex: Bebidas" value={form.categoria} onChange={e => set("categoria", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}><Ruler size={13} color="#888"/> Unidade</label>
              <select style={inputStyle} value={form.unidade} onChange={e => set("unidade", e.target.value)}>
                {["UN", "KG", "LT", "CX"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}><Barcode size={13} color="#888"/> Código de Barras</label>
            <input style={inputStyle} placeholder="EAN-13, EAN-8..." value={form.codigoBarras} onChange={e => set("codigoBarras", e.target.value)} />
          </div>

          <h3 style={sectionHeader}>Precificação</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}><ShoppingCart size={13} color="#888"/> Custo (R$)</label>
              <input style={inputStyle} value={form.precoCusto} onChange={e => set("precoCusto", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}><DollarSign size={13} color="#888"/> Venda (R$)</label>
              <input style={inputStyle} value={form.preco} onChange={e => set("preco", e.target.value)} required />
            </div>
          </div>

          {lucro !== null && lucro > 0 && (
            <div style={{ padding: "10px 12px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "-2px" }}>
              <span style={{ color: "#aaa" }}>Lucro estimado: <b style={{ color: "#10b981" }}>{fmt(lucro)}</b></span>
              <span style={{ fontWeight: 600, color: "#10b981" }}>{margem?.toFixed(1)}% de margem</span>
            </div>
          )}

          <h3 style={sectionHeader}>Estoque</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Qtd. Atual</label>
              <input style={inputStyle} type="number" value={form.quantidadeEstoque} onChange={e => set("quantidadeEstoque", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Mínimo</label>
              <input style={inputStyle} type="number" value={form.estoqueMinimo} onChange={e => set("estoqueMinimo", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea style={{ ...inputStyle, height: "60px", resize: "none" }} placeholder="Opcional..." value={form.descricao} onChange={e => set("descricao", e.target.value)} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: "#fff", fontSize: "13px", marginTop: "4px" }}>
            <input type="checkbox" checked={form.ativo} onChange={e => set("ativo", e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#10b981" }} />
            Produto ativo
          </label>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#888", fontWeight: 600, cursor: "pointer", fontSize: "13px" }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: "12px", background: "#10b981", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "13px" }}>
              <Check size={16} /> {saving ? "Processando..." : "Cadastrar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}