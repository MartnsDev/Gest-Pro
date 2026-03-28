"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Store,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Pencil,
  X,
  Check,
  Trash2,
  Mail,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
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

/* ─── Helpers ────────────────────────────────────────────────────────────── */
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
  // 204 No Content não tem body
  if (res.status === 204) return undefined as T;
  return res.json();
}

const inp: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  background: "var(--surface-overlay)",
  border: "1px solid var(--border)",
  borderRadius: 7,
  color: "var(--foreground)",
  fontSize: 13,
  outline: "none",
};

/* ─── Modal de exclusão com código ──────────────────────────────────────── */
type EtapaExclusao = "confirmar" | "enviando" | "codigo" | "excluindo";

function ModalExclusao({
  empresa,
  onClose,
  onExcluida,
}: {
  empresa: Empresa;
  onClose: () => void;
  onExcluida: () => void;
}) {
  const [etapa, setEtapa] = useState<EtapaExclusao>("confirmar");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");

  const solicitarCodigo = async () => {
    setEtapa("enviando");
    setErro("");
    try {
      await fetchAuth(`/api/v1/empresas/${empresa.id}/solicitar-exclusao`, {
        method: "POST",
      });
      setEtapa("codigo");
      toast.success("Código enviado para seu e-mail!");
    } catch (e: any) {
      setErro(e.message);
      setEtapa("confirmar");
    }
  };

  const confirmarExclusao = async () => {
    if (!codigo.trim() || codigo.length < 6) {
      setErro("Digite o código de 6 dígitos");
      return;
    }
    setEtapa("excluindo");
    setErro("");
    try {
      await fetchAuth(
        `/api/v1/empresas/${empresa.id}/confirmar-exclusao?codigo=${codigo.trim()}`,
        { method: "DELETE" },
      );
      toast.success(`"${empresa.nomeFantasia}" excluída com sucesso.`);
      onExcluida();
      onClose();
    } catch (e: any) {
      setErro(e.message);
      setEtapa("codigo");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.80)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--surface-elevated)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 440,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "rgba(239,68,68,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={20} color="#ef4444" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--foreground)",
                  margin: 0,
                }}
              >
                Excluir Empresa
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  margin: "2px 0 0",
                }}
              >
                {empresa.nomeFantasia}
              </p>
            </div>
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
            <X size={17} />
          </button>
        </div>

        {/* Etapa 1 — Aviso */}
        {etapa === "confirmar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ef4444",
                  margin: "0 0 8px",
                }}
              >
                ⚠️ Ação irreversível
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--foreground-muted)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Ao excluir{" "}
                <strong style={{ color: "var(--foreground)" }}>
                  {empresa.nomeFantasia}
                </strong>
                , todos os dados serão permanentemente removidos:
              </p>
              <ul
                style={{
                  fontSize: 13,
                  color: "var(--foreground-muted)",
                  margin: "10px 0 0",
                  paddingLeft: 18,
                  lineHeight: 1.8,
                }}
              >
                <li>Produtos e estoque</li>
                <li>Histórico de vendas</li>
                <li>Clientes e fornecedores</li>
                <li>Caixas e relatórios</li>
              </ul>
            </div>

            <p
              style={{
                fontSize: 13,
                color: "var(--foreground-muted)",
                margin: 0,
              }}
            >
              Para confirmar, enviaremos um código de verificação para seu
              e-mail cadastrado.
            </p>

            {erro && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  color: "#ef4444",
                  fontSize: 13,
                }}
              >
                <AlertCircle size={14} /> {erro}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  color: "var(--foreground-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={solicitarCodigo}
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 0",
                  background: "#ef4444",
                  border: "none",
                  borderRadius: 9,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Mail size={14} /> Enviar código por e-mail
              </button>
            </div>
          </div>
        )}

        {/* Etapa 2 — Enviando */}
        {etapa === "enviando" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "32px 0",
              color: "var(--foreground-muted)",
            }}
          >
            <Loader2
              size={20}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Enviando código para seu e-mail...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Etapa 3 — Inserir código */}
        {etapa === "codigo" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <CheckCircle size={15} color="#10b981" />
              <p style={{ fontSize: 13, color: "#10b981", margin: 0 }}>
                Código enviado! Verifique sua caixa de entrada.
              </p>
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Digite o código de 6 dígitos
              </label>
              <input
                style={{
                  ...inp,
                  letterSpacing: "0.4em",
                  fontSize: 22,
                  textAlign: "center",
                  padding: "12px",
                  borderColor: erro ? "#ef4444" : "var(--border)",
                }}
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setErro("");
                }}
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
              {erro && (
                <p
                  style={{
                    fontSize: 12,
                    color: "#ef4444",
                    margin: "6px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <AlertCircle size={12} /> {erro}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: 9,
                  color: "var(--foreground-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={codigo.length < 6}
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 0",
                  background: codigo.length < 6 ? "var(--border)" : "#ef4444",
                  border: "none",
                  borderRadius: 9,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: codigo.length < 6 ? "not-allowed" : "pointer",
                  transition: "background .15s",
                }}
              >
                <Trash2 size={14} /> Confirmar exclusão
              </button>
            </div>

            <button
              onClick={solicitarCodigo}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--foreground-muted)",
                fontSize: 12,
                textDecoration: "underline",
                textAlign: "center",
                padding: 0,
              }}
            >
              Não recebeu? Reenviar código
            </button>
          </div>
        )}

        {/* Etapa 4 — Excluindo */}
        {etapa === "excluindo" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "32px 0",
              color: "#ef4444",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <Loader2
              size={20}
              style={{ animation: "spin 1s linear infinite" }}
            />
            Excluindo empresa e todos os dados...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function GerenciarEmpresas({
  onEmpresaSelecionada,
  modoSelecao,
}: Props) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ nomeFantasia: "", cnpj: "" });
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ nomeFantasia: "", cnpj: "" });
  const [salvandoId, setSalvandoId] = useState<number | null>(null);

  // Modal de exclusão
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(
    null,
  );

  const carregar = async () => {
    try {
      setEmpresas(await fetchAuth<Empresa[]>("/api/v1/empresas"));
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const ok = (msg: string) => {
    setSucesso(msg);
    setTimeout(() => setSucesso(""), 3000);
  };

  const iniciarEdicao = (emp: Empresa) => {
    setEditandoId(emp.id);
    setEditForm({ nomeFantasia: emp.nomeFantasia, cnpj: emp.cnpj ?? "" });
    setErro("");
  };

  const salvarEdicao = async (id: number) => {
    if (!editForm.nomeFantasia.trim()) {
      setErro("Nome fantasia é obrigatório.");
      return;
    }
    setSalvandoId(id);
    setErro("");
    try {
      await fetchAuth(`/api/v1/empresas/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...editForm,
          cnpj: editForm.cnpj.trim() || null,
        }),
      });
      ok("Empresa atualizada!");
      setEditandoId(null);
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvandoId(null);
    }
  };

  const salvar = async () => {
    if (!form.nomeFantasia.trim()) {
      setErro("Nome fantasia é obrigatório.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await fetchAuth("/api/v1/empresas", {
        method: "POST",
        body: JSON.stringify({ ...form, cnpj: form.cnpj.trim() || null }),
      });
      ok("Empresa cadastrada com sucesso!");
      setForm({ nomeFantasia: "", cnpj: "" });
      setCriando(false);
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          color: "var(--foreground-muted)",
          fontSize: 14,
          gap: 10,
        }}
      >
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />{" "}
        Carregando empresas...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div
      style={{
        padding: "28px 28px 40px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 700,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Modal de exclusão */}
      {empresaParaExcluir && (
        <ModalExclusao
          empresa={empresaParaExcluir}
          onClose={() => setEmpresaParaExcluir(null)}
          onExcluida={() => {
            carregar();
            setEmpresaParaExcluir(null);
          }}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {modoSelecao ? "Selecionar Empresa" : "Minhas Empresas"}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground-muted)",
              marginTop: 4,
            }}
          >
            {modoSelecao
              ? "Escolha a empresa para abrir o caixa"
              : "Gerencie suas lojas e empresas"}
          </p>
        </div>
        {!modoSelecao && (
          <button
            onClick={() => {
              setCriando(true);
              setErro("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={15} /> Nova Empresa
          </button>
        )}
      </div>

      {/* Feedback */}
      {sucesso && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: 8,
            color: "var(--primary)",
            fontSize: 13,
          }}
        >
          <CheckCircle size={15} /> {sucesso}
        </div>
      )}
      {erro && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 8,
            color: "#ef4444",
            fontSize: 13,
          }}
        >
          <AlertCircle size={15} /> {erro}
        </div>
      )}

      {/* Formulário criação */}
      {criando && (
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
              fontSize: 14,
              fontWeight: 600,
              color: "var(--foreground)",
              marginBottom: 16,
            }}
          >
            Nova Empresa / Loja
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Nome Fantasia *
              </label>
              <input
                value={form.nomeFantasia}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nomeFantasia: e.target.value }))
                }
                placeholder="Ex: Minha Loja Centro"
                style={inp}
                autoFocus
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: 12,
                  color: "var(--foreground-muted)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                CNPJ (opcional)
              </label>
              <input
                value={form.cnpj}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cnpj: e.target.value }))
                }
                placeholder="00.000.000/0001-00"
                style={inp}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={salvar}
                disabled={salvando}
                style={{
                  padding: "9px 20px",
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: salvando ? "not-allowed" : "pointer",
                  opacity: salvando ? 0.7 : 1,
                }}
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => {
                  setCriando(false);
                  setErro("");
                }}
                style={{
                  padding: "9px 20px",
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
            </div>
          </div>
        </div>
      )}

      {/* Lista de empresas */}
      {empresas.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 48,
            background: "var(--surface-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <Building2 size={40} color="var(--foreground-subtle)" />
          <p style={{ fontSize: 14, color: "var(--foreground-muted)" }}>
            Nenhuma empresa cadastrada ainda.
          </p>
          <button
            onClick={() => setCriando(true)}
            style={{
              padding: "9px 18px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cadastrar primeira empresa
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {empresas.map((emp) => {
            const editando = editandoId === emp.id;
            const salvEste = salvandoId === emp.id;

            return (
              <div
                key={emp.id}
                style={{
                  background: "var(--surface-elevated)",
                  border: `1px solid ${editando ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  transition: "border-color .15s",
                }}
              >
                {editando ? (
                  /* ── Modo edição ── */
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ flex: 2 }}>
                        <label
                          style={{
                            fontSize: 11,
                            color: "var(--foreground-muted)",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          Nome Fantasia *
                        </label>
                        <input
                          value={editForm.nomeFantasia}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              nomeFantasia: e.target.value,
                            }))
                          }
                          autoFocus
                          style={inp}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            fontSize: 11,
                            color: "var(--foreground-muted)",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          CNPJ
                        </label>
                        <input
                          value={editForm.cnpj}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, cnpj: e.target.value }))
                          }
                          placeholder="00.000.000/0001-00"
                          style={inp}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => salvarEdicao(emp.id)}
                        disabled={salvEste}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          background: "var(--primary)",
                          color: "#fff",
                          border: "none",
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: salvEste ? "not-allowed" : "pointer",
                          opacity: salvEste ? 0.7 : 1,
                        }}
                      >
                        <Check size={13} />{" "}
                        {salvEste ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => {
                          setEditandoId(null);
                          setErro("");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "7px 14px",
                          background: "transparent",
                          border: "1px solid var(--border)",
                          borderRadius: 7,
                          color: "var(--foreground-muted)",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        <X size={13} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Modo visualização ── */
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: modoSelecao ? "pointer" : "default",
                    }}
                    onClick={() => modoSelecao && onEmpresaSelecionada?.(emp)}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: "var(--primary-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Store size={18} color="var(--primary)" />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--foreground)",
                            margin: 0,
                          }}
                        >
                          {emp.nomeFantasia}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--foreground-muted)",
                            margin: "2px 0 0",
                          }}
                        >
                          {emp.cnpj || "Sem CNPJ"} · Plano {emp.planoNome}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      {!modoSelecao && (
                        <>
                          {/* Botão Editar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              iniciarEdicao(emp);
                            }}
                            title="Editar empresa"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              background: "var(--surface-overlay)",
                              border: "1px solid var(--border)",
                              borderRadius: 7,
                              color: "var(--foreground-muted)",
                              cursor: "pointer",
                              transition: "all .15s",
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.borderColor = "var(--primary)";
                              b.style.color = "var(--primary)";
                            }}
                            onMouseLeave={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.borderColor = "var(--border)";
                              b.style.color = "var(--foreground-muted)";
                            }}
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Botão Excluir */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmpresaParaExcluir(emp);
                            }}
                            title="Excluir empresa"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              background: "var(--surface-overlay)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: 7,
                              color: "#ef4444",
                              cursor: "pointer",
                              transition: "all .15s",
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.background = "rgba(239,68,68,0.08)";
                              b.style.borderColor = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.background = "var(--surface-overlay)";
                              b.style.borderColor = "rgba(239,68,68,0.3)";
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                      {modoSelecao && (
                        <ChevronRight
                          size={18}
                          color="var(--foreground-subtle)"
                        />
                      )}
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
