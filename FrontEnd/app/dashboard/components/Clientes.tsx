"use client";

import { useEffect, useState, useMemo } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Plus, X, Check, Search, Edit2, Trash2,
  Users, Store, Phone, Mail, CreditCard,
  Truck, ChevronUp, ChevronDown, Building2,
  FileText, User,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
type Tipo = "CLIENTE" | "FORNECEDOR";

interface Contato {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  cnpj?: string;
  contato?: string;    // nome do contato (fornecedor)
  observacoes?: string;
  tipo: Tipo;
  ativo: boolean;
  empresaId: number;
}

interface ContatoForm {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cnpj: string;
  contato: string;
  observacoes: string;
  tipo: Tipo;
}

const FORM_VAZIO: ContatoForm = {
  nome: "", email: "", telefone: "", cpf: "",
  cnpj: "", contato: "", observacoes: "", tipo: "CLIENTE",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { credentials: "include", headers: { "Content-Type": "application/json" }, ...opts }
  );
  if (!res.ok) {
    const e = await res.json().catch(() => null);
    throw new Error(e?.mensagem ?? `Erro ${res.status}`);
  }
  return res.json();
}

const fmtCpf = (v: string) =>
  v.replace(/\D/g, "").replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

const fmtCnpj = (v: string) =>
  v.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

