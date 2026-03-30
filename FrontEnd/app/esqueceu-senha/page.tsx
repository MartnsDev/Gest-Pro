"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-v2";

export default function EsqueceuSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const senhaMatch = novaSenha === confirmar && confirmar.length > 0;
  const senhaForte =
    novaSenha.length >= 6 && /[A-Za-z]/.test(novaSenha) && /\d/.test(novaSenha);
  const senhaScore = [
    novaSenha.length >= 6,
    /[A-Z]/.test(novaSenha),
    /[0-9]/.test(novaSenha),
    novaSenha.length >= 10,
  ].filter(Boolean).length;
  const senhaCor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][senhaScore];
  const senhaLabel = ["", "Fraca", "Razoável", "Boa", "Forte"][senhaScore];

  const enviarCodigo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      setErro("Informe seu e-mail");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/esqueceu-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      if (res.ok) {
        setStep(2);
        setTimer(60);
      } else if (res.status === 404) setErro("E-mail não encontrado.");
      else setErro("Erro ao enviar código. Tente novamente.");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const redefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo) {
      setErro("Informe o código recebido");
      return;
    }
    if (!senhaForte) {
      setErro("Senha deve ter ao menos 6 chars com letras e números");
      return;
    }
    if (!senhaMatch) {
      setErro("As senhas não coincidem");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, novaSenha }),
        credentials: "include",
      });
      if (res.ok) {
        setSucesso(true);
      } else if (res.status === 400) setErro("Código inválido ou expirado.");
      else setErro("Erro ao redefinir senha.");
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="forgot-layout"
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        display: "flex",
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.15); }
          50% { box-shadow: 0 0 40px rgba(16,185,129,0.3); }
        }
        @keyframes dash {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }

        .g-input {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        .g-input:focus {
          border-color: rgba(16,185,129,0.5);
          background: rgba(16,185,129,0.04);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
        }
        .g-input::placeholder { color: rgba(255,255,255,0.2); }
        .g-input:disabled { opacity: 0.45; cursor: not-allowed; }

        .g-input-code {
          letter-spacing: 0.3em;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
        }

        .g-btn-primary {
          width: 100%;
          padding: 13px;
          background: #10b981;
          border: none;
          border-radius: 10px;
          color: #0a0a0f;
          font-size: 14px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.01em;
        }
        .g-btn-primary:hover:not(:disabled) {
          background: #34d399;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(16,185,129,0.35);
        }
        .g-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .g-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .g-btn-ghost {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .g-btn-ghost:hover:not(:disabled) {
          border-color: rgba(16,185,129,0.3);
          color: #10b981;
          background: rgba(16,185,129,0.04);
        }
        .g-btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

        .g-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        .left-panel-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: border-color .2s;
        }
        .left-panel-stat:hover { border-color: rgba(16,185,129,0.2); }

        .step-dot {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          transition: all .35s cubic-bezier(0.16,1,0.3,1);
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .forgot-left-panel { display: none !important; }
          .forgot-right-panel {
            max-width: none !important;
            border-left: none !important;
            padding: 28px 20px !important;
            min-height: 100vh;
          }
          .forgot-form-wrap {
            max-width: 100% !important;
            width: 100%;
          }
          .forgot-logo { margin-bottom: 28px !important; }
          .forgot-title { font-size: 23px !important; }
          .forgot-steps { margin-bottom: 24px !important; }
        }
      `}</style>

      {/* ── PAINEL ESQUERDO (decorativo, igual ao login/cadastro) ── */}
      <div
        className="forgot-left-panel"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid de fundo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow central */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "30%",
            transform: "translate(-50%,-50%)",
            width: 500,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 65%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 99,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#10b981",
                letterSpacing: "0.05em",
              }}
            >
              RECUPERAÇÃO DE ACESSO
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontSize: 38,
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#f1f5f9",
              marginBottom: 14,
              letterSpacing: "-0.02em",
            }}
          >
            Sua loja.
            <br />
            <span style={{ color: "#10b981" }}>Seus dados.</span>
          </h2>

          <p
            style={{
              fontSize: 15,
              color: "rgba(241,245,249,0.45)",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 320,
            }}
          >
            PDV, estoque, caixa e relatórios em tempo real. Entre e retome o
            controle do seu negócio.
          </p>

          {/* Stats — igual à tela de login */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              maxWidth: 340,
            }}
          >
            {[
              { value: "< 3s", label: "por venda" },
              { value: "100%", label: "tempo real" },
              { value: "4×", label: "pagamentos" },
              { value: "∞", label: "relatórios" },
            ].map((s) => (
              <div key={s.label} className="left-panel-stat">
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#10b981",
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </span>
                <span style={{ fontSize: 12, color: "rgba(241,245,249,0.35)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer esquerdo */}
        <p
          style={{
            position: "absolute",
            bottom: 28,
            left: 64,
            fontSize: 12,
            color: "rgba(241,245,249,0.18)",
          }}
        >
          © 2025 GestPro · Matheus Martins
        </p>
      </div>

      {/* ── PAINEL DIREITO (formulário) ── */}
      <div
        className="forgot-right-panel"
        style={{
          width: "100%",
          maxWidth: 520,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.01)",
          backdropFilter: "blur(4px)",
          position: "relative",
        }}
      >
        <div
          className="forgot-form-wrap"
          style={{
            width: "100%",
            maxWidth: 400,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
            transition: "all .7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Logo */}
          <a
            className="forgot-logo"
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 40,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <rect
                x="3"
                y="3"
                width="12"
                height="12"
                rx="3"
                fill="#10b981"
                opacity="0.9"
              />
              <rect
                x="17"
                y="3"
                width="12"
                height="12"
                rx="3"
                fill="#10b981"
                opacity="0.35"
              />
              <rect
                x="3"
                y="17"
                width="12"
                height="12"
                rx="3"
                fill="#10b981"
                opacity="0.35"
              />
              <rect
                x="17"
                y="17"
                width="12"
                height="12"
                rx="3"
                fill="#10b981"
                opacity="0.65"
              />
            </svg>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#f1f5f9",
                letterSpacing: "-0.02em",
              }}
            >
              Gest<span style={{ color: "#10b981" }}>Pro</span>
            </span>
          </a>

          {/* ── SUCESSO ── */}
          {sucesso ? (
            <div
              style={{
                animation: "scaleIn .5s cubic-bezier(0.16,1,0.3,1) both",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  animation: "pulse-glow 2.5s ease-in-out infinite",
                }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="100"
                    style={{ animation: "dash .6s .2s ease both" }}
                  />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                }}
              >
                Senha redefinida!
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(241,245,249,0.4)",
                  lineHeight: 1.7,
                  marginBottom: 32,
                }}
              >
                Sua senha foi atualizada com sucesso.
                <br />
                Faça login com sua nova senha.
              </p>
              <button
                onClick={() => router.push("/auth/login")}
                className="g-btn-primary"
              >
                Ir para o login →
              </button>
            </div>
          ) : (
            <>
              {/* Cabeçalho do form */}
              <div style={{ marginBottom: 32 }}>
                <h1
                  className="forgot-title"
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#f1f5f9",
                    letterSpacing: "-0.02em",
                    marginBottom: 8,
                  }}
                >
                  {step === 1 ? "Esqueceu a senha?" : "Nova senha"}
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: "rgba(241,245,249,0.38)",
                    lineHeight: 1.65,
                  }}
                >
                  {step === 1 ? (
                    "Informe seu e-mail e enviaremos um código de verificação."
                  ) : (
                    <>
                      Código enviado para{" "}
                      <span style={{ color: "#10b981", fontWeight: 500 }}>
                        {email}
                      </span>
                      . Crie sua nova senha.
                    </>
                  )}
                </p>
              </div>

              {/* Steps indicator */}
              <div
                className="forgot-steps"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0,
                  marginBottom: 32,
                }}
              >
                {[
                  { n: 1, label: "E-mail" },
                  { n: 2, label: "Nova senha" },
                ].map(({ n, label }, i) => (
                  <div
                    key={n}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: i === 0 ? 1 : "none",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        className="step-dot"
                        style={{
                          background:
                            step >= n ? "#10b981" : "rgba(255,255,255,0.05)",
                          border: `1px solid ${step >= n ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                          color:
                            step >= n ? "#0a0a0f" : "rgba(255,255,255,0.25)",
                        }}
                      >
                        {step > n ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M5 12l5 5L20 7"
                              stroke="#0a0a0f"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          n
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color:
                            step >= n
                              ? "rgba(241,245,249,0.7)"
                              : "rgba(241,245,249,0.22)",
                          transition: "color .3s",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    {i === 0 && (
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          margin: "0 12px",
                          background:
                            step >= 2 ? "#10b981" : "rgba(255,255,255,0.07)",
                          transition: "background .4s",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <form
                  onSubmit={enviarCodigo}
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  <div>
                    <label className="g-label">E-MAIL</label>
                    <input
                      className="g-input"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErro("");
                      }}
                      disabled={loading}
                      autoFocus
                      required
                    />
                  </div>

                  {erro && <ErrorBox msg={erro} />}

                  <button
                    type="submit"
                    className="g-btn-primary"
                    disabled={loading}
                  >
                    {loading ? <Spinner /> : "Enviar código →"}
                  </button>

                  <div style={{ textAlign: "center", paddingTop: 4 }}>
                    <a
                      href="/auth/login"
                      style={{
                        fontSize: 13,
                        color: "rgba(241,245,249,0.35)",
                        textDecoration: "none",
                        transition: "color .2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(241,245,249,0.7)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(241,245,249,0.35)")
                      }
                    >
                      ← Voltar ao login
                    </a>
                  </div>
                </form>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form
                  onSubmit={redefinirSenha}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    animation: "slideRight .35s ease both",
                  }}
                >
                  {/* Código */}
                  <div>
                    <label className="g-label">CÓDIGO DE VERIFICAÇÃO</label>
                    <input
                      className="g-input g-input-code"
                      type="text"
                      placeholder="· · · · · · · ·"
                      value={codigo}
                      onChange={(e) => {
                        setCodigo(e.target.value.toUpperCase());
                        setErro("");
                      }}
                      maxLength={8}
                      disabled={loading}
                      autoFocus
                      required
                    />
                    <p
                      style={{
                        fontSize: 11,
                        color: "rgba(241,245,249,0.28)",
                        marginTop: 6,
                      }}
                    >
                      Verifique sua caixa de entrada e spam
                    </p>
                  </div>

                  {/* Nova senha */}
                  <div>
                    <label className="g-label">NOVA SENHA</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="g-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Mín. 6 chars com letras e números"
                        value={novaSenha}
                        onChange={(e) => {
                          setNovaSenha(e.target.value);
                          setErro("");
                        }}
                        disabled={loading}
                        style={{ paddingRight: 48 }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        style={{
                          position: "absolute",
                          right: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "rgba(241,245,249,0.3)",
                          fontSize: 12,
                          padding: 0,
                          transition: "color .2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(241,245,249,0.7)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(241,245,249,0.3)")
                        }
                      >
                        {showPass ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>

                    {/* Barra de força */}
                    {novaSenha.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{ display: "flex", gap: 4, marginBottom: 6 }}
                        >
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 2,
                                background:
                                  i <= senhaScore
                                    ? senhaCor
                                    : "rgba(255,255,255,0.07)",
                                transition: "background .25s",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: senhaCor,
                            fontWeight: 500,
                          }}
                        >
                          {senhaLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirmar senha */}
                  <div>
                    <label className="g-label">CONFIRMAR SENHA</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="g-input"
                        type="password"
                        placeholder="Repita a nova senha"
                        value={confirmar}
                        onChange={(e) => {
                          setConfirmar(e.target.value);
                          setErro("");
                        }}
                        disabled={loading}
                        style={{
                          paddingRight: 44,
                          borderColor:
                            confirmar.length > 0
                              ? senhaMatch
                                ? "rgba(16,185,129,0.45)"
                                : "rgba(239,68,68,0.4)"
                              : undefined,
                        }}
                        required
                      />
                      {confirmar.length > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: 13,
                            color: senhaMatch ? "#10b981" : "#ef4444",
                            transition: "color .2s",
                          }}
                        >
                          {senhaMatch ? "✓" : "✕"}
                        </span>
                      )}
                    </div>
                  </div>

                  {erro && <ErrorBox msg={erro} />}

                  <button
                    type="submit"
                    className="g-btn-primary"
                    disabled={loading || !senhaForte || !senhaMatch || !codigo}
                  >
                    {loading ? <Spinner dark /> : "Redefinir senha →"}
                  </button>

                  {/* Reenviar */}
                  <button
                    type="button"
                    onClick={() => enviarCodigo()}
                    disabled={timer > 0 || loading}
                    className="g-btn-ghost"
                  >
                    {timer > 0 ? (
                      <>⏳ Reenviar em {timer}s</>
                    ) : (
                      <>↺ Reenviar código</>
                    )}
                  </button>

                  {/* Trocar e-mail */}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErro("");
                      setCodigo("");
                      setNovaSenha("");
                      setConfirmar("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(241,245,249,0.25)",
                      fontSize: 12,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      textAlign: "center",
                      padding: "2px 0",
                      transition: "color .2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "rgba(241,245,249,0.55)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(241,245,249,0.25)")
                    }
                  >
                    ← Trocar e-mail
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-componentes ── */
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div
      style={{
        padding: "11px 14px",
        background: "rgba(239,68,68,0.07)",
        border: "1px solid rgba(239,68,68,0.18)",
        borderRadius: 9,
        fontSize: 13,
        color: "#f87171",
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
      }}
    >
      <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
      {msg}
    </div>
  );
}

function Spinner({ dark }: { dark?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={dark ? "rgba(10,10,15,0.3)" : "rgba(255,255,255,0.25)"}
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={dark ? "#0a0a0f" : "white"}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
