"use client";

import { useEffect, useState, ReactNode } from "react";
import { useEmpresa, type CaixaInfo } from "../context/Empresacontext";
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
} from "recharts";
import {
  AlertCircle,
  DollarSign,
  FileText,
  BarChart3,
  Package,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Store,
  Check,
  X,
  Lock,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Smartphone,
  Truck,
  User,
  ChevronRight,
  Receipt,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { toast } from "sonner";
import NovaVendaOverlay from "../acoesRapidas/NovaVenda";
import NovoProdutoOverlay from "../acoesRapidas/NovoProduto";
import NovoClienteOverlay from "../acoesRapidas/NovoCliente";
import AbrirCaixaOverlay from "../acoesRapidas/AbrirCaixa";
import type { Usuario } from "@/lib/api-v2";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
  empresasCriadas: number;
  limiteEmpresas: number;
  statusAcesso: string;
}
interface VisaoGeral {
  vendasHoje: number;
  produtosComEstoque: number;
  produtosSemEstoque: number;
  clientesAtivos: number;
  vendasSemanais: number;
  vendasMes: number;
  lucroDia: number;
  lucroMes: number;
  planoUsuario: PlanoDTO | null;
  custos: number;
  totalInvestido: number;
  alertas: string[];
}
interface MetodoPagamentoData {
  metodo: string;
  total: number;
}
interface ProdutoVendasData {
  nome: string;
  quantidade: number;
}
interface VendasDiariasData {
  dia: string;
  total: number;
}
interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
  categoria?: string;
}
interface ClienteDTO {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  tipo: string;
}
interface Empresa {
  id: number;
  nomeFantasia: string;
}

const CHART_COLORS = ["#10b981", "#3b82f6", "#a78bfa", "#f59e0b", "#ef4444"];
const UNIDADES_R = ["UN", "KG", "G", "L", "ML", "CX", "PCT", "PAR", "M", "CM"];
const FORMA_LABEL: Record<string, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  CARTAO_DEBITO: "Débito",
  CARTAO_CREDITO: "Crédito",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?: number | null) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v ?? 0,
  );

async function fetchQ<T>(path: string, opts?: RequestInit): Promise<T> {
  const token =
    (typeof window !== "undefined"
      ? (sessionStorage.getItem("jwt_token") ??
        document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ??
        null)
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
  padding: "9px 12px",
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
  padding: "10px 0",
  background: "var(--primary)",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  justifyContent: "center",
};
const btnG: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 14px",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground-muted)",
  fontSize: 13,
  cursor: "pointer",
};

function Overlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  );
}

