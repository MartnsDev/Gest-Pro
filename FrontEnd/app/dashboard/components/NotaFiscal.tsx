"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FileText, Upload, Download, Plus, Search, CheckCircle,
  AlertCircle, XCircle, ShieldCheck, FileArchive, Send,
  Trash2, RefreshCw, Eye, X, ChevronDown, Loader2,
  AlertTriangle, Clock, Building2, Receipt, Briefcase
} from "lucide-react";
import { toast } from "sonner";

// =====================================================================
// TYPES
// =====================================================================
type AbaGeral = "historico" | "emitir" | "certificado" | "contador";
type TipoNota = "NFE" | "NFCE" | "NFSE";
type StatusNota = "DIGITACAO" | "VALIDANDO" | "AUTORIZADA" | "REJEITADA" | "CANCELADA" | "INUTILIZADA" | "CONTINGENCIA";
type FormaPagamento = "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO" | "TRANSFERENCIA" | "OUTROS";

interface ItemNota {
  id: string;
  descricao: string;
  ncm: string;
  cfop: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto: number;
  csosn: string;
  cstIcms: string;
  icmsAliquota: number;
}

interface NotaResumo {
  id: number;
  numeroNota: string;
  serie: string;
  tipo: TipoNota;
  status: StatusNota;
  clienteNome: string;
  chaveAcesso: string;
  valorTotal: number;
  dataEmissao: string;
  protocolo: string;
  motivoRejeicao?: string;
}

// =====================================================================
// MOCK DATA
// =====================================================================
const NOTAS_MOCK: NotaResumo[] = [
  { id: 1, numeroNota: "000000001", serie: "1", tipo: "NFE", status: "AUTORIZADA", clienteNome: "Empresa XPTO Ltda", chaveAcesso: "35260425000000000000550010000000011234567890", valorTotal: 4850.00, dataEmissao: "2026-04-25T10:30:00", protocolo: "135260000000001" },
  { id: 2, numeroNota: "000000002", serie: "1", tipo: "NFCE", status: "AUTORIZADA", clienteNome: "João da Silva", chaveAcesso: "35260425000000000000650010000000021234567891", valorTotal: 127.50, dataEmissao: "2026-04-25T11:20:00", protocolo: "135260000000002" },
  { id: 3, numeroNota: "000000003", serie: "1", tipo: "NFE", status: "REJEITADA", clienteNome: "Maria Oliveira ME", chaveAcesso: "", valorTotal: 980.00, dataEmissao: "2026-04-24T16:00:00", protocolo: "", motivoRejeicao: "[225] Rejeição: Falha no schema XML - tag <NCM> inválida" },
  { id: 4, numeroNota: "000000004", serie: "1", tipo: "NFSE", status: "AUTORIZADA", clienteNome: "Consultoria ABC", chaveAcesso: "98765", valorTotal: 3000.00, dataEmissao: "2026-04-23T09:00:00", protocolo: "NFSE-12345" },
  { id: 5, numeroNota: "000000005", serie: "1", tipo: "NFE", status: "CANCELADA", clienteNome: "Distribuidora Sul", chaveAcesso: "35260425000000000000550010000000051234567894", valorTotal: 1500.00, dataEmissao: "2026-04-22T14:30:00", protocolo: "135260000000005" },
  { id: 6, numeroNota: "000000006", serie: "1", tipo: "NFE", status: "CONTINGENCIA", clienteNome: "Pedro Costa EPP", chaveAcesso: "35260425000000000000550010000000061234567895", valorTotal: 720.00, dataEmissao: "2026-04-22T08:00:00", protocolo: "" },
];

// =====================================================================
// HELPERS
// =====================================================================
const STATUS_CONFIG: Record<StatusNota, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  AUTORIZADA:  { label: "Autorizada",  color: "#16a34a", bg: "#dcfce7", icon: <CheckCircle size={13} /> },
  REJEITADA:   { label: "Rejeitada",   color: "#dc2626", bg: "#fee2e2", icon: <XCircle size={13} /> },
  CANCELADA:   { label: "Cancelada",   color: "#6b7280", bg: "#f3f4f6", icon: <XCircle size={13} /> },
  DIGITACAO:   { label: "Digitação",   color: "#2563eb", bg: "#dbeafe", icon: <Clock size={13} /> },
  VALIDANDO:   { label: "Validando",   color: "#d97706", bg: "#fef3c7", icon: <Loader2 size={13} /> },
  INUTILIZADA: { label: "Inutilizada", color: "#7c3aed", bg: "#ede9fe", icon: <AlertTriangle size={13} /> },
  CONTINGENCIA:{ label: "Contingência",color: "#ea580c", bg: "#ffedd5", icon: <AlertTriangle size={13} /> },
};