/* ─── Estilos ────────────────────────────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "var(--surface-overlay)", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--foreground)", fontSize: 13, outline: "none",
};
const btnP: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
  background: "var(--primary)", border: "none", borderRadius: 8,
  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const btnG: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
  background: "transparent", border: "1px solid var(--border)",
  borderRadius: 8, color: "var(--foreground-muted)", fontSize: 13, cursor: "pointer",
};

/* ─── Modal de Contato ───────────────────────────────────────────────────── */
function ModalContato({ item, tipoInicial, onSave, onClose, saving }: {
  item?: Contato; tipoInicial: Tipo;
  onSave: (f: ContatoForm) => Promise<void>;
  onClose: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<ContatoForm>(
    item ? {
      nome: item.nome ?? "", email: item.email ?? "",
      telefone: item.telefone ?? "", cpf: item.cpf ?? "",
      cnpj: item.cnpj ?? "", contato: item.contato ?? "",
      observacoes: item.observacoes ?? "", tipo: item.tipo,
    } : { ...FORM_VAZIO, tipo: tipoInicial }
  );

  const set = (k: keyof ContatoForm, v: string) => setForm(f => ({ ...f, [k]: v }));
  const isForn = form.tipo === "FORNECEDOR";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 26, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
            {item ? "Editar" : "Novo"} {form.tipo === "CLIENTE" ? "Cliente" : "Fornecedor"}
          </h2>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>

        {/* Tipo (só para criação) */}
        {!item && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
            {(["CLIENTE", "FORNECEDOR"] as Tipo[]).map(t => (
              <button key={t} onClick={() => set("tipo", t)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                background: form.tipo === t ? "var(--primary-muted)" : "var(--surface-overlay)",
                border: `1px solid ${form.tipo === t ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 9, cursor: "pointer",
                color: form.tipo === t ? "var(--primary)" : "var(--foreground-muted)",
                fontSize: 13, fontWeight: form.tipo === t ? 600 : 400,
              }}>
                {t === "CLIENTE" ? <User size={15} /> : <Truck size={15} />}
                {t === "CLIENTE" ? "Cliente" : "Fornecedor"}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>Nome *</label>
            <input style={inp} value={form.nome} onChange={e => set("nome", e.target.value)}
              placeholder={isForn ? "Razão social ou nome fantasia" : "Nome completo"} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                <Phone size={11} style={{ marginRight: 4 }} />Telefone
              </label>
              <input style={inp} value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                <Mail size={11} style={{ marginRight: 4 }} />E-mail
              </label>
              <input style={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemplo.com" />
            </div>
          </div>

          {/* Campos por tipo */}
          {!isForn && (
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                <CreditCard size={11} style={{ marginRight: 4 }} />CPF
              </label>
              <input style={inp} value={form.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" maxLength={14} />
            </div>
          )}

          {isForn && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                    <Building2 size={11} style={{ marginRight: 4 }} />CNPJ
                  </label>
                  <input style={inp} value={form.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" maxLength={18} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                    <User size={11} style={{ marginRight: 4 }} />Contato
                  </label>
                  <input style={inp} value={form.contato} onChange={e => set("contato", e.target.value)} placeholder="Nome do contato" />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 5, fontWeight: 500 }}>
                  <FileText size={11} style={{ marginRight: 4 }} />Observações
                </label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: 60 }} value={form.observacoes}
                  onChange={e => set("observacoes", e.target.value)} placeholder="Produtos fornecidos, condições, etc..." />
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...btnG, flex: 1, justifyContent: "center" }}>Cancelar</button>
            <button onClick={() => { if (!form.nome.trim()) { toast.error("Nome obrigatório"); return; } onSave(form); }}
              disabled={saving} style={{ ...btnP, flex: 2, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Salvando..." : <><Check size={14} />{item ? "Salvar" : "Cadastrar"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Card de detalhe ────────────────────────────────────────────────────── */
function DetalheContato({ item, onEditar, onClose }: {
  item: Contato; onEditar: () => void; onClose: () => void;
}) {
  const isForn = item.tipo === "FORNECEDOR";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: isForn ? "rgba(59,130,246,0.12)" : "var(--primary-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isForn ? <Truck size={18} color="#3b82f6" /> : <User size={18} color="var(--primary)" />}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{item.nome}</p>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, background: isForn ? "rgba(59,130,246,0.1)" : "var(--primary-muted)", color: isForn ? "#3b82f6" : "var(--primary)" }}>
                {isForn ? "Fornecedor" : "Cliente"}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
          {item.telefone && <div style={{ display: "flex", gap: 10, fontSize: 13 }}><Phone size={14} color="var(--foreground-muted)" /><span>{item.telefone}</span></div>}
          {item.email    && <div style={{ display: "flex", gap: 10, fontSize: 13 }}><Mail size={14} color="var(--foreground-muted)" /><span>{item.email}</span></div>}
          {item.cpf      && <div style={{ display: "flex", gap: 10, fontSize: 13 }}><CreditCard size={14} color="var(--foreground-muted)" /><span>CPF: {fmtCpf(item.cpf.replace(/\D/g,""))}</span></div>}
          {item.cnpj     && <div style={{ display: "flex", gap: 10, fontSize: 13 }}><Building2 size={14} color="var(--foreground-muted)" /><span>CNPJ: {fmtCnpj(item.cnpj.replace(/\D/g,""))}</span></div>}
          {item.contato  && <div style={{ display: "flex", gap: 10, fontSize: 13 }}><User size={14} color="var(--foreground-muted)" /><span>Contato: {item.contato}</span></div>}
          {item.observacoes && (
            <div style={{ padding: "8px 12px", background: "var(--surface-overlay)", borderRadius: 8, fontSize: 12, color: "var(--foreground-muted)", marginTop: 4 }}>
              {item.observacoes}
            </div>
          )}
        </div>
        <button onClick={onEditar} style={{ ...btnP, width: "100%", justifyContent: "center" }}>
          <Edit2 size={14} /> Editar
        </button>
      </div>
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
type SortKey = "nome" | "email" | "telefone";

export default function Clientes() {
  const { empresaAtiva } = useEmpresa();
  const [todos,      setTodos]      = useState<Contato[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [aba,        setAba]        = useState<Tipo>("CLIENTE");
  const [filtro,     setFiltro]     = useState("");
  const [sortKey,    setSortKey]    = useState<SortKey>("nome");
  const [sortAsc,    setSortAsc]    = useState(true);
  const [modal,      setModal]      = useState<{ tipo: "novo" | "editar" | "detalhe"; item?: Contato } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const carregar = async () => {
    if (!empresaAtiva) return;
    setLoading(true);
    try { setTodos(await fetchAuth<Contato[]>(`/api/v1/clientes?empresaId=${empresaAtiva.id}`)); }
    catch { toast.error("Erro ao carregar contatos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [empresaAtiva?.id]);

  const clientes    = useMemo(() => todos.filter(c => c.tipo === "CLIENTE"),    [todos]);
  const fornecedores = useMemo(() => todos.filter(c => c.tipo === "FORNECEDOR"), [todos]);
  const abaLista    = aba === "CLIENTE" ? clientes : fornecedores;

  const lista = useMemo(() =>
    abaLista
      .filter(c =>
        c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        c.email?.toLowerCase().includes(filtro.toLowerCase()) ||
        c.telefone?.includes(filtro) ||
        c.cnpj?.includes(filtro) ||
        c.cpf?.includes(filtro)
      )
      .sort((a, b) => {
        const va = (a[sortKey] ?? "").toLowerCase();
        const vb = (b[sortKey] ?? "").toLowerCase();
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }),
    [abaLista, filtro, sortKey, sortAsc]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v);
    else { setSortKey(k); setSortAsc(true); }
  };

  const handleSalvar = async (form: ContatoForm) => {
    if (!empresaAtiva) return;
    setSaving(true);
    try {
      const body = {
        nome: form.nome, email: form.email || null,
        telefone: form.telefone || null, cpf: form.cpf || null,
        cnpj: form.cnpj || null, contato: form.contato || null,
        observacoes: form.observacoes || null,
        tipo: form.tipo, empresaId: empresaAtiva.id,
      };

      if (modal?.tipo === "editar" && modal.item) {
        const updated = await fetchAuth<Contato>(`/api/v1/clientes/${modal.item.id}`, { method: "PUT", body: JSON.stringify(body) });
        setTodos(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success(`${form.tipo === "CLIENTE" ? "Cliente" : "Fornecedor"} atualizado!`);
      } else {
        const created = await fetchAuth<Contato>("/api/v1/clientes", { method: "POST", body: JSON.stringify(body) });
        setTodos(prev => [created, ...prev]);
        toast.success(`${form.tipo === "CLIENTE" ? "Cliente" : "Fornecedor"} cadastrado!`);
        setAba(form.tipo); // vai para a aba do tipo criado
      }
      setModal(null);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Remover este registro?")) return;
    setDeletingId(id);
    try {
      await fetchAuth(`/api/v1/clientes/${id}`, { method: "DELETE" });
      setTodos(prev => prev.filter(c => c.id !== id));
      toast.success("Removido!");
    } catch (e: any) { toast.error(e.message); }
    finally { setDeletingId(null); }
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th onClick={() => handleSort(k)} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", cursor: "pointer", textAlign: "left", background: "var(--surface)", whiteSpace: "nowrap", userSelect: "none" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}{sortKey === k && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </span>
    </th>
  );

  if (!empresaAtiva) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--foreground-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Store size={40} color="var(--foreground-subtle)" />
      <p style={{ fontSize: 14 }}>Selecione uma empresa para ver os contatos.</p>
    </div>
  );

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Clientes & Fornecedores</h2>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 3 }}>
            {empresaAtiva.nomeFantasia} · {clientes.length} cliente(s) · {fornecedores.length} fornecedor(es)
          </p>
        </div>
        <button style={btnP} onClick={() => setModal({ tipo: "novo" })}>
          <Plus size={15} /> Novo
        </button>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", gap: 4, background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {([["CLIENTE", "Clientes", <Users size={14} />, clientes.length], ["FORNECEDOR", "Fornecedores", <Truck size={14} />, fornecedores.length]] as [Tipo, string, React.ReactNode, number][]).map(([val, label, icon, count]) => (
          <button key={val} onClick={() => setAba(val)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "7px 14px",
            background: aba === val ? "var(--primary)" : "transparent",
            border: "none", borderRadius: 7, cursor: "pointer",
            color: aba === val ? "#fff" : "var(--foreground-muted)",
            fontSize: 13, fontWeight: aba === val ? 600 : 400, transition: "all .15s",
          }}>
            {icon}{label}
            <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 99, background: aba === val ? "rgba(255,255,255,0.2)" : "var(--surface-overlay)", fontWeight: 600 }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Filtro */}
      <div style={{ position: "relative", maxWidth: 360 }}>
        <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
        <input style={{ ...inp, paddingLeft: 32 }} placeholder={`Buscar ${aba === "CLIENTE" ? "cliente" : "fornecedor"}...`} value={filtro} onChange={e => setFiltro(e.target.value)} />
      </div>

      {/* Tabela */}
      <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th k="nome" label="Nome" />
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", background: "var(--surface)" }}>Telefone</th>
                <Th k="email" label="E-mail" />
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", background: "var(--surface)" }}>
                  {aba === "CLIENTE" ? "CPF" : "CNPJ"}
                </th>
                {aba === "FORNECEDOR" && (
                  <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", background: "var(--surface)" }}>Contato</th>
                )}
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", background: "var(--surface)" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} style={{ padding: "12px 14px" }}>
                    <div className="skeleton" style={{ height: 14, width: j === 0 ? "60%" : "50%", borderRadius: 6 }} />
                  </td>
                ))}</tr>
              )) : lista.length === 0 ? (
                <tr><td colSpan={aba === "FORNECEDOR" ? 6 : 5}>
                  <div style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--foreground-subtle)" }}>
                    {aba === "CLIENTE" ? <Users size={36} /> : <Truck size={36} />}
                    <p style={{ fontSize: 14 }}>{abaLista.length === 0 ? `Nenhum ${aba === "CLIENTE" ? "cliente" : "fornecedor"} cadastrado.` : "Nenhum resultado."}</p>
                  </div>
                </td></tr>
              ) : lista.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--border-subtle)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-overlay)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}>

                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                      onClick={() => setModal({ tipo: "detalhe", item: c })}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: aba === "FORNECEDOR" ? "rgba(59,130,246,0.1)" : "var(--primary-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: aba === "FORNECEDOR" ? "#3b82f6" : "var(--primary)" }}>
                          {c.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>{c.nome}</span>
                    </div>
                  </td>

                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--foreground-muted)" }}>
                    {c.telefone
                      ? <a href={`tel:${c.telefone}`} style={{ color: "var(--foreground-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
                          onMouseEnter={e => (e.currentTarget as any).style.color = "var(--primary)"}
                          onMouseLeave={e => (e.currentTarget as any).style.color = "var(--foreground-muted)"}>
                          <Phone size={12} />{c.telefone}
                        </a>
                      : <span style={{ color: "var(--foreground-subtle)" }}>—</span>}
                  </td>

                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--foreground-muted)" }}>
                    {c.email
                      ? <a href={`mailto:${c.email}`} style={{ color: "var(--foreground-muted)", textDecoration: "none" }}
                          onMouseEnter={e => (e.currentTarget as any).style.color = "var(--primary)"}
                          onMouseLeave={e => (e.currentTarget as any).style.color = "var(--foreground-muted)"}>
                          {c.email}
                        </a>
                      : <span style={{ color: "var(--foreground-subtle)" }}>—</span>}
                  </td>

                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--foreground-muted)" }}>
                    {aba === "CLIENTE"
                      ? (c.cpf ? fmtCpf(c.cpf.replace(/\D/g,"")) : <span style={{ color: "var(--foreground-subtle)" }}>—</span>)
                      : (c.cnpj ? fmtCnpj(c.cnpj.replace(/\D/g,"")) : <span style={{ color: "var(--foreground-subtle)" }}>—</span>)
                    }
                  </td>

                  {aba === "FORNECEDOR" && (
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--foreground-muted)" }}>
                      {c.contato ?? <span style={{ color: "var(--foreground-subtle)" }}>—</span>}
                    </td>
                  )}

                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setModal({ tipo: "editar", item: c })} style={{ ...btnG, padding: "6px 8px" }}><Edit2 size={14} /></button>
                      <button onClick={() => handleExcluir(c.id)} disabled={deletingId === c.id}
                        style={{ ...btnG, padding: "6px 8px", borderColor: "rgba(239,68,68,0.3)", color: "var(--destructive)", opacity: deletingId === c.id ? 0.5 : 1 }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && lista.length > 0 && (
          <div style={{ padding: "9px 14px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--foreground-muted)" }}>
            {lista.length} de {abaLista.length} registro(s)
          </div>
        )}
      </div>

      {(modal?.tipo === "novo" || modal?.tipo === "editar") && (
        <ModalContato item={modal.item} tipoInicial={aba} onSave={handleSalvar} onClose={() => setModal(null)} saving={saving} />
      )}
      {modal?.tipo === "detalhe" && modal.item && (
        <DetalheContato item={modal.item} onEditar={() => setModal({ tipo: "editar", item: modal.item })} onClose={() => setModal(null)} />
      )}
    </div>
  );
}