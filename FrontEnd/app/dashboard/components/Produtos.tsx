"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Star,
  X,
  Check,
  Package,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { produtosService, type Produto, type CreateProdutoDTO } from "@/lib/services/produtos";
import { EmptyState } from "@/components/dashboard/EmptyState";

/* ─── Shared Styles ────────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  background: "var(--surface-overlay)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 14,
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
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
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

/* ─── Modal de Produto ─────────────────────────────────────────────────────── */
interface ModalProps {
  produto?: Produto;
  categorias: string[];
  onSave: (data: CreateProdutoDTO) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

function ProdutoModal({ produto, categorias, onSave, onClose, saving }: ModalProps) {
  const [form, setForm] = useState<CreateProdutoDTO>({
    nome: produto?.nome ?? "",
    categoria: produto?.categoria ?? "",
    preco: produto?.preco ?? 0,
    estoque: produto?.estoque ?? 0,
    estoqueMinimo: produto?.estoqueMinimo ?? 5,
    destaque: produto?.destaque ?? false,
    descricao: produto?.descricao ?? "",
  });

  const set = (k: keyof CreateProdutoDTO, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.error("Nome é obrigatório");
    if (form.preco <= 0) return toast.error("Preço deve ser maior que zero");
    await onSave(form);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "28px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)" }}>
            {produto ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button onClick={onClose} style={{ ...btnGhost, padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--foreground-muted)", fontWeight: 500, marginBottom: 6, display: "block" }}>
              Nome *
            </label>
            <input style={inputStyle} value={form.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Coca-Cola 2L" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", fontWeight: 500, marginBottom: 6, display: "block" }}>
                Categoria
              </label>
              <input style={inputStyle} list="cats" value={form.categoria} onChange={(e) => set("categoria", e.target.value)} placeholder="Ex: Bebidas" />
              <datalist id="cats">
                {categorias.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", fontWeight: 500, marginBottom: 6, display: "block" }}>
                Preço (R$) *
              </label>
              <input style={inputStyle} type="number" step="0.01" min="0" value={form.preco} onChange={(e) => set("preco", parseFloat(e.target.value) || 0)} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", fontWeight: 500, marginBottom: 6, display: "block" }}>
                Estoque Atual
              </label>
              <input style={inputStyle} type="number" min="0" value={form.estoque} onChange={(e) => set("estoque", parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", fontWeight: 500, marginBottom: 6, display: "block" }}>
                Estoque Mínimo
              </label>
              <input style={inputStyle} type="number" min="0" value={form.estoqueMinimo} onChange={(e) => set("estoqueMinimo", parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--foreground-muted)", fontWeight: 500, marginBottom: 6, display: "block" }}>
              Descrição
            </label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Opcional..."
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => set("destaque", e.target.checked)}
              style={{ accentColor: "var(--warning)", width: 16, height: 16 }}
            />
            <span style={{ fontSize: 13, color: "var(--foreground-muted)" }}>Produto em destaque</span>
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ ...btnGhost, flex: 1, justifyContent: "center" }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Salvando..." : (<><Check size={15} /> Salvar</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
type SortKey = "nome" | "categoria" | "preco" | "estoque";

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("nome");
  const [sortAsc, setSortAsc] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; produto?: Produto }>({ open: false });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const data = await produtosService.listar();
      setProdutos(data);
      const cats = [...new Set(data.map((p) => p.categoria).filter(Boolean))];
      setCategorias(cats);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter((p) => {
        const matchNome = p.nome.toLowerCase().includes(filtro.toLowerCase());
        const matchCat = categoriaFiltro ? p.categoria === categoriaFiltro : true;
        return matchNome && matchCat;
      })
      .sort((a, b) => {
        const va = a[sortKey] ?? "";
        const vb = b[sortKey] ?? "";
        if (typeof va === "string") return sortAsc ? va.localeCompare(String(vb)) : String(vb).localeCompare(va);
        return sortAsc ? Number(va) - Number(vb) : Number(vb) - Number(va);
      });
  }, [produtos, filtro, categoriaFiltro, sortKey, sortAsc]);