const TIPO_CONFIG: Record<TipoNota, { label: string; sublabel: string; icon: React.ReactNode }> = {
  NFE:  { label: "NF-e",  sublabel: "Nota Fiscal Eletrônica (Produto)",  icon: <Receipt size={22} /> },
  NFCE: { label: "NFC-e", sublabel: "Nota Fiscal ao Consumidor",          icon: <FileText size={22} /> },
  NFSE: { label: "NFS-e", sublabel: "Nota Fiscal de Serviço",             icon: <Briefcase size={22} /> },
};

const CFOP_COMUNS = [
  { value: "5102", label: "5102 - Venda de mercadoria adquirida ou recebida de terceiros" },
  { value: "5101", label: "5101 - Venda de produção do estabelecimento" },
  { value: "5405", label: "5405 - Venda de mercadoria com ST retido anteriormente" },
  { value: "6102", label: "6102 - Venda interestadual de mercadoria" },
  { value: "5933", label: "5933 - Prestação de serviço tributado pelo ISSQN" },
];

const CSOSN_OPCOES = [
  { value: "102", label: "102 - Tributada sem permissão de crédito" },
  { value: "400", label: "400 - Não tributada pelo Simples Nacional" },
  { value: "500", label: "500 - ICMS cobrado anteriormente por ST" },
  { value: "900", label: "900 - Outros (Tributada com permissão de crédito)" },
];

const fmt = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
const fmtDate = (s: string) => new Date(s).toLocaleString("pt-BR");

// =====================================================================
// SUBCOMPONENTS
// =====================================================================

function Badge({ status }: { status: StatusNota }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px",
      borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
      color: cfg.color, background: cfg.bg,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StyledInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        {...props}
        style={{
          padding: "9px 12px", borderRadius: 8, fontSize: 13,
          background: "var(--surface-overlay)", border: "1px solid var(--border)",
          color: "var(--foreground)", outline: "none", width: "100%",
          transition: "border-color 0.2s",
          ...props.style,
        }}
      />
    </div>
  );
}

