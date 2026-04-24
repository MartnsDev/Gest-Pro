"use client";

import { useEffect, useState, useMemo } from "react";
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
  Loader2,
  ShieldAlert,
  Eye,
  EyeOff,
  Archive,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface Empresa {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  planoNome: string;
  limiteCaixas: number;
  ativo: boolean; // Adicionado para controlar o Soft Delete
}

interface Props {
  onEmpresaSelecionada?: (empresa: Empresa) => void;
  modoSelecao?: boolean;
}

type AbaTipo = "ativas" | "inativas";

/* ─── Helper fetch ───────────────────────────────────────────────────────── */
async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const token =
    (typeof window !== "undefined"
      ? (sessionStorage.getItem("jwt_token") ??
        document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/)?.[1] ??
        null)
      : null) ?? "";
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}${path}`,
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

/* ─── Modal de arquivamento por senha ────────────────────────────────────── */
function ModalExclusao({
  empresa,
  onClose,
  onExcluida,
}: {
  empresa: Empresa;
  onClose: () => void;
  onExcluida: (id: number) => void;
}) {
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const confirmar = async () => {
    if (!senha.trim()) {
      setErro("Digite sua senha");
      return;
    }
    setExcluindo(true);
    setErro("");
    try {
      await fetchAuth(`/api/v1/empresas/${empresa.id}/confirmar-exclusao`, {
        method: "DELETE",
        body: JSON.stringify({ senha }),
      });
      toast.success(`A loja "${empresa.nomeFantasia}" foi arquivada.`);
      onExcluida(empresa.id);
      onClose();
    } catch (e: any) {
      setErro(e.message);
      setExcluindo(false);
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
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 14,
          padding: 28,
          width: "100%",
          maxWidth: 420,
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
                background: "rgba(245,158,11,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Archive size={20} color="#f59e0b" />
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
                Arquivar Empresa
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

        {/* Aviso de Arquivamento */}
        <div
          style={{
            padding: "12px 14px",
            background: "rgba(245,158,11,0.07)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 10,
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#f59e0b",
              margin: "0 0 6px",
            }}
          >
            ⚠️ Arquivamento de Loja
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--foreground-muted)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            A empresa <strong style={{ color: "var(--foreground)" }}>{empresa.nomeFantasia}</strong> não aparecerá mais no sistema. No entanto, seus dados de histórico (vendas e relatórios) <strong>serão preservados</strong> para segurança contábil.
          </p>
        </div>

        {/* Campo de senha */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--foreground-muted)",
              display: "block",
              marginBottom: 8,
            }}
          >
            Digite sua senha para confirmar
          </label>
          <div style={{ position: "relative" }}>
            <input
              style={{
                ...inp,
                padding: "10px 40px 10px 12px",
                fontSize: 14,
                borderColor: erro ? "#ef4444" : "var(--border)",
              }}
              type={showSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro("");
              }}
              onKeyDown={(e) => e.key === "Enter" && confirmar()}
              placeholder="Sua senha de acesso"
              autoFocus
            />
            <button
              onClick={() => setShowSenha((v) => !v)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--foreground-muted)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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

        {/* Botões */}
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
            onClick={confirmar}
            disabled={excluindo || !senha.trim()}
            style={{
              flex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "10px 0",
              background:
                excluindo || !senha.trim() ? "rgba(245,158,11,0.4)" : "#f59e0b",
              border: "none",
              borderRadius: 9,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: excluindo || !senha.trim() ? "not-allowed" : "pointer",
              transition: "background .15s",
            }}
          >
            {excluindo ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />{" "}
                Arquivando...
              </>
            ) : (
              <>
                <Archive size={14} /> Confirmar arquivamento
              </>
            )}
          </button>
        </div>
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
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(
    null,
  );
  
  // Novo estado para controlar as abas
  const [abaAtiva, setAbaAtiva] = useState<AbaTipo>("ativas");

  const carregar = async () => {
    try {
      // Como o backend agora deve retornar todas as empresas (ou você pode ajustar a rota para trazer todas, caso ele esteja filtrando por padrão)
      const data = await fetchAuth<Empresa[]>("/api/v1/empresas");
      
      // Se a sua API antiga não retornar o campo 'ativo', vamos simular que tudo está ativo por padrão
      const empresasComStatus = data.map(emp => ({ ...emp, ativo: emp.ativo !== false }));
      
      setEmpresas(empresasComStatus);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // Lógica para filtrar empresas com base na aba selecionada
  const lista = useMemo(() => {
    return empresas.filter(emp => abaAtiva === "ativas" ? emp.ativo : !emp.ativo);
  }, [empresas, abaAtiva]);

  const stats = useMemo(() => {
    return {
      ativas: empresas.filter(e => e.ativo).length,
      inativas: empresas.filter(e => !e.ativo).length
    };
  }, [empresas]);

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
      const targetEmpresa = empresas.find(e => e.id === id);
      
      // Enviamos apenas os campos necessários, assim como fizemos em Produtos
      const bodyClean = {
          nomeFantasia: editForm.nomeFantasia,
          cnpj: editForm.cnpj.trim() || null,
          ativo: targetEmpresa?.ativo // Preserva o status atual
      };

      const updated = await fetchAuth<Empresa>(`/api/v1/empresas/${id}`, {
        method: "PUT",
        body: JSON.stringify(bodyClean),
      });
      
      // Força a garantir que o 'ativo' não venha undefined do servidor
      updated.ativo = updated.ativo !== false;
      
      setEmpresas(prev => prev.map(e => e.id === id ? updated : e));
      ok("Empresa atualizada!");
      setEditandoId(null);
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
      setAbaAtiva("ativas"); // Volta pra aba de ativas ao criar
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEmpresaExcluida = (id: number) => {
      // Como é soft delete, nós só mudamos a flag em vez de remover do array
      setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ativo: false } : e));
      toast.success("Empresa arquivada com sucesso. Você pode encontrá-la na aba 'Inativas'.");
  };

  const handleRestaurar = async (emp: Empresa) => {
      try {
          // Prepara o body sem campos que a API não aceita
          const bodyClean = {
              nomeFantasia: emp.nomeFantasia,
              cnpj: emp.cnpj,
              ativo: true // A mágica da restauração
          };
          
          await fetchAuth(`/api/v1/empresas/${emp.id}`, {
              method: "PUT",
              body: JSON.stringify(bodyClean),
          });
          
          setEmpresas(prev => prev.map(e => e.id === emp.id ? { ...e, ativo: true } : e));
          toast.success("Empresa restaurada com sucesso!");
      } catch (e: any) {
          toast.error("Erro ao restaurar: " + e.message);
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
          onExcluida={handleEmpresaExcluida}
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
              : "Gerencie suas lojas e filiais"}
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
              color: "#000",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Plus size={15} /> Nova Empresa
          </button>
        )}
      </div>

      {/* Abas de Navegação */}
      {!modoSelecao && (
        <div style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
          <button 
            onClick={() => setAbaAtiva("ativas")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: abaAtiva === "ativas" ? 700 : 500, color: abaAtiva === "ativas" ? "var(--primary)" : "var(--foreground-muted)", position: "relative", paddingBottom: 6 }}
          >
            Ativas ({stats.ativas})
            {abaAtiva === "ativas" && <div style={{ position: "absolute", bottom: -13, left: 0, right: 0, height: 2, background: "var(--primary)", borderRadius: 2 }} />}
          </button>
          
          <button 
            onClick={() => setAbaAtiva("inativas")}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: abaAtiva === "inativas" ? 700 : 500, color: abaAtiva === "inativas" ? "var(--destructive)" : "var(--foreground-muted)", position: "relative", paddingBottom: 6 }}
          >
            Arquivadas ({stats.inativas})
            {abaAtiva === "inativas" && <div style={{ position: "absolute", bottom: -13, left: 0, right: 0, height: 2, background: "var(--destructive)", borderRadius: 2 }} />}
          </button>
        </div>
      )}

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
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
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

      {/* Lista */}
      {lista.length === 0 ? (
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
          {abaAtiva === "ativas" ? <Building2 size={40} color="var(--foreground-subtle)" /> : <Archive size={40} color="var(--foreground-subtle)" />}
          <p style={{ fontSize: 14, color: "var(--foreground-muted)" }}>
            {abaAtiva === "ativas" ? "Nenhuma empresa ativa encontrada." : "Nenhuma empresa foi arquivada ainda."}
          </p>
          {abaAtiva === "ativas" && !criando && !modoSelecao && (
            <button
              onClick={() => setCriando(true)}
              style={{
                padding: "9px 18px",
                background: "var(--primary)",
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cadastrar primeira empresa
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: abaAtiva === "inativas" ? 0.8 : 1 }}>
          {lista.map((emp) => {
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
                          color: "#000",
                          border: "none",
                          borderRadius: 7,
                          fontSize: 12,
                          fontWeight: 700,
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: modoSelecao ? "pointer" : "default",
                    }}
                    onClick={() => modoSelecao && abaAtiva === "ativas" && onEmpresaSelecionada?.(emp)}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: abaAtiva === "ativas" ? "var(--primary-muted)" : "rgba(245,158,11,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {abaAtiva === "ativas" ? <Store size={18} color="var(--primary)" /> : <Archive size={18} color="#f59e0b" />}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--foreground)",
                            margin: 0,
                            textDecoration: abaAtiva === "inativas" ? "line-through" : "none"
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
                      {!modoSelecao && abaAtiva === "ativas" && (
                        <>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmpresaParaExcluir(emp);
                            }}
                            title="Arquivar empresa"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 32,
                              height: 32,
                              background: "var(--surface-overlay)",
                              border: "1px solid rgba(245,158,11,0.3)",
                              borderRadius: 7,
                              color: "#f59e0b",
                              cursor: "pointer",
                              transition: "all .15s",
                            }}
                            onMouseEnter={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.background = "rgba(245,158,11,0.1)";
                              b.style.borderColor = "#f59e0b";
                            }}
                            onMouseLeave={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.background = "var(--surface-overlay)";
                              b.style.borderColor = "rgba(245,158,11,0.3)";
                            }}
                          >
                            <Archive size={13} />
                          </button>
                        </>
                      )}
                      
                      {!modoSelecao && abaAtiva === "inativas" && (
                         <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestaurar(emp);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 12px",
                              background: "transparent",
                              border: "1px solid rgba(16,185,129,0.3)",
                              borderRadius: 7,
                              color: "var(--success)",
                              fontSize: 12,
                              cursor: "pointer",
                              transition: "all .15s",
                            }}
                            onMouseEnter={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.background = "rgba(16,185,129,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              const b = e.currentTarget as HTMLButtonElement;
                              b.style.background = "transparent";
                            }}
                          >
                            <RotateCcw size={13} /> Restaurar
                          </button>
                      )}

                      {modoSelecao && abaAtiva === "ativas" && (
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