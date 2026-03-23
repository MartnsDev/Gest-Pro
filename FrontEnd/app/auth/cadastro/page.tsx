"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cadastrar, loginComGoogle } from "@/lib/api";

export default function CadastroPage() {
  const router = useRouter();
  const fotoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 1 = dados, 2 = sucesso

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErro(""); };

  const senhaForte = form.senha.length >= 6 && /[A-Za-z]/.test(form.senha) && /\d/.test(form.senha);
  const senhaMatch = form.senha === form.confirmar && form.confirmar.length > 0;

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    const reader = new FileReader();
    reader.onload = ev => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) { setErro("Nome é obrigatório"); return; }
    if (!form.email) { setErro("E-mail é obrigatório"); return; }
    if (!senhaForte) { setErro("Senha deve ter ao menos 6 caracteres com letras e números"); return; }
    if (form.confirmar && !senhaMatch) { setErro("As senhas não conferem"); return; }

    setLoading(true); setErro("");
    try {
      await cadastrar(form.nome, form.email, form.senha, foto || undefined);
      setStep(2);
    } catch (err: any) {
      setErro(err.message || "Erro ao cadastrar. Tente novamente.");
    } finally { setLoading(false); }
  };

  // Força da senha
  const senhaScore = [
    form.senha.length >= 6,
    /[A-Z]/.test(form.senha),
    /[0-9]/.test(form.senha),
    form.senha.length >= 10,
  ].filter(Boolean).length;

  const senhaLabel = ["", "Fraca", "Razoável", "Boa", "Forte"][senhaScore];
  const senhaCor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][senhaScore];

  return (
    <div style={{ minHeight: "100vh", background: "#030305", display: "flex", fontFamily: "'DM Mono', monospace", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(16,185,129,0.25); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes checkIn { from { transform:scale(0) rotate(-45deg); opacity:0; } to { transform:scale(1) rotate(0deg); opacity:1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .field-input { width:100%; padding:12px 16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f1f5f9; font-size:14px; font-family:'DM Mono',monospace; outline:none; transition:all .2s; }
        .field-input:focus { border-color:rgba(16,185,129,0.5); background:rgba(16,185,129,0.03); box-shadow:0 0 0 3px rgba(16,185,129,0.08); }
        .field-input::placeholder { color:rgba(241,245,249,0.25); }
        .btn-primary { width:100%; padding:14px; background:#10b981; border:none; border-radius:10px; color:#030305; font-size:14px; font-weight:700; font-family:'DM Mono',monospace; cursor:pointer; letter-spacing:.04em; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .btn-primary:hover:not(:disabled) { background:#34d399; transform:translateY(-1px); box-shadow:0 8px 30px rgba(16,185,129,0.3); }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
        .btn-google { width:100%; padding:12px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:rgba(241,245,249,0.7); font-size:13px; font-family:'DM Mono',monospace; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:10px; }
        .btn-google:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.07); color:#f1f5f9; transform:translateY(-1px); }
        .link-style { color:rgba(16,185,129,0.8); text-decoration:none; transition:color .2s; }
        .link-style:hover { color:#10b981; }
      `}</style>

      {/* Painel esquerdo */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px", position: "relative", overflow: "hidden",
        borderRight: "1px solid rgba(16,185,129,0.08)",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(16,185,129,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />
        <div style={{ position: "absolute", top: "25%", left: "25%", width: 500, height: 500, background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

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

        {/* Benefícios */}
        <div style={{ position: "relative", zIndex: 1, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all .9s cubic-bezier(0.16,1,0.3,1) .2s" }}>
          <div style={{ fontSize: 11, color: "rgba(16,185,129,0.6)", letterSpacing: "0.2em", marginBottom: 20 }}>COMECE GRÁTIS</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 3vw, 48px)", letterSpacing: "-0.04em", lineHeight: 1.1, color: "#f1f5f9", marginBottom: 40 }}>
            7 dias para<br />
            <span style={{ backgroundImage: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              experimentar tudo.
            </span>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "◆", text: "Sem cartão de crédito" },
              { icon: "◆", text: "PDV completo desde o dia 1" },
              { icon: "◆", text: "Estoque, caixa e relatórios" },
              { icon: "◆", text: "Login com Google ou e-mail" },
              { icon: "◆", text: "Dados seguros com JWT + OAuth2" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                opacity: mounted ? 1 : 0,
                transition: `all .6s cubic-bezier(0.16,1,0.3,1) ${.35 + i * .08}s`,
                transform: mounted ? "translateX(0)" : "translateX(-16px)",
              }}>
                <span style={{ fontSize: 8, color: "#10b981" }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: "rgba(241,245,249,0.55)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(241,245,249,0.2)", position: "relative", zIndex: 1 }}>
          © 2025 GestPro · Matheus Martins
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div style={{
        width: "clamp(400px, 45%, 560px)", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 40px", overflowY: "auto",
      }}>
        <div style={{
          width: "100%", maxWidth: 440,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(32px)",
          transition: "all .8s cubic-bezier(0.16,1,0.3,1) .15s",
        }}>

          {/* ── STEP 2: Sucesso ── */}
          {step === 2 ? (
            <div style={{ textAlign: "center", padding: "20px 0", animation: "fadeUp .6s ease both" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 28px",
                animation: "checkIn .5s cubic-bezier(0.16,1,0.3,1) both",
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 12 }}>
                Conta criada!
              </h2>
              <p style={{ fontSize: 14, color: "rgba(241,245,249,0.45)", lineHeight: 1.75, marginBottom: 32 }}>
                Enviamos um e-mail de confirmação para <span style={{ color: "#10b981" }}>{form.email}</span>.<br />
                Confirme para acessar sua conta.
              </p>
              <div style={{ padding: "16px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10, marginBottom: 28, fontSize: 13, color: "rgba(241,245,249,0.5)", lineHeight: 1.7 }}>
                Não recebeu? Verifique a caixa de spam ou aguarde alguns minutos.
              </div>
              <button onClick={() => router.push("/auth/login")} className="btn-primary">
                Ir para o login →
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 8 }}>
                  Criar conta grátis
                </h1>
                <p style={{ fontSize: 14, color: "rgba(241,245,249,0.4)" }}>
                  7 dias sem custo, sem cartão de crédito
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
                Cadastrar com Google
              </button>

              {/* Divisor */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: 11, color: "rgba(241,245,249,0.25)", letterSpacing: "0.1em" }}>OU</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Foto */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 4 }}>
                  <div
                    onClick={() => fotoRef.current?.click()}
                    style={{
                      width: 60, height: 60, borderRadius: "50%",
                      border: "2px dashed rgba(16,185,129,0.3)",
                      background: fotoPreview ? "transparent" : "rgba(16,185,129,0.05)",
                      cursor: "pointer", overflow: "hidden",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all .2s", flexShrink: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(16,185,129,0.6)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(16,185,129,0.3)"}
                  >
                    {fotoPreview
                      ? <img src={fotoPreview} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: 22, color: "rgba(16,185,129,0.4)" }}>◎</span>}
                  </div>
                  <div>
                    <button type="button" onClick={() => fotoRef.current?.click()} style={{ background: "none", border: "none", color: "#10b981", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer", padding: 0 }}>
                      {foto ? "Trocar foto" : "Adicionar foto"} (opcional)
                    </button>
                    <p style={{ fontSize: 11, color: "rgba(241,245,249,0.25)", marginTop: 4 }}>JPG, PNG até 5MB</p>
                  </div>
                  <input ref={fotoRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>NOME COMPLETO</label>
                  <input className="field-input" type="text" placeholder="Seu nome" value={form.nome} onChange={e => set("nome", e.target.value)} autoComplete="name" required />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>E-MAIL</label>
                  <input className="field-input" type="email" placeholder="seu@email.com" value={form.email} onChange={e => set("email", e.target.value)} autoComplete="email" required />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>SENHA</label>
                  <div style={{ position: "relative" }}>
                    <input className="field-input" type={showPass ? "text" : "password"} placeholder="Mín. 6 chars com letras e números" value={form.senha} onChange={e => set("senha", e.target.value)} autoComplete="new-password" style={{ paddingRight: 44 }} required />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(241,245,249,0.3)", padding: 0 }}>
                      {showPass ? "✕" : "◉"}
                    </button>
                  </div>
                  {/* Barra de força */}
                  {form.senha.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= senhaScore ? senhaCor : "rgba(255,255,255,0.08)", transition: "background .3s" }} />
                        ))}
                      </div>
                      <p style={{ fontSize: 11, color: senhaCor, marginTop: 5, transition: "color .3s" }}>{senhaLabel}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 12, color: "rgba(241,245,249,0.5)", display: "block", marginBottom: 7, letterSpacing: "0.05em" }}>CONFIRMAR SENHA</label>
                  <div style={{ position: "relative" }}>
                    <input className="field-input" type="password" placeholder="Repita a senha" value={form.confirmar} onChange={e => set("confirmar", e.target.value)} autoComplete="new-password"
                      style={{ paddingRight: 44, borderColor: form.confirmar.length > 0 ? (senhaMatch ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)") : undefined }} />
                    {form.confirmar.length > 0 && (
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

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                  {loading ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#030305" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  ) : "Criar conta grátis →"}
                </button>

                <p style={{ fontSize: 11, color: "rgba(241,245,249,0.25)", textAlign: "center", lineHeight: 1.6 }}>
                  Ao criar conta você concorda com nossos termos de uso.
                </p>
              </form>

              <p style={{ fontSize: 13, color: "rgba(241,245,249,0.35)", textAlign: "center", marginTop: 24 }}>
                Já tem conta?{" "}
                <a href="/auth/login" className="link-style">Entrar</a>
              </p>

              <div style={{ textAlign: "center", marginTop: 12 }}>
                <a href="/" style={{ fontSize: 12, color: "rgba(241,245,249,0.2)", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(241,245,249,0.5)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(241,245,249,0.2)")}>
                  ← Voltar ao início
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}