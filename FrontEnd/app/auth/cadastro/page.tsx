"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Check, X } from "lucide-react";
import { FormInput } from "@/components/auth/FormInput";
import { PhotoUpload } from "@/components/auth/PhotoUpload";
import { cadastrar, login, loginComGoogle } from "@/lib/api";
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

export default function AuthPage() {
  const [isCadastro, setIsCadastro] = useState(false);

  // --- LOGIN STATES ---
  const [emailLogin, setEmailLogin] = useState("");
  const [senhaLogin, setSenhaLogin] = useState("");
  const [showSenhaLogin, setShowSenhaLogin] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");
    setLoadingLogin(true);
    try {
      await login(emailLogin, senhaLogin);
      window.location.href = "/dashboard";
    } catch (err) {
      setErrorLogin(
        err instanceof Error ? err.message : "Erro ao fazer login.",
      );
    } finally {
      setLoadingLogin(false);
    }
  };

  // --- CADASTRO STATES ---
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [loadingCadastro, setLoadingCadastro] = useState(false);
  const [errorCadastro, setErrorCadastro] = useState("");
  const [showModal, setShowModal] = useState(false);

  const senhasOk = confirmarSenha.length > 0 && senha === confirmarSenha;
  const senhasErr = confirmarSenha.length > 0 && senha !== confirmarSenha;

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCadastro("");
    if (senha !== confirmarSenha)
      return setErrorCadastro("As senhas não coincidem!");
    if (senha.length < 6)
      return setErrorCadastro("A senha deve ter no mínimo 6 caracteres");

    setLoadingCadastro(true);
    try {
      await cadastrar(nome, email, senha, foto);
      setShowModal(true);
    } catch (err) {
      setErrorCadastro(
        err instanceof Error ? err.message : "Erro ao realizar cadastro",
      );
    } finally {
      setLoadingCadastro(false);
    }
  };

  return (
    <>
      <div className={s.cardTopBar} />
      <div className={s.cardBody}>
        <div className={s.cardBrandBlock}>
          <div className={s.brand}>
            <span className={s.brandDark}>Gest</span>
            <span className={s.brandGreen}>Pro</span>
          </div>
          <p className={s.cardTagline}>
            {isCadastro
              ? "Crie sua conta grátis — 7 dias sem cartão"
              : "Bem-vindo de volta!"}
          </p>
        </div>

        {isCadastro ? (
          <>
            {errorCadastro && <div className={s.errorBox}>{errorCadastro}</div>}
            <button
              type="button"
              onClick={loginComGoogle}
              className={s.btnGoogle}
              disabled={loadingCadastro}
            >
              <GoogleIcon /> Cadastrar com Google
            </button>
            <div className={s.divider}>
              <span className={s.dividerLine} />
              <span className={s.dividerText}>ou</span>
              <span className={s.dividerLine} />
            </div>
            <form onSubmit={handleCadastro} className={s.form}>
              <PhotoUpload
                preview={fotoPreview}
                onChange={handleFotoChange}
                disabled={loadingCadastro}
              />
              <FormInput
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                icon={User}
                required
                disabled={loadingCadastro}
                autoComplete="name"
              />
              <FormInput
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
                disabled={loadingCadastro}
                autoComplete="email"
              />
              <FormInput
                type={showSenha ? "text" : "password"}
                placeholder="Senha (mínimo 6 caracteres)"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                icon={Lock}
                required
                disabled={loadingCadastro}
                autoComplete="new-password"
                rightSlot={
                  <button
                    type="button"
                    className={s.eyeBtn}
                    onClick={() => setShowSenha((v) => !v)}
                    tabIndex={-1}
                    aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showSenha ? (
                      <EyeOff size={16} strokeWidth={2} />
                    ) : (
                      <Eye size={16} strokeWidth={2} />
                    )}
                  </button>
                }
              />
              <FormInput
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                icon={Lock}
                required
                disabled={loadingCadastro}
                autoComplete="new-password"
                rightSlot={
                  <button
                    type="button"
                    className={s.eyeBtn}
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showConfirm ? (
                      <EyeOff size={16} strokeWidth={2} />
                    ) : (
                      <Eye size={16} strokeWidth={2} />
                    )}
                  </button>
                }
              />
              {senhasOk && (
                <div className={`${s.matchRow} ${s.matchOk}`}>
                  <Check size={13} strokeWidth={3} /> Senhas conferem
                </div>
              )}
              {senhasErr && (
                <div className={`${s.matchRow} ${s.matchErr}`}>
                  <X size={13} strokeWidth={3} /> Senhas não coincidem
                </div>
              )}
              <button
                type="submit"
                className={s.btnPrimary}
                disabled={loadingCadastro}
              >
                {loadingCadastro ? (
                  <>
                    <span className={s.spinner} /> Cadastrando...
                  </>
                ) : (
                  <>
                    Criar conta <Check size={16} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {errorLogin && <div className={s.errorBox}>{errorLogin}</div>}
            <button
              type="button"
              onClick={loginComGoogle}
              className={s.btnGoogle}
              disabled={loadingLogin}
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
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                icon={Mail}
                required
                disabled={loadingLogin}
                autoComplete="email"
              />
              <FormInput
                type={showSenhaLogin ? "text" : "password"}
                placeholder="Senha"
                value={senhaLogin}
                onChange={(e) => setSenhaLogin(e.target.value)}
                icon={Lock}
                required
                disabled={loadingLogin}
                autoComplete="current-password"
                rightSlot={
                  <button
                    type="button"
                    className={s.eyeBtn}
                    onClick={() => setShowSenhaLogin((v) => !v)}
                    tabIndex={-1}
                    aria-label={
                      showSenhaLogin ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showSenhaLogin ? (
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
              <button
                type="submit"
                className={s.btnPrimary}
                disabled={loadingLogin}
              >
                {loadingLogin ? (
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
          </>
        )}
        <p className={s.switchRow}>
          {isCadastro ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            type="button"
            className={`${s.switchLink} ${!isCadastro ? s.switchLinkPrimary : ""}`}
            onClick={() => setIsCadastro(!isCadastro)}
          >
            {isCadastro ? "Fazer login" : "Criar conta grátis"}
          </button>
        </p>
      </div>

      {showModal && (
        <div className={s.modalOverlay}>
          <div className={s.modalCard} style={{ maxWidth: 380 }}>
            <button
              className={s.modalClose}
              onClick={() => setShowModal(false)}
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
            <div className={s.cardTopBar} />
            <div className={s.cardBody}>
              <div className={s.successBox}>
                <div className={`${s.successIcon} ${s.successIconGreen}`}>
                  <Check size={32} color="#059669" strokeWidth={3} />
                </div>
                <h2 className={s.successTitle}>Confirme seu e-mail</h2>
                <p className={s.successDesc}>
                  Enviamos um link para <strong>{email}</strong>. Verifique sua
                  caixa de entrada e clique no link para ativar sua conta.
                </p>
                <button
                  className={s.btnPrimary}
                  onClick={() => setShowModal(false)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
