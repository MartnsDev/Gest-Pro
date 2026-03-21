"use client";

import { useEffect, useState, useMemo } from "react";
import { useEmpresa } from "../context/Empresacontext";
import {
  Plus, X, Check, Search, Edit2, Trash2,
  Users, Store, Phone, Mail, CreditCard,
  UserCheck, ChevronUp, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  ativo: boolean;
}

interface ClienteForm {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
}

const FORM_VAZIO: ClienteForm = { nome: "", email: "", telefone: "", cpf: "" };

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
  v.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

const fmtTel = (v: string) =>
  v.replace(/\D/g, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");

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

/* ─── Modal de Cliente ───────────────────────────────────────────────────── */
function ModalCliente({ cliente, onSave, onClose, saving }: {
  cliente?: Cliente;
  onSave: (f: ClienteForm) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ClienteForm>(
    cliente ? {
      nome: cliente.nome ?? "",
      email: cliente.email ?? "",
      telefone: cliente.telefone ?? "",
      cpf: cliente.cpf ?? "",
    } : FORM_VAZIO
  );

  const set = (k: keyof ClienteForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { toast.error("Nome é obrigatório."); return; }
    await onSave(form);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
            {cliente ? "Editar Cliente" : "Novo Cliente"}
          </h2>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
              Nome *
            </label>
            <input style={inp} value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome completo" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                <Phone size={11} style={{ marginRight: 4 }} />Telefone
              </label>
              <input style={inp} value={form.telefone} onChange={e => set("telefone", e.target.value)}
                placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
                <CreditCard size={11} style={{ marginRight: 4 }} />CPF
              </label>
              <input style={inp} value={form.cpf} onChange={e => set("cpf", e.target.value)}
                placeholder="000.000.000-00" maxLength={14} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 6, fontWeight: 500 }}>
              <Mail size={11} style={{ marginRight: 4 }} />E-mail
            </label>
            <input style={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)}
              placeholder="email@exemplo.com" />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ ...btnG, flex: 1, justifyContent: "center" }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ ...btnP, flex: 2, justifyContent: "center", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Salvando..." : <><Check size={14} />{cliente ? "Salvar alterações" : "Cadastrar"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Detalhe do cliente ─────────────────────────────────────────────────── */
function DetalheCliente({ cliente, onEditar, onClose }: {
  cliente: Cliente; onEditar: () => void; onClose: () => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 14, padding: 26, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Cliente</h2>
          <button onClick={onClose} style={{ ...btnG, padding: 6, border: "none" }}><X size={16} /></button>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--primary-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>
              {cliente.nome.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{cliente.nome}</p>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "var(--success-muted)", color: "var(--success)", fontWeight: 500 }}>
              Ativo
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {cliente.telefone && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <Phone size={14} color="var(--foreground-muted)" />
              <span style={{ color: "var(--foreground)" }}>{cliente.telefone}</span>
            </div>
          )}
          {cliente.email && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <Mail size={14} color="var(--foreground-muted)" />
              <span style={{ color: "var(--foreground)" }}>{cliente.email}</span>
            </div>
          )}
          {cliente.cpf && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <CreditCard size={14} color="var(--foreground-muted)" />
              <span style={{ color: "var(--foreground)" }}>{fmtCpf(cliente.cpf.replace(/\D/g, ""))}</span>
            </div>
          )}
        </div>

        <button onClick={onEditar} style={{ ...btnP, width: "100%", justifyContent: "center" }}>
          <Edit2 size={14} /> Editar dados
        </button>
      </div>
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
type SortKey = "nome" | "email" | "telefone";

