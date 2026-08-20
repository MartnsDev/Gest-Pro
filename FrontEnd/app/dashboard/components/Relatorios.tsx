"use client";

import { useState } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  FileText, Store, TrendingUp, TrendingDown, ShoppingBag,
  DollarSign, Package, Clock, AlertCircle, BarChart3, ChevronDown,
  Loader2, FileDown, Table2, Receipt, ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAuthJson } from "@/lib/api-v2";
import { useActionCooldown } from "@/hooks/use-action-cooldown";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface VendasDia   { dia:string; qtdVendas:number; total:number; desconto:number }
interface Pagamento   { forma:string; qtd:number; total:number; percentual:number }
interface ProdutoRel  { nome:string; quantidade:number; receita:number; lucro:number }
interface VendasHora  { hora:number; qtd:number; total:number }
interface VendaItem {
  id:number; data:string; formaPagamento:string; formaPagamento2?:string;
  valorFinal:number; desconto:number; troco?:number; observacao?:string;
  nomeCliente?:string; itens:string[]; origem?:string; status?:string; // "PDV" | "PEDIDO"
}
interface Relatorio {
  titulo:string; periodo:string; nomeEmpresa:string; geradoEm:string;
  totalVendas:number; receitaTotal:number; lucroTotal:number;
  totalDescontos:number; ticketMedio:number; maiorVenda:number; menorVenda:number;
  cancelamentos:number; valorCancelado:number;
  receitaPdv?:number; receitaPedidos?:number;   // ← origem separada
  vendasDiarias:VendasDia[]; pagamentos:Pagamento[];
  topProdutos:ProdutoRel[]; vendasPorHora:VendasHora[];
  vendas:VendaItem[];
  somentePedidos?:boolean;
  somentePdv?:boolean;
  lucroDisponivel?:boolean;
}
interface PedidoRelatorio {
  id:number; nomeCliente?:string; valorTotal:number; desconto:number; valorFinal:number;
  custoFrete:number; formaPagamento?:string; canalVenda?:string; status?:string;
  dataPedido:string|number[]; observacao?:string;
  itens?:{nomeProduto?:string;quantidade?:number;precoUnitario?:number;subtotal?:number}[];
}
interface CaixaInfo { id:number; status:string; aberto:boolean; dataAbertura:string; dataFechamento?:string }
interface VendaPdvRelatorio {
  id:number; formaPagamento?:string; formaPagamento2?:string; valorTotal:number; desconto:number;
  valorFinal:number; troco?:number; observacao?:string; dataVenda:string|number[];
  itens?:{nomeProduto?:string;quantidade?:number;subtotal?:number}[];
  nomeCliente?:string; cancelada?:boolean;
}
type Periodo = "hoje"|"semana"|"mes"|"personalizado"|"caixa";
type Origem = "todos"|"pdv"|"pedidos";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?:number|null) =>
  new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v??0);
const fmtN = (v:number) => new Intl.NumberFormat("pt-BR").format(v);

const esc = (s:unknown) =>
  String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;")
               .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");

async function fetchAuth<T>(path:string, opts?:RequestInit):Promise<T> {
  return fetchAuthJson<T>(path,opts);
}

const inicioDoDia=(data:Date)=>new Date(data.getFullYear(),data.getMonth(),data.getDate(),0,0,0,0);
const fimDoDia=(data:Date)=>new Date(data.getFullYear(),data.getMonth(),data.getDate(),23,59,59,999);
const dataValida=(valor:string|number[]|undefined|null)=>{
  if(!valor)return null;
  const data=Array.isArray(valor)
    ?new Date(valor[0],(valor[1]??1)-1,valor[2]??1,valor[3]??0,valor[4]??0,valor[5]??0,Math.floor((valor[6]??0)/1_000_000))
    :new Date(valor.replace(" ","T"));
  return Number.isNaN(data.getTime())?null:data;
};

function limitesPeriodo(periodo:Periodo,dataInicio:string,dataFim:string):{inicio:Date;fim:Date;label:string}|null{
  const agora=new Date();
  if(periodo==="hoje")return{inicio:inicioDoDia(agora),fim:fimDoDia(agora),label:"Hoje"};
  if(periodo==="semana"){
    const inicio=inicioDoDia(agora);const dia=(inicio.getDay()+6)%7;inicio.setDate(inicio.getDate()-dia);
    const fim=fimDoDia(new Date(inicio));fim.setDate(fim.getDate()+6);
    return{inicio,fim,label:"Esta semana"};
  }
  if(periodo==="mes")return{inicio:new Date(agora.getFullYear(),agora.getMonth(),1),fim:fimDoDia(new Date(agora.getFullYear(),agora.getMonth()+1,0)),label:"Este mês"};
  if(periodo==="personalizado"){
    if(!dataInicio||!dataFim)return null;
    const inicio=dataValida(`${dataInicio}T00:00:00`);const fim=dataValida(`${dataFim}T23:59:59.999`);
    if(!inicio||!fim||inicio>fim)return null;
    return{inicio,fim,label:`${inicio.toLocaleDateString("pt-BR")} → ${fim.toLocaleDateString("pt-BR")}`};
  }
  return null;
}

