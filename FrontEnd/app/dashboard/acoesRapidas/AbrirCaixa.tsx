"use client";

import { useEffect, useState } from "react";
import { DollarSign, Store, CheckCircle, AlertCircle, Lock, X } from "lucide-react";
import { useEmpresa, type Empresa, type CaixaInfo } from "../context/Empresacontext";
import { toast } from "sonner";

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials:"include", headers:{"Content-Type":"application/json"}, ...opts });
  if (!res.ok){ const err = await res.json().catch(()=>null); throw new Error(err?.mensagem ?? `Erro ${res.status}`); }
  return res.json();
}

const fmt = (v?: number | null) =>
  new Intl.NumberFormat("pt-BR",{ style:"currency", currency:"BRL" }).format(v ?? 0);

const inp: React.CSSProperties = { width:"100%", padding:"10px 12px", background:"var(--surface-overlay)", border:"1px solid var(--border)", borderRadius:8, color:"var(--foreground)", fontSize:16, outline:"none" };

export default function AbrirCaixa({ onConcluido }: { onConcluido?: () => void }) {
  const { empresaAtiva, caixaAtivo, setCaixaAtivo, setEmpresaAtiva } = useEmpresa();

  const [passo,       setPasso]       = useState<"empresa"|"abrir"|"fechar">(caixaAtivo ? "fechar" : "empresa");
  const [empresas,    setEmpresas]    = useState<Empresa[]>([]);
  const [empresaSel,  setEmpresaSel]  = useState<Empresa|null>(empresaAtiva);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [saldoFinal,   setSaldoFinal]   = useState("");
  const [loading,     setLoading]     = useState(false);
  const [erro,        setErro]        = useState("");

  useEffect(()=>{ fetchAuth<Empresa[]>("/api/v1/empresas").then(setEmpresas).catch(()=>{}); },[]);

  const abrirCaixa = async () => {
    if (!empresaSel){ setErro("Selecione uma empresa."); return; }
    const val = parseFloat(saldoInicial.replace(",","."));
    if (isNaN(val)||val<0){ setErro("Informe um saldo inicial válido."); return; }
    setLoading(true); setErro("");
    try {
      const caixa = await fetchAuth<CaixaInfo>("/api/v1/caixas/abrir",{ method:"POST", body:JSON.stringify({ empresaId:empresaSel.id, saldoInicial:val }) });
      caixa.empresaNome = empresaSel.nomeFantasia;
      setCaixaAtivo(caixa); setEmpresaAtiva(empresaSel);
      toast.success("Caixa aberto!");
      onConcluido?.();
    } catch(e:any){ setErro(e.message); }
    finally{ setLoading(false); }
  };

  const fecharCaixa = async () => {
    if (!caixaAtivo) return;
    const val = parseFloat(saldoFinal.replace(",","."));
    if (isNaN(val)||val<0){ setErro("Informe o saldo final em caixa."); return; }
    setLoading(true); setErro("");
    try {
      await fetchAuth("/api/v1/caixas/fechar",{ method:"POST", body:JSON.stringify({ caixaId:caixaAtivo.id, saldoFinal:val }) });
      setCaixaAtivo(null);
      toast.success("Caixa fechado!");
      onConcluido?.();
    } catch(e:any){ setErro(e.message); }
    finally{ setLoading(false); }
  };

  return (
    <div
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(5px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:16 }}
      onClick={e => e.target === e.currentTarget && onConcluido?.()}
    >
    <div style={{ background:"var(--surface-elevated)", border:"1px solid var(--border)", borderRadius:16, width:"100%", maxWidth:460, overflow:"hidden" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {passo==="fechar"
            ? <Lock size={17} color="var(--warning)"/>
            : <DollarSign size={17} color="var(--primary)"/>
          }
          <span style={{ fontSize:14, fontWeight:600, color:"var(--foreground)" }}>
            {passo==="fechar" ? "Fechar Caixa" : passo==="empresa" ? "Selecionar Empresa" : "Abrir Caixa"}
          </span>
        </div>
      </div>

      <div style={{ padding:20 }}>
        {erro && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:8, color:"var(--destructive)", fontSize:13, marginBottom:16 }}>
            <AlertCircle size={14}/> {erro}
          </div>
        )}

        {/* Passo 1: empresa */}
        {passo==="empresa" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <p style={{ fontSize:13, color:"var(--foreground-muted)", marginBottom:4 }}>Selecione a empresa para abrir o caixa:</p>
            {empresas.length===0
              ? <p style={{ fontSize:13, color:"var(--foreground-subtle)", textAlign:"center", padding:24 }}>Nenhuma empresa cadastrada.</p>
              : empresas.map(emp=>(
                <div key={emp.id} onClick={()=>setEmpresaSel(emp)} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:empresaSel?.id===emp.id?"var(--primary-muted)":"var(--surface-overlay)", border:`1px solid ${empresaSel?.id===emp.id?"var(--primary)":"var(--border)"}`, borderRadius:10, cursor:"pointer" }}>
                  <Store size={15} color={empresaSel?.id===emp.id?"var(--primary)":"var(--foreground-muted)"}/>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"var(--foreground)", margin:0 }}>{emp.nomeFantasia}</p>
                  </div>
                  {empresaSel?.id===emp.id && <CheckCircle size={15} color="var(--primary)"/>}
                </div>
              ))}
            <button onClick={()=>{ if (!empresaSel){ setErro("Selecione uma empresa."); return; } setErro(""); setPasso("abrir"); }}
              disabled={!empresaSel}
              style={{ marginTop:8, padding:"10px 0", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:empresaSel?"pointer":"not-allowed", opacity:empresaSel?1:0.5 }}>
              Continuar
            </button>
          </div>
        )}

        {/* Passo 2: saldo inicial */}
        {passo==="abrir" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"var(--primary-muted)", borderRadius:8 }}>
              <Store size={14} color="var(--primary)"/>
              <span style={{ fontSize:13, color:"var(--primary)", fontWeight:500 }}>{empresaSel?.nomeFantasia}</span>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6 }}>Saldo Inicial (R$)</label>
              <input type="number" min="0" step="0.01" value={saldoInicial} onChange={e=>setSaldoInicial(e.target.value)} placeholder="0,00" style={inp} autoFocus/>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{ setPasso("empresa"); setErro(""); }}
                style={{ flex:1, padding:"10px 0", background:"transparent", border:"1px solid var(--border)", borderRadius:8, color:"var(--foreground-muted)", fontSize:13, cursor:"pointer" }}>Voltar</button>
              <button onClick={abrirCaixa} disabled={loading}
                style={{ flex:2, padding:"10px 0", background:"var(--primary)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
                {loading?"Abrindo...":"Abrir Caixa"}
              </button>
            </div>
          </div>
        )}

        {/* Fechar caixa */}
        {passo==="fechar" && caixaAtivo && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"var(--surface-overlay)", borderRadius:10, padding:16 }}>
              <p style={{ fontSize:10, color:"var(--foreground-muted)", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 12px", fontWeight:600 }}>Resumo do Caixa</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { l:"Empresa",         v:caixaAtivo.empresaNome??empresaAtiva?.nomeFantasia },
                  { l:"Saldo Inicial",   v:fmt(caixaAtivo.valorInicial) },
                  { l:"Total em Vendas", v:fmt(caixaAtivo.totalVendas), destaque:true },
                ].map(r=>(
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                    <span style={{ color:"var(--foreground-muted)" }}>{r.l}</span>
                    <span style={{ color:r.destaque?"var(--primary)":"var(--foreground)", fontWeight:r.destaque?600:500 }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, paddingTop:8, borderTop:"1px solid var(--border)" }}>
                  <span style={{ color:"var(--foreground-muted)" }}>Saldo Esperado</span>
                  <span style={{ color:"var(--foreground)", fontWeight:600 }}>{fmt((caixaAtivo.valorInicial??0)+(caixaAtivo.totalVendas??0))}</span>
                </div>
              </div>
            </div>
            <div>
              <label style={{ fontSize:12, color:"var(--foreground-muted)", display:"block", marginBottom:6 }}>Saldo Final em Caixa (R$)</label>
              <input type="number" min="0" step="0.01" value={saldoFinal} onChange={e=>setSaldoFinal(e.target.value)} placeholder="0,00" style={inp} autoFocus/>
            </div>
            <button onClick={fecharCaixa} disabled={loading}
              style={{ padding:"10px 0", background:"var(--destructive)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1 }}>
              {loading?"Fechando...":"Confirmar Fechamento"}
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}