export default function Clientes() {
  const { empresaAtiva } = useEmpresa();

  const [clientes,   setClientes]   = useState<Cliente[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [filtro,     setFiltro]     = useState("");
  const [sortKey,    setSortKey]    = useState<SortKey>("nome");
  const [sortAsc,    setSortAsc]    = useState(true);
  const [modal,      setModal]      = useState<{ tipo: "novo" | "editar" | "detalhe"; cliente?: Cliente } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const carregar = async () => {
    if (!empresaAtiva) return;
    setLoading(true);
    try {
      setClientes(await fetchAuth<Cliente[]>(`/api/v1/clientes?empresaId=${empresaAtiva.id}`));
    } catch { toast.error("Erro ao carregar clientes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [empresaAtiva?.id]);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc(v => !v);
    else { setSortKey(k); setSortAsc(true); }
  };

  const lista = useMemo(() =>
    clientes
      .filter(c =>
        c.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        c.email?.toLowerCase().includes(filtro.toLowerCase()) ||
        c.telefone?.includes(filtro) ||
        c.cpf?.includes(filtro)
      )
      .sort((a, b) => {
        const va = (a[sortKey] ?? "").toLowerCase();
        const vb = (b[sortKey] ?? "").toLowerCase();
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      }),
    [clientes, filtro, sortKey, sortAsc]);

  const handleSalvar = async (form: ClienteForm) => {
    if (!empresaAtiva) return;
    setSaving(true);
    try {
      const body = {
        nome: form.nome,
        email: form.email || null,
        telefone: form.telefone || null,
        cpf: form.cpf || null,
        empresa: { id: empresaAtiva.id },
      };

      if (modal?.tipo === "editar" && modal.cliente) {
        const updated = await fetchAuth<Cliente>(`/api/v1/clientes/${modal.cliente.id}`, { method: "PUT", body: JSON.stringify(body) });
        setClientes(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success("Cliente atualizado!");
      } else {
        const created = await fetchAuth<Cliente>("/api/v1/clientes", { method: "POST", body: JSON.stringify(body) });
        setClientes(prev => [created, ...prev]);
        toast.success("Cliente cadastrado!");
      }
      setModal(null);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm("Desativar este cliente?")) return;
    setDeletingId(id);
    try {
      await fetchAuth(`/api/v1/clientes/${id}`, { method: "DELETE" });
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.success("Cliente removido!");
    } catch (e: any) { toast.error(e.message); }
    finally { setDeletingId(null); }
  };

  const Th = ({ k, label }: { k: SortKey; label: string }) => (
    <th onClick={() => handleSort(k)} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", cursor: "pointer", textAlign: "left", background: "var(--surface)", whiteSpace: "nowrap", userSelect: "none" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {sortKey === k && (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </span>
    </th>
  );

  if (!empresaAtiva) return (
    <div style={{ padding: 48, textAlign: "center", color: "var(--foreground-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <Store size={40} color="var(--foreground-subtle)" />
      <p style={{ fontSize: 14 }}>Selecione uma empresa para ver os clientes.</p>
    </div>
  );

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Clientes</h2>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 3 }}>
            {empresaAtiva.nomeFantasia} · {clientes.length} cliente(s)
          </p>
        </div>
        <button style={btnP} onClick={() => setModal({ tipo: "novo" })}>
          <Plus size={15} /> Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {[
          { label: "Total", value: String(clientes.length), icon: <Users size={15} /> },
          { label: "Com E-mail", value: String(clientes.filter(c => c.email).length), icon: <Mail size={15} /> },
          { label: "Com Telefone", value: String(clientes.filter(c => c.telefone).length), icon: <Phone size={15} /> },
          { label: "Com CPF", value: String(clientes.filter(c => c.cpf).length), icon: <CreditCard size={15} /> },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--primary)" }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div style={{ position: "relative", maxWidth: 360 }}>
        <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--foreground-subtle)" }} />
        <input style={{ ...inp, paddingLeft: 32 }} placeholder="Buscar por nome, e-mail, telefone ou CPF..." value={filtro} onChange={e => setFiltro(e.target.value)} />
      </div>

      {/* Tabela */}
      <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th k="nome" label="Nome" />
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", background: "var(--surface)", whiteSpace: "nowrap" }}>Telefone</th>
                <Th k="email" label="E-mail" />
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", background: "var(--surface)", whiteSpace: "nowrap" }}>CPF</th>
                <th style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "var(--foreground-muted)", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "left", background: "var(--surface)", whiteSpace: "nowrap" }}>Ações</th>
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
                <tr><td colSpan={5}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 48, color: "var(--foreground-subtle)" }}>
                    <Users size={36} />
                    <p style={{ fontSize: 14 }}>{clientes.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum resultado."}</p>
                  </div>
                </td></tr>
              ) : lista.map(c => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--border-subtle)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-overlay)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.background = "transparent")}>

                  {/* Nome + avatar */}
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                      onClick={() => setModal({ tipo: "detalhe", cliente: c })}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{c.nome.charAt(0).toUpperCase()}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>{c.nome}</span>
                    </div>
                  </td>

                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--foreground-muted)" }}>
                    {c.telefone ? (
                      <a href={`tel:${c.telefone}`} style={{ color: "var(--foreground-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--primary)"}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground-muted)"}>
                        <Phone size={12} />{c.telefone}
                      </a>
                    ) : <span style={{ color: "var(--foreground-subtle)" }}>—</span>}
                  </td>

                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--foreground-muted)" }}>
                    {c.email ? (
                      <a href={`mailto:${c.email}`} style={{ color: "var(--foreground-muted)", textDecoration: "none" }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--primary)"}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "var(--foreground-muted)"}>
                        {c.email}
                      </a>
                    ) : <span style={{ color: "var(--foreground-subtle)" }}>—</span>}
                  </td>

                  <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--foreground-muted)" }}>
                    {c.cpf ? fmtCpf(c.cpf.replace(/\D/g, "")) : <span style={{ color: "var(--foreground-subtle)" }}>—</span>}
                  </td>

                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button title="Editar" onClick={() => setModal({ tipo: "editar", cliente: c })}
                        style={{ ...btnG, padding: "6px 8px" }}><Edit2 size={14} /></button>
                      <button title="Remover" onClick={() => handleExcluir(c.id)} disabled={deletingId === c.id}
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
            {lista.length} de {clientes.length} cliente(s)
          </div>
        )}
      </div>

      {/* Modais */}
      {(modal?.tipo === "novo" || modal?.tipo === "editar") && (
        <ModalCliente
          cliente={modal.cliente}
          onSave={handleSalvar}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {modal?.tipo === "detalhe" && modal.cliente && (
        <DetalheCliente
          cliente={modal.cliente}
          onEditar={() => setModal({ tipo: "editar", cliente: modal.cliente })}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}