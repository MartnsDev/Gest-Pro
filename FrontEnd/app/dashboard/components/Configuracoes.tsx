"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import type { Usuario } from "@/lib/api-v2";
import {
  User,
  Camera,
  Lock,
  Shield,
  Bell,
  HeadphonesIcon,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  Loader2,
  Mail,
  Zap,
  Star,
  Crown,
  Package,
  MessageCircle,
  Copy,
  CheckCircle,
  AlertCircle,
  Upload,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tipos ──────────────────────────────────────────────────────────────── */
interface Perfil {
  id: number;
  nome: string;
  email: string;
  fotoUrl?: string;
  tipoPlano: string;
  diasRestantes: number;
  statusAcesso: string;
  dataAssinatura?: string;
  emailConfirmado: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const API =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gestpro-backend-production.up.railway.app";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("jwt_token") ?? "";
}

async function fetchAuth<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => null);
    throw new Error(e?.mensagem ?? `Erro ${res.status}`);
  }
  return res.json();
}

/* ─── Plano info ─────────────────────────────────────────────────────────── */
const PLANO_INFO: Record<
  string,
  { label: string; cor: string; icon: ReactNode; beneficios: string[] }
> = {
  EXPERIMENTAL: {
    label: "Experimental",
    cor: "#71717a",
    icon: <Package size={18} />,
    beneficios: [
      "1 empresa",
      "1 caixa",
      "Relatórios básicos",
      "Exportação PDF/CSV",
      "30 dias de acesso",
    ],
  },
  BASICO: {
    label: "Básico",
    cor: "#3b82f6",
    icon: <Zap size={18} />,
    beneficios: [
      "1 empresa",
      "1 caixa",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
  },
  PRO: {
    label: "Pro",
    cor: "#a78bfa",
    icon: <Star size={18} />,
    beneficios: [
      "5 empresas",
      "5 caixas simultâneos",
      "Relatórios completos",
      "Exportação PDF/CSV",
      "Suporte prioritário",
    ],
  },
  PREMIUM: {
    label: "Premium",
    cor: "#f59e0b",
    icon: <Crown size={18} />,
    beneficios: [
      "Empresas ilimitadas",
      "Caixas ilimitados",
      "Todos os relatórios",
      "Suporte 24/7",
      "API access",
    ],
  },
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  background: "var(--surface-overlay)",
  border: "1px solid var(--border)",
  borderRadius: 9,
  color: "var(--foreground)",
  fontSize: 14,
  outline: "none",
  transition: "border-color .15s",
};

const card: React.CSSProperties = {
  background: "var(--surface-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "22px 24px",
};

/* ─── Seção wrapper ──────────────────────────────────────────────────────── */
function Secao({
  titulo,
  sub,
  icon,
  children,
}: {
  titulo: string;
  sub?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={card}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--primary-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            {titulo}
          </p>
          {sub && (
            <p
              style={{
                fontSize: 12,
                color: "var(--foreground-muted)",
                margin: "2px 0 0",
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Foto de perfil ─────────────────────────────────────────────────────── */
function FotoPerfil({
  perfil,
  onAtualizado,
}: {
  perfil: Perfil;
  onAtualizado: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Usa fotoUrl diretamente — já é URL completa (Cloudinary ou Google)
  const [preview, setPreview] = useState<string | null>(perfil.fotoUrl || null);

  const iniciais = perfil.nome
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto deve ter menos de 5MB");
      return;
    }

    // Preview instantâneo com blob local enquanto faz upload
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("foto", file);

      const res = await fetch(`${API}/api/v1/configuracoes/perfil/foto`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // NÃO inclua Content-Type aqui — o browser define automaticamente com boundary
        },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.mensagem ?? `Erro ${res.status}`);
      }

      const data = await res.json();
      URL.revokeObjectURL(localUrl);

      // data.fotoUrl é a URL permanente do Cloudinary
      const urlFinal = data.fotoUrl as string;
      setPreview(urlFinal);
      onAtualizado(urlFinal);
      toast.success("Foto atualizada!");
    } catch (e: any) {
      toast.error(e.message);
      URL.revokeObjectURL(localUrl);
      setPreview(perfil.fotoUrl || null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid var(--primary)",
            background: "var(--primary-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {preview ? (
            <img
              src={preview}
              alt="Foto"
              referrerPolicy="no-referrer"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setPreview(null)}
            />
          ) : (
            <span
              style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}
            >
              {iniciais}
            </span>
          )}
        </div>

        {/* Spinner durante upload */}
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader2
              size={20}
              color="#fff"
              style={{ animation: "spin 1s linear infinite" }}
            />
          </div>
        )}

        <button
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--primary)",
            border: "2px solid var(--surface-elevated)",
            cursor: uploading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <Camera size={13} />
        </button>
      </div>

      <div>
        <p
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          {perfil.nome}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--foreground-muted)",
            margin: "3px 0 10px",
          }}
        >
          {perfil.email}
        </p>
        <button
          onClick={() => !uploading && inputRef.current?.click()}
          disabled={uploading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 13px",
            background: "var(--surface-overlay)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground-muted)",
            fontSize: 13,
            cursor: uploading ? "not-allowed" : "pointer",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? (
            <>
              <Loader2
                size={13}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Enviando...
            </>
          ) : (
            <>
              <Upload size={13} />
              Trocar foto
            </>
          )}
        </button>
        <p
          style={{
            fontSize: 11,
            color: "var(--foreground-subtle)",
            margin: "6px 0 0",
          }}
        >
          JPG, PNG ou WebP · Máx 5MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFile}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── FAQ Item ───────────────────────────────────────────────────────────── */
