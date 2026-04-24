"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Plus, Search, ChevronRight, Store, Package, Trash2, 
  MapPin, Tag, Truck, Ban, Edit2, Wallet, X, CheckCircle2, Clock, Check
} from "lucide-react";
import { toast } from "sonner";

// ─── IMPORTANDO O NOVO COMPONENTE ───
import NovoPedido from "../acoesRapidas/NovoPedido";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
// ... (Mantenha as interfaces Produto, ItemCarrinho, ItemPedidoDTO, Pedido, etc. aqui)
interface Produto { id:number; nome:string; preco:number; quantidadeEstoque:number; categoria?:string }
interface ItemCarrinho { produto:Produto; quantidade:number }
interface ItemPedidoDTO { idProduto:number; nomeProduto:string; quantidade:number; precoUnitario:number; subtotal:number }
interface Pedido {
  id:number; empresaId:number; nomeEmpresa:string; nomeCliente?:string;
  itens:ItemPedidoDTO[]; valorTotal:number; desconto:number; valorFinal:number; custoFrete:number;
  formaPagamento:string; canalVenda:string; status:string; contaDestino?:string;
  enderecoEntrega?:string; dataPedido:string; dataAtualizacao:string;
  observacao?:string; motivoCancelamento?:string;
}
type FormaPagamento = "PIX"|"DINHEIRO"|"CARTAO_DEBITO"|"CARTAO_CREDITO";
type CanalVenda     = "WHATSAPP"|"INSTAGRAM"|"MERCADO_LIVRE"|"SHOPEE"|"IFOOD"|"TELEFONE"|"OUTRO";
type StatusPedido   = "PENDENTE"|"CONFIRMADO"|"ENVIADO"|"ENTREGUE"|"CANCELADO";

/* ─── Metadados de status ────────────────────────────────────────────────── */
const STATUS_META: Record<StatusPedido,{label:string;color:string;bg:string;border:string;icon:React.ReactNode}> = {
  PENDENTE:   {label:"Pendente",   color:"#f59e0b", bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.4)",  icon:<Clock size={12}/>},
  CONFIRMADO: {label:"Confirmado", color:"#80a99b", bg:"rgba(16,185,129,0.12)", border:"rgba(16,185,129,0.4)",  icon:<CheckCircle2 size={12}/>},
  ENVIADO:    {label:"Enviado",    color:"#3b82f6", bg:"rgba(59,130,246,0.12)", border:"rgba(59,130,246,0.4)",  icon:<Truck size={12}/>},
  ENTREGUE:   {label:"Entregue",   color:"#10b981", bg:"rgba(16,185,129,0.18)", border:"rgba(16,185,129,0.5)",  icon:<Check size={12}/>},
  CANCELADO:  {label:"Cancelado",  color:"#ef4444", bg:"rgba(239,68,68,0.12)",  border:"rgba(239,68,68,0.4)",   icon:<Ban size={12}/>},
};
const CANAIS: {value:CanalVenda;label:string;emoji:string}[] = [
  {value:"WHATSAPP",label:"WhatsApp",emoji:"💬"},
  {value:"INSTAGRAM",label:"Instagram",emoji:"📸"},
  {value:"MERCADO_LIVRE",label:"Mercado Livre",emoji:"🛒"},
  {value:"SHOPEE",label:"Shopee",emoji:"🧡"},
  {value:"IFOOD",label:"iFood",emoji:"🍔"},
  {value:"TELEFONE",label:"Telefone",emoji:"📞"},
  {value:"OUTRO",label:"Outro",emoji:"📦"},
];
const FORMA_LABEL: Record<string,string> = {
  PIX:"Pix",DINHEIRO:"Dinheiro",CARTAO_DEBITO:"Débito",CARTAO_CREDITO:"Crédito",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?:number|null) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v??0);
const fmtData = (s?:any) => { /* ... sua lógica de formatação de data ... */ return String(s); };
async function fetchAuth<T>(path:string,opts?:RequestInit):Promise<T> { /* ... sua lógica de fetch ... */ return {} as T; }

