"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import {
  FileText, Upload, Download, Plus, Search, CheckCircle,
  XCircle, ShieldCheck, FileArchive, Send, Trash2, Loader2,
  AlertTriangle, Clock, Receipt, Briefcase, Eye, X, RefreshCw, 
  Building2, ChevronLeft, ChevronRight, CreditCard, Calendar, TrendingUp
} from "lucide-react";

// =====================================================================
// CONFIGURAÇÕES E AMBIENTE
// =====================================================================
const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/nota-fiscal` 
  : "http://localhost:8080/api/nota-fiscal";
  
const EMPRESA_ID = 1; // Substituir pelo ID da empresa via Context (ex: empresaAtiva.id)

// =====================================================================
// DESIGN TOKENS
// =====================================================================
const theme = {
  bgBase: "#000000",
  bgCard: "#181a20",
  bgInput: "#0f1115",
  border: "#272a30",
  textMain: "#f8fafc",
  textMuted: "#94a3b8",
  primary: "#10b981",     
  primaryHover: "#059669",
  primaryAlpha: "rgba(16, 185, 129, 0.1)",
  danger: "#ef4444",
  dangerAlpha: "rgba(239, 68, 68, 0.1)",
  warning: "#f59e0b",
  info: "#3b82f6"
};

// =====================================================================
// TIPOS E HELPERS
// =====================================================================
type AbaGeral = "historico" | "emitir" | "certificado" | "contador";
type TipoNota = "NFE" | "NFCE" | "NFSE";
type StatusNota = "DIGITACAO" | "VALIDANDO" | "AUTORIZADA" | "REJEITADA" | "CANCELADA" | "CONTINGENCIA";

const fmt = (v?: number | null) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
const fmtDate = (s?: string) => s ? new Date(s).toLocaleString("pt-BR") : "—";

function ClientOnly({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok ? <>{children}</> : null;
}

function Card({ title, subtitle, children, style }: { title?: string; subtitle?: string; children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px", ...style }}>
      {title && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".08em", margin: 0 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: "var(--foreground-subtle)", margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>{children}</p>;
}

function StyledInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</label>
      <input
        {...props as any}
        style={{
          padding: "9px 12px", borderRadius: 8, fontSize: 13, background: "var(--surface-overlay)", 
          border: "1px solid var(--border)", color: "var(--foreground)", outline: "none", width: "100%",
          transition: "border-color 0.2s", ...props.style,
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === "AUTORIZADA";
  const isErr = status === "REJEITADA" || status === "CANCELADA";
  const isWarn = status === "CONTINGENCIA";
  
  const bg = isOk ? "rgba(52,211,153,0.1)" : isErr ? "rgba(239,68,68,0.1)" : isWarn ? "rgba(245,158,11,0.1)" : "var(--surface-overlay)";
  const color = isOk ? "#34d399" : isErr ? "#ef4444" : isWarn ? "#f59e0b" : "var(--primary)";
  const border = isOk ? "rgba(52,211,153,0.3)" : isErr ? "rgba(239,68,68,0.3)" : isWarn ? "rgba(245,158,11,0.3)" : "var(--border)";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, color, background: bg, border: `1px solid ${border}` }}>
      {status}
    </span>
  );
}

// =====================================================================
// COMPONENTE PRINCIPAL
// =====================================================================
export default function NotaFiscalPage() {
  const [aba, setAba] = useState<AbaGeral>("historico");
  const [loading, setLoading] = useState(false);
  const [emitindo, setEmitindo] = useState(false);

  const [notas, setNotas] = useState<any[]>([]);
  const [paginacao, setPaginao] = useState<any>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [estatisticas, setEstatisticas] = useState({ totalAutorizadas: 0, totalRejeitadas: 0, totalCanceladas: 0, valorTotalMes: 0 });
  const [filtroStatus, setFiltroStatus] = useState("TODOS");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [notaSelecionada, setNotaSelecionada] = useState<any>(null);

  const [tipoNota, setTipoNota] = useState<TipoNota>("NFE");
  const [naturezaOp, setNaturezaOp] = useState("Venda de Mercadoria");
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [clienteDoc, setClienteDoc] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [infoAdicionais, setInfoAdicionais] = useState("");
  const [itens, setItens] = useState<any[]>([]);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

  const [arquivoCert, setArquivoCert] = useState<File | null>(null);
  const [senhaCert, setSenhaCert] = useState("");
  const [certInfo, setCertInfo] = useState<any>(null);
  const [salvandoCert, setSalvandoCert] = useState(false);
  const [periodoExport, setPeriodoExport] = useState(new Date().toISOString().slice(0, 7));
  const [tipoSped, setTipoSped] = useState("EFD_ICMS_IPI");

  const fetchSeguro = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (res.status === 501) throw new Error("Funcionalidade ainda não implementada.");
    
    const text = await res.text();
    if (!text) {
        if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
        return null;
    }
    try {
        const json = JSON.parse(text);
        if (!res.ok) throw new Error(json.mensagem || `Erro HTTP: ${res.status}`);
        return json;
    } catch (e: any) {
        if (e.message.includes("HTTP") || e.message.includes("implementada")) throw e;
        console.error("Resposta não-JSON:", text);
        throw new Error("O servidor retornou uma resposta inválida. Verifique o console.");
    }
  };

  const fazerDownloadSeguro = async (url: string, filename: string) => {
    const toastId = toast.loading("Iniciando download...");
    try {
      const res = await fetch(url);
      if (res.status === 501) throw new Error("Módulo SPED ainda não implementado no servidor.");
      if (!res.ok) throw new Error("Arquivo não encontrado ou erro no servidor.");
      
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = filename; a.click();
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download concluído!", { id: toastId });
    } catch (e: any) {
      toast.error(e.message, { id: toastId });
    }
  };

  const carregarKPIs = useCallback(async () => {
    try {
      const json = await fetchSeguro(`${API_BASE}/estatisticas?empresaId=${EMPRESA_ID}`);
      if (json && json.sucesso) setEstatisticas(json.dados);
    } catch (e: any) { console.warn("Aviso (KPIs):", e.message); }
  }, []);

  const carregarNotas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ empresaId: String(EMPRESA_ID), page: String(paginaAtual) });
      if (filtroStatus !== "TODOS") params.append("status", filtroStatus);
      if (filtroBusca) params.append("clienteNome", filtroBusca);

      const json = await fetchSeguro(`${API_BASE}?${params.toString()}`);
      if (json && json.sucesso) {
        setNotas(json.dados.data || []);
        const { data, ...rest } = json.dados;
        setPaginao(rest);
      }
    } catch (error: any) {
      toast.error(error.message || "Falha ao carregar notas");
    } finally {
      setLoading(false);
    }
  }, [filtroStatus, filtroBusca, paginaAtual]);

  useEffect(() => {
    if (aba === "historico") {
      carregarKPIs();
      const timeout = setTimeout(carregarNotas, 400); 
      return () => clearTimeout(timeout);
    }
  }, [aba, filtroStatus, filtroBusca, paginaAtual, carregarNotas, carregarKPIs]);

  const handleConsultarCnpj = async () => {
    const limpo = clienteDoc.replace(/\D/g, "");
    if (limpo.length !== 14) return toast.error("Digite os 14 números do CNPJ.");
    
    setBuscandoCnpj(true);
    try {
      const data = await fetchSeguro(`${API_BASE}/cnpj/${limpo}`);
      if (data) { setClienteNome(data.nome || data.fantasia || ""); toast.success(`Dados encontrados via ${data.fonte || 'API'}!`); }
    } catch (e: any) { toast.error(e.message); } finally { setBuscandoCnpj(false); }
  };

  const handleEmitir = async () => {
    if (itens.length === 0) return toast.error("Adicione itens à nota.");
    setEmitindo(true);

    try {
      const payload = {
        empresaId: EMPRESA_ID, clienteNome, clienteCpfCnpj: clienteDoc.replace(/\D/g, ''),
        tipo: tipoNota, naturezaOperacao: naturezaOp, formaPagamento, informacoesAdicionais: infoAdicionais,
        itens: itens.map(i => ({ ...i, produtoId: 1 }))
      };

      const resCriar = await fetchSeguro(API_BASE, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!resCriar || !resCriar.sucesso) throw new Error("Falha ao criar o rascunho.");

      const resEmitir = await fetchSeguro(`${API_BASE}/${resCriar.dados.id}/emitir`, { method: "POST" });

      if (resEmitir && resEmitir.dados?.status === "AUTORIZADA") {
        toast.success(`NF Autorizada! Protocolo: ${resEmitir.dados.protocolo}`);
        setAba("historico"); setItens([]); setClienteNome(""); setClienteDoc(""); setInfoAdicionais("");
      } else {
        toast.warning(`Nota salva. Status atual: ${resEmitir?.dados?.status}`);
      }
    } catch (e: any) { toast.error(e.message); } finally { setEmitindo(false); }
  };

  const handleCancelar = async (id: number) => {
    const motivo = window.prompt("Justificativa (Mín. 15 caracteres):");
    if (!motivo || motivo.length < 15) return toast.error("Justificativa muito curta.");
    try {
      await fetchSeguro(`${API_BASE}/cancelar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notaId: id, justificativa: motivo }) });
      toast.success("Nota Cancelada!"); setNotaSelecionada(null); carregarNotas();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleExcluir = async (id: number) => {
    if (!window.confirm("Deseja excluir este rascunho?")) return;
    try {
      await fetchSeguro(`${API_BASE}/${id}`, { method: "DELETE" });
      toast.success("Rascunho excluído!"); carregarNotas();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUploadCertificado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoCert || !senhaCert) return toast.error("Preencha arquivo e senha.");
    setSalvandoCert(true);
    try {
      const formData = new FormData(); formData.append("arquivo", arquivoCert); formData.append("senha", senhaCert);
      const res = await fetch(`${API_BASE}/certificado/${EMPRESA_ID}`, { method: "POST", body: formData });
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;
      if (res.ok && json?.sucesso) { toast.success("Certificado validado!"); setCertInfo(json.dados); } 
      else { throw new Error(json?.mensagem || "Erro ao validar certificado."); }
    } catch (e: any) { toast.error(e.message); } finally { setSalvandoCert(false); }
  };

  // === CÁLCULOS E FILTROS DINÂMICOS (CORREÇÃO DO ERRO) ===
  const totalNota = itens.reduce((acc, i) => acc + ((i.quantidade * i.valorUnitario) - i.valorDesconto), 0);
  const adicionarItem = () => setItens([...itens, { id: Date.now(), descricao: "", ncm: "", cfop: "5102", unidade: "UN", quantidade: 1, valorUnitario: 0, valorDesconto: 0, csosn: "102" }]);

  // Filtra em tempo real no frontend enquanto a API não responde
  const notasFiltradas = notas.filter(n => 
    filtroBusca === "" || 
    (n.clienteNome && n.clienteNome.toLowerCase().includes(filtroBusca.toLowerCase())) ||
    (n.numeroNota && String(n.numeroNota).includes(filtroBusca))
  );

  return (
    <ClientOnly>
      <div style={{ padding: "28px 28px 48px", display: "flex", flexDirection: "column", gap: 26, maxWidth: 1200, margin: "0 auto", background: theme.bgBase, color: theme.textMain }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", marginBottom: 4, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 8 }}>
              <Receipt color="var(--primary)" size={26} /> Emissor Fiscal Inteligente
            </h1>
            <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: 0 }}>Gestão de NF-e, NFC-e e NFS-e conectada à SEFAZ</p>
          </div>
          <button onClick={carregarNotas} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--foreground)", fontWeight: 500, cursor: "pointer" }}>
             <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Atualizar Dados
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "Faturamento (Mês)", val: fmt(estatisticas.valorTotalMes), ic: <TrendingUp size={16} />, cor: "var(--primary)" },
            { label: "NF Autorizadas", val: estatisticas.totalAutorizadas, ic: <CheckCircle size={16} />, cor: "#34d399" },
            { label: "NF Rejeitadas", val: estatisticas.totalRejeitadas, ic: <AlertTriangle size={16} />, cor: "#ef4444" },
            { label: "NF Canceladas", val: estatisticas.totalCanceladas, ic: <XCircle size={16} />, cor: "var(--foreground-muted)" }
          ].map((k, i) => (
             <div key={i} style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 20px" }}>
               <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ color: k.cor }}>{k.ic}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{k.label}</span>
               </div>
               <div style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)" }}>{k.val}</div>
             </div>
          ))}
        </div>

        {/* ABAS */}
        <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)" }}>
          {[
            { id: "historico", label: "Histórico" }, { id: "emitir", label: "Nova Emissão" },
            { id: "certificado", label: "Certificado" }, { id: "contador", label: "Contabilidade" }
          ].map(t => (
            <button key={t.id} onClick={() => setAba(t.id as AbaGeral)} 
              style={{ 
                padding: "10px 18px", background: aba === t.id ? "var(--surface-elevated)" : "transparent", cursor: "pointer",
                border: "1px solid", borderColor: aba === t.id ? "var(--border)" : "transparent", borderBottom: "none",
                borderRadius: "10px 10px 0 0", fontWeight: 700, fontSize: 13, marginBottom: aba === t.id ? -1 : 0,
                color: aba === t.id ? "var(--foreground)" : "var(--foreground-muted)", transition: "all 0.15s"
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDOS DAS ABAS */}
        {aba === "historico" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }} />
                <input placeholder="Buscar por cliente..." value={filtroBusca} onChange={e => { setFiltroBusca(e.target.value); setPaginaAtual(1); }} style={{ ...inpStyle, paddingLeft: 36 }} />
              </div>
              <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPaginaAtual(1); }} style={{ ...inpStyle, width: 200 }}>
                <option value="TODOS">Todos os Status</option>
                <option value="AUTORIZADA">Autorizada</option>
                <option value="REJEITADA">Rejeitada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="DIGITACAO">Rascunhos</option>
              </select>
            </div>

            <Card style={{ padding: 0 }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "var(--surface-overlay)", borderBottom: "1px solid var(--border)" }}>
                      {["Documento", "Cliente", "Data", "Valor", "Status", ""].map(h => <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {notasFiltradas.length === 0 && !loading && <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--foreground-subtle)", fontSize: 13 }}>Nenhuma nota localizada.</td></tr>}
                    {notasFiltradas.map(n => (
                      <tr key={n.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>{n.numeroNota || "Rascunho"} <span style={{ fontWeight: 400, color: "var(--foreground-muted)" }}>({n.tipo})</span></td>
                        <td style={{ padding: "12px 16px", color: "var(--foreground)" }}>{n.clienteNome || "Consumidor Padrão"}</td>
                        <td style={{ padding: "12px 16px", color: "var(--foreground-muted)" }}>{fmtDate(n.dataEmissao)}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--foreground)" }}>{fmt(n.valorTotal)}</td>
                        <td style={{ padding: "12px 16px" }}><StatusBadge status={n.status} /></td>
                        <td style={{ padding: "12px 16px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button onClick={() => setNotaSelecionada(n)} style={btnStyle}><Eye size={14}/> Ver</button>
                          {n.status === "AUTORIZADA" && <button onClick={() => fazerDownloadSeguro(`${API_BASE}/${n.id}/xml`, `nf-${n.numeroNota}.xml`)} style={{...btnStyle, color: "var(--primary)", borderColor: "var(--primary)"}}><Download size={14}/> XML</button>}
                          {n.status === "DIGITACAO" && <button onClick={() => handleExcluir(n.id)} style={{...btnStyle, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)"}}><Trash2 size={14}/></button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            
            {paginacao && paginacao.pages > 1 && (
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 15 }}>
                <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>Página {paginacao.page} de {paginacao.pages}</span>
                <button disabled={!paginacao.hasPrevious} onClick={() => setPaginaAtual(p => p - 1)} style={btnStyle}><ChevronLeft size={16}/></button>
                <button disabled={!paginacao.hasNext} onClick={() => setPaginaAtual(p => p + 1)} style={btnStyle}><ChevronRight size={16}/></button>
              </div>
            )}
          </div>
        )}

        {aba === "emitir" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <SectionTitle>Selecione o Modelo</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {(["NFE", "NFCE", "NFSE"] as TipoNota[]).map(t => (
                  <button key={t} onClick={() => setTipoNota(t)} style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 11, padding: "16px 15px",
                    background: tipoNota === t ? "rgba(52,211,153,0.08)" : "var(--surface-overlay)",
                    border: `1px solid ${tipoNota === t ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, cursor: "pointer", transition: "all .16s", textAlign: "left",
                  }}>
                    <div style={{ color: tipoNota === t ? "var(--primary)" : "var(--foreground)" }}><Receipt size={20} /></div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{t}</p>
                      <p style={{ fontSize: 11, color: "var(--foreground-subtle)", margin: "3px 0 0" }}>{t === "NFE" ? "Produto (Mod. 55)" : t === "NFCE" ? "Consumidor (Mod. 65)" : "Serviço"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Card title="Dados da Emissão">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                 <div>
                    <StyledInput label="CPF ou CNPJ (Destinatário)" value={clienteDoc} onChange={e => setClienteDoc(e.target.value)} placeholder="000.000.000-00" />
                    {clienteDoc.length >= 14 && (
                      <button onClick={handleConsultarCnpj} disabled={buscandoCnpj} style={{ marginTop: 8, fontSize: 11, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
                        {buscandoCnpj ? <Loader2 size={12} className="animate-spin" /> : <Building2 size={12} />} Autopreencher Dados
                      </button>
                    )}
                 </div>
                 <StyledInput label="Nome ou Razão Social" value={clienteNome} onChange={e => setClienteNome(e.target.value)} />
                 <StyledInput label="Natureza da Operação" value={naturezaOp} onChange={e => setNaturezaOp(e.target.value)} />
                 <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase" }}>Pagamento</label>
                    <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)} style={inpStyle}>
                        <option value="PIX">Pix</option><option value="DINHEIRO">Dinheiro</option><option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    </select>
                 </div>
              </div>
            </Card>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
                <SectionTitle>Produtos da Nota</SectionTitle>
                <button onClick={adicionarItem} style={{ background: "var(--primary)", color: "#000", border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                  <Plus size={14}/> Add Produto
                </button>
              </div>
              
              {itens.length === 0 && <div style={{ textAlign: "center", padding: 30, color: "var(--foreground-subtle)", fontSize: 13, border: "1px dashed var(--border)", borderRadius: 10 }}>Nenhum produto adicionado.</div>}

              {itens.map((it, idx) => (
                <div key={it.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr 1fr 40px", gap: 10, marginBottom: 15, background: "var(--surface-overlay)", padding: 12, borderRadius: 10, border: "1px solid var(--border)" }}>
                  <StyledInput label="Descrição" value={it.descricao} onChange={e => { const n = [...itens]; n[idx].descricao = e.target.value; setItens(n); }} />
                  <StyledInput label="NCM" value={it.ncm} onChange={e => { const n = [...itens]; n[idx].ncm = e.target.value; setItens(n); }} />
                  <StyledInput label="Qtd" type="number" value={it.quantidade} onChange={e => { const n = [...itens]; n[idx].quantidade = Number(e.target.value); setItens(n); }} />
                  <StyledInput label="R$ Unit" type="number" value={it.valorUnitario} onChange={e => { const n = [...itens]; n[idx].valorUnitario = Number(e.target.value); setItens(n); }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase" }}>Total</label>
                    <div style={{ padding: "9px 12px", fontWeight: 700, fontSize: 13, color: "var(--primary)", background: "rgba(52,211,153,0.08)", borderRadius: 8, border: "1px solid rgba(52,211,153,0.2)" }}>
                      {fmt((it.quantidade * it.valorUnitario) - it.valorDesconto)}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 20 }}>
                    <button onClick={() => setItens(itens.filter(i => i.id !== it.id))} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              
              {itens.length > 0 && (
                <div style={{ textAlign: "right", marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <span style={{ marginRight: 15, color: "var(--foreground-muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Total Geral:</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)" }}>{fmt(totalNota)}</span>
                </div>
              )}
            </Card>

            <button disabled={emitindo} onClick={handleEmitir} style={{ background: "var(--primary)", color: "#000", padding: "16px", borderRadius: 12, fontSize: 14, fontWeight: 800, border: "none", cursor: emitindo ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, transition: "opacity 0.2s" }}>
              {emitindo ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
              {emitindo ? "PROCESSANDO SEFAZ..." : "TRANSMITIR NOTA FISCAL"}
            </button>
          </div>
        )}

        {aba === "certificado" && (
           <Card title="Certificado Digital A1 (.pfx)" style={{ maxWidth: 600 }}>
              <p style={{ fontSize: 13, color: "var(--foreground-subtle)", margin: "-10px 0 20px" }}>Obrigatório para assinatura HTTPS mTLS com a SEFAZ.</p>
              <form onSubmit={handleUploadCertificado} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                 <div style={{ padding: 20, border: "2px dashed var(--border)", borderRadius: 10, textAlign: "center", background: "var(--surface-overlay)", position: "relative" }}>
                    <input type="file" accept=".pfx,.p12" onChange={e => setArquivoCert(e.target.files?.[0] || null)} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer", zIndex: 10 }} />
                    <Upload size={24} style={{ color: "var(--foreground-muted)", marginBottom: 8 }} />
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: arquivoCert ? "var(--primary)" : "var(--foreground-muted)" }}>
                      {arquivoCert ? `✓ ${arquivoCert.name}` : "Clique ou arraste seu arquivo .pfx aqui"}
                    </p>
                 </div>
                 <StyledInput label="Senha do Certificado" type="password" value={senhaCert} onChange={e => setSenhaCert(e.target.value)} />
                 <button type="submit" disabled={salvandoCert} style={{ background: "var(--primary)", color: "#000", padding: 14, borderRadius: 10, border: "none", fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", gap: 8 }}>
                   {salvandoCert ? <Loader2 className="animate-spin" size={16}/> : <ShieldCheck size={16}/>}
                   {salvandoCert ? "VALIDANDO..." : "SALVAR E ATIVAR CERTIFICADO"}
                 </button>
              </form>
              {certInfo && (
                <div style={{ marginTop: 20, padding: 16, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 10, fontSize: 13 }}>
                  <p style={{ margin: "0 0 8px 0", fontWeight: 700, color: "#34d399", display: "flex", alignItems: "center", gap: 6 }}><CheckCircle size={16}/> Certificado Operacional</p>
                  <p style={{ margin: "0 0 4px", color: "var(--foreground)" }}><strong>Titular:</strong> {certInfo.titular}</p>
                  <p style={{ margin: 0, color: "var(--foreground)" }}><strong>Validade:</strong> {certInfo.validoAte}</p>
                </div>
              )}
           </Card>
        )}

        {aba === "contador" && (
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              <Card title="Exportação de Arquivos XML (Mensal)">
                 <p style={{ fontSize: 13, color: "var(--foreground-subtle)", margin: "-10px 0 20px" }}>ZIP contendo todos os XMLs autorizados para a contabilidade.</p>
                 <StyledInput label="Mês de Referência" type="month" value={periodoExport} onChange={e => setPeriodoExport(e.target.value)} style={{ marginBottom: 16 }} />
                 <button onClick={() => fazerDownloadSeguro(`${API_BASE}/exportar/xml-mensal?empresaId=${EMPRESA_ID}&periodo=${periodoExport}`, `xmls-${periodoExport}.zip`)} style={{...btnStyle, width: "100%", justifyContent: "center", padding: 12, color: "var(--primary)", borderColor: "var(--primary)"}}><Download size={16}/> GERAR E BAIXAR ZIP</button>
              </Card>
              <Card title="Geração SPED Fiscal">
                 <p style={{ fontSize: 13, color: "var(--foreground-subtle)", margin: "-10px 0 20px" }}>Geração de TXT (Lucro Presumido/Real).</p>
                 <StyledInput label="Mês de Referência" type="month" value={periodoExport} onChange={e => setPeriodoExport(e.target.value)} style={{ marginBottom: 12 }} />
                 <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase" }}>Tipo</label>
                    <select value={tipoSped} onChange={e => setTipoSped(e.target.value)} style={inpStyle}><option value="EFD_ICMS_IPI">EFD ICMS/IPI</option><option value="EFD_CONTRIBUICOES">EFD Contribuições</option></select>
                 </div>
                 <button onClick={() => fazerDownloadSeguro(`${API_BASE}/exportar/sped?empresaId=${EMPRESA_ID}&periodo=${periodoExport}&tipo=${tipoSped}`, `sped-${periodoExport}.txt`)} style={{...btnStyle, width: "100%", justifyContent: "center", padding: 12}}><FileText size={16}/> BAIXAR SPED TXT</button>
              </Card>
           </div>
        )}

        {/* MODAL DETALHES */}
        {notaSelecionada && (
          <div onClick={() => setNotaSelecionada(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999, backdropFilter: "blur(4px)" }}>
              <div onClick={e => e.stopPropagation()} style={{ background: "var(--surface-elevated)", padding: 32, borderRadius: 16, border: "1px solid var(--border)", width: 500, maxWidth: "90%", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{notaSelecionada.tipo} - {notaSelecionada.numeroNota || "Rascunho"}</h2>
                      <button onClick={() => setNotaSelecionada(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)" }}><X size={20}/></button>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}><span style={{ color: "var(--foreground-muted)" }}>Cliente:</span><strong style={{ color: "var(--foreground)" }}>{notaSelecionada.clienteNome || "Consumidor"}</strong></div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}><span style={{ color: "var(--foreground-muted)" }}>Status:</span><StatusBadge status={notaSelecionada.status} /></div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}><span style={{ color: "var(--foreground-muted)" }}>Chave:</span><span style={{ fontFamily: "monospace", color: "var(--primary)" }}>{notaSelecionada.chaveAcesso || "—"}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "var(--foreground-muted)" }}>Protocolo:</span><strong style={{ fontFamily: "monospace", color: "var(--foreground)" }}>{notaSelecionada.protocolo || "—"}</strong></div>
                      {notaSelecionada.motivoRejeicao && (<div style={{ padding: 12, background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}><strong>Rejeição/Falha:</strong><br/>{notaSelecionada.motivoRejeicao}</div>)}
                  </div>

                  <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
                      {notaSelecionada.status === "AUTORIZADA" && (
                          <>
                             <button onClick={() => fazerDownloadSeguro(`${API_BASE}/${notaSelecionada.id}/danfe`, `danfe-${notaSelecionada.numeroNota}.pdf`)} style={{ ...btnStyle, flex: 1, justifyContent: "center" }}><FileText size={16}/> DANFE</button>
                             <button onClick={() => fazerDownloadSeguro(`${API_BASE}/${notaSelecionada.id}/xml`, `nf-${notaSelecionada.numeroNota}.xml`)} style={{ ...btnStyle, flex: 1, justifyContent: "center", color: "var(--primary)", borderColor: "var(--primary)" }}><Download size={16}/> XML</button>
                             <button onClick={() => handleCancelar(notaSelecionada.id)} style={{ ...btnStyle, flex: 1, justifyContent: "center", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}><Trash2 size={16}/> Cancelar</button>
                          </>
                      )}
                  </div>
              </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
    </ClientOnly>
  );
}

// ESTILOS LOCAIS
const inpStyle = { padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-overlay)", color: "var(--foreground)", width: "100%", fontSize: 13, outline: "none" };
const btnStyle = { background: "var(--surface-overlay)", border: "1px solid var(--border)", padding: "8px 12px", borderRadius: 8, cursor: "pointer", color: "var(--foreground)", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700 };