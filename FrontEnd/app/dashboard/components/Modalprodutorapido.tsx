"use client";

import { useState } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  X,
  Check,
  Tag,
  Barcode,
  Ruler,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

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

const fmt = (v?: number | null) =>
  v != null
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v)
    : "—";

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const token =
    (typeof globalThis.window !== "undefined"
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
    const err = await res.json().catch(() => null);
    throw new Error(err?.mensagem ?? `Erro ${res.status}`);
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

interface Props {
  onClose: () => void;
  onCadastrado?: () => void; // callback opcional para recarregar lista
}

export default function ModalProdutoRapido({ onClose, onCadastrado }: Props) {
  const { empresaAtiva } = useEmpresa();
  const [form, setForm] = useState<ProdutoForm>(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof ProdutoForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const precoNum = Number.parseFloat(form.preco.replace(",", ".")) || 0;
  const custoNum = Number.parseFloat(form.precoCusto.replace(",", ".")) || 0;
  const lucro = precoNum > 0 && custoNum > 0 ? precoNum - custoNum : null;
  const margem =
    lucro != null && precoNum > 0 ? (lucro / precoNum) * 100 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    if (!form.preco || Number.parseFloat(form.preco) <= 0) {
      toast.error("Preço de venda é obrigatório");
      return;
    }
    if (!empresaAtiva) {
      toast.error("Selecione uma empresa.");
      return;
    }

    setSaving(true);
    try {
      await fetchAuth("/api/v1/produtos", {
        method: "POST",
        body: JSON.stringify({
          empresaId: empresaAtiva.id,
          nome: form.nome,
          categoria: form.categoria || null,
          descricao: form.descricao || null,
          unidade: form.unidade || null,
          codigoBarras: form.codigoBarras || null,
          preco: Number.parseFloat(form.preco),
          precoCusto: form.precoCusto
            ? Number.parseFloat(form.precoCusto)
            : null,
          quantidadeEstoque: Number.parseInt(form.quantidadeEstoque),
          estoqueMinimo: Number.parseInt(form.estoqueMinimo) || 0,
          ativo: form.ativo,
        }),
      });
      toast.success(`"${form.nome}" cadastrado!`);
      onCadastrado?.();
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
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
        zIndex: 100,
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
          padding: 26,
          width: "100%",
          maxWidth: 520,
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
              Novo Produto
            </h2>
            {empresaAtiva && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  margin: "3px 0 0",
                }}
              >
                {empresaAtiva.nomeFantasia}
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Nome */}
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
              autoFocus
              required
            />
          </div>

          {/* Categoria + Unidade */}
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

          {/* Código de barras */}
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

          {/* Preços */}
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

            {/* Preview lucro */}
            {lucro != null && (
              <div
                style={{
                  marginTop: 10,
                  padding: "9px 13px",
                  background:
                    lucro >= 0
                      ? "rgba(16,185,129,0.08)"
                      : "rgba(239,68,68,0.08)",
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
                <div style={{ display: "flex", gap: 12 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        lucro >= 0 ? "var(--primary)" : "var(--destructive)",
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

          {/* Estoque */}
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
                  Estoque Mínimo
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

          {/* Descrição */}
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
              style={{ ...inp, resize: "vertical", minHeight: 60 }}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Observações opcionais..."
            />
          </div>

          {/* Ativo */}
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

          {/* Botões */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px 0",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--foreground-muted)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 2,
                padding: "10px 0",
                background: "var(--primary)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {saving ? (
                "Cadastrando..."
              ) : (
                <>
                  <Check size={14} />
                  Cadastrar produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