function StyledSelect({ label, options, ...props }: {
  label: string;
  options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", letterSpacing: 0.3, textTransform: "uppercase" }}>
        {label}
      </label>
      <select
        {...props}
        style={{
          padding: "9px 12px", borderRadius: 8, fontSize: 13,
          background: "var(--surface-overlay)", border: "1px solid var(--border)",
          color: "var(--foreground)", outline: "none", width: "100%",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--surface-elevated)", borderRadius: 14,
      border: "1px solid var(--border)", padding: 24, ...style
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
      color: "var(--foreground-muted)", margin: "0 0 16px", paddingBottom: 10,
      borderBottom: "1px solid var(--border)",
    }}>
      {children}
    </h3>
  );
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================
export default function NotaFiscalPage() {
  const [aba, setAba] = useState<AbaGeral>("historico");
  const [tipoNota, setTipoNota] = useState<TipoNota>("NFE");
  const [itens, setItens] = useState<ItemNota[]>([]);
  const [notas, setNotas] = useState<NotaResumo[]>(NOTAS_MOCK);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [notaSelecionada, setNotaSelecionada] = useState<NotaResumo | null>(null);
  const [emitindo, setEmitindo] = useState(false);
  const [arquivoCert, setArquivoCert] = useState<File | null>(null);
  const [senhaCert, setSenhaCert] = useState("");
  const [certInfo, setCertInfo] = useState<Record<string, string> | null>(null);
  const [salvandoCert, setSalvandoCert] = useState(false);

  // Form de emissão
  const [naturezaOp, setNaturezaOp] = useState("Venda de Mercadoria");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteDoc, setClienteDoc] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("PIX");
  const [infoAdicionais, setInfoAdicionais] = useState("");

  // === FILTROS ===
  const notasFiltradas = notas.filter(n => {
    const matchStatus = filtroStatus === "TODOS" || n.status === filtroStatus;
    const matchBusca = filtroBusca === "" ||
      n.clienteNome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      n.numeroNota.includes(filtroBusca) ||
      (n.chaveAcesso && n.chaveAcesso.includes(filtroBusca));
    return matchStatus && matchBusca;
  });

  // === TOTAIS ===
  const totalAutorizadas = notas.filter(n => n.status === "AUTORIZADA").length;
  const totalMes = notas.filter(n => n.status === "AUTORIZADA").reduce((a, b) => a + b.valorTotal, 0);
  const totalRejeitadas = notas.filter(n => n.status === "REJEITADA").length;
  const totalContingencia = notas.filter(n => n.status === "CONTINGENCIA").length;

  // === HANDLERS ===
  const adicionarItem = () => {
    const novoItem: ItemNota = {
      id: Date.now().toString(),
      descricao: "",
      ncm: "",
      cfop: "5102",
      unidade: "UN",
      quantidade: 1,
      valorUnitario: 0,
      valorDesconto: 0,
      csosn: "400",
      cstIcms: "",
      icmsAliquota: 0,
    };
    setItens([...itens, novoItem]);
  };

  const removerItem = (id: string) => setItens(itens.filter(i => i.id !== id));

  const atualizarItem = (id: string, field: keyof ItemNota, value: any) => {
    setItens(itens.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const calcTotal = (item: ItemNota) =>
    Math.max(0, item.quantidade * item.valorUnitario - item.valorDesconto);

  const totalNota = itens.reduce((a, i) => a + calcTotal(i), 0);

  const handleEmitir = async () => {
    if (itens.length === 0) {
      toast.error("Adicione ao menos um produto à nota.");
      return;
    }
    if (!clienteNome && tipoNota !== "NFCE") {
      toast.error("Informe o destinatário da nota.");
      return;
    }
    setEmitindo(true);
    // Simula chamada à API
    await new Promise(r => setTimeout(r, 2200));
    const sucesso = Math.random() > 0.3;
    if (sucesso) {
      const nova: NotaResumo = {
        id: notas.length + 1,
        numeroNota: String(notas.length + 1).padStart(9, "0"),
        serie: "1", tipo: tipoNota, status: "AUTORIZADA",
        clienteNome: clienteNome || "Consumidor Final",
        chaveAcesso: "35260425" + Math.random().toString().slice(2, 38),
        valorTotal: totalNota,
        dataEmissao: new Date().toISOString(),
        protocolo: "1352600" + Math.random().toString().slice(2, 12),
      };
      setNotas([nova, ...notas]);
      setItens([]);
      setClienteNome("");
      setClienteDoc("");
      toast.success(`${TIPO_CONFIG[tipoNota].label} emitida e autorizada pela SEFAZ! Protocolo: ${nova.protocolo}`);
      setAba("historico");
    } else {
      toast.error("[225] SEFAZ rejeitou: Falha no schema XML. Verifique os dados do NCM e tente novamente.");
    }
    setEmitindo(false);
  };

  const handleSalvarCertificado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoCert || !senhaCert) {
      toast.error("Selecione o arquivo .pfx e informe a senha.");
      return;
    }
    setSalvandoCert(true);
    await new Promise(r => setTimeout(r, 1500));
    setCertInfo({
      titular: "CN=EMPRESA TESTE LTDA:00000000000100, OU=Autenticado por AC VALID, OU=RFB e-CNPJ A1, OU=Secretaria da Receita Federal do Brasil - RFB, O=ICP-Brasil, C=BR",
      emissor: "CN=AC VALID BRASIL v5, OU=Autoridade Certificadora, O=ICP-Brasil, C=BR",
      validoAte: "Thu Apr 25 2027 00:00:00 GMT-0300",
      valido: "true",
    });
    toast.success("Certificado validado e registrado com sucesso!");
    setSalvandoCert(false);
  };

  const handleCancelarNota = async (nota: NotaResumo) => {
    const motivo = window.prompt("Informe a justificativa do cancelamento (mín. 15 caracteres):");
    if (!motivo || motivo.length < 15) {
      toast.error("Justificativa inválida.");
      return;
    }
    await new Promise(r => setTimeout(r, 1000));
    setNotas(notas.map(n => n.id === nota.id ? { ...n, status: "CANCELADA" } : n));
    setNotaSelecionada(null);
    toast.success("Nota cancelada com sucesso na SEFAZ.");
  };

  const handleRetransmitirContingencias = async () => {
    toast.info("Retransmitindo notas em contingência...");
    await new Promise(r => setTimeout(r, 2000));
    setNotas(notas.map(n => n.status === "CONTINGENCIA" ? { ...n, status: "AUTORIZADA", protocolo: "1352600" + Math.random().toString().slice(2, 12) } : n));
    toast.success("Contingências transmitidas com sucesso!");
  };

  // =====================================================================
  // RENDER
  // =====================================================================
  return (
    <div style={{ padding: "28px 28px 60px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100, margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--foreground)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ background: "var(--primary)", borderRadius: 10, padding: "6px 10px", display: "flex" }}>
              <FileText size={22} color="#000" />
            </span>
            Motor Fiscal
          </h1>
          <p style={{ fontSize: 14, color: "var(--foreground-muted)", marginTop: 6, marginBottom: 0 }}>
            NF-e · NFC-e · NFS-e — integrado direto à SEFAZ e Prefeituras
          </p>
        </div>

        {totalContingencia > 0 && (
          <button
            onClick={handleRetransmitirContingencias}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, color: "#ea580c", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            <AlertTriangle size={16} />
            {totalContingencia} nota(s) em contingência — Retransmitir
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Autorizadas (total)", value: totalAutorizadas, color: "#16a34a", bg: "#dcfce7" },
          { label: "Faturado no período", value: fmt(totalMes), color: "#2563eb", bg: "#dbeafe" },
          { label: "Rejeitadas", value: totalRejeitadas, color: "#dc2626", bg: "#fee2e2" },
          { label: "Em contingência", value: totalContingencia, color: "#ea580c", bg: "#ffedd5" },
        ].map((kpi, i) => (
          <div key={i} style={{ background: "var(--surface-elevated)", borderRadius: 12, border: "1px solid var(--border)", padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--foreground-muted)", margin: "0 0 8px" }}>{kpi.label}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: kpi.color, margin: 0, background: kpi.bg, display: "inline-block", padding: "2px 10px", borderRadius: 8 }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {([
          { id: "historico", label: "Histórico", icon: <Search size={15} /> },
          { id: "emitir", label: "Nova Emissão", icon: <Plus size={15} /> },
          { id: "certificado", label: "Certificado Digital", icon: <ShieldCheck size={15} /> },
          { id: "contador", label: "Área do Contador", icon: <FileArchive size={15} /> },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAba(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
              borderRadius: "10px 10px 0 0", cursor: "pointer", fontSize: 13, fontWeight: 700,
              transition: "all .15s", whiteSpace: "nowrap", border: "1px solid transparent",
              borderBottom: "none",
              background: aba === tab.id ? "var(--surface-elevated)" : "transparent",
              color: aba === tab.id ? "var(--foreground)" : "var(--foreground-muted)",
              borderColor: aba === tab.id ? "var(--border)" : "transparent",
              marginBottom: aba === tab.id ? -1 : 0,
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* ABA: HISTÓRICO */}
      {/* ================================================================ */}
      {aba === "historico" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Filtros */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-muted)" }} />
              <input
                value={filtroBusca}
                onChange={e => setFiltroBusca(e.target.value)}
                placeholder="Buscar por número, cliente ou chave..."
                style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: 8, background: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 13, outline: "none" }}
              />
            </div>
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              style={{ padding: "9px 12px", borderRadius: 8, background: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 13, outline: "none" }}
            >
              <option value="TODOS">Todos os status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button
              onClick={() => setAba("emitir")}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              <Plus size={15} /> Nova Nota
            </button>
          </div>

          {/* Tabela */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-overlay)" }}>
                  {["Número", "Tipo", "Destinatário", "Valor Total", "Data", "Status", "Ações"].map(col => (
                    <th key={col} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--foreground-muted)", whiteSpace: "nowrap" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {notasFiltradas.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--foreground-muted)", fontSize: 13 }}>Nenhuma nota encontrada.</td></tr>
                )}
                {notasFiltradas.map((nota) => (
                  <tr key={nota.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-overlay)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <span style={{ fontWeight: 700, fontFamily: "monospace" }}>{nota.numeroNota}</span>
                      <span style={{ fontSize: 11, color: "var(--foreground-muted)", marginLeft: 6 }}>/ {nota.serie}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                        {nota.tipo}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--foreground)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {nota.clienteNome}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                      {fmt(nota.valorTotal)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--foreground-muted)" }}>
                      {fmtDate(nota.dataEmissao)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge status={nota.status} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setNotaSelecionada(nota)}
                          style={{ padding: "5px 10px", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "var(--foreground)", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <Eye size={13} /> Ver
                        </button>
                        {nota.status === "AUTORIZADA" && (
                          <button
                            onClick={() => {
                              const url = `/api/nota-fiscal/${nota.id}/xml`;
                              toast.info("Baixando XML...");
                            }}
                            style={{ padding: "5px 10px", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <Download size={13} /> XML
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <p style={{ fontSize: 12, color: "var(--foreground-muted)", textAlign: "right" }}>
            {notasFiltradas.length} nota(s) exibida(s)
          </p>
        </div>
      )}

      {/* ================================================================ */}
      {/* ABA: EMITIR NOTA */}
      {/* ================================================================ */}
      {aba === "emitir" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Seleção de tipo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {(["NFE", "NFCE", "NFSE"] as TipoNota[]).map(tipo => {
              const cfg = TIPO_CONFIG[tipo];
              const ativo = tipoNota === tipo;
              return (
                <button
                  key={tipo}
                  onClick={() => setTipoNota(tipo)}
                  style={{
                    padding: "18px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                    border: `2px solid ${ativo ? "var(--primary)" : "var(--border)"}`,
                    background: ativo ? "rgba(var(--primary-rgb, 250,204,21), 0.08)" : "var(--surface-elevated)",
                    transition: "all .15s",
                  }}
                >
                  <div style={{ color: ativo ? "var(--primary)" : "var(--foreground-muted)", marginBottom: 8 }}>{cfg.icon}</div>
                  <p style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px", color: "var(--foreground)" }}>{cfg.label}</p>
                  <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: 0 }}>{cfg.sublabel}</p>
                </button>
              );
            })}
          </div>

          {/* Dados da nota */}
          <Card>
            <SectionTitle>Dados da Emissão</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <StyledInput label="Natureza da Operação" value={naturezaOp} onChange={e => setNaturezaOp(e.target.value)} placeholder="Ex: Venda de Mercadoria" />
              <StyledSelect
                label="Forma de Pagamento"
                value={formaPagamento}
                onChange={e => setFormaPagamento(e.target.value as FormaPagamento)}
                options={[
                  { value: "PIX", label: "Pix" },
                  { value: "DINHEIRO", label: "Dinheiro" },
                  { value: "CARTAO_CREDITO", label: "Cartão de Crédito" },
                  { value: "CARTAO_DEBITO", label: "Cartão de Débito" },
                  { value: "BOLETO", label: "Boleto Bancário" },
                  { value: "TRANSFERENCIA", label: "Transferência Bancária" },
                  { value: "OUTROS", label: "Outros" },
                ]}
              />
            </div>
          </Card>

          {/* Destinatário */}
          {tipoNota !== "NFCE" && (
            <Card>
              <SectionTitle>Destinatário</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <StyledInput label="CPF / CNPJ" value={clienteDoc} onChange={e => setClienteDoc(e.target.value)} placeholder="000.000.000-00 ou 00.000.000/0001-00" />
                  {clienteDoc.replace(/\D/g, "").length >= 11 && (
                    <button style={{ marginTop: 6, fontSize: 11, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                      Consultar na Receita Federal →
                    </button>
                  )}
                </div>
                <StyledInput label="Nome / Razão Social" value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Nome completo ou razão social" />
              </div>
            </Card>
          )}

          {/* Produtos / Serviços */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <SectionTitle>Produtos / Serviços</SectionTitle>
              <button
                onClick={adicionarItem}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                <Plus size={14} /> Adicionar Item
              </button>
            </div>

            {itens.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", background: "var(--surface-overlay)", borderRadius: 10, border: "1px dashed var(--border)" }}>
                <FileText size={32} style={{ color: "var(--foreground-muted)", marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: 0 }}>Nenhum item adicionado ainda.</p>
                <p style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 4 }}>Clique em "Adicionar Item" para começar.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {itens.map((item, idx) => (
                  <div key={item.id} style={{ background: "var(--surface-overlay)", borderRadius: 10, border: "1px solid var(--border)", padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground-muted)" }}>Item #{idx + 1}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--foreground)" }}>{fmt(calcTotal(item))}</span>
                        <button onClick={() => removerItem(item.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <StyledInput label="Descrição" value={item.descricao} onChange={e => atualizarItem(item.id, "descricao", e.target.value)} placeholder="Nome do produto/serviço" />
                      <StyledInput label="NCM" value={item.ncm} onChange={e => atualizarItem(item.id, "ncm", e.target.value)} placeholder="00000000" />
                      <StyledSelect
                        label="CFOP"
                        value={item.cfop}
                        onChange={e => atualizarItem(item.id, "cfop", e.target.value)}
                        options={CFOP_COMUNS}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
                      <StyledInput label="Unidade" value={item.unidade} onChange={e => atualizarItem(item.id, "unidade", e.target.value)} placeholder="UN" />
                      <StyledInput label="Quantidade" type="number" value={item.quantidade} onChange={e => atualizarItem(item.id, "quantidade", Number(e.target.value))} />
                      <StyledInput label="Vlr. Unitário (R$)" type="number" value={item.valorUnitario} onChange={e => atualizarItem(item.id, "valorUnitario", Number(e.target.value))} />
                      <StyledInput label="Desconto (R$)" type="number" value={item.valorDesconto} onChange={e => atualizarItem(item.id, "valorDesconto", Number(e.target.value))} />
                      <StyledSelect
                        label="CSOSN"
                        value={item.csosn}
                        onChange={e => atualizarItem(item.id, "csosn", e.target.value)}
                        options={CSOSN_OPCOES}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {itens.length > 0 && (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                <div style={{ background: "var(--surface-overlay)", borderRadius: 10, padding: "12px 20px", border: "1px solid var(--border)", minWidth: 240 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--foreground-muted)" }}>Subtotal:</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{fmt(totalNota)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>Total da Nota:</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)" }}>{fmt(totalNota)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <SectionTitle>Informações Adicionais</SectionTitle>
            <textarea
              value={infoAdicionais}
              onChange={e => setInfoAdicionais(e.target.value)}
              placeholder="Informações complementares para o fisco (opcional)"
              rows={3}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 13, outline: "none", resize: "vertical" }}
            />
          </Card>

          {/* Botão Emitir */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              onClick={() => { setItens([]); setClienteNome(""); setClienteDoc(""); }}
              style={{ padding: "12px 20px", background: "transparent", color: "var(--foreground-muted)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Limpar
            </button>
            <button
              onClick={handleEmitir}
              disabled={emitindo}
              style={{
                padding: "12px 28px", background: emitindo ? "var(--surface-overlay)" : "var(--primary)",
                color: emitindo ? "var(--foreground-muted)" : "#000",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
                cursor: emitindo ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
                transition: "all .15s",
              }}
            >
              {emitindo ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={18} />}
              {emitindo ? "Transmitindo para SEFAZ..." : `Emitir ${TIPO_CONFIG[tipoNota].label}`}
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ABA: CERTIFICADO DIGITAL */}
      {/* ================================================================ */}
      {aba === "certificado" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <Card>
            <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldCheck size={26} color="#16a34a" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>Certificado Digital A1</h2>
                <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: 0, lineHeight: 1.6 }}>
                  Faça upload do arquivo <strong>.pfx</strong> ou <strong>.p12</strong> para assinar digitalmente os XMLs antes de enviar à SEFAZ.
                </p>
              </div>
            </div>

            <form onSubmit={handleSalvarCertificado} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--foreground-muted)", display: "block", marginBottom: 8 }}>
                  Arquivo do Certificado (.pfx / .p12)
                </label>
                <label style={{
                  display: "block", position: "relative", cursor: "pointer",
                  padding: 20, borderRadius: 10, textAlign: "center",
                  border: `2px dashed ${arquivoCert ? "#16a34a" : "var(--border)"}`,
                  background: arquivoCert ? "#dcfce7" : "var(--surface-overlay)",
                  transition: "all .15s",
                }}>
                  <input type="file" accept=".pfx,.p12" onChange={e => setArquivoCert(e.target.files?.[0] || null)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                  <Upload size={24} color={arquivoCert ? "#16a34a" : "var(--foreground-muted)"} style={{ marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: arquivoCert ? "#16a34a" : "var(--foreground-muted)" }}>
                    {arquivoCert ? `✓ ${arquivoCert.name}` : "Clique para selecionar ou arraste o arquivo"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--foreground-muted)" }}>
                    Formatos suportados: .pfx, .p12 (certificado A1)
                  </p>
                </label>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: "var(--foreground-muted)", display: "block", marginBottom: 8 }}>
                  Senha do Certificado
                </label>
                <input
                  type="password"
                  value={senhaCert}
                  onChange={e => setSenhaCert(e.target.value)}
                  placeholder="••••••••••"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, background: "var(--surface-overlay)", border: "1px solid var(--border)", color: "var(--foreground)", fontSize: 14, outline: "none" }}
                />
                <p style={{ fontSize: 11, color: "var(--foreground-muted)", marginTop: 4 }}>
                  A senha é criptografada antes de ser armazenada. Nunca é exposta.
                </p>
              </div>

              <button
                type="submit"
                disabled={salvandoCert}
                style={{ padding: "12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: salvandoCert ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}
              >
                {salvandoCert ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <ShieldCheck size={17} />}
                {salvandoCert ? "Validando..." : "Salvar e Validar Certificado"}
              </button>
            </form>
          </Card>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {certInfo ? (
              <Card>
                <SectionTitle>Certificado Ativo</SectionTitle>
                <div style={{ display: "flex", align: "center", gap: 10, marginBottom: 16, padding: 12, background: "#dcfce7", borderRadius: 10 }}>
                  <CheckCircle size={20} color="#16a34a" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>Certificado válido e operacional</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Titular", value: certInfo.titular?.split(",")[0]?.replace("CN=", "").split(":")[0] },
                    { label: "Emissor", value: certInfo.emissor?.split(",")[0]?.replace("CN=", "") },
                    { label: "Válido até", value: new Date(certInfo.validoAte).toLocaleDateString("pt-BR") },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--foreground-muted)" }}>{label}</span>
                      <span style={{ fontSize: 13, color: "var(--foreground)", wordBreak: "break-all" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card style={{ textAlign: "center", padding: 32 }}>
                <ShieldCheck size={40} style={{ color: "var(--foreground-muted)", marginBottom: 12 }} />
                <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: 0 }}>Nenhum certificado ativo.</p>
                <p style={{ fontSize: 12, color: "var(--foreground-muted)", marginTop: 4 }}>Faça o upload do seu certificado A1 para emitir notas fiscais.</p>
              </Card>
            )}

            <Card>
              <SectionTitle>Segurança</SectionTitle>
              {[
                { icon: "🔒", text: "Arquivo .pfx nunca é armazenado em disco — apenas carregado em memória segura." },
                { icon: "🔑", text: "A senha é criptografada com AES-256 antes de qualquer persistência." },
                { icon: "🛡️", text: "Comunicação com SEFAZ via TLS mútuo usando o próprio certificado." },
                { icon: "⏱️", text: "Alertas automáticos quando o certificado está próximo do vencimento (30 dias)." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 12, color: "var(--foreground-muted)", lineHeight: 1.5 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ABA: CONTADOR */}
      {/* ================================================================ */}
      {aba === "contador" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card>
            <SectionTitle>Exportação Mensal de XMLs</SectionTitle>
            <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginBottom: 20, lineHeight: 1.6 }}>
              Gera um arquivo <strong>.zip</strong> com todos os XMLs autorizados e cancelados do mês. O contador importa esse arquivo no sistema de escrituração dele.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <StyledInput label="Período" type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
              <button
                onClick={() => toast.success("ZIP gerado! Download iniciando...")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                <Download size={16} /> Gerar e Baixar ZIP
              </button>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "var(--surface-overlay)", borderRadius: 8, fontSize: 12, color: "var(--foreground-muted)" }}>
              ℹ️ Inclui notas com status <strong>AUTORIZADA</strong> e <strong>CANCELADA</strong>. Notas rejeitadas são excluídas.
            </div>
          </Card>

          <Card>
            <SectionTitle>SPED Fiscal</SectionTitle>
            <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginBottom: 20, lineHeight: 1.6 }}>
              Gera o arquivo TXT do SPED EFD ICMS/IPI ou EFD Contribuições. Disponível para empresas no Lucro Presumido e Lucro Real.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <StyledInput label="Período" type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
              <StyledSelect
                label="Tipo de SPED"
                options={[
                  { value: "EFD_ICMS_IPI", label: "EFD ICMS/IPI (SPED Fiscal)" },
                  { value: "EFD_CONTRIBUICOES", label: "EFD Contribuições (PIS/COFINS)" },
                ]}
              />
              <button
                onClick={() => toast.info("SPED em implementação para próxima versão.")}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", background: "var(--surface-overlay)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                <Download size={16} /> Gerar Arquivo TXT
              </button>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "#fff7ed", borderRadius: 8, fontSize: 12, color: "#92400e", border: "1px solid #fed7aa" }}>
              ⚠️ Recurso disponível para Lucro Presumido e Real. Empresas no Simples Nacional utilizam o PGDAS-D.
            </div>
          </Card>

          <Card style={{ gridColumn: "1 / -1" }}>
            <SectionTitle>Relatório de Apuração do Período</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
              {[
                { label: "NF-e Emitidas", value: "3", color: "#2563eb" },
                { label: "NFC-e Emitidas", value: "1", color: "#7c3aed" },
                { label: "NFS-e Emitidas", value: "1", color: "#16a34a" },
                { label: "Total Autorizado", value: fmt(totalMes), color: "#16a34a" },
                { label: "Canceladas", value: "1", color: "#6b7280" },
              ].map((stat, i) => (
                <div key={i} style={{ background: "var(--surface-overlay)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--foreground-muted)", margin: "0 0 6px" }}>{stat.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: stat.color, margin: 0 }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: DETALHE DA NOTA */}
      {/* ================================================================ */}
      {notaSelecionada && (
        <div
          onClick={() => setNotaSelecionada(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "var(--surface-elevated)", borderRadius: 16, border: "1px solid var(--border)", padding: 28, width: "100%", maxWidth: 580, maxHeight: "80vh", overflow: "auto" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                {notaSelecionada.tipo} #{notaSelecionada.numeroNota}
              </h2>
              <button onClick={() => setNotaSelecionada(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Badge status={notaSelecionada.status} />

              {[
                { label: "Destinatário", value: notaSelecionada.clienteNome },
                { label: "Valor Total", value: fmt(notaSelecionada.valorTotal) },
                { label: "Data de Emissão", value: fmtDate(notaSelecionada.dataEmissao) },
                { label: "Protocolo SEFAZ", value: notaSelecionada.protocolo || "—" },
                { label: "Chave de Acesso", value: notaSelecionada.chaveAcesso || "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--foreground-muted)", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "var(--foreground)", textAlign: "right", wordBreak: "break-all", fontFamily: label === "Chave de Acesso" ? "monospace" : undefined }}>{value}</span>
                </div>
              ))}

              {notaSelecionada.motivoRejeicao && (
                <div style={{ padding: 12, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 12, color: "#991b1b" }}>
                  <strong>Motivo da Rejeição:</strong><br />
                  {notaSelecionada.motivoRejeicao}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {notaSelecionada.status === "AUTORIZADA" && (
                <>
                  <button
                    onClick={() => toast.info("Baixando XML...")}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}
                  >
                    <Download size={15} /> Baixar XML
                  </button>
                  <button
                    onClick={() => toast.info("Gerando DANFE PDF...")}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}
                  >
                    <FileText size={15} /> DANFE PDF
                  </button>
                  <button
                    onClick={() => handleCancelarNota(notaSelecionada)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#dc2626", marginLeft: "auto" }}
                  >
                    <X size={15} /> Cancelar Nota
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}