function montarRelatorioPedidos(pedidos:PedidoRelatorio[],nomeEmpresa:string,limites:{inicio:Date;fim:Date;label:string}):Relatorio{
  const noPeriodo=pedidos.filter(p=>{const data=dataValida(p.dataPedido);return Boolean(data&&data>=limites.inicio&&data<=limites.fim);});
  const ativos=noPeriodo.filter(p=>p.status!=="CANCELADO");
  const cancelados=noPeriodo.filter(p=>p.status==="CANCELADO");
  const receitaTotal=ativos.reduce((s,p)=>s+Number(p.valorFinal||0),0);
  const totalDescontos=ativos.reduce((s,p)=>s+Number(p.desconto||0),0);
  const valores=ativos.map(p=>Number(p.valorFinal||0));
  const pagamentosMap=new Map<string,{qtd:number;total:number}>();
  const produtosMap=new Map<string,{quantidade:number;receita:number}>();
  const diasMap=new Map<string,{dia:string;qtdVendas:number;total:number;desconto:number}>();
  const horasMap=new Map<number,{qtd:number;total:number}>();

  ativos.forEach(p=>{
    const forma=p.formaPagamento||"NÃO INFORMADO";
    const pagamento=pagamentosMap.get(forma)??{qtd:0,total:0};pagamento.qtd++;pagamento.total+=Number(p.valorFinal||0);pagamentosMap.set(forma,pagamento);
    const data=dataValida(p.dataPedido);
    if(data){
      const chave=`${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,"0")}-${String(data.getDate()).padStart(2,"0")}`;
      const d=diasMap.get(chave)??{dia:data.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),qtdVendas:0,total:0,desconto:0};d.qtdVendas++;d.total+=Number(p.valorFinal||0);d.desconto+=Number(p.desconto||0);diasMap.set(chave,d);
      const hora=data.getHours();const h=horasMap.get(hora)??{qtd:0,total:0};h.qtd++;h.total+=Number(p.valorFinal||0);horasMap.set(hora,h);
    }
    (p.itens??[]).forEach(item=>{const nome=item.nomeProduto||"Produto removido";const atual=produtosMap.get(nome)??{quantidade:0,receita:0};atual.quantidade+=Number(item.quantidade||0);atual.receita+=Number(item.subtotal||0);produtosMap.set(nome,atual);});
  });

  return{
    titulo:"Relatório de Pedidos",periodo:limites.label,nomeEmpresa,
    geradoEm:new Date().toLocaleString("pt-BR"),totalVendas:ativos.length,receitaTotal,
    lucroTotal:0,lucroDisponivel:false,totalDescontos,ticketMedio:ativos.length?receitaTotal/ativos.length:0,
    maiorVenda:valores.length?Math.max(...valores):0,menorVenda:valores.length?Math.min(...valores):0,
    cancelamentos:cancelados.length,valorCancelado:cancelados.reduce((s,p)=>s+Number(p.valorFinal||0),0),
    receitaPdv:0,receitaPedidos:receitaTotal,somentePedidos:true,
    vendasDiarias:[...diasMap].sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v),
    pagamentos:[...pagamentosMap].map(([forma,v])=>({forma,...v,percentual:receitaTotal?v.total/receitaTotal*100:0})).sort((a,b)=>b.total-a.total),
    topProdutos:[...produtosMap].map(([nome,v])=>({nome,...v,lucro:0})).sort((a,b)=>b.quantidade-a.quantidade),
    vendasPorHora:[...horasMap].map(([hora,v])=>({hora,...v})).sort((a,b)=>a.hora-b.hora),
    vendas:noPeriodo.map(p=>({id:p.id,data:dataValida(p.dataPedido)?.toLocaleString("pt-BR")??"Data inválida",formaPagamento:p.formaPagamento||"Não informado",formaPagamento2:p.canalVenda,valorFinal:Number(p.valorFinal||0),desconto:Number(p.desconto||0),observacao:p.observacao,nomeCliente:p.nomeCliente,origem:"PEDIDO",status:p.status,itens:(p.itens??[]).map(i=>`${i.nomeProduto||"Produto removido"} x${Number(i.quantidade||0)} = ${fmt(Number(i.subtotal||0))}`)})),
  };
}

function montarRelatorioPdv(vendas:VendaPdvRelatorio[],nomeEmpresa:string,limites:{inicio:Date;fim:Date;label:string}):Relatorio{
  const noPeriodo=vendas.filter(v=>{const data=dataValida(v.dataVenda);return Boolean(data&&data>=limites.inicio&&data<=limites.fim);});
  const ativas=noPeriodo.filter(v=>!v.cancelada);const canceladas=noPeriodo.filter(v=>v.cancelada);
  const receitaTotal=ativas.reduce((s,v)=>s+Number(v.valorFinal||0),0);const valores=ativas.map(v=>Number(v.valorFinal||0));
  const pagamentosMap=new Map<string,{qtd:number;total:number}>();const produtosMap=new Map<string,{quantidade:number;receita:number}>();
  const diasMap=new Map<string,{dia:string;qtdVendas:number;total:number;desconto:number}>();const horasMap=new Map<number,{qtd:number;total:number}>();
  ativas.forEach(v=>{
    const forma=v.formaPagamento2?`${v.formaPagamento||"NÃO INFORMADO"} + ${v.formaPagamento2}`:(v.formaPagamento||"NÃO INFORMADO");
    const pagamento=pagamentosMap.get(forma)??{qtd:0,total:0};pagamento.qtd++;pagamento.total+=Number(v.valorFinal||0);pagamentosMap.set(forma,pagamento);
    const data=dataValida(v.dataVenda);if(data){const chave=`${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,"0")}-${String(data.getDate()).padStart(2,"0")}`;const d=diasMap.get(chave)??{dia:data.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),qtdVendas:0,total:0,desconto:0};d.qtdVendas++;d.total+=Number(v.valorFinal||0);d.desconto+=Number(v.desconto||0);diasMap.set(chave,d);const h=horasMap.get(data.getHours())??{qtd:0,total:0};h.qtd++;h.total+=Number(v.valorFinal||0);horasMap.set(data.getHours(),h);}
    (v.itens??[]).forEach(item=>{const nome=item.nomeProduto||"Produto removido";const atual=produtosMap.get(nome)??{quantidade:0,receita:0};atual.quantidade+=Number(item.quantidade||0);atual.receita+=Number(item.subtotal||0);produtosMap.set(nome,atual);});
  });
  return{titulo:"Relatório de Vendas PDV",periodo:limites.label,nomeEmpresa,geradoEm:new Date().toLocaleString("pt-BR"),totalVendas:ativas.length,receitaTotal,lucroTotal:0,lucroDisponivel:false,somentePdv:true,totalDescontos:ativas.reduce((s,v)=>s+Number(v.desconto||0),0),ticketMedio:ativas.length?receitaTotal/ativas.length:0,maiorVenda:valores.length?Math.max(...valores):0,menorVenda:valores.length?Math.min(...valores):0,cancelamentos:canceladas.length,valorCancelado:canceladas.reduce((s,v)=>s+Number(v.valorFinal||0),0),receitaPdv:receitaTotal,receitaPedidos:0,
    vendasDiarias:[...diasMap].sort(([a],[b])=>a.localeCompare(b)).map(([,v])=>v),pagamentos:[...pagamentosMap].map(([forma,v])=>({forma,...v,percentual:receitaTotal?v.total/receitaTotal*100:0})).sort((a,b)=>b.total-a.total),topProdutos:[...produtosMap].map(([nome,v])=>({nome,...v,lucro:0})).sort((a,b)=>b.quantidade-a.quantidade),vendasPorHora:[...horasMap].map(([hora,v])=>({hora,...v})).sort((a,b)=>a.hora-b.hora),vendas:noPeriodo.map(v=>({id:v.id,data:dataValida(v.dataVenda)?.toLocaleString("pt-BR")??"Data inválida",formaPagamento:v.formaPagamento||"Não informado",formaPagamento2:v.formaPagamento2,valorFinal:Number(v.valorFinal||0),desconto:Number(v.desconto||0),troco:Number(v.troco||0),observacao:v.observacao,nomeCliente:v.nomeCliente,origem:"PDV",status:v.cancelada?"CANCELADA":"CONCLUÍDA",itens:(v.itens??[]).map(i=>`${i.nomeProduto||"Produto removido"} x${Number(i.quantidade||0)} = ${fmt(Number(i.subtotal||0))}`)}))};
}