/* ─── Estilos e Componentes Auxiliares ────────────────────────────────────── */
const inp:React.CSSProperties={width:"100%",padding:"8px 11px",background:"var(--surface-overlay)",border:"1px solid var(--border)",borderRadius:8,color:"var(--foreground)",fontSize:13,outline:"none"};
const btnP:React.CSSProperties={display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"var(--primary)",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer"};
const btnDanger:React.CSSProperties={display:"flex",alignItems:"center",gap:6,padding:"7px 11px",background:"transparent",border:"1px solid rgba(239,68,68,0.35)",borderRadius:8,color:"var(--destructive)",fontSize:12,cursor:"pointer"};
function StatusBadge({status}:{status:string}) { /* ... */ return <span />; }
function CanalBadge({canal}:{canal:string}) { /* ... */ return <span />; }
function SeletorStatus({statusAtual,onChange,salvando}:any) { /* ... */ return <div />; }
function ModalConfirmarExclusao(props:any) { /* ... */ return <div />; }

/* ─── REMOVA O COMPONENTE ModalNovoPedido DAQUI ─── */
// (Ele agora está sendo importado do arquivo NovoPedido.tsx)

/* ─── Detalhe do Pedido ─────────────────────────────────────────────────── */
function DetalhePedido({pedido,onClose,onAtualizado,onRemovido}:any) {
  // ... (Mantenha o código do DetalhePedido aqui)
  return <div>Detalhe do Pedido</div>;
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function Pedidos() {
  const {empresaAtiva} = useEmpresa();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [detalhe, setDetalhe] = useState<Pedido|null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");
  const [busca, setBusca] = useState("");
  const [confirmandoLimpar, setConfirmandoLimpar] = useState(false);
  const [limpando, setLimpando] = useState(false);
  
  // ─── ESTADO PARA CONTROLAR O MODAL NOVO ───
  const [modalNovo, setModalNovo] = useState(false);

  const carregar = useCallback(async() => {
    if(!empresaAtiva) return;
    setLoading(true);
    try{setPedidos(await fetchAuth<Pedido[]>(`/api/v1/pedidos/empresa/${empresaAtiva.id}`));}
    catch{toast.error("Erro ao carregar pedidos");}
    finally{setLoading(false);}
  }, [empresaAtiva?.id]);

  useEffect(() => { carregar(); }, [carregar]);

  const adicionarPedido = useCallback(() => {
    // Ao invés de receber o pedido pronto, recarregamos a lista do servidor
    // para garantir que temos todos os dados frescos
    carregar();
    toast.success("Pedido registrado!");
  }, [carregar]);

  const removerPedido = useCallback((id:number)=>{ setPedidos(prev=>prev.filter(p=>p.id!==id)); },[]);
  const atualizarPedido = useCallback((updated:Pedido)=>{ setPedidos(prev=>prev.map(p=>p.id===updated.id?updated:p)); setDetalhe(updated); },[]);
  const limparTudo = async() => { /* ... */ };

  const pedidosFiltrados = useMemo(()=> pedidos.filter(p=>filtroStatus==="TODOS"||p.status===filtroStatus).filter(p=>busca===""||String(p.id).includes(busca)||(p.nomeCliente??"").toLowerCase().includes(busca.toLowerCase())||(CANAIS.find(c=>c.value===p.canalVenda)?.label??"").toLowerCase().includes(busca.toLowerCase())), [pedidos,filtroStatus,busca]);
  const ativos = pedidos.filter(p=>p.status!=="CANCELADO");
  const totalBruto = ativos.reduce((s,p)=>s+p.valorFinal,0);
  const pendentes = pedidos.filter(p=>p.status==="PENDENTE").length;

  if(!empresaAtiva) return(
    <div style={{padding:48,textAlign:"center",color:"var(--foreground-muted)",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
      <Store size={40} color="var(--foreground-subtle)"/>
      <p style={{fontSize:14}}>Selecione uma empresa para ver os pedidos.</p>
    </div>
  );

  return(
    <div style={{padding:28,display:"flex",flexDirection:"column",gap:20}}>

      {/* Cabeçalho */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:"var(--foreground)",margin:0}}>Pedidos</h2>
          <p style={{fontSize:13,color:"var(--foreground-muted)",marginTop:3}}>
            {empresaAtiva.nomeFantasia} · vendas remotas &amp; online
          </p>
        </div>
        <div style={{display:"flex",gap:8}}>
          {pedidos.length>0&&(
            <button onClick={()=>setConfirmandoLimpar(true)} style={btnDanger}>
              <Trash2 size={14}/> Limpar histórico
            </button>
          )}
          
          {/* ─── BOTÃO QUE ABRE O MODAL ─── */}
          <button style={btnP} onClick={() => setModalNovo(true)}>
            <Plus size={15}/> Novo Pedido
          </button>
        </div>
      </div>

      {/* KPIs, Filtros, Lista... (Mantenha o resto do JSX igual) */}
      
      {/* ─── RENDERIZAÇÃO CONDICIONAL DO MODAL IMPORTADO ─── */}
      {modalNovo && (
        <NovoPedido
          empresaId={empresaAtiva.id}
          onClose={() => setModalNovo(false)}
          onSucesso={adicionarPedido}
        />
      )}

      {detalhe && (
        <DetalhePedido
          pedido={detalhe}
          onClose={()=>setDetalhe(null)}
          onAtualizado={atualizarPedido}
          onRemovido={removerPedido}
        />
      )}
    </div>
  );
}