function FaqItem({
  pergunta,
  resposta,
}: {
  pergunta: string;
  resposta: string;
}) {
  const [aberto, setAberto] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <button
        onClick={() => setAberto((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}
        >
          {pergunta}
        </span>
        <ChevronRight
          size={16}
          color="var(--foreground-muted)"
          style={{
            transform: aberto ? "rotate(90deg)" : "none",
            transition: "transform .2s",
            flexShrink: 0,
          }}
        />
      </button>
      {aberto && (
        <p
          style={{
            fontSize: 13,
            color: "var(--foreground-muted)",
            margin: "0 0 13px",
            paddingRight: 24,
          }}
        >
          {resposta}
        </p>
      )}
    </div>
  );
}

/* ─── Formulário suporte ─────────────────────────────────────────────────── */
function FormularioSuporte({
  nomeUsuario,
  emailUsuario,
}: {
  nomeUsuario: string;
  emailUsuario: string;
}) {
  const [assunto, setAssunto] = useState("");
  const [categoria, setCategoria] = useState("Suporte técnico");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);

  const CATEGORIAS = [
    "Suporte técnico",
    "Dúvida sobre plano",
    "Problema com pagamento",
    "Bug / Erro",
    "Outro",
  ];

  const enviar = () => {
    if (!assunto.trim() || !mensagem.trim()) {
      toast.error("Preencha o assunto e a mensagem");
      return;
    }
    const assuntoFull = `[GestPro - ${categoria}] ${assunto}`;
    const corpo = [
      `Nome: ${nomeUsuario}`,
      `E-mail: ${emailUsuario}`,
      `Categoria: ${categoria}`,
      ``,
      `Mensagem:`,
      mensagem,
      ``,
      `---`,
      `Enviado via GestPro`,
    ].join("\n");
    globalThis.window.location.href = `mailto:gestprosuporte@gmail.com?subject=${encodeURIComponent(assuntoFull)}&body=${encodeURIComponent(corpo)}`;
    setEnviado(true);
    setTimeout(() => setEnviado(false), 4000);
  };

  const inp2: React.CSSProperties = {
    width: "100%",
    padding: "10px 13px",
    background: "var(--surface-overlay)",
    border: "1px solid var(--border)",
    borderRadius: 9,
    color: "var(--foreground)",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground-muted)",
            display: "block",
            marginBottom: 6,
          }}
        >
          Categoria
        </label>
        <select
          style={{ ...inp2, cursor: "pointer" }}
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground-muted)",
            display: "block",
            marginBottom: 6,
          }}
        >
          Assunto *
        </label>
        <input
          style={inp2}
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Descreva brevemente..."
        />
      </div>
      <div>
        <label
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--foreground-muted)",
            display: "block",
            marginBottom: 6,
          }}
        >
          Mensagem *
        </label>
        <textarea
          style={{ ...inp2, resize: "vertical", minHeight: 110 }}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Descreva em detalhes..."
        />
      </div>
      <button
        onClick={enviar}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 0",
          background: enviado ? "rgba(16,185,129,.15)" : "var(--primary)",
          border: `1px solid ${enviado ? "var(--primary)" : "transparent"}`,
          borderRadius: 9,
          color: enviado ? "var(--primary)" : "#fff",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          transition: "all .2s",
        }}
      >
        {enviado ? (
          <>
            <CheckCircle size={15} /> E-mail aberto
          </>
        ) : (
          <>
            <Mail size={15} /> Abrir no Gmail
          </>
        )}
      </button>
    </div>
  );
}