const CORES = ["#10b981","#3b82f6","#a78bfa","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16"];
const ttStyle = {background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:8,color:"var(--foreground)",fontSize:12};

const inp:React.CSSProperties = {width:"100%",padding:"8px 11px",background:"var(--surface-overlay)",border:"1px solid var(--border)",borderRadius:8,color:"var(--foreground)",fontSize:13,outline:"none"};
const btnP:React.CSSProperties = {display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"var(--primary)",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"};
const btnG:React.CSSProperties = {display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:"transparent",border:"1px solid var(--border)",borderRadius:8,color:"var(--foreground-muted)",fontSize:12,cursor:"pointer"};

/* ─── StatCard ───────────────────────────────────────────────────────────── */
function StatCard({label,value,sub,icon,color}:{label:string;value:string;sub?:string;icon:React.ReactNode;color?:string}) {
  return (
    <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{fontSize:11,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",margin:0}}>{label}</p>
        <span style={{color:color??"var(--primary)",opacity:0.8}}>{icon}</span>
      </div>
      <p style={{fontSize:22,fontWeight:800,color:color??"var(--foreground)",margin:0}}>{value}</p>
      {sub&&<p style={{fontSize:11,color:"var(--foreground-muted)",margin:0}}>{sub}</p>}
    </div>
  );
}

/* ─── Badge de origem ────────────────────────────────────────────────────── */
function OrigemBadge({origem}:{origem?:string}) {
  if(!origem) return null;
  const isPdv = origem==="PDV";
  return (
    <span style={{
      fontSize:10,padding:"1px 6px",borderRadius:99,fontWeight:600,
      background: isPdv?"rgba(16,185,129,0.1)":"rgba(59,130,246,0.1)",
      color: isPdv?"#10b981":"#3b82f6",
      border:`1px solid ${isPdv?"rgba(16,185,129,0.3)":"rgba(59,130,246,0.3)"}`,
      whiteSpace:"nowrap",
    }}>
      {isPdv?"PDV":"Pedido"}
    </span>
  );
}

/* ─── Exportadores ───────────────────────────────────────────────────────── */
function nomeArquivo(rel:Relatorio,extensao:string){
  const empresa=rel.nomeEmpresa.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-|-$/g,"").toLowerCase()||"empresa";
  return `${rel.somentePedidos?"pedidos":rel.somentePdv?"pdv":"relatorio"}_${empresa}_${new Date().toISOString().slice(0,10)}.${extensao}`;
}

function baixarBlob(blob:Blob,nome:string){
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=nome;a.style.display="none";
  document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function celulaCSV(valor:unknown){
  let texto=String(valor??"");
  if(/^[=+\-@]/.test(texto.trimStart()))texto=`'${texto}`;
  return `"${texto.replace(/"/g,'""')}"`;
}

function exportCSV(rel:Relatorio) {
  const linhas=[
    ["#","Origem","Status","Data","Pagamento","Canal/2ª forma","Itens","Desconto (R$)","Troco (R$)","Total (R$)","Cliente","Observação"],
    ...rel.vendas.map(v=>[
      String(v.id), v.origem??"PDV",v.status??"", v.data, v.formaPagamento,
      v.formaPagamento2??"", v.itens.join(" | "),
      Number(v.desconto??0).toFixed(2).replace(".",","),Number(v.troco??0).toFixed(2).replace(".",","),Number(v.valorFinal??0).toFixed(2).replace(".",","),
      v.nomeCliente??"", v.observacao??"",
    ]),
  ];
  const csv=linhas.map(l=>l.map(celulaCSV).join(";")).join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  baixarBlob(blob,nomeArquivo(rel,"csv"));
  toast.success("CSV exportado!");
}

function exportHTML(rel:Relatorio) {
  const mostraLucro=rel.lucroDisponivel!==false;
  const pagBarras = rel.pagamentos.map(p=>
    `<div class="bar-row"><span>${esc(p.forma)}</span><div class="bar-wrap"><div class="bar" style="width:${p.percentual.toFixed(1)}%"></div></div><span>${esc(fmt(p.total))} (${p.percentual.toFixed(1)}%)</span></div>`
  ).join("");
  const prodRows = rel.topProdutos.slice(0,10).map((p,i)=>
    `<tr><td>${i+1}</td><td>${esc(p.nome)}</td><td>${esc(fmtN(p.quantidade))}</td><td>${esc(fmt(p.receita))}</td>${mostraLucro?`<td>${esc(fmt(p.lucro))}</td>`:""}</tr>`
  ).join("");
  const vendaRows = rel.vendas.map(v=>
    `<tr><td>#${v.id}</td><td><span class="badge ${v.origem==="PEDIDO"?"badge-blue":"badge-green"}">${v.origem??"PDV"}</span></td><td>${esc(v.data)}</td><td>${esc(v.formaPagamento)}${v.formaPagamento2?" + "+esc(v.formaPagamento2):""}</td><td>${v.itens.map(it=>esc(it)).join("<br>")}</td><td>${esc(fmt(v.desconto))}</td><td>${esc(fmt(v.valorFinal))}</td><td>${esc(v.nomeCliente??"—")}</td></tr>`
  ).join("");

  const pdvPct  = rel.receitaTotal>0?((rel.receitaPdv??0)/rel.receitaTotal*100).toFixed(1):0;
  const pedPct  = rel.receitaTotal>0?((rel.receitaPedidos??0)/rel.receitaTotal*100).toFixed(1):0;

  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${esc(rel.titulo)}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:#0a0a0f;color:#f4f4f5;padding:32px}
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
.origem-row{display:flex;gap:16px;margin-bottom:16px}
.origem-card{flex:1;background:#18181b;border:1px solid #27272a;border-radius:8px;padding:14px;text-align:center}
.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:10px;font-size:13px}
.bar-row span:first-child{width:80px;color:#a1a1aa}
.bar-wrap{flex:1;background:#27272a;border-radius:4px;height:20px}
.bar{background:#10b981;border-radius:4px;height:20px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;padding:10px 12px;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:.06em;background:#111113;border-bottom:1px solid #27272a}
td{padding:10px 12px;border-bottom:1px solid #1c1c1f;color:#d4d4d8}
tr:hover td{background:#18181b}
.badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600}
.badge-green{background:rgba(16,185,129,.12);color:#10b981}
.badge-blue{background:rgba(59,130,246,.12);color:#3b82f6}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #27272a;font-size:12px;color:#52525b;text-align:center}
</style></head><body>
<div class="header">
  <div><div class="logo">Gevyro</div><div class="sub">${esc(rel.nomeEmpresa)}</div></div>
  <div class="periodo"><strong style="color:#f4f4f5;font-size:18px">${esc(rel.titulo)}</strong><br>Período: ${esc(rel.periodo)}<br>Gerado em: ${esc(rel.geradoEm)}</div>
</div>
<div class="grid">
  <div class="card"><div class="card-label">Receita Total</div><div class="card-value">${fmt(rel.receitaTotal)}</div><div class="card-sub">${rel.totalVendas} transações</div></div>
  ${mostraLucro?`<div class="card"><div class="card-label">Lucro Total</div><div class="card-value" style="color:#3b82f6">${fmt(rel.lucroTotal)}</div><div class="card-sub">PDV + Pedidos</div></div>`:""}
  <div class="card"><div class="card-label">Ticket Médio</div><div class="card-value" style="color:#a78bfa">${fmt(rel.ticketMedio)}</div></div>
  <div class="card"><div class="card-label">Descontos</div><div class="card-value" style="color:#f59e0b">${fmt(rel.totalDescontos)}</div></div>
  <div class="card"><div class="card-label">Maior Transação</div><div class="card-value">${fmt(rel.maiorVenda)}</div></div>
  <div class="card"><div class="card-label">Menor Transação</div><div class="card-value" style="color:#d4d4d8">${fmt(rel.menorVenda)}</div></div>
  <div class="card"><div class="card-label">Cancelamentos</div><div class="card-value" style="color:#ef4444">${rel.cancelamentos}</div><div class="card-sub">${fmt(rel.valorCancelado)}</div></div>
  <div class="card"><div class="card-label">Nº de Transações</div><div class="card-value">${rel.totalVendas}</div></div>
</div>
${!rel.somentePedidos&&!rel.somentePdv&&rel.receitaPdv!=null?`<div class="section"><h2>Origem das Vendas</h2><div class="origem-row">
  <div class="origem-card"><div class="card-label" style="color:#10b981">PDV (Caixa)</div><div class="card-value">${fmt(rel.receitaPdv)}</div><div class="card-sub">${pdvPct}% do total</div></div>
  <div class="origem-card"><div class="card-label" style="color:#3b82f6">Pedidos (Online)</div><div class="card-value" style="color:#3b82f6">${fmt(rel.receitaPedidos)}</div><div class="card-sub">${pedPct}% do total</div></div>
</div></div>`:""}
<div class="section"><h2>Formas de Pagamento</h2>${pagBarras}</div>
<div class="section"><h2>Top Produtos</h2><table><thead><tr><th>#</th><th>Produto</th><th>Qtd</th><th>Receita</th>${mostraLucro?"<th>Lucro</th>":""}</tr></thead><tbody>${prodRows}</tbody></table></div>
<div class="section"><h2>Transações (${rel.vendas.length})</h2><table><thead><tr><th>#</th><th>Origem</th><th>Data</th><th>Pagamento</th><th>Itens</th><th>Desconto</th><th>Total</th><th>Cliente</th></tr></thead><tbody>${vendaRows}</tbody></table></div>
<div class="footer">Relatório gerado automaticamente pelo Gevyro • ${esc(rel.geradoEm)}</div>
</body></html>`;

  const blob=new Blob([html],{type:"text/html;charset=utf-8"});
  baixarBlob(blob,nomeArquivo(rel,"html"));
  toast.success("HTML exportado!");
}

function exportPDF(rel:Relatorio) {
  const janela=window.open("","_blank","width=900,height=700");
  if(!janela){toast.error("Permita pop-ups para exportar PDF.");return;}

  const mostraLucro=rel.lucroDisponivel!==false;
  const pagBarras=rel.pagamentos.map(p=>
    `<div class="bar-row"><span>${esc(p.forma)}</span><div class="bar-wrap"><div class="bar" style="width:${p.percentual.toFixed(1)}%"></div></div><span>${esc(fmt(p.total))} (${p.percentual.toFixed(1)}%)</span></div>`
  ).join("");
  const prodRows=rel.topProdutos.slice(0,15).map((p,i)=>
    `<tr><td>${i+1}</td><td>${esc(p.nome)}</td><td>${esc(fmtN(p.quantidade))}</td><td>${esc(fmt(p.receita))}</td>${mostraLucro?`<td>${esc(fmt(p.lucro))}</td>`:""}</tr>`
  ).join("");
  const vendaRows=rel.vendas.map(v=>
    `<tr><td>#${v.id}</td><td><span class="badge ${v.origem==="PEDIDO"?"badge-b":"badge-g"}">${v.origem??"PDV"}</span></td><td>${esc(v.data)}</td><td>${esc(v.formaPagamento)}${v.formaPagamento2?" + "+esc(v.formaPagamento2):""}</td><td>${esc(v.itens.slice(0,3).join(", "))}${v.itens.length>3?"...":""}</td><td>${esc(fmt(v.desconto))}</td><td>${esc(fmt(v.valorFinal))}</td><td>${esc(v.nomeCliente??"—")}</td></tr>`
  ).join("");

  const pdvPct  = rel.receitaTotal>0?((rel.receitaPdv??0)/rel.receitaTotal*100).toFixed(1):"0";
  const pedPct  = rel.receitaTotal>0?((rel.receitaPedidos??0)/rel.receitaTotal*100).toFixed(1):"0";

  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${esc(rel.titulo)}</title>
<style>
@page{size:A4;margin:15mm 12mm}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}tr{page-break-inside:avoid}}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a2e;font-size:12px}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #10b981}
.logo{font-size:22px;font-weight:900;color:#10b981}.sub{color:#6b7280;font-size:12px;margin-top:2px}
.periodo{text-align:right;color:#6b7280;font-size:11px;line-height:1.7}.titulo{font-size:16px;font-weight:700;color:#1a1a2e}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px}
.card-label{font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
.card-value{font-size:18px;font-weight:800;color:#10b981}.card-sub{font-size:10px;color:#94a3b8;margin-top:2px}
.section{margin-bottom:18px}
h2{font-size:12px;font-weight:700;color:#1e293b;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:.05em}
.origem-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.origem-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center}
.bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:11px}
.bar-row span:first-child{width:70px;color:#475569;font-weight:600}
.bar-wrap{flex:1;background:#e2e8f0;border-radius:3px;height:14px}.bar{background:#10b981;border-radius:3px;height:14px}
table{width:100%;border-collapse:collapse;margin-bottom:6px}
th{text-align:left;padding:6px 8px;font-size:9px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.05em;background:#f1f5f9;border-bottom:1px solid #e2e8f0}
td{padding:6px 8px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:11px}
.badge{display:inline-block;padding:1px 6px;border-radius:99px;font-size:9px;font-weight:700}
.badge-g{background:rgba(16,185,129,.1);color:#059669}.badge-b{background:rgba(59,130,246,.1);color:#2563eb}
.footer{margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;text-align:center}
.print-btn{position:fixed;top:12px;right:12px;padding:8px 18px;background:#10b981;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;z-index:999;box-shadow:0 2px 8px rgba(0,0,0,.15)}
</style></head><body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Salvar como PDF</button>
<div class="header">
  <div><div class="logo">Gevyro</div><div class="sub">${esc(rel.nomeEmpresa)}</div></div>
  <div class="periodo"><div class="titulo">${esc(rel.titulo)}</div>Período: ${esc(rel.periodo)}<br>Gerado em: ${esc(rel.geradoEm)}</div>
</div>
<div class="grid">
  <div class="card"><div class="card-label">Receita Total</div><div class="card-value">${fmt(rel.receitaTotal)}</div><div class="card-sub">${rel.totalVendas} transações</div></div>
  ${mostraLucro?`<div class="card"><div class="card-label">Lucro (PDV+Pedidos)</div><div class="card-value" style="color:#2563eb">${fmt(rel.lucroTotal)}</div></div>`:""}
  <div class="card"><div class="card-label">Ticket Médio</div><div class="card-value" style="color:#7c3aed">${fmt(rel.ticketMedio)}</div></div>
  <div class="card"><div class="card-label">Descontos</div><div class="card-value" style="color:#d97706">${fmt(rel.totalDescontos)}</div></div>
  ${!rel.somentePedidos?`<div class="card"><div class="card-label">PDV (Caixa)</div><div class="card-value">${fmt(rel.receitaPdv??0)}</div><div class="card-sub">${pdvPct}% do total</div></div>`:""}
  ${!rel.somentePdv?`<div class="card"><div class="card-label">Pedidos</div><div class="card-value" style="color:#2563eb">${fmt(rel.receitaPedidos??0)}</div><div class="card-sub">${pedPct}% do total</div></div>`:""}
  <div class="card"><div class="card-label">Cancelamentos</div><div class="card-value" style="color:#dc2626">${rel.cancelamentos}</div><div class="card-sub">${fmt(rel.valorCancelado)}</div></div>
  <div class="card"><div class="card-label">Nº de Transações</div><div class="card-value" style="color:#1a1a2e">${rel.totalVendas}</div></div>
</div>
<div class="section"><h2>Formas de Pagamento</h2>${pagBarras}</div>
<div class="section"><h2>Top Produtos (${rel.somentePedidos?"Pedidos":rel.somentePdv?"PDV":"PDV + Pedidos"})</h2>
<table><thead><tr><th>#</th><th>Produto</th><th>Qtd</th><th>Receita</th>${mostraLucro?"<th>Lucro Est.</th>":""}</tr></thead><tbody>${prodRows}</tbody></table></div>
<div class="section"><h2>Transações (${rel.vendas.length})</h2>
<table><thead><tr><th>#</th><th>Origem</th><th>Data</th><th>Pagamento</th><th>Itens</th><th>Desc.</th><th>Total</th><th>Cliente</th></tr></thead><tbody>${vendaRows}</tbody></table></div>
<div class="footer">Gevyro • ${esc(rel.nomeEmpresa)} • ${esc(rel.geradoEm)}</div>
</body></html>`;

  janela.document.write(html);janela.document.close();
  janela.onload=()=>setTimeout(()=>{janela.focus();janela.print();},400);
  toast.success("Janela de impressão aberta.");
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function Relatorios() {
  const {empresaAtiva}=useEmpresa();
  const [origem,setOrigem]=useState<Origem>("todos");
  const [periodo,setPeriodo]=useState<Periodo>("mes");
  const [dataInicio,setDataInicio]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10));
  const [dataFim,setDataFim]=useState(()=>new Date().toISOString().slice(0,10));
  const [caixaId,setCaixaId]=useState<number|null>(null);
  const [caixas,setCaixas]=useState<CaixaInfo[]>([]);
  const [caixasOk,setCaixasOk]=useState(false);
  const [relatorio,setRelatorio]=useState<Relatorio|null>(null);
  const [loading,setLoading]=useState(false);
  const [abaVendas,setAbaVendas]=useState(false);
  const relatorioCooldown=useActionCooldown(`relatorio:${empresaAtiva?.id??"sem-empresa"}`,10);

  const carregarCaixas=async()=>{
    if(!empresaAtiva||caixasOk) return;
    try{
      const data=await fetchAuth<CaixaInfo[]>(`/api/v1/caixas/empresa/${empresaAtiva.id}`);
      setCaixas(data);if(data.length>0)setCaixaId(data[0].id);setCaixasOk(true);
    }catch{}
  };

  const gerar=async()=>{
    if(!empresaAtiva||loading) return;
    if(periodo==="personalizado"&&!limitesPeriodo(periodo,dataInicio,dataFim)){toast.error("Informe um período válido.");return;}
    if(periodo==="caixa"&&!caixaId){toast.error("Selecione um caixa.");return;}
    if(!relatorioCooldown.tryStart()){toast.info(`Aguarde ${relatorioCooldown.remaining}s para gerar outro relatório.`);return;}
    setLoading(true);setRelatorio(null);
    try{
      if(origem==="pedidos"){
        const limites=limitesPeriodo(periodo,dataInicio,dataFim);
        if(!limites){toast.error(periodo==="caixa"?"O filtro por caixa existe apenas para vendas do PDV.":"Informe um período válido.");return;}
        const pedidos=await fetchAuth<PedidoRelatorio[]>(`/api/v1/pedidos/empresa/${empresaAtiva.id}`);
        setRelatorio(montarRelatorioPedidos(pedidos,empresaAtiva.nomeFantasia,limites));
        setAbaVendas(false);
        return;
      }
      if(origem==="pdv"){
        if(periodo==="caixa"){
          if(!caixaId){toast.error("Selecione um caixa.");return;}
          const porCaixa=await fetchAuth<Relatorio>(`/api/v1/relatorios/caixa/${caixaId}`);
          setRelatorio({...porCaixa,somentePdv:true,receitaPedidos:0});setAbaVendas(false);return;
        }
        const limites=limitesPeriodo(periodo,dataInicio,dataFim);
        if(!limites){toast.error("Informe um período válido.");return;}
        const listaCaixas=await fetchAuth<CaixaInfo[]>(`/api/v1/caixas/empresa/${empresaAtiva.id}`);
        const lotes=await Promise.all(listaCaixas.map(c=>fetchAuth<VendaPdvRelatorio[]>(`/api/v1/vendas/caixa/${c.id}`)));
        setRelatorio(montarRelatorioPdv(lotes.flat(),empresaAtiva.nomeFantasia,limites));setAbaVendas(false);return;
      }
      let url="";
      if(periodo==="hoje")       url=`/api/v1/relatorios/hoje?empresaId=${empresaAtiva.id}`;
      else if(periodo==="semana")url=`/api/v1/relatorios/semana?empresaId=${empresaAtiva.id}`;
      else if(periodo==="mes")   url=`/api/v1/relatorios/mes?empresaId=${empresaAtiva.id}`;
      else if(periodo==="caixa"&&caixaId) url=`/api/v1/relatorios/caixa/${caixaId}`;
      else if(periodo==="personalizado"){
        const limites=limitesPeriodo(periodo,dataInicio,dataFim);
        if(!limites){toast.error("Informe um período válido.");return;}
        url=`/api/v1/relatorios/periodo?empresaId=${empresaAtiva.id}&inicio=${encodeURIComponent(limites.inicio.toISOString())}&fim=${encodeURIComponent(limites.fim.toISOString())}`;
      }
      if(!url){toast.error("Selecione um período.");return;}
      setRelatorio(await fetchAuth<Relatorio>(url));
      setAbaVendas(false);
    }catch(e){toast.error(e instanceof Error?e.message:"Erro ao gerar relatório.");}
    finally{setLoading(false);}
  };

  if(!empresaAtiva) return(
    <div style={{padding:48,textAlign:"center",color:"var(--foreground-muted)",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <Store size={40} color="var(--foreground-subtle)"/>
      <p style={{fontSize:14}}>Selecione uma empresa para ver os relatórios.</p>
    </div>
  );

  const pdvPct     = relatorio&&relatorio.receitaTotal>0?((relatorio.receitaPdv??0)/relatorio.receitaTotal*100).toFixed(1):"0";
  const pedidosPct = relatorio&&relatorio.receitaTotal>0?((relatorio.receitaPedidos??0)/relatorio.receitaTotal*100).toFixed(1):"0";

  return(
    <div style={{padding:28,display:"flex",flexDirection:"column",gap:24}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:"var(--foreground)",margin:0}}>Relatórios</h2>
          <p style={{fontSize:13,color:"var(--foreground-muted)",marginTop:3}}>{empresaAtiva.nomeFantasia} · {origem==="pedidos"?"Somente pedidos":origem==="pdv"?"Somente PDV":"PDV + Pedidos"}</p>
        </div>
        {relatorio&&(
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={()=>exportCSV(relatorio)} style={btnG}><Table2 size={13}/>CSV</button>
            <button onClick={()=>exportHTML(relatorio)} style={btnG}><FileDown size={13}/>HTML</button>
            <button onClick={()=>exportPDF(relatorio)} style={btnG} title="Abre a impressão do navegador para salvar em PDF"><FileText size={13}/>Imprimir / PDF</button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,padding:20}}>
        <p style={{fontSize:11,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>Origem dos dados</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
          {([ ["todos","PDV + Pedidos"],["pdv","Somente PDV"],["pedidos","Somente pedidos"] ] as [Origem,string][]).map(([valor,label])=>(
            <button key={valor} onClick={()=>{setOrigem(valor);setRelatorio(null);if(valor==="pedidos"&&periodo==="caixa")setPeriodo("mes");}} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${origem===valor?"var(--primary)":"var(--border)"}`,background:origem===valor?"var(--primary-muted)":"transparent",color:origem===valor?"var(--primary)":"var(--foreground-muted)",fontSize:13,fontWeight:origem===valor?600:400,cursor:"pointer"}}>{label}</button>
          ))}
        </div>
        <p style={{fontSize:11,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Selecionar Período</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {([ ["hoje","Hoje"],["semana","Esta Semana"],["mes","Este Mês"],["personalizado","Personalizado"],...(origem!=="pedidos"?[["caixa","Por Caixa"]]:[]) ] as [Periodo,string][]).map(([v,l])=>(
            <button key={v} onClick={()=>{setPeriodo(v);if(v==="caixa")carregarCaixas();}} style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${periodo===v?"var(--primary)":"var(--border)"}`,background:periodo===v?"var(--primary-muted)":"transparent",color:periodo===v?"var(--primary)":"var(--foreground-muted)",fontSize:13,fontWeight:periodo===v?600:400,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        {periodo==="personalizado"&&(
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
            <div style={{flex:1,minWidth:160}}>
              <label style={{fontSize:11,color:"var(--foreground-muted)",display:"block",marginBottom:4}}>De</label>
              <input type="date" style={inp} value={dataInicio} onChange={e=>setDataInicio(e.target.value)}/>
            </div>
            <div style={{flex:1,minWidth:160}}>
              <label style={{fontSize:11,color:"var(--foreground-muted)",display:"block",marginBottom:4}}>Até</label>
              <input type="date" style={inp} value={dataFim} onChange={e=>setDataFim(e.target.value)}/>
            </div>
          </div>
        )}
        {periodo==="caixa"&&(
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:"var(--foreground-muted)",display:"block",marginBottom:4}}>Selecionar Caixa</label>
            <select style={{...inp,cursor:"pointer"}} value={caixaId??""} onChange={e=>setCaixaId(Number(e.target.value))}>
              {caixas.map(c=><option key={c.id} value={c.id}>Caixa #{c.id} — {c.aberto?"ABERTO":"Fechado"}</option>)}
            </select>
          </div>
        )}
        <button onClick={gerar} disabled={loading||relatorioCooldown.blocked} style={{...btnP,minWidth:160,justifyContent:"center",opacity:loading||relatorioCooldown.blocked?0.7:1,cursor:loading||relatorioCooldown.blocked?"not-allowed":"pointer"}}>
          {loading?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Gerando...</>:relatorioCooldown.blocked?<><Clock size={14}/>Aguarde {relatorioCooldown.remaining}s</>:<><BarChart3 size={14}/>Gerar Relatório</>}
        </button>
      </div>

      {relatorio&&(
        <div style={{display:"flex",flexDirection:"column",gap:24}}>

          {/* Cabeçalho do relatório */}
          <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div>
              <h3 style={{fontSize:18,fontWeight:700,color:"var(--foreground)",margin:0}}>{relatorio.titulo}</h3>
              <p style={{fontSize:13,color:"var(--foreground-muted)",margin:"4px 0 0"}}>{relatorio.periodo}</p>
            </div>
            <div style={{textAlign:"right",fontSize:12,color:"var(--foreground-muted)"}}>
              <p style={{margin:0}}>{relatorio.nomeEmpresa}</p>
              <p style={{margin:0}}>Gerado em {relatorio.geradoEm}</p>
            </div>
          </div>

          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:12}}>
            <StatCard label="Receita Total"   value={fmt(relatorio.receitaTotal)} sub={`${relatorio.totalVendas} transações`} icon={<DollarSign size={16}/>}/>
            {relatorio.lucroDisponivel!==false&&<StatCard label="Lucro Total" value={fmt(relatorio.lucroTotal)} icon={<TrendingUp size={16}/>} color="#3b82f6" sub="PDV + Pedidos"/>}
            <StatCard label="Ticket Médio"    value={fmt(relatorio.ticketMedio)}  icon={<BarChart3 size={16}/>}     color="#a78bfa"/>
            <StatCard label="Descontos"       value={fmt(relatorio.totalDescontos)} icon={<TrendingDown size={16}/>} color="#f59e0b"/>
            <StatCard label="Maior Transação" value={fmt(relatorio.maiorVenda)}   icon={<TrendingUp size={16}/>}/>
            <StatCard label="Menor Transação" value={fmt(relatorio.menorVenda)}   icon={<ShoppingBag size={16}/>}   color="var(--foreground-muted)"/>
            {relatorio.cancelamentos>0&&<StatCard label="Cancelamentos" value={String(relatorio.cancelamentos)} sub={fmt(relatorio.valorCancelado)} icon={<AlertCircle size={16}/>} color="#ef4444"/>}
          </div>

          {/* Origem PDV vs Pedidos */}
          {!relatorio.somentePedidos&&!relatorio.somentePdv&&(relatorio.receitaPdv!=null||relatorio.receitaPedidos!=null)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{background:"var(--surface-elevated)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:12,padding:"16px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <Receipt size={15} color="#10b981"/>
                  <p style={{fontSize:11,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",margin:0}}>PDV — Caixa Físico</p>
                </div>
                <p style={{fontSize:24,fontWeight:800,color:"var(--primary)",margin:"0 0 4px"}}>{fmt(relatorio.receitaPdv??0)}</p>
                <p style={{fontSize:12,color:"var(--foreground-muted)",margin:0}}>{pdvPct}% do faturamento total</p>
              </div>
              <div style={{background:"var(--surface-elevated)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:12,padding:"16px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <ShoppingCart size={15} color="#3b82f6"/>
                  <p style={{fontSize:11,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",margin:0}}>Pedidos — Online/Remoto</p>
                </div>
                <p style={{fontSize:24,fontWeight:800,color:"#3b82f6",margin:"0 0 4px"}}>{fmt(relatorio.receitaPedidos??0)}</p>
                <p style={{fontSize:12,color:"var(--foreground-muted)",margin:0}}>{pedidosPct}% do faturamento total</p>
              </div>
            </div>
          )}

          {/* Gráficos — linha 1 */}
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16}}>
            {relatorio.vendasDiarias.length>0&&(
              <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,padding:20}}>
                <p style={{fontSize:12,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>{relatorio.somentePedidos?"Pedidos por Dia":"Vendas por Dia"}</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={relatorio.vendasDiarias} margin={{top:4,right:4,left:-16,bottom:0}}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="dia" tick={{fill:"var(--foreground-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"var(--foreground-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={ttStyle} formatter={(v:number)=>[fmt(v),"Total"]}/>
                    <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fill="url(#grad1)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {relatorio.pagamentos.length>0&&(
              <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,padding:20}}>
                <p style={{fontSize:12,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Pagamentos</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={relatorio.pagamentos} dataKey="total" nameKey="forma" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                      {relatorio.pagamentos.map((_,i)=><Cell key={i} fill={CORES[i%CORES.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} formatter={(v:number)=>[fmt(v)]}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:8}}>
                  {relatorio.pagamentos.map((p,i)=>(
                    <div key={p.forma} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:10,height:10,borderRadius:"50%",background:CORES[i%CORES.length]}}/>
                        <span style={{color:"var(--foreground-muted)"}}>{p.forma}</span>
                      </div>
                      <span style={{fontWeight:600,color:"var(--foreground)"}}>{p.percentual.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Gráficos — linha 2 */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {relatorio.topProdutos.length>0&&(
              <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,padding:20}}>
                <p style={{fontSize:12,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>Top Produtos</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={relatorio.topProdutos.slice(0,8)} layout="vertical" margin={{top:0,right:20,left:0,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
                    <XAxis type="number" tick={{fill:"var(--foreground-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis type="category" dataKey="nome" tick={{fill:"var(--foreground-muted)",fontSize:10}} axisLine={false} tickLine={false} width={90}/>
                    <Tooltip contentStyle={ttStyle} formatter={(v:number)=>[fmtN(v),"unidades"]}/>
                    <Bar dataKey="quantidade" fill="#3b82f6" radius={[0,4,4,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {relatorio.vendasPorHora.length>0&&(
              <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,padding:20}}>
                <p style={{fontSize:12,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",marginBottom:16}}>
                  <Clock size={12} style={{marginRight:5}}/>Pico por Hora
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={relatorio.vendasPorHora} margin={{top:4,right:4,left:-20,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                    <XAxis dataKey="hora" tickFormatter={h=>`${h}h`} tick={{fill:"var(--foreground-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"var(--foreground-muted)",fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={ttStyle} labelFormatter={h=>`${h}:00`} formatter={(v:number)=>[v,"transações"]}/>
                    <Bar dataKey="qtd" fill="#a78bfa" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Tabela de produtos */}
          {relatorio.topProdutos.length>0&&(
            <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)"}}>
                <p style={{fontSize:12,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",margin:0}}>
                  <Package size={12} style={{marginRight:5}}/>Desempenho de Produtos — {relatorio.somentePedidos?"Pedidos":relatorio.somentePdv?"PDV":"PDV + Pedidos"}
                </p>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr>{["#","Produto","Qtd Vendida","Receita",...(relatorio.lucroDisponivel!==false?["Lucro Estimado","Margem"]:[])].map(h=>(
                      <th key={h} style={{padding:"9px 14px",fontSize:11,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".06em",textAlign:"left",background:"var(--surface)",whiteSpace:"nowrap"}}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {relatorio.topProdutos.map((p,i)=>{
                      const margem=p.receita>0?(p.lucro/p.receita)*100:0;
                      return(
                        <tr key={i} style={{borderTop:"1px solid var(--border-subtle)"}}
                          onMouseEnter={e=>((e.currentTarget as HTMLTableRowElement).style.background="var(--surface-overlay)")}
                          onMouseLeave={e=>((e.currentTarget as HTMLTableRowElement).style.background="transparent")}>
                          <td style={{padding:"10px 14px",fontSize:13,color:"var(--foreground-muted)"}}>{i+1}</td>
                          <td style={{padding:"10px 14px",fontSize:14,fontWeight:500,color:"var(--foreground)"}}>{p.nome}</td>
                          <td style={{padding:"10px 14px",fontSize:13,color:"var(--foreground)"}}>{fmtN(p.quantidade)}</td>
                          <td style={{padding:"10px 14px",fontSize:13,fontWeight:600,color:"var(--primary)"}}>{fmt(p.receita)}</td>
                          {relatorio.lucroDisponivel!==false&&<><td style={{padding:"10px 14px",fontSize:13,fontWeight:600,color:"#3b82f6"}}>{fmt(p.lucro)}</td>
                          <td style={{padding:"10px 14px"}}>
                            <span style={{fontSize:12,fontWeight:700,color:margem>=30?"var(--primary)":margem>=10?"#f59e0b":"#ef4444"}}>{margem.toFixed(1)}%</span>
                          </td></>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Listagem de transações */}
          {relatorio.vendas.length>0&&(
            <div style={{background:"var(--surface-elevated)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <p style={{fontSize:12,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".07em",margin:0}}>
                  {relatorio.somentePedidos?"Pedidos":"Transações"} ({relatorio.vendas.length}) — {relatorio.somentePedidos?"Somente pedidos":relatorio.somentePdv?"Somente PDV":"PDV + Pedidos"}
                </p>
                <button onClick={()=>setAbaVendas(v=>!v)} style={btnG}>
                  <ChevronDown size={13} style={{transform:abaVendas?"rotate(180deg)":"none",transition:"transform .2s"}}/>
                  {abaVendas?"Recolher":"Ver todas"}
                </button>
              </div>
              {abaVendas&&(
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr>{["#","Origem","Data","Pagamento","Itens","Desconto","Total","Cliente"].map(h=>(
                        <th key={h} style={{padding:"9px 14px",fontSize:11,fontWeight:600,color:"var(--foreground-muted)",textTransform:"uppercase",letterSpacing:".06em",textAlign:"left",background:"var(--surface)",whiteSpace:"nowrap"}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {relatorio.vendas.map(v=>(
                        <tr key={`${v.origem}-${v.id}`} style={{borderTop:"1px solid var(--border-subtle)"}}
                          onMouseEnter={e=>((e.currentTarget as HTMLTableRowElement).style.background="var(--surface-overlay)")}
                          onMouseLeave={e=>((e.currentTarget as HTMLTableRowElement).style.background="transparent")}>
                          <td style={{padding:"9px 14px",fontSize:13,color:"var(--foreground-muted)"}}>#{v.id}</td>
                          <td style={{padding:"9px 14px"}}><OrigemBadge origem={v.origem}/></td>
                          <td style={{padding:"9px 14px",fontSize:12,color:"var(--foreground-muted)"}}>{v.data}</td>
                          <td style={{padding:"9px 14px"}}>
                            <span style={{fontSize:11,padding:"2px 7px",background:"var(--primary-muted)",color:"var(--primary)",borderRadius:99,fontWeight:500}}>
                              {v.formaPagamento}{v.formaPagamento2?` + ${v.formaPagamento2}`:""}
                            </span>
                          </td>
                          <td style={{padding:"9px 14px",fontSize:12,color:"var(--foreground-muted)",maxWidth:220}}>
                            {v.itens.slice(0,2).join(" · ")}{v.itens.length>2?` +${v.itens.length-2}`:""}
                          </td>
                          <td style={{padding:"9px 14px",fontSize:12,color:v.desconto>0?"#f59e0b":"var(--foreground-subtle)"}}>
                            {v.desconto>0?`− ${fmt(v.desconto)}`:"—"}
                          </td>
                          <td style={{padding:"9px 14px",fontSize:14,fontWeight:700,color:"var(--primary)"}}>{fmt(v.valorFinal)}</td>
                          <td style={{padding:"9px 14px",fontSize:12,color:"var(--foreground-muted)"}}>{v.nomeCliente??"—"}</td>
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
      {!relatorio&&!loading&&(
        <div style={{padding:60,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:14,color:"var(--foreground-subtle)"}}>
          <FileText size={52}/>
          <p style={{fontSize:15,fontWeight:600,color:"var(--foreground)"}}>Selecione um período e gere o relatório</p>
          <p style={{fontSize:13}}>{origem==="pedidos"?"Gera indicadores exclusivamente dos pedidos no período selecionado.":origem==="pdv"?"Gera indicadores exclusivamente das vendas realizadas nos caixas.":"Combina automaticamente vendas do caixa (PDV) e pedidos online."}</p>
        </div>
      )}
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
