"use client";

import { useEffect, useState } from "react";
import {
  Building2, Plus, Store, ChevronRight,
  AlertCircle, CheckCircle, Pencil, X, Check,
} from "lucide-react";

interface Empresa {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  planoNome: string;
  limiteCaixas: number;
}

interface Props {
  onEmpresaSelecionada?: (empresa: Empresa) => void;
  modoSelecao?: boolean;
}

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt_token="))
    ?.split("=")[1];

  // Se não achar no cookie, tenta o localStorage como plano B
  const finalToken = token || localStorage.getItem("jwt_token");

  const headers = new Headers({
    "Content-Type": "application/json",
    ...opts?.headers,
  });

  if (finalToken) {
    headers.set("Authorization", `Bearer ${finalToken}`);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
    { 
      ...opts,
      credentials: "include", 
      headers: headers
    }
  );

  if (res.status === 401) {
    // Se der 401, o token expirou ou é inválido
    console.error("Sessão expirada");
    // window.location.href = "/auth/login"; // Opcional: deslogar se falhar
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.mensagem ?? `Erro ${res.status}`);
  }
  return res.json();
}

const inp: React.CSSProperties = {
  width: "100%", padding: "7px 10px",
  background: "var(--surface-overlay)",
  border: "1px solid var(--border)",
  borderRadius: 7, color: "var(--foreground)",
  fontSize: 13, outline: "none",
};