/* ─── Componente principal ───────────────────────────────────────────────── */
export default function Configuracoes({
  usuario,
  onFotoAtualizada,
  onNomeAtualizado,
}: {
  usuario?: Usuario;
  onFotoAtualizada?: (url: string) => void;
  onNomeAtualizado?: (nome: string) => void;
}) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<
    "perfil" | "senha" | "plano" | "notificacoes" | "suporte"
  >("perfil");

  const [novoNome, setNovoNome] = useState("");
  const [salvandoNome, setSalvandoNome] = useState(false);

  const [etapaSenha, setEtapaSenha] = useState<"idle" | "enviando" | "codigo">(
    "idle",
  );
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const [notif, setNotif] = useState({
    emailVendas: true,
    emailRelatorios: false,
    alertaEstoqueZerado: true,
    alertaVencimentoPlano: true,
  });
  const [salvandoNotif, setSalvandoNotif] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    fetchAuth<Perfil>("/api/v1/configuracoes/perfil")
      .then((p) => {
        setPerfil(p);
        setNovoNome(p.nome);
      })
      .catch(() => toast.error("Erro ao carregar perfil"))
      .finally(() => setLoading(false));
  }, []);

  const salvarNome = async () => {
    if (!novoNome.trim()) return;
    setSalvandoNome(true);
    try {
      await fetchAuth("/api/v1/configuracoes/perfil/nome", {
        method: "PUT",
        body: JSON.stringify({ nome: novoNome }),
      });
      setPerfil((p) => (p ? { ...p, nome: novoNome } : p));
      onNomeAtualizado?.(novoNome);
      toast.success("Nome atualizado!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvandoNome(false);
    }
  };

  const solicitarCodigo = async () => {
    setEtapaSenha("enviando");
    try {
      await fetchAuth("/api/v1/configuracoes/senha/solicitar-codigo", {
        method: "POST",
      });
      setEtapaSenha("codigo");
      toast.success("Código enviado para seu e-mail!");
    } catch (e: any) {
      toast.error(e.message);
      setEtapaSenha("idle");
    }
  };

  const trocarSenha = async () => {
    if (novaSenha !== confirmar) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("Mínimo 6 caracteres");
      return;
    }
    setSalvandoSenha(true);
    try {
      await fetchAuth("/api/v1/configuracoes/senha/trocar", {
        method: "POST",
        body: JSON.stringify({ codigo, novaSenha, confirmarSenha: confirmar }),
      });
      toast.success("Senha alterada com sucesso!");
      setEtapaSenha("idle");
      setCodigo("");
      setNovaSenha("");
      setConfirmar("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvandoSenha(false);
    }
  };

  const salvarNotif = async () => {
    setSalvandoNotif(true);
    try {
      await fetchAuth("/api/v1/configuracoes/notificacoes", {
        method: "PUT",
        body: JSON.stringify(notif),
      });
      toast.success("Preferências salvas!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSalvandoNotif(false);
    }
  };

  const copiar = (texto: string, chave: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(chave);
    setTimeout(() => setCopiado(null), 2000);
  };

  const plano = perfil
    ? (PLANO_INFO[perfil.tipoPlano] ?? PLANO_INFO["EXPERIMENTAL"])
    : null;
  const urgente = perfil && perfil.diasRestantes <= 5;

  const ABAS = [
    { id: "perfil", label: "Perfil", icon: <User size={15} /> },
    { id: "senha", label: "Senha", icon: <Lock size={15} /> },
    { id: "plano", label: "Meu Plano", icon: <Zap size={15} /> },
    { id: "notificacoes", label: "Notificações", icon: <Bell size={15} /> },
    { id: "suporte", label: "Suporte", icon: <HeadphonesIcon size={15} /> },
  ] as const;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          gap: 10,
          color: "var(--foreground-muted)",
        }}
      >
        <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />{" "}
        Carregando...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  return (
    <div
      style={{
        padding: "28px 28px 48px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        maxWidth: 760,
        margin: "0 auto",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--foreground)",
            margin: 0,
          }}
        >
          Configurações
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--foreground-muted)",
            margin: "4px 0 0",
          }}
        >
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Abas */}
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          background: "var(--surface-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 11,
          padding: 5,
        }}
      >
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAbaAtiva(a.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: abaAtiva === a.id ? 600 : 400,
              background: abaAtiva === a.id ? "var(--primary)" : "transparent",
              color: abaAtiva === a.id ? "#fff" : "var(--foreground-muted)",
              transition: "all .15s",
            }}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      {/* ── PERFIL ─────────────────────────────────────────────────────── */}
      {abaAtiva === "perfil" && perfil && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Secao
            titulo="Foto e Nome"
            sub="Personalize como você aparece no sistema"
            icon={<User size={18} />}
          >
            <FotoPerfil
              perfil={perfil}
              onAtualizado={(url) => {
                setPerfil((p) => (p ? { ...p, fotoUrl: url } : p));
                onFotoAtualizada?.(url);
              }}
            />
            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "20px 0",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground-muted)",
                }}
              >
                Nome completo
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  style={inp}
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && salvarNome()}
                />
                <button
                  onClick={salvarNome}
                  disabled={salvandoNome || novoNome === perfil.nome}
                  style={{
                    padding: "10px 18px",
                    background: "var(--primary)",
                    border: "none",
                    borderRadius: 9,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: salvandoNome || novoNome === perfil.nome ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {salvandoNome ? (
                    <Loader2
                      size={13}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Check size={13} />
                  )}{" "}
                  Salvar
                </button>
              </div>
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground-muted)",
                }}
              >
                E-mail
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  style={{ ...inp, opacity: 0.6, cursor: "not-allowed" }}
                  value={perfil.email}
                  readOnly
                />
                {perfil.emailConfirmado ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      color: "var(--primary)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <CheckCircle size={14} />
                    Confirmado
                  </span>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      color: "var(--warning)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <AlertCircle size={14} />
                    Não confirmado
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--foreground-subtle)",
                  margin: 0,
                }}
              >
                O e-mail não pode ser alterado. Contate o suporte.
              </p>
            </div>
          </Secao>
        </div>
      )}

      {/* ── SENHA ──────────────────────────────────────────────────────── */}
      {abaAtiva === "senha" && (
        <Secao
          titulo="Alterar Senha"
          sub="Um código de verificação será enviado ao seu e-mail"
          icon={<Lock size={18} />}
        >
          {etapaSenha === "idle" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: "var(--foreground-muted)",
                  margin: 0,
                }}
              >
                Para alterar sua senha, enviaremos um código para{" "}
                <strong style={{ color: "var(--foreground)" }}>
                  {perfil?.email}
                </strong>
                .
              </p>
              <button
                onClick={solicitarCodigo}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 20px",
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: 9,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Mail size={15} /> Enviar código por e-mail
              </button>
            </div>
          )}
          {etapaSenha === "enviando" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "var(--foreground-muted)",
                padding: "20px 0",
              }}
            >
              <Loader2
                size={20}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Enviando código...
            </div>
          )}
          {etapaSenha === "codigo" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(16,185,129,.07)",
                  border: "1px solid rgba(16,185,129,.2)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <CheckCircle size={16} color="var(--primary)" />
                <p style={{ fontSize: 13, color: "var(--primary)", margin: 0 }}>
                  Código enviado! Verifique seu e-mail.
                </p>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Código de verificação
                </label>
                <input
                  style={{
                    ...inp,
                    letterSpacing: "0.3em",
                    fontSize: 18,
                    textAlign: "center",
                    maxWidth: 200,
                  }}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nova senha
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={inp}
                    type={showSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    onClick={() => setShowSenha((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground-muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Confirmar senha
                </label>
                <input
                  style={{
                    ...inp,
                    borderColor:
                      confirmar && confirmar !== novaSenha
                        ? "var(--destructive)"
                        : "var(--border)",
                  }}
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Repita a nova senha"
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    setEtapaSenha("idle");
                    setCodigo("");
                    setNovaSenha("");
                    setConfirmar("");
                  }}
                  style={{
                    padding: "10px 16px",
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
                  onClick={trocarSenha}
                  disabled={
                    salvandoSenha ||
                    !codigo ||
                    !novaSenha ||
                    novaSenha !== confirmar
                  }
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "var(--primary)",
                    border: "none",
                    borderRadius: 9,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity:
                      salvandoSenha ||
                      !codigo ||
                      !novaSenha ||
                      novaSenha !== confirmar
                        ? 0.6
                        : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {salvandoSenha ? (
                    <Loader2
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Check size={14} />
                  )}{" "}
                  Confirmar nova senha
                </button>
              </div>
            </div>
          )}
        </Secao>
      )}

      {/* ── PLANO ──────────────────────────────────────────────────────── */}
      {abaAtiva === "plano" && perfil && plano && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              ...card,
              border: `1px solid ${plano.cor}40`,
              background: `${plano.cor}08`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: plano.cor }}>{plano.icon}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      color: plano.cor,
                    }}
                  >
                    Plano Atual
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: plano.cor,
                    margin: "0 0 6px",
                  }}
                >
                  {plano.label}
                </h3>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div
                  style={{
                    padding: "10px 16px",
                    background: urgente
                      ? "rgba(239,68,68,.1)"
                      : "rgba(16,185,129,.1)",
                    border: `1px solid ${urgente ? "rgba(239,68,68,.3)" : "rgba(16,185,129,.3)"}`,
                    borderRadius: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--foreground-muted)",
                      margin: "0 0 2px",
                      fontWeight: 600,
                    }}
                  >
                    Restam
                  </p>
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      color: urgente ? "var(--destructive)" : "var(--primary)",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {perfil.diasRestantes}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--foreground-muted)",
                      margin: "2px 0 0",
                    }}
                  >
                    dias
                  </p>
                </div>
              </div>
            </div>
            {urgente && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "rgba(239,68,68,.08)",
                  border: "1px solid rgba(239,68,68,.2)",
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <AlertCircle size={16} color="var(--destructive)" />
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--destructive)",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  Seu plano vence em breve! Renove para não perder o acesso.
                </p>
              </div>
            )}
          </div>
          <Secao titulo="Benefícios do seu plano" icon={<Sparkles size={18} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {plano.beneficios.map((b) => (
                <div
                  key={b}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--primary-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check size={13} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: 14, color: "var(--foreground)" }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </Secao>
        </div>
      )}

      {/* ── NOTIFICAÇÕES ───────────────────────────────────────────────── */}
      {abaAtiva === "notificacoes" && (
        <Secao
          titulo="Preferências de Notificação"
          sub="Escolha quando e como ser notificado"
          icon={<Bell size={15} />}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              {
                k: "emailVendas",
                l: "E-mail ao registrar venda",
                sub: "Receba um resumo a cada venda",
              },
              {
                k: "emailRelatorios",
                l: "Relatório semanal por e-mail",
                sub: "Resumo automático toda segunda",
              },
              {
                k: "alertaEstoqueZerado",
                l: "Alerta de estoque zerado",
                sub: "Notificação quando produto zera",
              },
              {
                k: "alertaVencimentoPlano",
                l: "Aviso de vencimento do plano",
                sub: "Alerta 7 e 3 dias antes",
              },
            ].map((item, i) => (
              <div
                key={item.k}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 0",
                  borderBottom:
                    i < 3 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--foreground)",
                      margin: 0,
                    }}
                  >
                    {item.l}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--foreground-muted)",
                      margin: "3px 0 0",
                    }}
                  >
                    {item.sub}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotif((n) => ({
                      ...n,
                      [item.k]: !n[item.k as keyof typeof n],
                    }))
                  }
                  style={{
                    width: 46,
                    height: 26,
                    borderRadius: 99,
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                    background: notif[item.k as keyof typeof notif]
                      ? "var(--primary)"
                      : "var(--border)",
                    transition: "background .2s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 3,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left .2s",
                      left: notif[item.k as keyof typeof notif] ? 23 : 3,
                      boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={salvarNotif}
            disabled={salvandoNotif}
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 20px",
              background: "var(--primary)",
              border: "none",
              borderRadius: 9,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              opacity: salvandoNotif ? 0.7 : 1,
            }}
          >
            {salvandoNotif ? (
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Check size={14} />
            )}{" "}
            Salvar preferências
          </button>
        </Secao>
      )}

      {/* ── SUPORTE ────────────────────────────────────────────────────── */}
      {abaAtiva === "suporte" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Secao
            titulo="Enviar mensagem"
            sub="Abriremos direto no seu Gmail"
            icon={<Mail size={18} />}
          >
            <FormularioSuporte
              nomeUsuario={perfil?.nome ?? ""}
              emailUsuario={perfil?.email ?? ""}
            />
          </Secao>
          <Secao
            titulo="Outros canais"
            sub="Prefere falar diretamente?"
            icon={<HeadphonesIcon size={18} />}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                {
                  chave: "email",
                  label: "E-mail",
                  valor: "gestprosuporte@gmail.com",
                  cor: "#3b82f6",
                  href: "mailto:gestprosuporte@gmail.com",
                  sub: "Respondemos em até 24h úteis",
                  btnLabel: "Abrir",
                  icon: <Mail size={18} color="#3b82f6" />,
                },
                {
                  chave: "whatsapp",
                  label: "WhatsApp",
                  valor: "(11) 93264-9629",
                  cor: "#25d366",
                  href: `https://wa.me/5511932649629?text=${encodeURIComponent("Olá! Preciso de suporte no GestPro.")}`,
                  sub: "Seg–Sáb, das 9h às 18h",
                  btnLabel: "Abrir chat",
                  icon: <MessageCircle size={18} color="#25d366" />,
                },
              ].map((canal) => (
                <div
                  key={canal.chave}
                  style={{
                    padding: "14px 16px",
                    background: "var(--surface-overlay)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: `${canal.cor}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {canal.icon}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--foreground-muted)",
                          textTransform: "uppercase",
                          letterSpacing: ".06em",
                          margin: "0 0 3px",
                        }}
                      >
                        {canal.label}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--foreground)",
                          margin: 0,
                        }}
                      >
                        {canal.valor}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--foreground-muted)",
                          margin: "2px 0 0",
                        }}
                      >
                        {canal.sub}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => copiar(canal.valor, canal.chave)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 11px",
                        background:
                          copiado === canal.chave
                            ? "var(--primary-muted)"
                            : "transparent",
                        border: `1px solid ${copiado === canal.chave ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 12,
                        color:
                          copiado === canal.chave
                            ? "var(--primary)"
                            : "var(--foreground-muted)",
                      }}
                    >
                      {copiado === canal.chave ? (
                        <>
                          <Check size={12} />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          Copiar
                        </>
                      )}
                    </button>
                    <a
                      href={canal.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "7px 11px",
                        background: canal.cor,
                        borderRadius: 8,
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      {canal.btnLabel}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Secao>
          <Secao titulo="Perguntas Frequentes" icon={<Shield size={18} />}>
            {[
              {
                p: "Como faço upgrade de plano?",
                r: "Entre em contato via e-mail ou WhatsApp.",
              },
              {
                p: "Posso cancelar meu plano?",
                r: "Sim. Sem multas. Acesso até o vencimento.",
              },
              {
                p: "Meus dados são seguros?",
                r: "Sim. Dados criptografados em servidores no Brasil.",
              },
              {
                p: "Como exporto meus dados?",
                r: "Na aba Relatórios — CSV, PDF ou HTML.",
              },
              {
                p: "Esqueci minha senha, o que fazer?",
                r: "Na tela de login clique em 'Esqueci minha senha'.",
              },
            ].map((item, i) => (
              <FaqItem key={i} pergunta={item.p} resposta={item.r} />
            ))}
          </Secao>
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p
              style={{
                fontSize: 12,
                color: "var(--foreground-subtle)",
                margin: 0,
              }}
            >
              GestPro v1.0.0 · Feito com ❤️ no Brasil
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