function ModalBox({
  title,
  sub,
  onClose,
  children,
}: {
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="animate-fade-in"
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 26,
        width: "100%",
        maxWidth: 500,
        maxHeight: "90vh",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {title}
          </h2>
          {sub && (
            <p
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                margin: "3px 0 0",
              }}
            >
              {sub}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--foreground-muted)",
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MODAL: NOVA VENDA RÁPIDA                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
function ModalVendaRapida({
  empresaId,
  caixaId,
  onClose,
  onFeito,
}: {
  empresaId: number;
  caixaId: number;
  onClose: () => void;
  onFeito: () => void;
}) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<{ produto: Produto; qtd: number }[]>(
    [],
  );
  const [forma, setForma] = useState("PIX");
  const [desconto, setDesconto] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchQ<Produto[]>(`/api/v1/produtos?empresaId=${empresaId}`)
      .then(setProdutos)
      .catch(() => {});
  }, []);

  const filtrados = produtos.filter(
    (p) =>
      p.quantidadeEstoque > 0 &&
      p.nome.toLowerCase().includes(busca.toLowerCase()),
  );
  const addItem = (p: Produto) =>
    setCarrinho((prev) => {
      const ex = prev.find((i) => i.produto.id === p.id);
      if (ex)
        return prev.map((i) =>
          i.produto.id === p.id
            ? { ...i, qtd: Math.min(i.qtd + 1, p.quantidadeEstoque) }
            : i,
        );
      return [...prev, { produto: p, qtd: 1 }];
    });

  const subtotal = carrinho.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
  const descontoN = Math.max(0, Number.parseFloat(desconto) || 0);
  const total = Math.max(subtotal - descontoN, 0);

  const registrar = async () => {
    if (!carrinho.length) {
      toast.error("Adicione produtos");
      return;
    }
    setSalvando(true);
    try {
      await fetchQ("/api/v1/vendas/registrar", {
        method: "POST",
        body: JSON.stringify({
          idCaixa: caixaId,
          formaPagamento: forma,
          desconto: descontoN,
          itens: carrinho.map((i) => ({
            idProduto: i.produto.id,
            quantidade: i.qtd,
          })),
        }),
      });
      toast.success("Venda registrada!");
      onFeito();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const FORMAS = [
    { v: "PIX", l: "Pix", icon: <Smartphone size={13} /> },
    { v: "DINHEIRO", l: "Dinheiro", icon: <DollarSign size={13} /> },
    { v: "CARTAO_DEBITO", l: "Débito", icon: <CreditCard size={13} /> },
    { v: "CARTAO_CREDITO", l: "Crédito", icon: <CreditCard size={13} /> },
  ];

  return (
    <Overlay onClose={onClose}>
      <div
        className="animate-fade-in"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 700,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Nova Venda Rápida
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground-muted)",
            }}
          >
            <X size={17} />
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Produtos */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid var(--border)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ position: "relative" }}>
                <Search
                  size={12}
                  style={{
                    position: "absolute",
                    left: 9,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--foreground-subtle)",
                  }}
                />
                <input
                  style={{ ...inp, paddingLeft: 28 }}
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtrados.map((p) => {
                const nc = carrinho.find((i) => i.produto.id === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => addItem(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        "var(--surface-overlay)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background =
                        "transparent")
                    }
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--foreground)",
                          margin: 0,
                        }}
                      >
                        {p.nome}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--foreground-muted)",
                          margin: "1px 0 0",
                        }}
                      >
                        Estoque: {p.quantidadeEstoque}
                        {p.categoria ? ` · ${p.categoria}` : ""}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--primary)",
                        }}
                      >
                        {fmt(p.preco)}
                      </span>
                      {nc && (
                        <span
                          style={{
                            fontSize: 11,
                            background: "var(--primary-muted)",
                            color: "var(--primary)",
                            padding: "2px 7px",
                            borderRadius: 99,
                            fontWeight: 600,
                          }}
                        >
                          {nc.qtd}×
                        </span>
                      )}
                      <Plus size={13} color="var(--foreground-muted)" />
                    </div>
                  </div>
                );
              })}
              {filtrados.length === 0 && (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--foreground-subtle)",
                    fontSize: 13,
                  }}
                >
                  Nenhum produto
                </div>
              )}
            </div>
          </div>
          {/* Carrinho */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--foreground-muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 8,
                }}
              >
                Carrinho ({carrinho.length})
              </p>
              {carrinho.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--foreground-subtle)",
                    fontSize: 12,
                    marginTop: 16,
                  }}
                >
                  Selecione produtos
                </p>
              ) : (
                carrinho.map((item) => (
                  <div
                    key={item.produto.id}
                    style={{
                      marginBottom: 7,
                      padding: "8px 9px",
                      background: "var(--surface-overlay)",
                      borderRadius: 7,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--foreground)",
                          margin: 0,
                          flex: 1,
                        }}
                      >
                        {item.produto.nome}
                      </p>
                      <button
                        onClick={() =>
                          setCarrinho((p) =>
                            p.filter((i) => i.produto.id !== item.produto.id),
                          )
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--foreground-subtle)",
                          padding: 0,
                        }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <button
                          onClick={() =>
                            setCarrinho((p) =>
                              p.map((i) =>
                                i.produto.id === item.produto.id
                                  ? { ...i, qtd: Math.max(1, i.qtd - 1) }
                                  : i,
                              ),
                            )
                          }
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 5,
                            background: "var(--surface-elevated)",
                            border: "1px solid var(--border)",
                            cursor: "pointer",
                            color: "var(--foreground)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Minus size={10} />
                        </button>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            minWidth: 20,
                            textAlign: "center",
                          }}
                        >
                          {item.qtd}
                        </span>
                        <button
                          onClick={() =>
                            setCarrinho((p) =>
                              p.map((i) =>
                                i.produto.id === item.produto.id &&
                                i.qtd < item.produto.quantidadeEstoque
                                  ? { ...i, qtd: i.qtd + 1 }
                                  : i,
                              ),
                            )
                          }
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 5,
                            background: "var(--primary-muted)",
                            border: "1px solid rgba(16,185,129,.3)",
                            cursor: "pointer",
                            color: "var(--primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {fmt(item.produto.preco * item.qtd)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div
              style={{
                padding: "10px 12px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 5,
                }}
              >
                {FORMAS.map((f) => (
                  <button
                    key={f.v}
                    onClick={() => setForma(f.v)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 8px",
                      background:
                        forma === f.v
                          ? "var(--primary-muted)"
                          : "var(--surface-overlay)",
                      border: `1px solid ${forma === f.v ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: 7,
                      cursor: "pointer",
                      color:
                        forma === f.v
                          ? "var(--primary)"
                          : "var(--foreground-muted)",
                      fontSize: 11,
                      fontWeight: forma === f.v ? 600 : 400,
                    }}
                  >
                    {f.icon}
                    {f.l}
                  </button>
                ))}
              </div>
              <div>
                <label
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Desconto R$
                </label>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  step="0.01"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div
                style={{
                  background: "var(--surface-overlay)",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "var(--foreground-muted)",
                  }}
                >
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {descontoN > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--destructive)",
                    }}
                  >
                    <span>Desconto</span>
                    <span>− {fmt(descontoN)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--primary)",
                    paddingTop: 5,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
              <button
                onClick={registrar}
                disabled={salvando || !carrinho.length}
                style={{
                  ...btnP,
                  opacity: salvando || !carrinho.length ? 0.6 : 1,
                }}
              >
                {salvando ? (
                  "Registrando..."
                ) : (
                  <>
                    <Check size={14} />
                    Confirmar · {fmt(total)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MODAL: CADASTRO RÁPIDO DE PRODUTO                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
function ModalProdutoRapido({
  empresaId,
  onClose,
  onFeito,
}: {
  empresaId: number;
  onClose: () => void;
  onFeito: () => void;
}) {
  const [form, setForm] = useState({
    nome: "",
    categoria: "",
    preco: "",
    precoCusto: "",
    quantidadeEstoque: "0",
    unidade: "UN",
    ativo: true,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));
  const precoN = Number.parseFloat(form.preco) || 0;
  const custoN = Number.parseFloat(form.precoCusto) || 0;
  const lucro = precoN > 0 && custoN > 0 ? precoN - custoN : null;
  const margem = lucro != null && precoN > 0 ? (lucro / precoN) * 100 : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || precoN <= 0) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    setSaving(true);
    try {
      await fetchQ("/api/v1/produtos", {
        method: "POST",
        body: JSON.stringify({
          empresaId,
          nome: form.nome,
          categoria: form.categoria || null,
          preco: precoN,
          precoCusto: custoN > 0 ? custoN : null,
          quantidadeEstoque: parseInt(form.quantidadeEstoque) || 0,
          unidade: form.unidade,
          ativo: form.ativo,
        }),
      });
      toast.success(`"${form.nome}" cadastrado!`);
      onFeito();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Cadastrar Produto" onClose={onClose}>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Nome *
            </label>
            <input
              style={inp}
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex: Coca-Cola 350ml"
              autoFocus
              required
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Categoria
              </label>
              <input
                style={inp}
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}
                placeholder="Ex: Bebidas"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Unidade
              </label>
              <select
                style={{ ...inp, cursor: "pointer" }}
                value={form.unidade}
                onChange={(e) => set("unidade", e.target.value)}
              >
                {UNIDADES_R.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Preço de Custo R$
              </label>
              <input
                style={inp}
                type="number"
                step="0.01"
                min="0"
                value={form.precoCusto}
                onChange={(e) => set("precoCusto", e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Preço de Venda R$ *
              </label>
              <input
                style={inp}
                type="number"
                step="0.01"
                min="0"
                value={form.preco}
                onChange={(e) => set("preco", e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>
          {lucro != null && (
            <div
              style={{
                padding: "8px 12px",
                background:
                  lucro >= 0 ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)",
                border: `1px solid ${lucro >= 0 ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.2)"}`,
                borderRadius: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--foreground-muted)" }}>
                Lucro unitário
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: lucro >= 0 ? "var(--primary)" : "var(--destructive)",
                }}
              >
                {fmt(lucro)}
                {margem != null && ` (${margem.toFixed(1)}%)`}
              </span>
            </div>
          )}
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Quantidade em Estoque
            </label>
            <input
              style={inp}
              type="number"
              min="0"
              value={form.quantidadeEstoque}
              onChange={(e) => set("quantidadeEstoque", e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, ...btnG, justifyContent: "center" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 2, ...btnP, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                "Salvando..."
              ) : (
                <>
                  <Check size={14} />
                  Cadastrar
                </>
              )}
            </button>
          </div>
        </form>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MODAL: CAIXA (ABRIR / VER STATUS)                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
