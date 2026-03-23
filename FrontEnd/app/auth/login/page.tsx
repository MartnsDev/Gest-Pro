"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, loginComGoogle } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErro(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.senha) { setErro("Preencha todos os campos"); return; }
    setLoading(true); setErro("");
    try {
      await login(form.email, form.senha);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.message === "PLANO_INATIVO") router.push("/pagamento");
      else setErro(err.message || "Credenciais inválidas");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030305", display: "flex", fontFamily: "'DM Mono', monospace", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(16,185,129,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .field-input { width:100%; padding:13px 16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f1f5f9; font-size:14px; font-family:'DM Mono',monospace; outline:none; transition:all .2s; }
        .field-input:focus { border-color:rgba(16,185,129,0.5); background:rgba(16,185,129,0.03); box-shadow:0 0 0 3px rgba(16,185,129,0.08); }
        .field-input::placeholder { color:rgba(241,245,249,0.25); }
        .btn-primary { width:100%; padding:14px; background:#10b981; border:none; border-radius:10px; color:#030305; font-size:14px; font-weight:700; font-family:'DM Mono',monospace; cursor:pointer; letter-spacing:.04em; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-primary:hover:not(:disabled) { background:#34d399; transform:translateY(-1px); box-shadow:0 8px 30px rgba(16,185,129,0.3); }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .btn-google { width:100%; padding:13px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:rgba(241,245,249,0.7); font-size:13px; font-family:'DM Mono',monospace; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:10px; }
        .btn-google:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.07); color:#f1f5f9; transform:translateY(-1px); }
        .link-style { color:rgba(16,185,129,0.8); text-decoration:none; transition:color .2s; }
        .link-style:hover { color:#10b981; }
      `}</style>

      {/* Painel esquerdo — visual */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px", position: "relative", overflow: "hidden",
        borderRight: "1px solid rgba(16,185,129,0.08)",
      }}>
        {/* Grid de pontos */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(16,185,129,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: "20%", left: "30%", width: 600, height: 600, background: "radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1, opacity: mounted ? 1 : 0, transition: "opacity .6s" }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.9"/>
            <rect x="17" y="4" width="11" height="11" rx="2" fill="#10b981" opacity="0.4"/>
            <rect x="4" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.4"/>
            <rect x="17" y="17" width="11" height="11" rx="2" fill="#10b981" opacity="0.7"/>
          </svg>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
            Gest<span style={{ color: "#10b981" }}>Pro</span>
          </span>
        </div>

        {/* Centro — quote */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transition: "all .9s cubic-bezier(0.16,1,0.3,1) .2s",
          }}>
            <div style={{ fontSize: 11, color: "rgba(16,185,129,0.6)", letterSpacing: "0.2em", marginBottom: 20 }}>
              CONTROLE REAL
            </div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 3.5vw, 52px)", letterSpacing: "-0.04em", lineHeight: 1.05, color: "#f1f5f9", marginBottom: 20 }}>
              Sua loja.<br />
              <span style={{ backgroundImage: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Seus dados.
              </span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(241,245,249,0.4)", lineHeight: 1.8, maxWidth: 380 }}>
              PDV, estoque, caixa e relatórios em tempo real. Entre e retome o controle do seu negócio.
            </p>
          </div>

          {/* Mini stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 48,
            opacity: mounted ? 1 : 0,
            transition: "all .9s cubic-bezier(0.16,1,0.3,1) .4s",
          }}>
            {[
              { v: "< 3s", l: "por venda" },
              { v: "100%", l: "tempo real" },
              { v: "4×", l: "pagamentos" },
              { v: "∞", l: "relatórios" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "16px", border: "1px solid rgba(16,185,129,0.1)", borderRadius: 10, background: "rgba(16,185,129,0.03)" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#10b981", letterSpacing: "-0.03em" }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "rgba(241,245,249,0.3)", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div style={{ fontSize: 11, color: "rgba(241,245,249,0.2)", position: "relative", zIndex: 1 }}>
          © 2025 GestPro · Matheus Martins
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div style={{
        width: "clamp(380px, 40%, 520px)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 40px", position: "relative",
      }}>
        <div style={{
          width: "100%", maxWidth: 400,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(32px)",
          transition: "all .8s cubic-bezier(0.16,1,0.3,1) .15s",
        }}>
          {/* Header do form */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 8 }}>
              Bem-vindo de volta
            </h1>
            <p style={{ fontSize: 14, color: "rgba(241,245,249,0.4)" }}>
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Google */}
          <button className="btn-google" onClick={loginComGoogle} style={{ marginBottom: 24 }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          {/* Divisor */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: 11, color: "rgba(241,245,249,0.25)", letterSpacing: "0.1em" }}>OU</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>
                E-MAIL
              </label>
              <input
                className="field-input"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", letterSpacing: "0.05em" }}>SENHA</label>
                <a href="/esqueceu-senha" className="link-style" style={{ fontSize: 12 }}>Esqueceu?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  className="field-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={e => set("senha", e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                  required
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(241,245,249,0.3)", fontSize: 13, padding: 0,
                }}>
                  {showPass ? "✕" : "◉"}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
                {erro}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#030305" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : "Entrar →"}
            </button>
          </form>

          {/* Footer do form */}
          <p style={{ fontSize: 13, color: "rgba(241,245,249,0.35)", textAlign: "center", marginTop: 28 }}>
            Não tem conta?{" "}
            <a href="/auth/cadastro" className="link-style">Criar conta grátis</a>
          </p>

          {/* Volta para landing */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <a href="/" style={{ fontSize: 12, color: "rgba(241,245,249,0.2)", textDecoration: "none", transition: "color .2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(241,245,249,0.5)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,245,249,0.2)")}>
              ← Voltar ao início
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}