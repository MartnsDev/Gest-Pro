"use client";

import { useState, useMemo, useCallback } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  FileText,
  Download,
  Store,
  Calendar,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  AlertCircle,
  BarChart3,
  ChevronDown,
  Loader2,
  FileDown,
  Image,
  Table2,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface VendasDia {
  dia: string;
  qtdVendas: number;
  total: number;
  desconto: number;
}
interface Pagamento {
  forma: string;
  qtd: number;
  total: number;
  percentual: number;
}
interface ProdutoRel {
  nome: string;
  quantidade: number;
  receita: number;
  lucro: number;
}
interface VendasHora {
  hora: number;
  qtd: number;
  total: number;
}
interface VendaItem {
  id: number;
  data: string;
  formaPagamento: string;
  formaPagamento2?: string;
  valorFinal: number;
  desconto: number;
  troco?: number;
  observacao?: string;
  nomeCliente?: string;
  itens: string[];
}

interface Relatorio {
  titulo: string;
  periodo: string;
  nomeEmpresa: string;
  geradoEm: string;
  totalVendas: number;
  receitaTotal: number;
  lucroTotal: number;
  totalDescontos: number;
  ticketMedio: number;
  maiorVenda: number;
  menorVenda: number;
  cancelamentos: number;
  valorCancelado: number;
  vendasDiarias: VendasDia[];
  pagamentos: Pagamento[];
  topProdutos: ProdutoRel[];
  vendasPorHora: VendasHora[];
  vendas: VendaItem[];
}

interface CaixaInfo {
  id: number;
  status: string;
  aberto: boolean;
  dataAbertura: string;
  dataFechamento?: string;
  totalVendas: number;
}

type Periodo = "hoje" | "semana" | "mes" | "personalizado" | "caixa";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?: number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v ?? 0,
  );
const fmtN = (v: number) => new Intl.NumberFormat("pt-BR").format(v);
const fmtDateSafe = (value?: string | null) => {
  if (!value) return "Sem data";

  const raw = String(value).trim();
  if (!raw) return "Sem data";

  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) {
    return direct.toLocaleDateString("pt-BR");
  }

  // Tenta formato "yyyy-MM-dd HH:mm:ss" (sem "T")
  const normalized = raw.includes(" ") ? raw.replace(" ", "T") : raw;
  const normalizedDate = new Date(normalized);
  if (!Number.isNaN(normalizedDate.getTime())) {
    return normalizedDate.toLocaleDateString("pt-BR");
  }

  // Tenta formatos comuns:
  // "dd/MM/yyyy", "dd-MM-yyyy", "dd/MM/yyyy HH:mm[:ss]", "dd/MM/yyyy, HH:mm[:ss]"
  const m = raw.match(
    /^(\d{2})[\/-](\d{2})[\/-](\d{4})(?:,?\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (m) {
    const [, dd, mm, yyyy, hh = "0", mi = "0", ss = "0"] = m;
    const dt = new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(mi),
      Number(ss),
    );
    if (!Number.isNaN(dt.getTime())) {
      return dt.toLocaleDateString("pt-BR");
    }
  }

  return "Sem data";
};
const CORES = [
  "#10b981",
  "#3b82f6",
  "#a78bfa",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const token =
    (typeof window !== "undefined"
      ? localStorage.getItem("jwt_token")
      : null) ?? "";
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "https://gestpro-backend-production.up.railway.app"}${path}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...opts,
    },
  );
  if (!res.ok) {
    const e = await res.json().catch(() => null);
    throw new Error(e?.mensagem ?? `Erro ${res.status}`);
  }
  return res.json();
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "8px 11px",
  background: "var(--surface-overlay)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 13,
  outline: "none",
};
const btnP: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  background: "var(--primary)",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const btnG: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 12px",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground-muted)",
  fontSize: 12,
  cursor: "pointer",
};

const ttStyle = {
  background: "var(--surface-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 12,
};

/* ─── Stat Card ──────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--foreground-muted)",
            textTransform: "uppercase",
            letterSpacing: ".07em",
            margin: 0,
          }}
        >
          {label}
        </p>
        <span style={{ color: color ?? "var(--primary)", opacity: 0.8 }}>
          {icon}
        </span>
      </div>
      <p
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: color ?? "var(--foreground)",
          margin: 0,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{ fontSize: 11, color: "var(--foreground-muted)", margin: 0 }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Exportadores ───────────────────────────────────────────────────────── */
