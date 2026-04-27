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
  Eye,
  EyeOff,
  Archive,
  RotateCcw,
  AlertTriangle,
  Info,
  Network
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface Empresa {
  id: number;
  nomeFantasia: string;
  cnpj: string;
  planoNome: string;
  limiteCaixas: number;
  ativo: boolean; 
  razaoSocial?: string;
  cidade?: string;      
  uf?: string;          
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
  padding: "9px 12px",
  background: "var(--surface-overlay)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--foreground)",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s",
};

/* ─── Modal de arquivamento por senha (Soft Delete) ──────────────────────── */
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
      setErro("Digite sua senha para confirmar.");
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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Archive size={24} color="#f59e0b" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Arquivar Loja</h2>
              <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "2px 0 0" }}>{empresa.nomeFantasia}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "14px 16px", background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16}/> Atenção
          </p>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: 0, lineHeight: 1.6 }}>
            A empresa <strong style={{ color: "var(--foreground)" }}>{empresa.nomeFantasia}</strong> ficará invisível no sistema, mas o histórico de vendas <strong>será preservado</strong>. Você poderá restaurá-la depois.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground-muted)", display: "block", marginBottom: 8 }}>Senha de administrador</label>
          <div style={{ position: "relative" }}>
            <input
              style={{ ...inp, paddingRight: 40, borderColor: erro ? "#ef4444" : "var(--border)" }}
              type={showSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
              onKeyDown={(e) => e.key === "Enter" && confirmar()}
              placeholder="••••••••"
              autoFocus
            />
            <button onClick={() => setShowSenha((v) => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", display: "flex", alignItems: "center" }}>
              {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {erro && (
            <p style={{ fontSize: 13, color: "#ef4444", margin: "8px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} /> {erro}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={confirmar} disabled={excluindo || !senha.trim()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", background: excluindo || !senha.trim() ? "rgba(245,158,11,0.5)" : "#f59e0b", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: excluindo || !senha.trim() ? "not-allowed" : "pointer", transition: "all .2s" }}>
            {excluindo ? <><Loader2 size={16} className="animate-spin" /> Arquivando...</> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal de Exclusão DEFINITIVA (Hard Delete) ─────────────────────────── */
function ModalExclusaoPermanente({
  empresa,
  onClose,
  onExcluidaPermanentemente,
}: {
  empresa: Empresa;
  onClose: () => void;
  onExcluidaPermanentemente: (id: number) => void;
}) {
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const confirmar = async () => {
    if (!senha.trim()) {
      setErro("Digite sua senha para confirmar.");
      return;
    }
    setExcluindo(true);
    setErro("");
    try {
      await fetchAuth(`/api/v1/empresas/${empresa.id}/exclusao-permanente`, {
        method: "DELETE",
        body: JSON.stringify({ senha }),
      });
      toast.success(`A loja "${empresa.nomeFantasia}" foi excluída permanentemente.`);
      onExcluidaPermanentemente(empresa.id);
      onClose();
    } catch (e: any) {
      setErro(e.message);
      setExcluindo(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 16, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.25)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Exclusão Definitiva</h2>
              <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: "2px 0 0" }}>{empresa.nomeFantasia}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "14px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#ef4444", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} /> Ação Irreversível
          </p>
          <p style={{ fontSize: 13, color: "var(--foreground-muted)", margin: 0, lineHeight: 1.6 }}>
            Você está prestes a excluir <strong style={{ color: "var(--foreground)" }}>permanentemente</strong> esta empresa. <strong>Todos os produtos, caixas e histórico de vendas vinculados a ela serão apagados para sempre.</strong>
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground-muted)", display: "block", marginBottom: 8 }}>Senha de administrador</label>
          <div style={{ position: "relative" }}>
            <input
              style={{ ...inp, paddingRight: 40, borderColor: erro ? "#ef4444" : "var(--border)" }}
              type={showSenha ? "text" : "password"}
              value={senha}
              onChange={(e) => { setSenha(e.target.value); setErro(""); }}
              onKeyDown={(e) => e.key === "Enter" && confirmar()}
              placeholder="••••••••"
              autoFocus
            />
            <button onClick={() => setShowSenha((v) => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--foreground-muted)", display: "flex", alignItems: "center" }}>
              {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {erro && (
            <p style={{ fontSize: 13, color: "#ef4444", margin: "8px 0 0", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} /> {erro}
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={confirmar} disabled={excluindo || !senha.trim()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", background: excluindo || !senha.trim() ? "rgba(239,68,68,0.5)" : "#ef4444", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, cursor: excluindo || !senha.trim() ? "not-allowed" : "pointer", transition: "all .2s" }}>
            {excluindo ? <><Loader2 size={16} className="animate-spin" /> Excluindo...</> : "Apagar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function GerenciarEmpresas({ onEmpresaSelecionada, modoSelecao }: Props) {
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
  
  // Controle de Modais
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState<Empresa | null>(null);
  const [empresaParaExcluirPermanente, setEmpresaParaExcluirPermanente] = useState<Empresa | null>(null);
  
  const [abaAtiva, setAbaAtiva] = useState<AbaTipo>("ativas");

  const carregar = async () => {
    try {
      const data = await fetchAuth<Empresa[]>("/api/v1/empresas");
      const empresasComStatus = data.map(emp => ({ ...emp, ativo: emp.ativo !== false }));
      setEmpresas(empresasComStatus);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

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
    setTimeout(() => setSucesso(""), 4000);
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
      const bodyClean = {
          nomeFantasia: editForm.nomeFantasia,
          cnpj: editForm.cnpj.trim() || null,
          ativo: targetEmpresa?.ativo 
      };

      const updated = await fetchAuth<Empresa>(`/api/v1/empresas/${id}`, {
        method: "PUT",
        body: JSON.stringify(bodyClean),
      });
      
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
      setAbaAtiva("ativas");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleEmpresaExcluida = (id: number) => {
      setEmpresas(prev => prev.map(e => e.id === id ? { ...e, ativo: false } : e));
  };

  const handleEmpresaExcluidaPermanentemente = (id: number) => {
      setEmpresas(prev => prev.filter(e => e.id !== id));
  };

  const handleRestaurar = async (emp: Empresa) => {
      try {
          const bodyClean = { nomeFantasia: emp.nomeFantasia, cnpj: emp.cnpj, ativo: true };
          await fetchAuth(`/api/v1/empresas/${emp.id}`, { method: "PUT", body: JSON.stringify(bodyClean) });
          setEmpresas(prev => prev.map(e => e.id === emp.id ? { ...e, ativo: true } : e));
          toast.success("Empresa restaurada com sucesso!");
      } catch (e: any) {
          toast.error(e.message);
      }
  };

  if (loading)
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--foreground-muted)", fontSize: 15, gap: 12 }}>
        <Loader2 size={24} className="animate-spin" /> Carregando seus negócios...
      </div>
    );

  const isAviso = erro.includes("opcional"); 

  return (
    <div style={{ padding: "32px 28px 64px", display: "flex", flexDirection: "column", gap: 28, maxWidth: 800, margin: "0 auto" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      
      {/* Modais de Exclusão */}
      {empresaParaExcluir && (
        <ModalExclusao empresa={empresaParaExcluir} onClose={() => setEmpresaParaExcluir(null)} onExcluida={handleEmpresaExcluida} />
      )}
      {empresaParaExcluirPermanente && (
        <ModalExclusaoPermanente empresa={empresaParaExcluirPermanente} onClose={() => setEmpresaParaExcluirPermanente(null)} onExcluidaPermanentemente={handleEmpresaExcluidaPermanentemente} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--foreground)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <Network size={26} color="var(--primary)" />
            {modoSelecao ? "Selecionar Empresa" : "Multi-Empresas"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--foreground-muted)", marginTop: 6 }}>
            {modoSelecao ? "Escolha a empresa para operar no momento" : "Gerencie todas as suas lojas, franquias e filiais em um só lugar"}
          </p>
        </div>
        {!modoSelecao && (
          <button onClick={() => { setCriando(true); setErro(""); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <Plus size={18} /> Adicionar Empresa
          </button>
        )}
      </div>

      {/* Banner Informativo (Aparece apenas no modo gerencial se não estiver criando) */}
      {!modoSelecao && !criando && (
        <div style={{ background: "linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 16, padding: "20px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ background: "var(--primary)", padding: 8, borderRadius: 10, display: "flex", color: "#000" }}>
            <Info size={20} />
          </div>
          <div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>Como funciona o modo Multi-Empresas?</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--foreground-muted)", lineHeight: 1.5 }}>
              Cada empresa adicionada funciona de forma <strong>independente</strong>. Ao selecionar uma loja, você visualizará apenas os produtos, vendas e relatórios pertencentes a ela, garantindo organização total dos seus negócios.
            </p>
          </div>
        </div>
      )}

      {/* Abas */}
      {!modoSelecao && (
        <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--border)", paddingBottom: 16, marginTop: 8 }}>
          <button onClick={() => setAbaAtiva("ativas")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: abaAtiva === "ativas" ? 700 : 500, color: abaAtiva === "ativas" ? "var(--primary)" : "var(--foreground-muted)", position: "relative", paddingBottom: 8, transition: "color 0.2s" }}>
            Lojas Ativas <span style={{ background: abaAtiva === "ativas" ? "rgba(16, 185, 129, 0.15)" : "var(--surface-overlay)", color: abaAtiva === "ativas" ? "var(--primary)" : "var(--foreground-subtle)", padding: "2px 8px", borderRadius: 99, fontSize: 11, marginLeft: 6 }}>{stats.ativas}</span>
            {abaAtiva === "ativas" && <div style={{ position: "absolute", bottom: -17, left: 0, right: 0, height: 3, background: "var(--primary)", borderRadius: "3px 3px 0 0" }} />}
          </button>
          <button onClick={() => setAbaAtiva("inativas")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, fontWeight: abaAtiva === "inativas" ? 700 : 500, color: abaAtiva === "inativas" ? "var(--destructive)" : "var(--foreground-muted)", position: "relative", paddingBottom: 8, transition: "color 0.2s" }}>
            Arquivadas <span style={{ background: abaAtiva === "inativas" ? "rgba(239, 68, 68, 0.15)" : "var(--surface-overlay)", color: abaAtiva === "inativas" ? "var(--destructive)" : "var(--foreground-subtle)", padding: "2px 8px", borderRadius: 99, fontSize: 11, marginLeft: 6 }}>{stats.inativas}</span>
            {abaAtiva === "inativas" && <div style={{ position: "absolute", bottom: -17, left: 0, right: 0, height: 3, background: "var(--destructive)", borderRadius: "3px 3px 0 0" }} />}
          </button>
        </div>
      )}

      {/* Feedbacks */}
      {sucesso && (
        <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, color: "var(--primary)", fontSize: 14, fontWeight: 500 }}>
          <CheckCircle size={20} /> <span>{sucesso}</span>
        </div>
      )}
      {erro && (
        <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: isAviso ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${isAviso ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 12, color: isAviso ? "#f59e0b" : "#ef4444", fontSize: 14, fontWeight: 500 }}>
          <AlertCircle size={20} /> <span>{erro}</span>
        </div>
      )}

      {/* Formulário criação */}
      {criando && (
        <div className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: "1px solid var(--primary)", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: "rgba(16, 185, 129, 0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Store size={18} color="var(--primary)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: 0 }}>Cadastrar Nova Loja</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground-muted)", display: "block", marginBottom: 8 }}>Nome Fantasia *</label>
              <input value={form.nomeFantasia} onChange={(e) => setForm((f) => ({ ...f, nomeFantasia: e.target.value }))} placeholder="Ex: Filial Centro, Loja Shopping..." style={{...inp, padding: "12px 16px", fontSize: 15}} autoFocus />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground-muted)", display: "block", marginBottom: 8 }}>CNPJ <span style={{ fontWeight: 400, opacity: 0.7 }}>(opcional)</span></label>
              <input value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" style={{...inp, padding: "12px 16px", fontSize: 15}} />
            </div>
          </div>
          
          <div style={{ display: "flex", gap: 12, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <button onClick={() => { setCriando(false); setErro(""); }} style={{ flex: 1, padding: "12px 0", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Cancelar
            </button>
            <button onClick={salvar} disabled={salvando} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", background: "var(--primary)", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: salvando ? "not-allowed" : "pointer", opacity: salvando ? 0.7 : 1 }}>
              {salvando ? <><Loader2 size={16} className="animate-spin" /> Registrando...</> : "Concluir Cadastro"}
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {lista.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 64, background: "var(--surface-elevated)", border: "1px dashed var(--border)", borderRadius: 16, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {abaAtiva === "ativas" ? <Building2 size={32} color="var(--foreground-subtle)" /> : <Archive size={32} color="var(--foreground-subtle)" />}
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", margin: "0 0 6px" }}>{abaAtiva === "ativas" ? "Nenhuma empresa ativa" : "Nenhuma empresa arquivada"}</h3>
            <p style={{ fontSize: 14, color: "var(--foreground-muted)", margin: 0, maxWidth: 300 }}>
              {abaAtiva === "ativas" ? "Você ainda não possui empresas cadastradas no sistema." : "Empresas desativadas aparecerão nesta lista."}
            </p>
          </div>
          {abaAtiva === "ativas" && !criando && !modoSelecao && (
            <button onClick={() => setCriando(true)} style={{ marginTop: 8, padding: "10px 24px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Cadastrar Primeira Empresa
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, opacity: abaAtiva === "inativas" ? 0.7 : 1 }}>
          {lista.map((emp) => {
            const editando = editandoId === emp.id;
            const salvEste = salvandoId === emp.id;

            return (
              <div key={emp.id} className="animate-fade-in" style={{ background: "var(--surface-elevated)", border: `1px solid ${editando ? "var(--primary)" : "var(--border)"}`, borderRadius: 16, padding: editando ? 24 : 20, transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: editando ? "0 8px 24px rgba(16, 185, 129, 0.1)" : "none" }}
                onMouseEnter={e => { if(!editando && !modoSelecao) { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                onMouseLeave={e => { if(!editando && !modoSelecao) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; } }}
              >
                {editando ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", display: "block", marginBottom: 6 }}>Nome Fantasia *</label>
                        <input value={editForm.nomeFantasia} onChange={(e) => setEditForm((f) => ({ ...f, nomeFantasia: e.target.value }))} autoFocus style={{...inp, padding: "10px 14px"}} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground-muted)", display: "block", marginBottom: 6 }}>CNPJ</label>
                        <input value={editForm.cnpj} onChange={(e) => setEditForm((f) => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" style={{...inp, padding: "10px 14px"}} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                      <button onClick={() => { setEditandoId(null); setErro(""); }} style={{ padding: "10px 16px", background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                        Cancelar
                      </button>
                      <button onClick={() => salvarEdicao(emp.id)} disabled={salvEste} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--primary)", color: "#000", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: salvEste ? "not-allowed" : "pointer", opacity: salvEste ? 0.7 : 1 }}>
                        {salvEste ? <><Loader2 size={14} className="animate-spin" /> Salvando</> : "Salvar Alterações"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: modoSelecao ? "pointer" : "default" }} onClick={() => modoSelecao && abaAtiva === "ativas" && onEmpresaSelecionada?.(emp)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: abaAtiva === "ativas" ? "rgba(16, 185, 129, 0.1)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {abaAtiva === "ativas" ? <Store size={22} color="var(--primary)" /> : <Archive size={22} color="#f59e0b" />}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", margin: "0 0 2px", textDecoration: abaAtiva === "inativas" ? "line-through" : "none" }}>
                          {emp.nomeFantasia}
                        </h3>
                        
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 12px" }}>
                          {emp.razaoSocial && (
                            <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>{emp.razaoSocial}</span>
                          )}
                          <span style={{ fontSize: 12, color: "var(--foreground-subtle)", fontFamily: "monospace" }}>{emp.cnpj || "Sem CNPJ"}</span>
                          {emp.cidade && emp.uf && (
                            <span style={{ fontSize: 12, color: "var(--foreground-muted)" }}>• {emp.cidade} - {emp.uf}</span>
                          )}
                          <span style={{ fontSize: 11, background: "var(--surface-overlay)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 99, color: "var(--foreground-muted)", fontWeight: 600 }}>Plano {emp.planoNome}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      
                      {/* Botões para Empresas ATIVAS */}
                      {!modoSelecao && abaAtiva === "ativas" && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); iniciarEdicao(emp); }} title="Editar configurações" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "var(--surface-overlay)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground-muted)", cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => {e.currentTarget.style.color="var(--foreground)"; e.currentTarget.style.borderColor="var(--foreground-muted)"}} onMouseLeave={e => {e.currentTarget.style.color="var(--foreground-muted)"; e.currentTarget.style.borderColor="var(--border)"}}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEmpresaParaExcluir(emp); }} title="Arquivar empresa" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, color: "#f59e0b", cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(245,158,11,0.15)"} onMouseLeave={e => e.currentTarget.style.background="rgba(245,158,11,0.05)"}>
                            <Archive size={16} />
                          </button>
                        </>
                      )}
                      
                      {/* Botões para Empresas INATIVAS */}
                      {!modoSelecao && abaAtiva === "inativas" && (
                         <>
                            <button onClick={(e) => { e.stopPropagation(); handleRestaurar(emp); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--surface-overlay)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 10, color: "var(--primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(16,185,129,0.1)"} onMouseLeave={e => e.currentTarget.style.background="var(--surface-overlay)"}>
                              <RotateCcw size={14} /> Restaurar
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setEmpresaParaExcluirPermanente(emp); }} title="Excluir Permanentemente" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#ef4444", cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.15)"} onMouseLeave={e => e.currentTarget.style.background="rgba(239,68,68,0.05)"}>
                              <Trash2 size={16} />
                            </button>
                         </>
                      )}

                      {modoSelecao && abaAtiva === "ativas" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--primary)", borderRadius: 10, color: "#000", fontSize: 13, fontWeight: 700 }}>
                          Acessar <ChevronRight size={16} />
                        </div>
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