export default function GerenciarEmpresas({ onEmpresaSelecionada, modoSelecao }: Props) {
  const [empresas,   setEmpresas]   = useState<Empresa[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [criando,    setCriando]    = useState(false);
  const [erro,       setErro]       = useState("");
  const [sucesso,    setSucesso]    = useState("");
  const [salvando,   setSalvando]   = useState(false);
  const [form,       setForm]       = useState({ nomeFantasia: "", cnpj: "" });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm,   setEditForm]   = useState({ nomeFantasia: "", cnpj: "" });
  const [salvandoId, setSalvandoId] = useState<number | null>(null);

  const carregar = async () => {
    try {
      setEmpresas(await fetchAuth<Empresa[]>("/api/v1/empresas"));
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const ok = (msg: string) => { setSucesso(msg); setTimeout(() => setSucesso(""), 3000); };

  const salvar = async () => {
    if (!form.nomeFantasia.trim()) { setErro("Nome fantasia é obrigatório."); return; }
    setSalvando(true); setErro("");
    try {
      await fetchAuth("/api/v1/empresas", { method: "POST", body: JSON.stringify(form) });
      ok("Empresa cadastrada com sucesso!");
      setForm({ nomeFantasia: "", cnpj: "" });
      setCriando(false);
      await carregar();
    } catch (e: any) { setErro(e.message); }
    finally { setSalvando(false); }
  };

  const iniciarEdicao = (emp: Empresa) => {
    setEditandoId(emp.id);
    setEditForm({ nomeFantasia: emp.nomeFantasia, cnpj: emp.cnpj ?? "" });
    setErro("");
  };

  const salvarEdicao = async (id: number) => {
    if (!editForm.nomeFantasia.trim()) { setErro("Nome fantasia é obrigatório."); return; }
    setSalvandoId(id); setErro("");
    try {
      await fetchAuth(`/api/v1/empresas/${id}`, { method: "PUT", body: JSON.stringify(editForm) });
      ok("Empresa atualizada!");
      setEditandoId(null);
      await carregar();
    } catch (e: any) { setErro(e.message); }
    finally { setSalvandoId(null); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "var(--foreground-muted)", fontSize: 14 }}>
      Carregando empresas...
    </div>
  );

  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>
            {modoSelecao ? "Selecionar Empresa" : "Minhas Empresas"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", marginTop: 4 }}>
            {modoSelecao ? "Escolha a empresa para abrir o caixa" : "Gerencie suas lojas e empresas"}
          </p>
        </div>
        {!modoSelecao && (
          <button onClick={() => { setCriando(true); setErro(""); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={15} /> Nova Empresa
          </button>
        )}
      </div>

      {/* Feedback */}
      {sucesso && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--success-muted)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, color: "var(--success)", fontSize: 13 }}>
          <CheckCircle size={15} /> {sucesso}
        </div>
      )}
      {erro && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--destructive-muted)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, color: "var(--destructive)", fontSize: 13 }}>
          <AlertCircle size={15} /> {erro}
        </div>
      )}

      {/* Formulário criação */}
      {criando && (
        <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 16 }}>Nova Empresa / Loja</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 6 }}>Nome Fantasia *</label>
              <input value={form.nomeFantasia} onChange={e => setForm(f => ({ ...f, nomeFantasia: e.target.value }))} placeholder="Ex: Minha Loja Centro" style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--foreground-muted)", display: "block", marginBottom: 6 }}>CNPJ (opcional)</label>
              <input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" style={inp} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={salvar} disabled={salvando} style={{ padding: "9px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: salvando ? "not-allowed" : "pointer", opacity: salvando ? 0.7 : 1 }}>
                {salvando ? "Salvando..." : "Salvar"}
              </button>
              <button onClick={() => { setCriando(false); setErro(""); }} style={{ padding: "9px 20px", background: "transparent", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground-muted)", fontSize: 13, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {empresas.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 48, background: "var(--surface-elevated)", border: "1px solid var(--border)", borderRadius: 12, textAlign: "center" }}>
          <Building2 size={40} color="var(--foreground-subtle)" />
          <p style={{ fontSize: 14, color: "var(--foreground-muted)" }}>Nenhuma empresa cadastrada ainda.</p>
          <button onClick={() => setCriando(true)} style={{ padding: "9px 18px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Cadastrar primeira empresa
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {empresas.map(emp => {
            const editando = editandoId === emp.id;
            const salvEste = salvandoId === emp.id;

            return (
              <div key={emp.id} style={{
                background: "var(--surface-elevated)",
                border: `1px solid ${editando ? "var(--primary)" : "var(--border)"}`,
                borderRadius: 12, padding: "14px 18px",
                transition: "border-color .15s",
              }}>
                {editando ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 2 }}>
                        <label style={{ fontSize: 11, color: "var(--foreground-muted)", display: "block", marginBottom: 4 }}>Nome Fantasia *</label>
                        <input value={editForm.nomeFantasia} onChange={e => setEditForm(f => ({ ...f, nomeFantasia: e.target.value }))} autoFocus style={inp} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: "var(--foreground-muted)", display: "block", marginBottom: 4 }}>CNPJ</label>
                        <input value={editForm.cnpj} onChange={e => setEditForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" style={inp} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => salvarEdicao(emp.id)} disabled={salvEste}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: salvEste ? "not-allowed" : "pointer", opacity: salvEste ? 0.7 : 1 }}>
                        <Check size={13} /> {salvEste ? "Salvando..." : "Salvar"}
                      </button>
                      <button onClick={() => { setEditandoId(null); setErro(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 7, color: "var(--foreground-muted)", fontSize: 12, cursor: "pointer" }}>
                        <X size={13} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: modoSelecao ? "pointer" : "default" }}
                    onClick={() => modoSelecao && onEmpresaSelecionada?.(emp)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--primary-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Store size={18} color="var(--primary)" />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", margin: 0 }}>{emp.nomeFantasia}</p>
                        <p style={{ fontSize: 12, color: "var(--foreground-muted)", margin: "2px 0 0" }}>
                          {emp.cnpj || "Sem CNPJ"} · Plano {emp.planoNome}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {!modoSelecao && (
                        <button
                          onClick={e => { e.stopPropagation(); iniciarEdicao(emp); }}
                          title="Editar empresa"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--foreground-muted)", cursor: "pointer", transition: "all .15s", flexShrink: 0 }}
                          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--primary)"; b.style.color = "var(--primary)"; }}
                          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "var(--border)"; b.style.color = "var(--foreground-muted)"; }}
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      {modoSelecao && <ChevronRight size={18} color="var(--foreground-subtle)" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}