function exportCSV(rel: Relatorio) {
  const linhas = [
    [
      "#",
      "Data",
      "Pagamento",
      "2ª Forma",
      "Itens",
      "Desconto",
      "Troco",
      "Total",
      "Cliente",
      "Observação",
    ],
    ...rel.vendas.map((v) => [
      String(v.id),
      v.data,
      v.formaPagamento,
      v.formaPagamento2 ?? "",
      v.itens.join(" | "),
      fmt(v.desconto),
      fmt(v.troco ?? 0),
      fmt(v.valorFinal),
      v.nomeCliente ?? "",
      v.observacao ?? "",
    ]),
  ];
  const csv = linhas
    .map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `relatorio_${rel.nomeEmpresa}_${Date.now()}.csv`;
  a.click();
  toast.success("CSV exportado!");
}

function exportHTML(rel: Relatorio) {
  const pagBarras = rel.pagamentos
    .map(
      (p) =>
        `<div class="bar-row"><span>${p.forma}</span><div class="bar-wrap"><div class="bar" style="width:${p.percentual.toFixed(1)}%"></div></div><span>${fmt(p.total)} (${p.percentual.toFixed(1)}%)</span></div>`,
    )
    .join("");

  const prodRows = rel.topProdutos
    .slice(0, 10)
    .map(
      (p, i) =>
        `<tr><td>${i + 1}</td><td>${p.nome}</td><td>${fmtN(p.quantidade)}</td><td>${fmt(p.receita)}</td><td>${fmt(p.lucro)}</td></tr>`,
    )
    .join("");

  const vendaRows = rel.vendas
    .map(
      (v) =>
        `<tr><td>#${v.id}</td><td>${v.data}</td><td>${v.formaPagamento}${v.formaPagamento2 ? " + " + v.formaPagamento2 : ""}</td><td>${v.itens.join("<br>")}</td><td>${fmt(v.desconto)}</td><td>${fmt(v.valorFinal)}</td><td>${v.nomeCliente ?? "—"}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${rel.titulo}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#f4f4f5;padding:32px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #27272a}
  .logo{font-size:28px;font-weight:900;color:#10b981}.sub{color:#71717a;font-size:14px;margin-top:4px}
  .periodo{text-align:right;color:#71717a;font-size:13px;line-height:1.8}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
  .card{background:#18181b;border:1px solid #27272a;border-radius:12px;padding:20px}
  .card-label{font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px}
  .card-value{font-size:26px;font-weight:800;color:#10b981}
  .card-sub{font-size:12px;color:#71717a;margin-top:4px}
  h2{font-size:16px;font-weight:700;color:#f4f4f5;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #27272a}
  .section{margin-bottom:32px}
  .bar-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;font-size:13px}
  .bar-row span:first-child{width:80px;color:#a1a1aa}
  .bar-wrap{flex:1;background:#27272a;border-radius:4px;height:20px}
  .bar{background:#10b981;border-radius:4px;height:20px;transition:width .3s}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:10px 12px;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:.06em;background:#111113;border-bottom:1px solid #27272a}
  td{padding:10px 12px;border-bottom:1px solid #1c1c1f;color:#d4d4d8}
  tr:hover td{background:#18181b}
  .tag{display:inline-block;padding:2px 8px;border-radius:99px;background:rgba(16,185,129,.12);color:#10b981;font-size:11px;font-weight:600}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #27272a;font-size:12px;color:#52525b;text-align:center}
</style></head><body>
<div class="header">
  <div><div class="logo">GestPro</div><div class="sub">${rel.nomeEmpresa}</div></div>
  <div class="periodo">
    <strong style="color:#f4f4f5;font-size:18px">${rel.titulo}</strong><br>
    Período: ${rel.periodo}<br>
    Gerado em: ${rel.geradoEm}
  </div>
</div>

<div class="grid">
  <div class="card"><div class="card-label">Receita Total</div><div class="card-value">${fmt(rel.receitaTotal)}</div><div class="card-sub">${rel.totalVendas} vendas</div></div>
  <div class="card"><div class="card-label">Lucro Total</div><div class="card-value" style="color:#3b82f6">${fmt(rel.lucroTotal)}</div></div>
  <div class="card"><div class="card-label">Ticket Médio</div><div class="card-value" style="color:#a78bfa">${fmt(rel.ticketMedio)}</div></div>
  <div class="card"><div class="card-label">Descontos</div><div class="card-value" style="color:#f59e0b">${fmt(rel.totalDescontos)}</div></div>
  <div class="card"><div class="card-label">Maior Venda</div><div class="card-value" style="color:#10b981">${fmt(rel.maiorVenda)}</div></div>
  <div class="card"><div class="card-label">Menor Venda</div><div class="card-value" style="color:#d4d4d8">${fmt(rel.menorVenda)}</div></div>
  <div class="card"><div class="card-label">Cancelamentos</div><div class="card-value" style="color:#ef4444">${rel.cancelamentos}</div><div class="card-sub">${fmt(rel.valorCancelado)}</div></div>
  <div class="card"><div class="card-label">Maior Venda</div><div class="card-value">${fmt(rel.maiorVenda)}</div></div>
</div>

<div class="section"><h2>Formas de Pagamento</h2>${pagBarras}</div>

<div class="section"><h2>Top Produtos</h2>
<table><thead><tr><th>#</th><th>Produto</th><th>Qtd</th><th>Receita</th><th>Lucro</th></tr></thead>
<tbody>${prodRows}</tbody></table></div>

<div class="section"><h2>Vendas (${rel.vendas.length})</h2>
<table><thead><tr><th>#</th><th>Data</th><th>Pagamento</th><th>Itens</th><th>Desconto</th><th>Total</th><th>Cliente</th></tr></thead>
<tbody>${vendaRows}</tbody></table></div>

<div class="footer">Relatório gerado automaticamente pelo GestPro • ${rel.geradoEm}</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `relatorio_${rel.nomeEmpresa}_${Date.now()}.html`;
  a.click();
  toast.success("HTML exportado!");
}

function exportPDF(rel: Relatorio) {
  const janela = window.open("", "_blank", "width=900,height=700");
  if (!janela) {
    toast.error("Permita pop-ups para exportar PDF.");
    return;
  }

  // Gera o mesmo HTML mas com @media print e auto-print
  const pagBarras = rel.pagamentos
    .map(
      (p) =>
        `<div class="bar-row"><span>${p.forma}</span><div class="bar-wrap"><div class="bar" style="width:${p.percentual.toFixed(1)}%"></div></div><span>${fmt(p.total)} (${p.percentual.toFixed(1)}%)</span></div>`,
    )
    .join("");

  const prodRows = rel.topProdutos
    .slice(0, 15)
    .map(
      (p, i) =>
        `<tr><td>${i + 1}</td><td>${p.nome}</td><td>${fmtN(p.quantidade)}</td><td>${fmt(p.receita)}</td><td>${fmt(p.lucro)}</td></tr>`,
    )
    .join("");

  const vendaRows = rel.vendas
    .map(
      (v) =>
        `<tr><td>#${v.id}</td><td>${v.data}</td><td>${v.formaPagamento}${v.formaPagamento2 ? " + " + v.formaPagamento2 : ""}</td><td>${v.itens.slice(0, 3).join(", ")}${v.itens.length > 3 ? "..." : ""}</td><td>${fmt(v.desconto)}</td><td>${fmt(v.valorFinal)}</td><td>${v.nomeCliente ?? "—"}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>${rel.titulo} — GestPro</title>
<style>
  @page { size: A4; margin: 15mm 12mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    tr { page-break-inside: avoid; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1a1a2e; font-size: 12px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #10b981; }
  .logo { font-size: 22px; font-weight: 900; color: #10b981; }
  .sub { color: #6b7280; font-size: 12px; margin-top: 2px; }
  .periodo { text-align: right; color: #6b7280; font-size: 11px; line-height: 1.7; }
  .titulo { font-size: 16px; font-weight: 700; color: #1a1a2e; }
  .grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; }
  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
  .card-label { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
  .card-value { font-size: 18px; font-weight: 800; color: #10b981; }
  .card-sub { font-size: 10px; color: #94a3b8; margin-top: 2px; }
  .section { margin-bottom: 18px; }
  h2 { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: .05em; }
  .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 11px; }
  .bar-row span:first-child { width: 70px; color: #475569; font-weight: 600; }
  .bar-wrap { flex: 1; background: #e2e8f0; border-radius: 3px; height: 14px; }
  .bar { background: #10b981; border-radius: 3px; height: 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
  th { text-align: left; padding: 6px 8px; font-size: 9px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .05em; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; }
  td { padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 11px; }
  .green { color: #059669; font-weight: 700; }
  .blue  { color: #2563eb; font-weight: 700; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
  .print-btn { position: fixed; top: 12px; right: 12px; padding: 8px 18px; background: #10b981; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; z-index: 999; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
</style></head><body>

<button class="print-btn no-print" onclick="window.print()">🖨️ Salvar como PDF</button>

<div class="header">
  <div><div class="logo">GestPro</div><div class="sub">${rel.nomeEmpresa}</div></div>
  <div class="periodo">
    <div class="titulo">${rel.titulo}</div>
    Período: ${rel.periodo}<br>
    Gerado em: ${rel.geradoEm}
  </div>
</div>

<div class="grid">
  <div class="card"><div class="card-label">Receita Total</div><div class="card-value">${fmt(rel.receitaTotal)}</div><div class="card-sub">${rel.totalVendas} vendas</div></div>
  <div class="card"><div class="card-label">Lucro Estimado</div><div class="card-value" style="color:#2563eb">${fmt(rel.lucroTotal)}</div></div>
  <div class="card"><div class="card-label">Ticket Médio</div><div class="card-value" style="color:#7c3aed">${fmt(rel.ticketMedio)}</div></div>
  <div class="card"><div class="card-label">Descontos</div><div class="card-value" style="color:#d97706">${fmt(rel.totalDescontos)}</div></div>
  <div class="card"><div class="card-label">Maior Venda</div><div class="card-value">${fmt(rel.maiorVenda)}</div></div>
  <div class="card"><div class="card-label">Menor Venda</div><div class="card-value" style="color:#64748b">${fmt(rel.menorVenda)}</div></div>
  <div class="card"><div class="card-label">Cancelamentos</div><div class="card-value" style="color:#dc2626">${rel.cancelamentos}</div><div class="card-sub">${fmt(rel.valorCancelado)}</div></div>
  <div class="card"><div class="card-label">Nº de Vendas</div><div class="card-value" style="color:#1a1a2e">${rel.totalVendas}</div></div>
</div>

<div class="section"><h2>Formas de Pagamento</h2>${pagBarras}</div>

<div class="section"><h2>Top Produtos</h2>
<table><thead><tr><th>#</th><th>Produto</th><th>Qtd</th><th>Receita</th><th>Lucro Est.</th></tr></thead>
<tbody>${prodRows}</tbody></table></div>

<div class="section"><h2>Vendas (${rel.vendas.length})</h2>
<table><thead><tr><th>#</th><th>Data</th><th>Pagamento</th><th>Itens</th><th>Desconto</th><th>Total</th><th>Cliente</th></tr></thead>
<tbody>${vendaRows}</tbody></table></div>

<div class="footer">GestPro • ${rel.nomeEmpresa} • Relatório gerado em ${rel.geradoEm}</div>
</body></html>`;

  janela.document.write(html);
  janela.document.close();
  // Aguarda carregar e dispara print automaticamente
  janela.onload = () => {
    setTimeout(() => {
      janela.focus();
      janela.print();
    }, 400);
  };
  toast.success("Janela de impressão aberta — selecione 'Salvar como PDF'.");
}

/* ─── Nota Fiscal Simplificada (Cupom Não Fiscal) ───────────────────────── */
function exportNotaFiscal(rel: Relatorio) {
  // Gera uma nota para cada venda do relatório
  // Se houver muitas vendas, gera a primeira como exemplo e avisa
  const vendas = rel.vendas.slice(0, 50); // máx 50 por vez

  const cupons = vendas
    .map((v) => {
      const itensHtml = v.itens
        .map((item) => {
          // item vem como "Produto x2 = R$ 20,00"
          const partes = item.split(" = ");
          const desc = partes[0] ?? item;
          const valor = partes[1] ?? "";
          return `<tr>
        <td style="padding:2px 0;font-size:11px;color:#1a1a2e">${desc}</td>
        <td style="padding:2px 0;font-size:11px;color:#1a1a2e;text-align:right;font-weight:600">${valor}</td>
      </tr>`;
        })
        .join("");

      const pagamento = v.formaPagamento2
        ? `${v.formaPagamento} + ${v.formaPagamento2}`
        : v.formaPagamento;

      return `
    <div class="cupom">
      <!-- Cabeçalho -->
      <div class="header">
        <div class="empresa">${rel.nomeEmpresa}</div>
        <div class="titulo-doc">CUPOM NÃO FISCAL</div>
        <div class="linha-ponto"></div>
        <div class="info-row"><span>Nº da Venda:</span><span>#${v.id}</span></div>
        <div class="info-row"><span>Data/Hora:</span><span>${v.data}</span></div>
        ${v.nomeCliente ? `<div class="info-row"><span>Cliente:</span><span>${v.nomeCliente}</span></div>` : ""}
        <div class="linha-ponto"></div>
      </div>

      <!-- Itens -->
      <table style="width:100%;border-collapse:collapse;margin:4px 0">
        <thead>
          <tr>
            <th style="font-size:9px;color:#64748b;text-align:left;padding:2px 0;text-transform:uppercase">Item</th>
            <th style="font-size:9px;color:#64748b;text-align:right;padding:2px 0;text-transform:uppercase">Valor</th>
          </tr>
        </thead>
        <tbody>${itensHtml}</tbody>
      </table>

      <div class="linha-ponto"></div>

      <!-- Totais -->
      <div class="totais">
        <div class="info-row"><span>Subtotal:</span><span>${fmt(v.valorFinal + v.desconto)}</span></div>
        ${v.desconto > 0 ? `<div class="info-row desc"><span>Desconto:</span><span>- ${fmt(v.desconto)}</span></div>` : ""}
        <div class="info-row total"><span>TOTAL:</span><span>${fmt(v.valorFinal)}</span></div>
        <div class="info-row pag"><span>Pagamento:</span><span>${pagamento}</span></div>
        ${v.troco && v.troco > 0 ? `<div class="info-row"><span>Troco:</span><span>${fmt(v.troco)}</span></div>` : ""}
      </div>

      <div class="linha-ponto"></div>

      <!-- Rodapé -->
      <div class="rodape">
        <div>Obrigado pela preferência!</div>
        <div style="margin-top:4px;font-size:9px;color:#94a3b8">
          Este documento não tem valor fiscal.<br>
          Emitido via GestPro • ${rel.geradoEm}
        </div>
      </div>

      <!-- Separador entre cupons na impressão -->
      <div class="page-break"></div>
    </div>`;
    })
    .join("");

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Notas Fiscais — ${rel.nomeEmpresa}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    .page-break { page-break-after: always; }
    .page-break:last-child { page-break-after: avoid; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', Courier, monospace; background: #f0f0f0; display: flex; flex-direction: column; align-items: center; padding: 16px; gap: 16px; }
  .cupom { background: #fff; width: 80mm; padding: 10px 8px; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
  .header { text-align: center; margin-bottom: 6px; }
  .empresa { font-size: 15px; font-weight: 900; color: #1a1a2e; letter-spacing: .04em; }
  .titulo-doc { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: .1em; margin: 2px 0 6px; }
  .linha-ponto { border-top: 1px dashed #cbd5e1; margin: 6px 0; }
  .info-row { display: flex; justify-content: space-between; font-size: 11px; color: #334155; padding: 1px 0; }
  .totais { margin: 4px 0; }
  .totais .desc span { color: #dc2626; }
  .totais .total { font-size: 14px; font-weight: 900; color: #1a1a2e; margin: 4px 0; }
  .totais .pag span { color: #059669; font-weight: 700; }
  .rodape { text-align: center; margin-top: 6px; font-size: 10px; color: #475569; }
  .print-btn { position: fixed; bottom: 20px; right: 20px; padding: 10px 22px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; z-index: 999; box-shadow: 0 2px 12px rgba(0,0,0,.2); }
  .aviso { width: 80mm; background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 8px 10px; font-size: 10px; color: #854d0e; text-align: center; }
</style></head><body>

<button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

${
  vendas.length < rel.vendas.length
    ? `<div class="aviso no-print">⚠ Exibindo ${vendas.length} de ${rel.vendas.length} vendas. Para exportar todas, filtre por um período menor.</div>`
    : ""
}

${cupons}
</body></html>`;

  const janela = window.open("", "_blank", "width=700,height=800");
  if (!janela) {
    toast.error("Permita pop-ups para gerar nota fiscal.");
    return;
  }
  janela.document.write(html);
  janela.document.close();
  janela.onload = () =>
    setTimeout(() => {
      janela.focus();
      janela.print();
    }, 400);
  toast.success(`${vendas.length} cupom(ns) gerado(s)!`);
}
export default function Relatorios() {
  const { empresaAtiva } = useEmpresa();

  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [dataInicio, setDataInicio] = useState(() =>
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
  );
  const [dataFim, setDataFim] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [caixaId, setCaixaId] = useState<number | null>(null);
  const [caixas, setCaixas] = useState<CaixaInfo[]>([]);
  const [caixasOk, setCaixasOk] = useState(false);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(false);
  const [abaVendas, setAbaVendas] = useState(false);

  // Carrega caixas ao entrar em modo caixa
  const carregarCaixas = async () => {
    if (!empresaAtiva || caixasOk) return;
    try {
      const data = await fetchAuth<CaixaInfo[]>(
        `/api/v1/caixas/empresa/${empresaAtiva.id}`,
      );
      setCaixas(data);
      if (data.length > 0) setCaixaId(data[0].id);
      setCaixasOk(true);
    } catch {}
  };

  const gerar = async () => {
    if (!empresaAtiva) return;
    setLoading(true);
    setRelatorio(null);
    try {
      let url = "";
      if (periodo === "hoje")
        url = `/api/v1/relatorios/hoje?empresaId=${empresaAtiva.id}`;
      else if (periodo === "semana")
        url = `/api/v1/relatorios/semana?empresaId=${empresaAtiva.id}`;
      else if (periodo === "mes")
        url = `/api/v1/relatorios/mes?empresaId=${empresaAtiva.id}`;
      else if (periodo === "caixa" && caixaId)
        url = `/api/v1/relatorios/caixa/${caixaId}`;
      else if (periodo === "personalizado") {
        const ini = new Date(dataInicio + "T00:00:00").toISOString();
        const fim = new Date(dataFim + "T23:59:59").toISOString();
        url = `/api/v1/relatorios/periodo?empresaId=${empresaAtiva.id}&inicio=${ini}&fim=${fim}`;
      }
      if (!url) {
        toast.error("Selecione um período ou caixa.");
        return;
      }
      setRelatorio(await fetchAuth<Relatorio>(url));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!empresaAtiva)
    return (
      <div
        style={{
          padding: 48,
          textAlign: "center",
          color: "var(--foreground-muted)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Store size={40} color="var(--foreground-subtle)" />
        <p style={{ fontSize: 14 }}>
          Selecione uma empresa para ver os relatórios.
        </p>
      </div>
    );

  return (
    <div
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Relatórios
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground-muted)",
              marginTop: 3,
            }}
          >
            {empresaAtiva.nomeFantasia}
          </p>
        </div>
        {relatorio && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => exportCSV(relatorio)} style={btnG}>
              <Table2 size={13} />
              CSV
            </button>
            <button onClick={() => exportHTML(relatorio)} style={btnG}>
              <FileDown size={13} />
              HTML
            </button>
            <button onClick={() => exportPDF(relatorio)} style={btnG}>
              <FileText size={13} />
              PDF
            </button>
            <button
              onClick={() => exportNotaFiscal(relatorio)}
              style={{
                ...btnG,
                borderColor: "rgba(16,185,129,0.4)",
                color: "var(--primary)",
              }}
            >
              <Receipt size={13} />
              Nota Fiscal
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--foreground-muted)",
            textTransform: "uppercase",
            letterSpacing: ".07em",
            marginBottom: 14,
          }}
        >
          Selecionar Período
        </p>

        {/* Abas de período */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {(
            [
              ["hoje", "Hoje"],
              ["semana", "Esta Semana"],
              ["mes", "Este Mês"],
              ["personalizado", "Personalizado"],
              ["caixa", "Por Caixa"],
            ] as [Periodo, string][]
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setPeriodo(v);
                if (v === "caixa") carregarCaixas();
              }}
              style={{
                padding: "7px 14px",
                borderRadius: 8,
                border: `1px solid ${periodo === v ? "var(--primary)" : "var(--border)"}`,
                background:
                  periodo === v ? "var(--primary-muted)" : "transparent",
                color:
                  periodo === v ? "var(--primary)" : "var(--foreground-muted)",
                fontSize: 13,
                fontWeight: periodo === v ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Período personalizado */}
        {periodo === "personalizado" && (
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <div style={{ flex: 1, minWidth: 160 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                De
              </label>
              <input
                type="date"
                style={inp}
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label
                style={{
                  fontSize: 11,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Até
              </label>
              <input
                type="date"
                style={inp}
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Seletor de caixa */}
        {periodo === "caixa" && (
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                fontSize: 11,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Selecionar Caixa
            </label>
            <select
              style={{ ...inp, cursor: "pointer" }}
              value={caixaId ?? ""}
              onChange={(e) => setCaixaId(Number(e.target.value))}
            >
              {caixas.map((c) => (
                <option key={c.id} value={c.id}>
                  Caixa #{c.id} — {c.aberto ? "ABERTO" : "Fechado"} —{" "}
                  {fmtDateSafe(c.dataAbertura)}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={gerar}
          disabled={loading}
          style={{
            ...btnP,
            minWidth: 160,
            justifyContent: "center",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Gerando...
            </>
          ) : (
            <>
              <BarChart3 size={14} />
              Gerar Relatório
            </>
          )}
        </button>
      </div>

      {/* Relatório */}
      {relatorio && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
          id="relatorio-content"
        >
          {/* Cabeçalho do relatório */}
          <div
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "18px 22px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--foreground)",
                  margin: 0,
                }}
              >
                {relatorio.titulo}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--foreground-muted)",
                  margin: "4px 0 0",
                }}
              >
                {relatorio.periodo}
              </p>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: 12,
                color: "var(--foreground-muted)",
              }}
            >
              <p style={{ margin: 0 }}>{relatorio.nomeEmpresa}</p>
              <p style={{ margin: 0 }}>Gerado em {relatorio.geradoEm}</p>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
              gap: 12,
            }}
          >
            <StatCard
              label="Receita Total"
              value={fmt(relatorio.receitaTotal)}
              sub={`${relatorio.totalVendas} vendas`}
              icon={<DollarSign size={16} />}
            />
            <StatCard
              label="Lucro Total"
              value={fmt(relatorio.lucroTotal)}
              icon={<TrendingUp size={16} />}
              color="#3b82f6"
            />
            <StatCard
              label="Ticket Médio"
              value={fmt(relatorio.ticketMedio)}
              icon={<BarChart3 size={16} />}
              color="#a78bfa"
            />
            <StatCard
              label="Descontos"
              value={fmt(relatorio.totalDescontos)}
              icon={<TrendingDown size={16} />}
              color="#f59e0b"
            />
            <StatCard
              label="Maior Venda"
              value={fmt(relatorio.maiorVenda)}
              icon={<TrendingUp size={16} />}
            />
            <StatCard
              label="Menor Venda"
              value={fmt(relatorio.menorVenda)}
              icon={<ShoppingBag size={16} />}
              color="var(--foreground-muted)"
            />
            {relatorio.cancelamentos > 0 && (
              <StatCard
                label="Cancelamentos"
                value={String(relatorio.cancelamentos)}
                sub={fmt(relatorio.valorCancelado)}
                icon={<AlertCircle size={16} />}
                color="#ef4444"
              />
            )}
          </div>

          {/* Gráficos — linha 1 */}
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
          >
            {/* Vendas diárias */}
            {relatorio.vendasDiarias.length > 0 && (
              <div
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginBottom: 16,
                  }}
                >
                  Vendas por Dia
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={relatorio.vendasDiarias}
                    margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="dia"
                      tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={ttStyle}
                      formatter={(v: number) => [fmt(v), "Total"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#grad1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Formas de pagamento */}
            {relatorio.pagamentos.length > 0 && (
              <div
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginBottom: 16,
                  }}
                >
                  Pagamentos
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={relatorio.pagamentos}
                      dataKey="total"
                      nameKey="forma"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {relatorio.pagamentos.map((_, i) => (
                        <Cell key={i} fill={CORES[i % CORES.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={ttStyle}
                      formatter={(v: number) => [fmt(v)]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    marginTop: 8,
                  }}
                >
                  {relatorio.pagamentos.map((p, i) => (
                    <div
                      key={p.forma}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: CORES[i % CORES.length],
                          }}
                        />
                        <span style={{ color: "var(--foreground-muted)" }}>
                          {p.forma}
                        </span>
                      </div>
                      <span
                        style={{ fontWeight: 600, color: "var(--foreground)" }}
                      >
                        {p.percentual.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gráficos — linha 2 */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {/* Top produtos */}
            {relatorio.topProdutos.length > 0 && (
              <div
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginBottom: 16,
                  }}
                >
                  Top Produtos
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={relatorio.topProdutos.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="nome"
                      tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={ttStyle}
                      formatter={(v: number) => [fmtN(v), "unidades"]}
                    />
                    <Bar
                      dataKey="quantidade"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Vendas por hora */}
            {relatorio.vendasPorHora.length > 0 && (
              <div
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    marginBottom: 16,
                  }}
                >
                  <Clock size={12} style={{ marginRight: 5 }} />
                  Pico de Vendas por Hora
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={relatorio.vendasPorHora}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                    />
                    <XAxis
                      dataKey="hora"
                      tickFormatter={(h) => `${h}h`}
                      tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--foreground-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={ttStyle}
                      labelFormatter={(h) => `${h}:00`}
                      formatter={(v: number) => [v, "vendas"]}
                    />
                    <Bar dataKey="qtd" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tabela de produtos detalhada */}
          {relatorio.topProdutos.length > 0 && (
            <div
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    margin: 0,
                  }}
                >
                  <Package size={12} style={{ marginRight: 5 }} />
                  Desempenho de Produtos
                </p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {[
                        "#",
                        "Produto",
                        "Qtd Vendida",
                        "Receita",
                        "Lucro Estimado",
                        "Margem",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "9px 14px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--foreground-muted)",
                            textTransform: "uppercase",
                            letterSpacing: ".06em",
                            textAlign: "left",
                            background: "var(--surface)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.topProdutos.map((p, i) => {
                      const margem =
                        p.receita > 0 ? (p.lucro / p.receita) * 100 : 0;
                      return (
                        <tr
                          key={i}
                          style={{
                            borderTop: "1px solid var(--border-subtle)",
                          }}
                          onMouseEnter={(e) =>
                            ((
                              e.currentTarget as HTMLTableRowElement
                            ).style.background = "var(--surface-overlay)")
                          }
                          onMouseLeave={(e) =>
                            ((
                              e.currentTarget as HTMLTableRowElement
                            ).style.background = "transparent")
                          }
                        >
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              color: "var(--foreground-muted)",
                            }}
                          >
                            {i + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 14,
                              fontWeight: 500,
                              color: "var(--foreground)",
                            }}
                          >
                            {p.nome}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              color: "var(--foreground)",
                            }}
                          >
                            {fmtN(p.quantidade)}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "var(--primary)",
                            }}
                          >
                            {fmt(p.receita)}
                          </td>
                          <td
                            style={{
                              padding: "10px 14px",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#3b82f6",
                            }}
                          >
                            {fmt(p.lucro)}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color:
                                  margem >= 30
                                    ? "var(--primary)"
                                    : margem >= 10
                                      ? "#f59e0b"
                                      : "#ef4444",
                              }}
                            >
                              {margem.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Vendas individuais */}
          {relatorio.vendas.length > 0 && (
            <div
              style={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".07em",
                    margin: 0,
                  }}
                >
                  Vendas ({relatorio.vendas.length})
                </p>
                <button onClick={() => setAbaVendas((v) => !v)} style={btnG}>
                  <ChevronDown
                    size={13}
                    style={{
                      transform: abaVendas ? "rotate(180deg)" : "none",
                      transition: "transform .2s",
                    }}
                  />
                  {abaVendas ? "Recolher" : "Ver todas"}
                </button>
              </div>
              {abaVendas && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {[
                          "#",
                          "Data",
                          "Pagamento",
                          "Itens",
                          "Desconto",
                          "Total",
                          "Cliente",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "9px 14px",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--foreground-muted)",
                              textTransform: "uppercase",
                              letterSpacing: ".06em",
                              textAlign: "left",
                              background: "var(--surface)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.vendas.map((v) => (
                        <tr
                          key={v.id}
                          style={{
                            borderTop: "1px solid var(--border-subtle)",
                          }}
                          onMouseEnter={(e) =>
                            ((
                              e.currentTarget as HTMLTableRowElement
                            ).style.background = "var(--surface-overlay)")
                          }
                          onMouseLeave={(e) =>
                            ((
                              e.currentTarget as HTMLTableRowElement
                            ).style.background = "transparent")
                          }
                        >
                          <td
                            style={{
                              padding: "9px 14px",
                              fontSize: 13,
                              color: "var(--foreground-muted)",
                            }}
                          >
                            #{v.id}
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              fontSize: 12,
                              color: "var(--foreground-muted)",
                            }}
                          >
                            {v.data}
                          </td>
                          <td style={{ padding: "9px 14px" }}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: "2px 7px",
                                background: "var(--primary-muted)",
                                color: "var(--primary)",
                                borderRadius: 99,
                                fontWeight: 500,
                              }}
                            >
                              {v.formaPagamento}
                              {v.formaPagamento2
                                ? ` + ${v.formaPagamento2}`
                                : ""}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              fontSize: 12,
                              color: "var(--foreground-muted)",
                              maxWidth: 220,
                            }}
                          >
                            {v.itens.slice(0, 2).join(" · ")}
                            {v.itens.length > 2
                              ? ` +${v.itens.length - 2}`
                              : ""}
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              fontSize: 12,
                              color:
                                v.desconto > 0
                                  ? "#f59e0b"
                                  : "var(--foreground-subtle)",
                            }}
                          >
                            {v.desconto > 0 ? `− ${fmt(v.desconto)}` : "—"}
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "var(--primary)",
                            }}
                          >
                            {fmt(v.valorFinal)}
                          </td>
                          <td
                            style={{
                              padding: "9px 14px",
                              fontSize: 12,
                              color: "var(--foreground-muted)",
                            }}
                          >
                            {v.nomeCliente ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {!relatorio && !loading && (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            color: "var(--foreground-subtle)",
          }}
        >
          <FileText size={52} />
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            Selecione um período e gere o relatório
          </p>
          <p style={{ fontSize: 13 }}>
            Vendas, lucro, produtos, formas de pagamento, pico de horário e
            mais.
          </p>
        </div>
      )}
    </div>
  );
}
