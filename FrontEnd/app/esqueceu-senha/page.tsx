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

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const senhaMatch = novaSenha === confirmar && confirmar.length > 0;
  const senhaForte = novaSenha.length >= 6 && /[A-Za-z]/.test(novaSenha) && /\d/.test(novaSenha);

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
    if (!email) { setErro("Informe seu e-mail"); return; }
    setLoading(true); setErro("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/esqueceu-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      if (res.ok) { setStep(2); setTimer(60); }
      else if (res.status === 404) setErro("E-mail não encontrado.");
      else setErro("Erro ao enviar código. Tente novamente.");
    } catch { setErro("Erro ao conectar com o servidor."); }
    finally { setLoading(false); }
  };

  const redefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo) { setErro("Informe o código recebido"); return; }
    if (!senhaForte) { setErro("Senha deve ter ao menos 6 chars com letras e números"); return; }
    if (!senhaMatch) { setErro("As senhas não coincidem"); return; }
    setLoading(true); setErro("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, novaSenha }),
        credentials: "include",
      });
      if (res.ok) { setSucesso(true); }
      else if (res.status === 400) setErro("Código inválido ou expirado.");
      else setErro("Erro ao redefinir senha.");
    } catch { setErro("Erro ao conectar com o servidor."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030305", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace", padding: "24px", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(16,185,129,0.25); }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes checkIn { from { transform:scale(0) rotate(-45deg); opacity:0; } to { transform:scale(1) rotate(0deg); opacity:1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .field-input { width:100%; padding:13px 16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f1f5f9; font-size:14px; font-family:'DM Mono',monospace; outline:none; transition:all .2s; }
        .field-input:focus { border-color:rgba(16,185,129,0.5); background:rgba(16,185,129,0.03); box-shadow:0 0 0 3px rgba(16,185,129,0.08); }
        .field-input::placeholder { color:rgba(241,245,249,0.25); }
        .field-input:disabled { opacity:.5; cursor:not-allowed; }
        .btn-primary { width:100%; padding:14px; background:#10b981; border:none; border-radius:10px; color:#030305; font-size:14px; font-weight:700; font-family:'DM Mono',monospace; cursor:pointer; letter-spacing:.04em; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-primary:hover:not(:disabled) { background:#34d399; transform:translateY(-1px); box-shadow:0 8px 30px rgba(16,185,129,0.3); }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .btn-ghost { width:100%; padding:12px; background:transparent; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:rgba(241,245,249,0.5); font-size:13px; font-family:'DM Mono',monospace; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-ghost:hover:not(:disabled) { border-color:rgba(16,185,129,0.3); color:#10b981; }
        .btn-ghost:disabled { opacity:.4; cursor:not-allowed; }
        .link-style { color:rgba(16,185,129,0.8); text-decoration:none; transition:color .2s; }
        .link-style:hover { color:#10b981; }
      `}</style>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(16,185,129,0.1) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%)" }} />
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: 440, position: "relative", zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(24px)",
        transition: "all .8s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Logo + voltar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.9"/>
              <rect x="17" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.4"/>
              <rect x="4" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.4"/>
              <rect x="17" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.7"/>
            </svg>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
              Gest<span style={{ color: "#10b981" }}>Pro</span>
            </span>
          </a>
          <a href="/auth/login" className="link-style" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            ← Voltar ao login
          </a>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "36px 32px",
          backdropFilter: "blur(20px)",
        }}>

          {/* ── SUCESSO ── */}
          {sucesso ? (
            <div style={{ textAlign: "center", animation: "fadeUp .5s ease both" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px", animation: "checkIn .5s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 12 }}>
                Senha redefinida!
              </h2>
              <p style={{ fontSize: 14, color: "rgba(241,245,249,0.45)", lineHeight: 1.75, marginBottom: 28 }}>
                Sua senha foi atualizada com sucesso. Faça login com sua nova senha.
              </p>
              <button onClick={() => router.push("/auth/login")} className="btn-primary">
                Ir para o login →
              </button>
            </div>

          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 8 }}>
                  {step === 1 ? "Esqueceu a senha?" : "Nova senha"}
                </h1>
                <p style={{ fontSize: 13, color: "rgba(241,245,249,0.4)", lineHeight: 1.6 }}>
                  {step === 1
                    ? "Informe seu e-mail e enviaremos um código de verificação."
                    : <>Código enviado para <span style={{ color: "#10b981" }}>{email}</span>. Crie sua nova senha.</>}
                </p>
              </div>

              {/* Steps */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
                {[1, 2].map((n, i) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, flex: n < 2 ? 1 : "none" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      background: step >= n ? "#10b981" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${step >= n ? "#10b981" : "rgba(255,255,255,0.1)"}`,
                      color: step >= n ? "#030305" : "rgba(241,245,249,0.3)",
                      transition: "all .3s",
                    }}>
                      {step > n ? "✓" : n}
                    </div>
                    <span style={{ fontSize: 12, color: step >= n ? "rgba(241,245,249,0.7)" : "rgba(241,245,249,0.25)", transition: "color .3s" }}>
                      {n === 1 ? "E-mail" : "Nova senha"}
                    </span>
                    {n < 2 && <div style={{ flex: 1, height: 1, background: step >= 2 ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)", transition: "background .3s" }} />}
                  </div>
                ))}
              </div>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <form onSubmit={enviarCodigo} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>E-MAIL</label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErro(""); }}
                      disabled={loading}
                      autoFocus
                      required
                    />
                  </div>

                  {erro && (
                    <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
                      {erro}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#030305" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    ) : "Enviar código →"}
                  </button>
                </form>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={redefinirSenha} style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp .4s ease both" }}>
                  <div>
                    <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>CÓDIGO DE VERIFICAÇÃO</label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Ex: A1B2C3D4"
                      value={codigo}
                      onChange={e => { setCodigo(e.target.value); setErro(""); }}
                      maxLength={8}
                      disabled={loading}
                      autoFocus
                      required
                      style={{ letterSpacing: "0.15em", fontSize: 16 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>NOVA SENHA</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="field-input"
                        type={showPass ? "text" : "password"}
                        placeholder="Mín. 6 chars com letras e números"
                        value={novaSenha}
                        onChange={e => { setNovaSenha(e.target.value); setErro(""); }}
                        disabled={loading}
                        style={{ paddingRight: 44 }}
                        required
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(241,245,249,0.3)", padding: 0, fontSize: 13 }}>
                        {showPass ? "✕" : "◉"}
                      </button>
                    </div>
                    {novaSenha.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= senhaScore ? senhaCor : "rgba(255,255,255,0.08)", transition: "background .3s" }} />
                          ))}
                        </div>
                        <p style={{ fontSize: 11, color: senhaCor, marginTop: 5 }}>{senhaLabel}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>CONFIRMAR SENHA</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="field-input"
                        type="password"
                        placeholder="Repita a nova senha"
                        value={confirmar}
                        onChange={e => { setConfirmar(e.target.value); setErro(""); }}
                        disabled={loading}
                        style={{
                          paddingRight: 44,
                          borderColor: confirmar.length > 0 ? (senhaMatch ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)") : undefined,
                        }}
                        required
                      />
                      {confirmar.length > 0 && (
                        <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: senhaMatch ? "#10b981" : "#ef4444" }}>
                          {senhaMatch ? "✓" : "✕"}
                        </span>
                      )}
                    </div>
                  </div>

                  {erro && (
                    <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
                      {erro}
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={loading || !senhaForte || !senhaMatch}>
                    {loading ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#030305" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    ) : "Redefinir senha →"}
                  </button>

                  {/* Reenviar */}
                  <button
                    type="button"
                    onClick={() => enviarCodigo()}
                    disabled={timer > 0 || loading}
                    className="btn-ghost"
                  >
                    ↺ {timer > 0 ? `Reenviar em ${timer}s` : "Reenviar código"}
                  </button>

                  {/* Trocar e-mail */}
                  <button type="button" onClick={() => { setStep(1); setErro(""); setCodigo(""); setNovaSenha(""); setConfirmar(""); }} style={{ background: "none", border: "none", color: "rgba(241,245,249,0.3)", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", textAlign: "center", transition: "color .2s", padding: "4px 0" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(241,245,249,0.6)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,245,249,0.3)")}>
                    Trocar e-mail
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{ fontSize: 12, color: "rgba(241,245,249,0.18)", textAlign: "center", marginTop: 24 }}>
          Sua loja organizada, suas vendas garantidas
        </p>
      </div>
    </div>
  );
}