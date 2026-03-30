"use client";

import { useEffect, useState, useMemo } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  Package,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Boxes,
  Tag,
  Barcode,
  Ruler,
  DollarSign,
  ShoppingCart,
  Minus,
  Plus,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface Produto {
  id: number;
  nome: string;
  categoria?: string;
  descricao?: string;
  unidade?: string;
  codigoBarras?: string;
  preco: number;
  precoCusto?: number;
  lucroUnitario?: number;
  margemLucro?: number;
  quantidadeEstoque: number;
  estoqueMinimo?: number;
  ativo: boolean;
}

interface ProdutoForm {
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

// Limites por plano — espelho do TipoPlano.java
const LIMITE_PRODUTOS: Record<string, number> = {
  EXPERIMENTAL: 300,
  BASICO: 800,
  PRO: 999999,
  PREMIUM: 999999,
};

const FORM_VAZIO: ProdutoForm = {
  nome: "",
  categoria: "",
  descricao: "",
  unidade: "UN",
  codigoBarras: "",
  preco: "",
  precoCusto: "",
  quantidadeEstoque: "0",
  estoqueMinimo: "0",
  ativo: true,
};

const UNIDADES = ["UN", "KG", "G", "L", "ML", "CX", "PCT", "PAR", "M", "CM"];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v)
    : "—";

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
    const err = await res.json().catch(() => null);
    throw new Error(err?.mensagem ?? `Erro ${res.status}`);
  }
  return res.json();
}

/* ─── Estilos ────────────────────────────────────────────────────────────── */
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
const btnPrimary: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 16px",
  background: "var(--primary)",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const btnGhost: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground-muted)",
  fontSize: 13,
  cursor: "pointer",
};

/* ─── Barra de uso de produtos ───────────────────────────────────────────── */
function BarraUsoProdutos({
  total,
  plano,
  onUpgrade,
}: {
  total: number;
  plano: string;
  onUpgrade: () => void;
}) {
  const limite = LIMITE_PRODUTOS[plano] ?? 999999;
  const ilimitado = limite >= 999999;
  const restantes = ilimitado ? null : Math.max(limite - total, 0);

  const pct = ilimitado ? 0 : Math.min((total / limite) * 100, 100);
  const critico = pct >= 90;
  const aviso = pct >= 70;
  const cor = critico ? "#ef4444" : aviso ? "#f59e0b" : "var(--primary)";

  return (
    <div
      style={{
        padding: "12px 16px",
        background: critico
          ? "rgba(239,68,68,0.07)"
          : "var(--surface-elevated)",
        border: `1px solid ${critico ? "rgba(239,68,68,0.25)" : aviso ? "rgba(245,158,11,0.2)" : "var(--border)"}`,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "var(--foreground-muted)",
              fontWeight: 500,
            }}
          >
            Produtos cadastrados
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: ilimitado ? "var(--foreground)" : cor,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {ilimitado ? (
              <>
                {total} <span style={{ opacity: 0.5 }}>·</span> Ilimitado
              </>
            ) : (
              <>
                {total} / {limite}
                <span style={{ color: "var(--foreground-muted)", fontWeight: 600 }}>
                  · Restam {restantes}
                </span>
              </>
            )}
          </span>
        </div>
        {!ilimitado && (
          <div
            style={{ height: 5, background: "var(--border)", borderRadius: 99 }}
          >
            <div
              style={{
                height: 5,
                width: `${pct}%`,
                background: cor,
                borderRadius: 99,
                transition: "width .3s",
              }}
            />
          </div>
        )}
        {critico && (
          <p style={{ fontSize: 11, color: "#ef4444", margin: "5px 0 0" }}>
            Você está perto do limite. Faça upgrade para cadastrar produtos
            ilimitados.
          </p>
        )}
      </div>
      {(critico || aviso) && (
        <button
          onClick={onUpgrade}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            background: cor,
            border: "none",
            borderRadius: 7,
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <Zap size={12} /> Fazer upgrade
        </button>
      )}
    </div>
  );
}