  const handleSave = async (data: CreateProdutoDTO) => {
    setSaving(true);
    try {
      if (modal.produto) {
        const updated = await produtosService.atualizar(modal.produto.id, data);
        setProdutos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        toast.success("Produto atualizado!");
      } else {
        const created = await produtosService.criar(data);
        setProdutos((prev) => [created, ...prev]);
        toast.success("Produto criado!");
      }
      setModal({ open: false });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este produto?")) return;
    setDeletingId(id);
    try {
      await produtosService.excluir(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produto excluído!");
    } catch {
      toast.error("Erro ao excluir produto");
    } finally {
      setDeletingId(null);
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : null;

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--foreground-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    cursor: "pointer",
    userSelect: "none",
    textAlign: "left",
    background: "var(--surface)",
    whiteSpace: "nowrap",
  };

  return (
    <div style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>Produtos</h2>
        <button
          style={btnPrimary}
          onClick={() => setModal({ open: true })}
        >
          <PlusCircle size={16} /> Novo Produto
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
          <input
            style={{ ...inputStyle, paddingLeft: 32 }}
            placeholder="Buscar por nome..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <select
          style={{ ...inputStyle, width: "auto", cursor: "pointer" }}
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filtro || categoriaFiltro) && (
          <button style={btnGhost} onClick={() => { setFiltro(""); setCategoriaFiltro(""); }}>
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Table */}
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
                {(["nome", "categoria", "preco", "estoque"] as SortKey[]).map((k) => (
                  <th key={k} style={thStyle} onClick={() => handleSort(k)}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {{ nome: "Nome", categoria: "Categoria", preco: "Preço", estoque: "Estoque" }[k]}
                      <SortIcon k={k} />
                    </span>
                  </th>
                ))}
                <th style={{ ...thStyle, cursor: "default" }}>Destaque</th>
                <th style={{ ...thStyle, cursor: "default" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: "12px 14px" }}>
                        <div className="skeleton" style={{ height: 14, width: j === 0 ? "70%" : "50%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<Package size={36} />}
                      title="Nenhum produto encontrado"
                      description="Adicione um produto ou ajuste os filtros"
                    />
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((p) => {
                  const estoqueBaixo = p.estoqueMinimo && p.estoque <= p.estoqueMinimo;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderTop: "1px solid var(--border-subtle)" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-overlay)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 14px", color: "var(--foreground)", fontSize: 14, fontWeight: 500 }}>
                        {p.nome}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.categoria && (
                          <span style={{ fontSize: 12, padding: "3px 8px", background: "var(--secondary-muted)", color: "var(--secondary)", borderRadius: 999, fontWeight: 500 }}>
                            {p.categoria}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", color: "var(--foreground)", fontSize: 14 }}>
                        R$ {p.preco.toFixed(2)}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: estoqueBaixo ? "var(--destructive)" : p.estoque === 0 ? "var(--destructive)" : "var(--success)",
                        }}>
                          {p.estoque}
                        </span>
                        {estoqueBaixo && (
                          <span style={{ fontSize: 11, color: "var(--warning)", marginLeft: 6 }}>baixo</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {p.destaque && <Star size={15} style={{ color: "var(--warning)" }} />}
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            title="Editar"
                            onClick={() => setModal({ open: true, produto: p })}
                            style={{ ...btnGhost, padding: "6px 8px" }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            title="Excluir"
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            style={{ ...btnGhost, padding: "6px 8px", borderColor: "rgba(239,68,68,0.3)", color: "var(--destructive)", opacity: deletingId === p.id ? 0.5 : 1 }}
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

        {!loading && produtosFiltrados.length > 0 && (
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--foreground-muted)" }}>
            {produtosFiltrados.length} de {produtos.length} produto(s)
          </div>
        )}
      </div>

      {modal.open && (
        <ProdutoModal
          produto={modal.produto}
          categorias={categorias}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
          saving={saving}
        />
      )}
    </div>
  );
}