function ModalCaixaRapido({
  empresas,
  caixaAtivo,
  onClose,
  onFeito,
}: {
  empresas: Empresa[];
  caixaAtivo: CaixaInfo | null;
  onClose: () => void;
  onFeito: (c: CaixaInfo, e: Empresa) => void;
}) {
  const [empSel, setEmpSel] = useState<Empresa | null>(empresas[0] ?? null);
  const [saldo, setSaldo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const abrir = async () => {
    if (!empSel) {
      toast.error("Selecione uma empresa");
      return;
    }
    setSalvando(true);
    try {
      const caixa = await fetchQ<CaixaInfo>("/api/v1/caixas/abrir", {
        method: "POST",
        body: JSON.stringify({
          empresaId: empSel.id,
          saldoInicial: parseFloat(saldo) || 0,
        }),
      });
      toast.success("Caixa aberto!");
      onFeito(caixa, empSel);
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvando(false);
    }
  };

  if (caixaAtivo)
    return (
      <Overlay onClose={onClose}>
        <ModalBox title="Caixa Atual" onClose={onClose}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                background: "rgba(16,185,129,.08)",
                border: "1px solid rgba(16,185,129,.2)",
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  margin: "0 0 4px",
                }}
              >
                Status
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--primary)",
                  margin: 0,
                }}
              >
                ● CAIXA ABERTO
              </p>
            </div>
            {[
              { l: "Saldo Inicial", v: fmt(caixaAtivo.valorInicial) },
              {
                l: "Total em Vendas",
                v: fmt(caixaAtivo.totalVendas),
                bold: true,
              },
              {
                l: "Saldo Esperado",
                v: fmt(
                  (caixaAtivo.valorInicial ?? 0) +
                    (caixaAtivo.totalVendas ?? 0),
                ),
              },
            ].map((r) => (
              <div
                key={r.l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>{r.l}</span>
                <span
                  style={{
                    fontWeight: r.bold ? 700 : 500,
                    color: r.bold ? "var(--primary)" : "var(--foreground)",
                  }}
                >
                  {r.v}
                </span>
              </div>
            ))}
            <button onClick={onClose} style={{ ...btnP, marginTop: 8 }}>
              Fechar
            </button>
          </div>
        </ModalBox>
      </Overlay>
    );

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Abrir Caixa" onClose={onClose}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Empresa
            </label>
            <select
              style={{ ...inp, cursor: "pointer" }}
              value={empSel?.id ?? ""}
              onChange={(e) =>
                setEmpSel(
                  empresas.find((em) => em.id === Number(e.target.value)) ??
                    null,
                )
              }
            >
              {empresas.map((em) => (
                <option key={em.id} value={em.id}>
                  {em.nomeFantasia}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Saldo Inicial (R$)
            </label>
            <input
              style={inp}
              type="number"
              min="0"
              step="0.01"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
              placeholder="0,00"
              autoFocus
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, ...btnG, justifyContent: "center" }}
            >
              Cancelar
            </button>
            <button
              onClick={abrir}
              disabled={salvando}
              style={{ flex: 2, ...btnP, opacity: salvando ? 0.7 : 1 }}
            >
              {salvando ? (
                "Abrindo..."
              ) : (
                <>
                  <Check size={14} />
                  Abrir Caixa
                </>
              )}
            </button>
          </div>
        </div>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MODAL: CADASTRAR CLIENTE RÁPIDO                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function ModalClienteRapido({
  empresaId,
  onClose,
  onFeito,
}: {
  empresaId: number;
  onClose: () => void;
  onFeito: () => void;
}) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    tipo: "CLIENTE",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      await fetchQ("/api/v1/clientes", {
        method: "POST",
        body: JSON.stringify({
          nome: form.nome,
          telefone: form.telefone || null,
          email: form.email || null,
          tipo: form.tipo,
          empresaId,
        }),
      });
      toast.success(
        `${form.tipo === "CLIENTE" ? "Cliente" : "Fornecedor"} cadastrado!`,
      );
      onFeito();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <ModalBox title="Cadastrar Contato" onClose={onClose}>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[
              ["CLIENTE", "Cliente"],
              ["FORNECEDOR", "Fornecedor"],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => set("tipo", v)}
                style={{
                  padding: "9px 0",
                  borderRadius: 8,
                  border: `1px solid ${form.tipo === v ? "var(--primary)" : "var(--border)"}`,
                  background:
                    form.tipo === v ? "var(--primary-muted)" : "transparent",
                  color:
                    form.tipo === v
                      ? "var(--primary)"
                      : "var(--foreground-muted)",
                  fontSize: 13,
                  fontWeight: form.tipo === v ? 600 : 400,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {v === "CLIENTE" ? <User size={14} /> : <Truck size={14} />}
                {l}
              </button>
            ))}
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 5,
              }}
            >
              Nome *
            </label>
            <input
              style={inp}
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Nome completo"
              autoFocus
              required
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Telefone
              </label>
              <input
                style={inp}
                value={form.telefone}
                onChange={(e) => set("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                E-mail
              </label>
              <input
                style={inp}
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, ...btnG, justifyContent: "center" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 2, ...btnP, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? (
                "Salvando..."
              ) : (
                <>
                  <Check size={14} />
                  Cadastrar
                </>
              )}
            </button>
          </div>
        </form>
      </ModalBox>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* MODAL: RESUMO DO DIA — busca relatório de hoje automaticamente              */
/* ─────────────────────────────────────────────────────────────────────────── */
interface RelatorioHoje {
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
  pagamentos: {
    forma: string;
    qtd: number;
    total: number;
    percentual: number;
  }[];
  topProdutos: {
    nome: string;
    quantidade: number;
    receita: number;
    lucro: number;
  }[];
}

function ModalResumoDia({
  empresaId,
  onClose,
  onIrRelatorios,
}: {
  empresaId: number;
  onClose: () => void;
  onIrRelatorios: () => void;
}) {
  const [rel, setRel] = useState<RelatorioHoje | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchQ<RelatorioHoje>(`/api/v1/relatorios/hoje?empresaId=${empresaId}`)
      .then(setRel)
      .catch((e) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [empresaId]);

  const CORES = ["#10b981", "#3b82f6", "#a78bfa", "#f59e0b", "#ef4444"];

  return (
    <Overlay onClose={onClose}>
      <div
        className="animate-fade-in"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--foreground)",
                margin: 0,
              }}
            >
              Resumo de Hoje
            </h2>
            {rel && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  margin: "3px 0 0",
                }}
              >
                {rel.periodo}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--foreground-muted)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 44,
                    background: "var(--surface-overlay)",
                    borderRadius: 8,
                    opacity: 0.5,
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          )}

          {erro && (
            <p
              style={{
                color: "var(--destructive)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              {erro}
            </p>
          )}

          {rel && !loading && (
            <>
              {/* Stats principais */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  {
                    l: "Receita Total",
                    v: fmt(rel.receitaTotal),
                    c: "var(--primary)",
                    bg: "rgba(16,185,129,.08)",
                  },
                  {
                    l: "Lucro Estimado",
                    v: fmt(rel.lucroTotal),
                    c: "#3b82f6",
                    bg: "rgba(59,130,246,.08)",
                  },
                  {
                    l: "Ticket Médio",
                    v: fmt(rel.ticketMedio),
                    c: "#a78bfa",
                    bg: "rgba(167,139,250,.08)",
                  },
                  {
                    l: "Nº de Vendas",
                    v: String(rel.totalVendas),
                    c: "var(--foreground)",
                    bg: "var(--surface-overlay)",
                  },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: s.bg,
                      border: `1px solid ${s.bg}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--foreground-muted)",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        margin: "0 0 4px",
                      }}
                    >
                      {s.l}
                    </p>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: s.c,
                        margin: 0,
                      }}
                    >
                      {s.v}
                    </p>
                  </div>
                ))}
              </div>

              {/* Descontos e cancelamentos */}
              {(rel.totalDescontos > 0 || rel.cancelamentos > 0) && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {rel.totalDescontos > 0 && (
                    <div
                      style={{
                        background: "rgba(245,158,11,.08)",
                        borderRadius: 9,
                        padding: "10px 13px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--foreground-muted)",
                          margin: "0 0 2px",
                        }}
                      >
                        Descontos dados
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#f59e0b",
                          margin: 0,
                        }}
                      >
                        − {fmt(rel.totalDescontos)}
                      </p>
                    </div>
                  )}
                  {rel.cancelamentos > 0 && (
                    <div
                      style={{
                        background: "rgba(239,68,68,.08)",
                        borderRadius: 9,
                        padding: "10px 13px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--foreground-muted)",
                          margin: "0 0 2px",
                        }}
                      >
                        Cancelamentos
                      </p>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--destructive)",
                          margin: 0,
                        }}
                      >
                        {rel.cancelamentos} ({fmt(rel.valorCancelado)})
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Formas de pagamento */}
              {rel.pagamentos.length > 0 && (
                <div
                  style={{
                    background: "var(--surface-overlay)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--foreground-muted)",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      margin: "0 0 10px",
                    }}
                  >
                    Pagamentos
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 7 }}
                  >
                    {rel.pagamentos.map((p, i) => (
                      <div key={p.forma}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              color: "var(--foreground)",
                              fontWeight: 500,
                            }}
                          >
                            {p.forma}
                          </span>
                          <span
                            style={{
                              color: CORES[i % CORES.length],
                              fontWeight: 700,
                            }}
                          >
                            {fmt(p.total)}{" "}
                            <span
                              style={{
                                color: "var(--foreground-muted)",
                                fontWeight: 400,
                              }}
                            >
                              ({p.percentual.toFixed(1)}%)
                            </span>
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "var(--border)",
                            borderRadius: 99,
                          }}
                        >
                          <div
                            style={{
                              height: 5,
                              width: `${p.percentual}%`,
                              background: CORES[i % CORES.length],
                              borderRadius: 99,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top produtos */}
              {rel.topProdutos.length > 0 && (
                <div
                  style={{
                    background: "var(--surface-overlay)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--foreground-muted)",
                      textTransform: "uppercase",
                      letterSpacing: ".07em",
                      margin: "0 0 10px",
                    }}
                  >
                    Mais Vendidos Hoje
                  </p>
                  {rel.topProdutos.slice(0, 5).map((p, i) => (
                    <div
                      key={p.nome}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom:
                          i < 4 ? "1px solid var(--border-subtle)" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--foreground-subtle)",
                            minWidth: 16,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          style={{ fontSize: 13, color: "var(--foreground)" }}
                        >
                          {p.nome}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--primary)",
                            margin: 0,
                          }}
                        >
                          {fmt(p.receita)}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--foreground-muted)",
                            margin: 0,
                          }}
                        >
                          {p.quantidade}× vendidos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nenhuma venda hoje */}
              {rel.totalVendas === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--foreground-muted)",
                  }}
                >
                  <BarChart3
                    size={36}
                    style={{ opacity: 0.3, marginBottom: 8 }}
                  />
                  <p style={{ fontSize: 14 }}>
                    Nenhuma venda registrada hoje ainda.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  onIrRelatorios();
                  onClose();
                }}
                style={{ ...btnP, gap: 8 }}
              >
                <FileText size={14} /> Ver Relatórios Completos
              </button>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* COMPONENTE PRINCIPAL                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
function ClientOnly({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  return ok ? <>{children}</> : null;
}

function SectionCard({
  title,
  children,
  fullWidth,
}: {
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 20,
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--foreground-muted)",
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: ".07em",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

export default function DashboardHome({
  usuario,
  onNavegar,
}: {
  usuario?: Usuario;
  onNavegar?: (secao: string) => void;
}) {
  const { empresaAtiva, caixaAtivo, setCaixaAtivo, setEmpresaAtiva, empresas } =
    useEmpresa();

  const [visao, setVisao] = useState<VisaoGeral | null>(null);
  const [vendasMetodo, setVendasMetodo] = useState<MetodoPagamentoData[]>([]);
  const [vendasProduto, setVendasProduto] = useState<ProdutoVendasData[]>([]);
  const [vendasDiarias, setVendasDiarias] = useState<VendasDiariasData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [modal, setModal] = useState<
    "venda" | "produto" | "caixa" | "cliente" | "relatorio" | null
  >(null);
  const [overlayVenda, setOverlayVenda] = useState(false);

  const nav = (s: string) => onNavegar?.(s);

  const fetchDados = async (id: number) => {
    setLoading(true);
    const token =
      (typeof globalThis.window !== "undefined"
        ? (sessionStorage.getItem("jwt_token") ??
          document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ??
          null)
        : null) ?? "";
    const base =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://gestpro-backend-production.up.railway.app";
    const opts = {
      credentials: "include" as const,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    try {
      const [v, metodo, produto, diarias] = await Promise.allSettled([
        fetch(
          `${base}/api/v1/dashboard/visao-geral?empresaId=${id}`,
          opts,
        ).then((r) => r.json()),
        fetch(
          `${base}/api/v1/dashboard/vendas/metodo-pagamento?empresaId=${id}`,
          opts,
        ).then((r) => r.json()),
        fetch(
          `${base}/api/v1/dashboard/vendas/produto?empresaId=${id}`,
          opts,
        ).then((r) => r.json()),
        fetch(
          `${base}/api/v1/dashboard/vendas/diarias?empresaId=${id}`,
          opts,
        ).then((r) => r.json()),
      ]);

      if (v.status === "fulfilled") setVisao(v.value);
      if (metodo.status === "fulfilled") setVendasMetodo(metodo.value ?? []);
      if (produto.status === "fulfilled") setVendasProduto(produto.value ?? []);
      if (diarias.status === "fulfilled") setVendasDiarias(diarias.value ?? []);
    } catch (err) {
      console.error("Erro ao buscar dados do dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Só busca se houver ID e se não estivermos já carregando (opcional)
    if (empresaAtiva?.id) {
      fetchDados(empresaAtiva.id);
    }

    // Opcional: Função de limpeza se o usuário sair da página rápido
    return () => {
      setLoading(false);
    };
  }, [empresaAtiva?.id]);

  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "usuário";
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statsCards = [
    {
      title: "Vendas Hoje",
      value: loading ? "—" : fmt(visao?.vendasHoje),
      icon: <CreditCard size={16} />,
      accent: "primary" as const,
    },
    {
      title: "Vendas Semana",
      value: loading ? "—" : fmt(visao?.vendasSemanais),
      icon: <BarChart3 size={16} />,
      accent: "secondary" as const,
    },
    {
      title: "Vendas Mês",
      value: loading ? "—" : fmt(visao?.vendasMes),
      icon: <Calendar size={16} />,
      accent: "primary" as const,
    },
    {
      title: "Lucro Hoje",
      value: loading ? "—" : fmt(visao?.lucroDia),
      icon: <TrendingUp size={16} />,
      accent: "secondary" as const,
    },
    {
      title: "Lucro Mês",
      value: loading ? "—" : fmt(visao?.lucroMes),
      icon: <TrendingUp size={16} />,
      accent: "primary" as const,
    },
    {
      title: "Em Estoque",
      value: loading ? "—" : String(visao?.produtosComEstoque ?? 0),
      icon: <Package size={16} />,
      accent: "secondary" as const,
    },
    {
      title: "Zerados",
      value: loading ? "—" : String(visao?.produtosSemEstoque ?? 0),
      icon: <TrendingDown size={16} />,
      accent: "destructive" as const,
    },
    {
      title: "Clientes",
      value: loading ? "—" : String(visao?.clientesAtivos ?? 0),
      icon: <Users size={16} />,
      accent: "warning" as const,
    },
   {
      title: "Custo em Estoque",
      value: loading ? "—" : fmt(visao?.custos),
      icon: <Receipt size={16} />,
      accent: "warning" as const,
    },
    
    /*

    {
      title: "Total Investido",
      value: loading ? "—" : fmt(visao?.totalInvestido),
      icon: <DollarSign size={16} />,
      accent: "secondary" as const,
    },
    
    */
  ];

  const alertas: string[] = [
    ...(visao?.alertas ?? []),
    ...(visao?.planoUsuario
      ? [
          `Plano ${visao.planoUsuario.tipoPlano}: ${visao.planoUsuario.diasRestantes} dia(s) restante(s)`,
        ]
      : []),
  ];

  // Ações rápidas — cada uma com modal próprio
  const acoes = [
    {
      label: caixaAtivo ? "Ver Caixa" : "Abrir Caixa",
      desc: caixaAtivo
        ? `${fmt(caixaAtivo.totalVendas)} em vendas`
        : "Nenhum caixa aberto",
      icon: caixaAtivo ? <DollarSign size={22} /> : <Lock size={22} />,
      cor: caixaAtivo ? "var(--primary)" : "var(--foreground-muted)",
      bg: caixaAtivo ? "rgba(16,185,129,.1)" : "var(--surface-overlay)",
      borda: caixaAtivo ? "rgba(16,185,129,.3)" : "var(--border)",
      acao: () => nav("caixa-rapido"),
    },
    {
      label: "Nova Venda",
      desc: caixaAtivo
        ? `Caixa #${caixaAtivo.id} aberto`
        : "Abra o caixa primeiro",
      icon: <ShoppingBag size={22} />,
      cor: caixaAtivo ? "var(--foreground)" : "var(--foreground-subtle)",
      bg: "var(--surface-overlay)",
      borda: "var(--border)",
      acao: () => (caixaAtivo ? setOverlayVenda(true) : nav("caixa-rapido")),
    },
    {
      label: "Novo Produto",
      desc: `${visao?.produtosComEstoque ?? 0} com estoque`,
      icon: <Package size={22} />,
      cor: "var(--foreground)",
      bg: "var(--surface-overlay)",
      borda: "var(--border)",
      acao: () => nav("produto-rapido"),
    },
    {
      label: "Novo Cliente",
      desc: `${visao?.clientesAtivos ?? 0} ativos`,
      icon: <Users size={22} />,
      cor: "var(--foreground)",
      bg: "var(--surface-overlay)",
      borda: "var(--border)",
      acao: () => nav("cliente-rapido"),
    },
    {
      label: "Resumo do Dia",
      desc: "Ver métricas rápidas",
      icon: <BarChart3 size={22} />,
      cor: "var(--foreground)",
      bg: "var(--surface-overlay)",
      borda: "var(--border)",
      acao: () => setModal("relatorio"),
    },
    {
      label: "Relatórios",
      desc: "Exportar dados completos",
      icon: <FileText size={22} />,
      cor: "var(--foreground)",
      bg: "var(--surface-overlay)",
      borda: "var(--border)",
      acao: () => nav("relatorios"),
    },
  ];

  if (!empresaAtiva)
    return (
      <ClientOnly>
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
          <Store size={48} color="var(--foreground-subtle)" />
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Nenhuma empresa selecionada
          </h2>
          <p style={{ fontSize: 14 }}>
            Selecione ou cadastre uma empresa no menu superior.
          </p>
        </div>
      </ClientOnly>
    );

  return (
    <ClientOnly>
      {/* Overlay de nova venda */}
      {overlayVenda && (
        <NovaVendaOverlay onClose={() => setOverlayVenda(false)} />
      )}

      {/* Caixa — overlay com blur */}
      {modal === "caixa" && (
        <Overlay onClose={() => setModal(null)}>
          <AbrirCaixaOverlay
            onConcluido={() => {
              setModal(null);
              if (empresaAtiva?.id) fetchDados(empresaAtiva.id);
            }}
          />
        </Overlay>
      )}

      {/* Produto — overlay com blur */}
      {modal === "produto" && empresaAtiva && (
        <Overlay onClose={() => setModal(null)}>
          <NovoProdutoOverlay
            onConcluido={() => {
              fetchDados(empresaAtiva.id);
            }}
          />
        </Overlay>
      )}

      {/* Cliente — overlay com blur */}
      {modal === "cliente" && empresaAtiva && (
        <Overlay onClose={() => setModal(null)}>
          <NovoClienteOverlay
            onConcluido={() => {
              fetchDados(empresaAtiva.id);
            }}
          />
        </Overlay>
      )}

      {/* Resumo do dia — overlay com blur + relatório de hoje */}
      {modal === "relatorio" && empresaAtiva && (
        <ModalResumoDia
          empresaId={empresaAtiva.id}
          onClose={() => setModal(null)}
          onIrRelatorios={() => nav("relatorios")}
        />
      )}

      <div
        style={{
          padding: "28px 28px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Saudação */}
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--foreground)",
              marginBottom: 4,
            }}
          >
            Olá, {primeiroNome}! 👋
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground-muted)",
              textTransform: "capitalize",
            }}
          >
            {today} · {empresaAtiva.nomeFantasia}
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {statsCards.map((c, i) => (
            <StatsCard key={i} {...c} loading={loading} />
          ))}
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alertas.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "var(--warning-muted)",
                  border: "1px solid rgba(245,158,11,.2)",
                  borderRadius: 8,
                  color: "var(--warning)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {msg}
              </div>
            ))}
          </div>
        )}

        {/* Ações Rápidas */}
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--foreground-muted)",
              marginBottom: 14,
              textTransform: "uppercase",
              letterSpacing: ".07em",
            }}
          >
            Ações Rápidas
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {acoes.map((a, i) => (
              <button
                key={i}
                onClick={a.acao}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "18px 16px",
                  background: a.bg,
                  border: `1px solid ${a.borda}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all .15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = "var(--primary)";
                  b.style.transform = "translateY(-2px)";
                  b.style.boxShadow = "0 4px 16px rgba(0,0,0,.2)";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget as HTMLButtonElement;
                  b.style.borderColor = a.borda;
                  b.style.transform = "translateY(0)";
                  b.style.boxShadow = "none";
                }}
              >
                <span style={{ color: a.cor }}>{a.icon}</span>
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: a.cor,
                      margin: 0,
                    }}
                  >
                    {a.label}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--foreground-subtle)",
                      margin: "3px 0 0",
                    }}
                  >
                    {a.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <SectionCard title="Vendas Diárias (Seg–Dom)">
            {vendasDiarias.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={vendasDiarias}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="dia"
                    tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(96,165,250,.06)" }}
                    formatter={(v: number) => [fmt(v), "Vendas"]}
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--foreground-subtle)",
                  fontSize: 13,
                }}
              >
                Sem dados
              </div>
            )}
          </SectionCard>

          <SectionCard title="Formas de Pagamento">
            {vendasMetodo.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={vendasMetodo}
                    dataKey="total"
                    nameKey="metodo"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {vendasMetodo.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [v, "vendas"]}
                  />
                  <Legend
                    formatter={(v) => (
                      <span
                        style={{
                          color: "var(--foreground-muted)",
                          fontSize: 12,
                        }}
                      >
                        {v}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--foreground-subtle)",
                  fontSize: 13,
                }}
              >
                Sem dados
              </div>
            )}
          </SectionCard>

          <SectionCard title="Produtos Mais Vendidos" fullWidth>
            {vendasProduto.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={vendasProduto}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    tick={{ fill: "var(--foreground-muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(52,211,153,.06)" }}
                    formatter={(v: number) => [v, "unidades"]}
                  />
                  <Bar
                    dataKey="quantidade"
                    fill={CHART_COLORS[1]}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: 180,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--foreground-subtle)",
                  fontSize: 13,
                }}
              >
                Sem dados
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </ClientOnly>
  );
}