/* ─── Modal Produto ──────────────────────────────────────────────────────── */
function ModalProduto({
  produto,
  categorias,
  onSave,
  onClose,
  saving,
}: {
  produto?: Produto;
  categorias: string[];
  onSave: (f: ProdutoForm) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ProdutoForm>(
    produto
      ? {
          nome: produto.nome,
          categoria: produto.categoria ?? "",
          descricao: produto.descricao ?? "",
          unidade: produto.unidade ?? "UN",
          codigoBarras: produto.codigoBarras ?? "",
          preco: String(produto.preco),
          precoCusto:
            produto.precoCusto != null ? String(produto.precoCusto) : "",
          quantidadeEstoque: String(produto.quantidadeEstoque),
          estoqueMinimo: String(produto.estoqueMinimo ?? 0),
          ativo: produto.ativo,
        }
      : FORM_VAZIO,
  );

  const set = (k: keyof ProdutoForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const precoNum = parseFloat(form.preco.replace(",", ".")) || 0;
  const custoNum = parseFloat(form.precoCusto.replace(",", ".")) || 0;
  const lucro = precoNum > 0 && custoNum > 0 ? precoNum - custoNum : null;
  const margem =
    lucro != null && precoNum > 0 ? (lucro / precoNum) * 100 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!form.preco || parseFloat(form.preco) <= 0) {
      toast.error("Preço de venda é obrigatório");
      return;
    }
    await onSave(form);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 560,
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {produto ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button
            onClick={onClose}
            style={{ ...btnGhost, padding: 6, border: "none" }}
          >
            <X size={16} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Nome *
            </label>
            <input
              style={inp}
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Ex: Coca-Cola 350ml"
              required
            />
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                <Tag size={11} style={{ marginRight: 4 }} />
                Categoria
              </label>
              <input
                style={inp}
                list="cats"
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value)}
                placeholder="Ex: Bebidas"
              />
              <datalist id="cats">
                {categorias.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                <Ruler size={11} style={{ marginRight: 4 }} />
                Unidade
              </label>
              <select
                style={{ ...inp, cursor: "pointer" }}
                value={form.unidade}
                onChange={(e) => set("unidade", e.target.value)}
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              <Barcode size={11} style={{ marginRight: 4 }} />
              Código de Barras
            </label>
            <input
              style={inp}
              value={form.codigoBarras}
              onChange={(e) => set("codigoBarras", e.target.value)}
              placeholder="EAN-13, EAN-8..."
            />
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 10,
              }}
            >
              Precificação
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--foreground-muted)",
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  <ShoppingCart size={11} style={{ marginRight: 4 }} />
                  Preço de Custo (R$)
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
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  <DollarSign size={11} style={{ marginRight: 4 }} />
                  Preço de Venda (R$) *
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
                  marginTop: 10,
                  padding: "10px 14px",
                  background:
                    lucro >= 0
                      ? "var(--success-muted)"
                      : "var(--destructive-muted)",
                  border: `1px solid ${lucro >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "var(--foreground-muted)" }}>
                  Lucro unitário
                </span>
                <div style={{ display: "flex", gap: 16 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        lucro >= 0 ? "var(--success)" : "var(--destructive)",
                    }}
                  >
                    {fmt(lucro)}
                  </span>
                  {margem != null && (
                    <span style={{ color: "var(--foreground-muted)" }}>
                      ({margem.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".06em",
                marginBottom: 10,
              }}
            >
              Estoque
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--foreground-muted)",
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  Quantidade Atual
                </label>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  value={form.quantidadeEstoque}
                  onChange={(e) => set("quantidadeEstoque", e.target.value)}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--foreground-muted)",
                    display: "block",
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  Estoque Mínimo (alerta)
                </label>
                <input
                  style={inp}
                  type="number"
                  min="0"
                  value={form.estoqueMinimo}
                  onChange={(e) => set("estoqueMinimo", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                display: "block",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Descrição
            </label>
            <textarea
              style={{ ...inp, resize: "vertical", minHeight: 68 }}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Observações opcionais..."
            />
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => set("ativo", e.target.checked)}
              style={{ accentColor: "var(--primary)", width: 15, height: 15 }}
            />
            <span style={{ fontSize: 13, color: "var(--foreground-muted)" }}>
              Produto ativo
            </span>
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...btnGhost, flex: 1, justifyContent: "center" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...btnPrimary,
                flex: 2,
                justifyContent: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                "Salvando..."
              ) : (
                <>
                  <Check size={14} />
                  {produto ? "Salvar alterações" : "Cadastrar produto"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Modal Estoque ──────────────────────────────────────────────────────── */
function ModalEstoque({
  produto,
  onSave,
  onClose,
  saving,
}: {
  produto: Produto;
  onSave: (n: number) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [qtd, setQtd] = useState(produto.quantidadeEstoque);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 360,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
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
            Ajustar Estoque
          </h2>
          <button
            onClick={onClose}
            style={{ ...btnGhost, padding: 6, border: "none" }}
          >
            <X size={15} />
          </button>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--foreground-muted)",
            marginBottom: 20,
          }}
        >
          {produto.nome}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => setQtd((q) => Math.max(0, q - 1))}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--surface-overlay)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--foreground)",
            }}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min="0"
            value={qtd}
            onChange={(e) => setQtd(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              ...inp,
              width: 100,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          />
          <button
            onClick={() => setQtd((q) => q + 1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--primary-muted)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--primary)",
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--foreground-muted)",
            marginBottom: 20,
          }}
        >
          <span>Atual: {produto.quantidadeEstoque}</span>
          <span
            style={{
              color:
                qtd > produto.quantidadeEstoque
                  ? "var(--success)"
                  : qtd < produto.quantidadeEstoque
                    ? "var(--destructive)"
                    : "var(--foreground-muted)",
            }}
          >
            Diferença: {qtd - produto.quantidadeEstoque >= 0 ? "+" : ""}
            {qtd - produto.quantidadeEstoque}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ ...btnGhost, flex: 1, justifyContent: "center" }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(qtd)}
            disabled={saving || qtd === produto.quantidadeEstoque}
            style={{
              ...btnPrimary,
              flex: 2,
              justifyContent: "center",
              opacity: saving || qtd === produto.quantidadeEstoque ? 0.6 : 1,
            }}
          >
            {saving ? (
              "Salvando..."
            ) : (
              <>
                <Check size={14} />
                Confirmar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
type SortKey =
  | "nome"
  | "categoria"
  | "preco"
  | "quantidadeEstoque"
  | "margemLucro";
type ModalState =
  | { tipo: "produto"; produto?: Produto }
  | { tipo: "estoque"; produto: Produto }
  | null;

export default function Produtos({
  onNavegar,
}: {
  onNavegar?: (s: string) => void;
}) {
  const { empresaAtiva } = useEmpresa();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [planoAtual, setPlanoAtual] = useState<string>("EXPERIMENTAL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [catFiltro, setCatFiltro] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("nome");
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const categorias = useMemo(
    () => [
      ...new Set(produtos.map((p) => p.categoria).filter(Boolean) as string[]),
    ],
    [produtos],
  );

  const carregar = async () => {
    if (!empresaAtiva) return;
    setLoading(true);
    try {
      const [prods, perfil] = await Promise.allSettled([
        fetchAuth<Produto[]>(`/api/v1/produtos?empresaId=${empresaAtiva.id}`),
        fetchAuth<{ tipoPlano: string }>("/api/v1/configuracoes/perfil"),
      ]);
      if (prods.status === "fulfilled") setProdutos(prods.value);
      if (perfil.status === "fulfilled") setPlanoAtual(perfil.value.tipoPlano);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [empresaAtiva?.id]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc((v) => !v);
    else {
      setSortKey(k);
      setSortAsc(true);
    }
  };

  const lista = useMemo(
    () =>
      produtos
        .filter(
          (p) =>
            p.nome.toLowerCase().includes(filtro.toLowerCase()) &&
            (!catFiltro || p.categoria === catFiltro),
        )
        .sort((a, b) => {
          const va = (a as any)[sortKey] ?? "";
          const vb = (b as any)[sortKey] ?? "";
          if (typeof va === "string")
            return sortAsc
              ? va.localeCompare(String(vb))
              : String(vb).localeCompare(va);
          return sortAsc ? Number(va) - Number(vb) : Number(vb) - Number(va);
        }),
    [produtos, filtro, catFiltro, sortKey, sortAsc],
  );

  const totalAtivos = useMemo(
    () => produtos.filter((p) => p.ativo).length,
    [produtos],
  );
  const limite = LIMITE_PRODUTOS[planoAtual] ?? 999999;
  const atingiuLimite = totalAtivos >= limite;

  const handleSalvar = async (form: ProdutoForm) => {
    if (!empresaAtiva) {
      toast.error("Selecione uma empresa primeiro.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        empresaId: empresaAtiva.id,
        nome: form.nome,
        categoria: form.categoria || null,
        descricao: form.descricao || null,
        unidade: form.unidade || null,
        codigoBarras: form.codigoBarras || null,
        preco: parseFloat(form.preco),
        precoCusto: form.precoCusto ? parseFloat(form.precoCusto) : null,
        quantidadeEstoque: parseInt(form.quantidadeEstoque),
        estoqueMinimo: parseInt(form.estoqueMinimo) || 0,
        ativo: form.ativo,
      };
      const editing = modal?.tipo === "produto" && modal.produto;
      if (editing) {
        const updated = await fetchAuth<Produto>(
          `/api/v1/produtos/${modal.produto!.id}`,
          { method: "PUT", body: JSON.stringify(body) },
        );
        setProdutos((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        toast.success("Produto atualizado!");
      } else {
        const created = await fetchAuth<Produto>("/api/v1/produtos", {
          method: "POST",
          body: JSON.stringify(body),
        });
        setProdutos((prev) => [created, ...prev]);
        toast.success("Produto cadastrado!");
      }
      setModal(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEstoque = async (novoEstoque: number) => {
    if (modal?.tipo !== "estoque") return;
    setSaving(true);
    try {
      const p = modal.produto;
      const updated = await fetchAuth<Produto>(`/api/v1/produtos/${p.id}`, {
        method: "PUT",
        body: JSON.stringify({
          empresaId: empresaAtiva?.id,
          nome: p.nome,
          categoria: p.categoria,
          descricao: p.descricao,
          unidade: p.unidade,
          codigoBarras: p.codigoBarras,
          preco: p.preco,
          precoCusto: p.precoCusto,
          quantidadeEstoque: novoEstoque,
          estoqueMinimo: p.estoqueMinimo,
          ativo: p.ativo,
        }),
      });
      setProdutos((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
      toast.success("Estoque atualizado!");
      setModal(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Excluir este produto?")) return;
    setDeletingId(id);
    try {
      await fetchAuth(`/api/v1/produtos/${id}`, { method: "DELETE" });
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto excluído!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(k)}
      style={{
        padding: "10px 14px",
        fontSize: 11,
        fontWeight: 600,
        color: "var(--foreground-muted)",
        textTransform: "uppercase",
        letterSpacing: ".06em",
        cursor: "pointer",
        textAlign: "left",
        background: "var(--surface)",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {sortKey === k &&
          (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </span>
    </th>
  );

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
        <Package size={40} color="var(--foreground-subtle)" />
        <p style={{ fontSize: 14 }}>
          Selecione uma empresa no menu superior para ver os produtos.
        </p>
      </div>
    );

  return (
    <div
      style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
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
            Produtos
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground-muted)",
              marginTop: 3,
            }}
          >
            {empresaAtiva.nomeFantasia} · {produtos.length} produto(s)
          </p>
        </div>
        <button
          style={{
            ...btnPrimary,
            opacity: atingiuLimite ? 0.5 : 1,
            cursor: atingiuLimite ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (atingiuLimite) {
              toast.error(
                `Limite de ${limite} produtos atingido. Faça upgrade para o Pro!`,
              );
              onNavegar?.("planos");
              return;
            }
            setModal({ tipo: "produto" });
          }}
        >
          <PlusCircle size={15} /> Novo Produto
        </button>
      </div>

      {/* Barra de uso */}
      <BarraUsoProdutos
        total={totalAtivos}
        plano={planoAtual}
        onUpgrade={() => onNavegar?.("planos")}
      />

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={13}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--foreground-subtle)",
            }}
          />
          <input
            style={{ ...inp, paddingLeft: 32 }}
            placeholder="Buscar produto..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <select
          style={{ ...inp, width: "auto", cursor: "pointer" }}
          value={catFiltro}
          onChange={(e) => setCatFiltro(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(filtro || catFiltro) && (
          <button
            style={btnGhost}
            onClick={() => {
              setFiltro("");
              setCatFiltro("");
            }}
          >
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th k="nome" label="Produto" />
                <Th k="categoria" label="Categoria" />
                <Th k="preco" label="Venda" />
                <th
                  style={{
                    padding: "10px 14px",
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
                  Custo
                </th>
                <Th k="margemLucro" label="Margem" />
                <Th k="quantidadeEstoque" label="Estoque" />
                <th
                  style={{
                    padding: "10px 14px",
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
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} style={{ padding: "12px 14px" }}>
                        <div
                          className="skeleton"
                          style={{
                            height: 14,
                            width: j === 0 ? "70%" : "50%",
                            borderRadius: 6,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : lista.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        padding: 48,
                        color: "var(--foreground-subtle)",
                      }}
                    >
                      <Package size={36} />
                      <p style={{ fontSize: 14 }}>Nenhum produto encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lista.map((p) => {
                  const baixo =
                    p.estoqueMinimo != null &&
                    p.quantidadeEstoque <= p.estoqueMinimo &&
                    p.quantidadeEstoque > 0;
                  const zerado = p.quantidadeEstoque === 0;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderTop: "1px solid var(--border-subtle)" }}
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
                      <td style={{ padding: "12px 14px" }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--foreground)",
                            margin: 0,
                          }}
                        >
                          {p.nome}
                        </p>
                        {p.unidade && (
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--foreground-subtle)",
                            }}
                          >
                            {p.unidade}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.categoria && (
                          <span
                            style={{
                              fontSize: 12,
                              padding: "3px 8px",
                              background: "var(--secondary-muted)",
                              color: "var(--secondary)",
                              borderRadius: 999,
                              fontWeight: 500,
                            }}
                          >
                            {p.categoria}
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: 14,
                          color: "var(--foreground)",
                          fontWeight: 500,
                        }}
                      >
                        {fmt(p.preco)}
                      </td>
                      <td
                        style={{
                          padding: "12px 14px",
                          fontSize: 13,
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {p.precoCusto != null ? (
                          fmt(p.precoCusto)
                        ) : (
                          <span style={{ color: "var(--foreground-subtle)" }}>
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.margemLucro != null ? (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color:
                                p.margemLucro >= 30
                                  ? "var(--success)"
                                  : p.margemLucro >= 10
                                    ? "var(--warning)"
                                    : "var(--destructive)",
                            }}
                          >
                            {Number(p.margemLucro).toFixed(1)}%
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "var(--foreground-subtle)",
                              fontSize: 13,
                            }}
                          >
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: zerado
                                ? "var(--destructive)"
                                : baixo
                                  ? "var(--warning)"
                                  : "var(--success)",
                            }}
                          >
                            {p.quantidadeEstoque}
                          </span>
                          {(zerado || baixo) && (
                            <AlertTriangle
                              size={13}
                              color={
                                zerado ? "var(--destructive)" : "var(--warning)"
                              }
                            />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            title="Ajustar estoque"
                            onClick={() =>
                              setModal({ tipo: "estoque", produto: p })
                            }
                            style={{ ...btnGhost, padding: "6px 8px" }}
                          >
                            <Boxes size={14} />
                          </button>
                          <button
                            title="Editar"
                            onClick={() =>
                              setModal({ tipo: "produto", produto: p })
                            }
                            style={{ ...btnGhost, padding: "6px 8px" }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            title="Excluir"
                            onClick={() => handleExcluir(p.id)}
                            disabled={deletingId === p.id}
                            style={{
                              ...btnGhost,
                              padding: "6px 8px",
                              borderColor: "rgba(239,68,68,0.3)",
                              color: "var(--destructive)",
                              opacity: deletingId === p.id ? 0.5 : 1,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && lista.length > 0 && (
          <div
            style={{
              padding: "9px 14px",
              borderTop: "1px solid var(--border)",
              fontSize: 12,
              color: "var(--foreground-muted)",
            }}
          >
            {lista.length} de {produtos.length} produto(s)
          </div>
        )}
      </div>

      {modal?.tipo === "produto" && (
        <ModalProduto
          produto={modal.produto}
          categorias={categorias}
          onSave={handleSalvar}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal?.tipo === "estoque" && (
        <ModalEstoque
          produto={modal.produto}
          onSave={handleEstoque}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
