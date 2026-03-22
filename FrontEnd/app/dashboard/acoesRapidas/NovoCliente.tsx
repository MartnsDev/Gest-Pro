"use client";

import { useState } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Check, X, Phone, Mail, CreditCard, Truck, Building2, FileText, User,
} from "lucide-react";
import { toast } from "sonner";

type Tipo = "CLIENTE" | "FORNECEDOR";
interface ContatoForm { nome:string; email:string; telefone:string; cpf:string; cnpj:string; contato:string; observacoes:string; tipo:Tipo; }
const FORM_VAZIO: ContatoForm = { nome:"", email:"", telefone:"", cpf:"", cnpj:"", contato:"", observacoes:"", tipo:"CLIENTE" };

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials:"include", headers:{"Content-Type":"application/json"}, ...opts });
  if (!res.ok){ const e = await res.json().catch(()=>null); throw new Error(e?.mensagem ?? `Erro ${res.status}`); }
  return res.json();
}

const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", background:"var(--surface-overlay)", border:"1px solid var(--border)", borderRadius:8, color:"var(--foreground)", fontSize:13, outline:"none" };
const btnP: React.CSSProperties = { display:"flex", alignItems:"center", gap:6, padding:"9px 16px", background:"var(--primary)", border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" };
const btnG: React.CSSProperties = { display:"flex", alignItems:"center", gap:6, padding:"8px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:8, color:"var(--foreground-muted)", fontSize:13, cursor:"pointer" };

export default function NovoCliente({ onConcluido }: { onConcluido?: () => void }) {
  const { empresaAtiva } = useEmpresa();
  const [form, setForm] = useState<ContatoForm>({ ...FORM_VAZIO });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof ContatoForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const isForn = form.tipo === "FORNECEDOR";

  const salvar = async () => {
    if (!form.nome.trim()){ toast.error("Nome obrigatório"); return; }
    if (!empresaAtiva){ toast.error("Selecione uma empresa"); return; }
    setSaving(true);
    try {
      await fetchAuth("/api/v1/clientes",{ method:"POST", body:JSON.stringify({
        nome:form.nome, email:form.email||null, telefone:form.telefone||null,
        cpf:!isForn&&form.cpf?form.cpf:null, cnpj:isForn&&form.cnpj?form.cnpj:null,
        contato:isForn&&form.contato?form.contato:null, observacoes:form.observacoes||null,
        tipo:form.tipo, empresaId:empresaAtiva.id,
      })});
      toast.success(`${isForn?"Fornecedor":"Cliente"} "${form.nome}" cadastrado!`);
      setForm({ ...FORM_VAZIO, tipo:form.tipo });
      onConcluido?.();
    } catch(e:any){ toast.error(e.message); }
    finally{ setSaving(false); }
  };

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(5px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}
      onClick={e => e.target === e.currentTarget && onConcluido?.()}
    >
    <div style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)", borderRadius:14, padding:26, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:15, fontWeight:700, color:"var(--foreground)", margin:0 }}>
          Novo {isForn?"Fornecedor":"Cliente"}
        </h2>
        {onConcluido && <button onClick={onConcluido} style={{ ...btnG, padding:6, border:"none" }}><X size={16}/></button>}
      </div>

      {/* Seletor tipo */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
        {(["CLIENTE","FORNECEDOR"] as Tipo[]).map(t=>(
          <button key={t} onClick={()=>set("tipo",t)} style={{
            display:"flex", alignItems:"center", gap:8, padding:"10px 14px",
            background:form.tipo===t?"var(--primary-muted)":"var(--surface-overlay)",
            border:`1px solid ${form.tipo===t?"var(--primary)":"var(--border)"}`,
            borderRadius:9, cursor:"pointer",
            color:form.tipo===t?"var(--primary)":"var(--foreground-muted)",
            fontSize:13, fontWeight:form.tipo===t?600:400,
          }}>
            {t==="CLIENTE"?<User size={15}/>:<Truck size={15}/>}
            {t==="CLIENTE"?"Cliente":"Fornecedor"}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:5, fontWeight:500 }}>Nome *</label>
          <input style={inp} value={form.nome} onChange={e=>set("nome",e.target.value)}
            placeholder={isForn?"Razão social ou nome fantasia":"Nome completo"} autoFocus/>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:5, fontWeight:500 }}>
              <Phone size={11} style={{ marginRight:4 }}/>Telefone
            </label>
            <input style={inp} value={form.telefone} onChange={e=>set("telefone",e.target.value)} placeholder="(00) 00000-0000"/>
          </div>
          <div>
            <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:5, fontWeight:500 }}>
              <Mail size={11} style={{ marginRight:4 }}/>E-mail
            </label>
            <input style={inp} type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@exemplo.com"/>
          </div>
        </div>

        {!isForn && (
          <div>
            <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:5, fontWeight:500 }}>
              <CreditCard size={11} style={{ marginRight:4 }}/>CPF
            </label>
            <input style={inp} value={form.cpf} onChange={e=>set("cpf",e.target.value)} placeholder="000.000.000-00" maxLength={14}/>
          </div>
        )}

        {isForn && (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:5, fontWeight:500 }}>
                  <Building2 size={11} style={{ marginRight:4 }}/>CNPJ
                </label>
                <input style={inp} value={form.cnpj} onChange={e=>set("cnpj",e.target.value)} placeholder="00.000.000/0000-00" maxLength={18}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:5, fontWeight:500 }}>
                  <User size={11} style={{ marginRight:4 }}/>Contato
                </label>
                <input style={inp} value={form.contato} onChange={e=>set("contato",e.target.value)} placeholder="Nome do contato"/>
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:5, fontWeight:500 }}>
                <FileText size={11} style={{ marginRight:4 }}/>Observações
              </label>
              <textarea style={{ ...inp, resize:"vertical", minHeight:60 }} value={form.observacoes}
                onChange={e=>set("observacoes",e.target.value)} placeholder="Produtos fornecidos, condições, etc..."/>
            </div>
          </>
        )}

        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button type="button" onClick={()=>setForm({...FORM_VAZIO,tipo:form.tipo})} style={{ ...btnG, flex:1, justifyContent:"center" }}>Limpar</button>
          <button onClick={salvar} disabled={saving} style={{ ...btnP, flex:2, justifyContent:"center", opacity:saving?.7:1 }}>
            {saving?"Salvando...":<><Check size={14}/>Cadastrar</>}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}