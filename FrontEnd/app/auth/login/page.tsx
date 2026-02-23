"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import { FormInput } from "@/components/auth/FormInput";
import { loginComGoogle, login } from "@/lib/api";
import CadastroPage from "../cadastro/page";
import s from "@/app/styles/auth.module.css";

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCadastro, setIsCadastro] = useState(false); // <- hook dentro do componente

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, pass);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  if (isCadastro) {
    return <CadastroPage />; // renderiza só o cadastro
  }

  return (
    <>
      <div className={s.cardTopBar} />
      <div className={s.cardBody}>
        <div className={s.cardBrandBlock}>
          <div className={s.brand}>
            <span className={s.brandDark}>Gest</span>
            <span className={s.brandGreen}>Pro</span>
          </div>
          <p className={s.cardTagline}>Bem-vindo de volta!</p>
        </div>

        {error && <div className={s.errorBox}>{error}</div>}

        <button
          type="button"
          onClick={loginComGoogle}
          className={s.btnGoogle}
          disabled={loading}
        >
          <GoogleIcon /> Entrar com Google
        </button>

        <div className={s.divider}>
          <span className={s.dividerLine} />
          <span className={s.dividerText}>ou</span>
          <span className={s.dividerLine} />
        </div>

        <form onSubmit={handleLogin} className={s.form}>
          <FormInput
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            disabled={loading}
            autoComplete="email"
          />
          <FormInput
            type={showPass ? "text" : "password"}
            placeholder="Senha"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            icon={Lock}
            required
            disabled={loading}
            autoComplete="current-password"
            rightSlot={
              <button
                type="button"
                className={s.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPass ? (
                  <EyeOff size={16} strokeWidth={2} />
                ) : (
                  <Eye size={16} strokeWidth={2} />
                )}
              </button>
            }
          />
          <a href="/esqueceu-senha" className={s.forgotLink}>
            Esqueceu sua senha?
          </a>

          <button type="submit" className={s.btnPrimary} disabled={loading}>
            {loading ? (
              <>
                <span className={s.spinner} /> Entrando...
              </>
            ) : (
              <>
                Entrar <Check size={16} strokeWidth={3} />
              </>
            )}
          </button>
        </form>

        <p className={s.switchRow}>
          Não tem conta?{" "}
          <button
            type="button"
            onClick={() => setIsCadastro(true)}
            className={`${s.switchLink} ${s.switchLinkPrimary}`}
          >
            Criar conta grátis
          </button>
        </p>
      </div>
    </>
  );
}
