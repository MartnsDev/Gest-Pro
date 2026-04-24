"use client";

import { useState, ReactNode } from "react";
import { 
  Check, X, User, Truck, Phone, Mail, 
  CreditCard, Building2, FileText 
} from "lucide-react";
import { toast } from "sonner";

/* ─── Modal Base Interno ─── */
function Overlay({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

function ModalBox({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="animate-fade-in" style={{
      background: "var(--surface-elevated)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 26, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{title}</h2>
          {sub && <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "3px 0 0" }}>{sub}</p>}
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--foreground-muted)", padding: 6 }}>
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ─── Configurações e Estilos ─── */
type Tipo = "CLIENTE" | "FORNECEDOR";

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", background: "var(--surface-overlay)",
  border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)",
  fontSize: 13, outline: "none"
};
const btnP: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "10px 0",
  background: "var(--primary)", border: "none", borderRadius: 8,
  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", justifyContent: "center"
};
const btnG: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "9px 14px",
  background: "transparent", border: "1px solid var(--border)", borderRadius: 8,
  color: "var(--foreground-muted)", fontSize: 13, cursor: "pointer", justifyContent: "center"
};

/* ─── Componente Principal ─── */
interface Props {
  empresaId: number;
  onClose: () => void;
  onConcluido: () => void;
}

export default function NovoCliente({ empresaId, onClose, onConcluido }: Props) {
  const [form, setForm] = useState({ 
    nome: "", email: "", telefone: "", cpf: "", cnpj: "", contato: "", observacoes: "", tipo: "CLIENTE" as Tipo
  });
  const [saving, setSaving] = useState(false);
  
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  
  const isForn = form.tipo === "FORNECEDOR";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { 
      toast.error("Nome é obrigatório"); 
      return; 
    }
    
    setSaving(true);
    try {
      const token = sessionStorage.getItem("jwt_token") ?? document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ?? "";
      const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      
      const res = await fetch(`${base}/api/v1/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          empresaId,
          nome: form.nome, 
          email: form.email || null, 
          telefone: form.telefone || null, 
          cpf: form.cpf || null,
          cnpj: form.cnpj || null,
          contato: form.contato || null,
          observacoes: form.observacoes || null,
          tipo: form.tipo
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.mensagem || "Falha ao cadastrar contato");
      }
      
      toast.success(`${form.tipo === "CLIENTE" ? "Cliente" : "Fornecedor"} cadastrado com sucesso!`); 
      onConcluido(); 
      onClose();
    } catch (error: any) { 
      toast.error(error.message); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Cadastrar Contato Rápido" onClose={onClose}>
        
        {/* Escolha de Tipo */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
          {(["CLIENTE", "FORNECEDOR"] as Tipo[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("tipo", t)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                background: form.tipo === t ? "var(--primary-muted)" : "var(--surface-overlay)",
                border: `1px solid ${form.tipo === t ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 9, cursor: "pointer",
                color: form.tipo === t ? "var(--primary)" : "var(--foreground-muted)",
                fontSize: 13, fontWeight: form.tipo === t ? 600 : 400,
                transition: "all 0.2s"
              }}
            >
              {t === "CLIENTE" ? <User size={15} /> : <Truck size={15} />}
              {t === "CLIENTE" ? "Cliente" : "Fornecedor"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* NOME */}
          <div>
            <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>Nome *</label>
            <input 
              style={inp} 
              value={form.nome} 
              onChange={e => set("nome", e.target.value)} 
              placeholder={isForn ? "Razão social ou nome fantasia" : "Nome completo"} 
              autoFocus 
              required 
            />
          </div>
          
          {/* TELEFONE E EMAIL */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                <Phone size={11} style={{ marginRight: 4 }} /> Telefone
              </label>
              <input style={inp} value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                <Mail size={11} style={{ marginRight: 4 }} /> E-mail
              </label>
              <input style={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemplo.com" />
            </div>
          </div>
          
          {/* CAMPOS CONDICIONAIS - CLIENTE */}
          {!isForn && (
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                <CreditCard size={11} style={{ marginRight: 4 }} /> CPF
              </label>
              <input style={inp} value={form.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" maxLength={14} />
            </div>
          )}

          {/* CAMPOS CONDICIONAIS - FORNECEDOR */}
          {isForn && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                    <Building2 size={11} style={{ marginRight: 4 }} /> CNPJ
                  </label>
                  <input style={inp} value={form.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" maxLength={18} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                    <User size={11} style={{ marginRight: 4 }} /> Contato
                  </label>
                  <input style={inp} value={form.contato} onChange={e => set("contato", e.target.value)} placeholder="Nome do contato (Vendedor)" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                  <FileText size={11} style={{ marginRight: 4 }} /> Observações
                </label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: 60 }} value={form.observacoes} onChange={e => set("observacoes", e.target.value)} placeholder="Produtos fornecidos, condições de pagamento..." />
              </div>
            </>
          )}
          
          {/* BOTÕES */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, ...btnG }}>Cancelar</button>
            <button type="submit" disabled={saving} style={{ flex: 2, ...btnP, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Salvando..." : <><Check size={14} />Cadastrar {isForn ? "Fornecedor" : "Cliente"}</>}
            </button>
          </div>

        </form>
      </ModalBox>
    </Overlay>
  );
}