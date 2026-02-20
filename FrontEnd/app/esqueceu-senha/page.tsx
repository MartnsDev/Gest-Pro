"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Check,
  ArrowLeft,
  KeyRound,
  X,
  RefreshCw,
} from "lucide-react";
import a from "@/app/styles/auth.module.css";

const BACKEND_URL = "http://localhost:8080/api/auth";

function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div className={a.toastWrap}>
      <div
        className={`${a.toast} ${type === "error" ? a.toastError : a.toastSuccess}`}
      >
        {type === "success" ? (
          <Check size={16} strokeWidth={3} />
        ) : (
          <X size={16} strokeWidth={3} />
        )}
        <span>{msg}</span>
        <button className={a.toastClose} onClick={onClose} aria-label="Fechar">
          <X size={13} />
        </button>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className={a.stepRow}>
      <div
        className={`${a.stepConnector} ${current >= 2 ? a.stepConnectorActive : ""}`}
      />
      {([1, 2] as const).map((n) => (
        <div key={n} className={a.stepItem}>
          <div
            className={`${a.stepCircle} ${current >= n ? a.stepCircleActive : ""}`}
          >
            {current > n ? <Check size={13} strokeWidth={3} /> : n}
          </div>
          <span
            className={`${a.stepLabel} ${current >= n ? a.stepLabelActive : ""}`}
          >
            {n === 1 ? "E-mail" : "Nova senha"}
          </span>
        </div>
      ))}
    </div>
  );
}

function FormInput({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ElementType }) {
  return (
    <div className={a.inputWrap}>
      <span className={a.inputIcon}>
        <Icon size={17} />
      </span>
      <input className={a.input} {...props} />
    </div>
  );
}

export default function EsqueceuSenhaPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const handleEnviarCodigo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/esqueceu-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStep(2);
        setTimer(60);
        showToast("Código enviado para o seu e-mail!", "success");
      } else if (res.status === 404) {
        showToast(
          "E-mail não encontrado. Verifique e tente novamente.",
          "error",
        );
      } else {
        showToast("Erro ao enviar código. Tente novamente.", "error");
      }
    } catch {
      showToast("Erro ao conectar com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      showToast("As senhas não coincidem!", "error");
      return;
    }
    if (novaSenha.length < 6) {
      showToast("A senha deve ter pelo menos 6 caracteres.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, novaSenha }),
      });
      if (res.ok) {
        showToast("Senha redefinida com sucesso!", "success");
        setTimeout(() => (window.location.href = "/"), 1800);
      } else if (res.status === 400) {
        showToast("Código inválido ou expirado. Tente novamente.", "error");
      } else {
        showToast("Erro ao redefinir senha. Tente novamente.", "error");
      }
    } catch {
      showToast("Erro ao conectar com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={a.authPage}>
      <div className={a.blob1} />
      <div className={a.blob2} />
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className={a.card}>
        <div className={a.cardTopBar} />
        <div className={a.cardBody}>
          <a href="/" className={a.backLink}>
            <ArrowLeft size={15} /> Voltar para login
          </a>

          <div className={a.cardBrandBlock}>
            <div className={a.brand}>
              <span className={a.brandDark}>Gest</span>
              <span className={a.brandGreen}>Pro</span>
            </div>
            <p className={a.cardTagline}>
              {step === 1 ? "Recuperar senha" : "Redefinir senha"}
            </p>
          </div>

          <StepIndicator current={step} />

          {step === 1 && (
            <form onSubmit={handleEnviarCodigo} className={a.form}>
              <p className={a.hint}>
                Digite seu e-mail e enviaremos um código de verificação.
              </p>
              <FormInput
                icon={Mail}
                type="email"
                placeholder="E-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading} className={a.btnPrimary}>
                {loading ? (
                  <>
                    <span className={a.spinner} /> Enviando...
                  </>
                ) : (
                  <>
                    Enviar código <Check size={17} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRedefinirSenha} className={a.form}>
              <p className={a.hint}>
                Código enviado para <strong>{email}</strong>. Insira o código e
                crie sua nova senha.
              </p>

              <FormInput
                icon={KeyRound}
                type="text"
                placeholder="Código de verificação"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                maxLength={8}
                required
                disabled={loading}
              />
              <FormInput
                icon={Lock}
                type="password"
                placeholder="Nova senha (mín. 6 caracteres)"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                disabled={loading}
              />
              <FormInput
                icon={Lock}
                type="password"
                placeholder="Confirmar nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                disabled={loading}
              />

              {confirmarSenha && (
                <div
                  className={`${a.matchRow} ${novaSenha === confirmarSenha ? a.matchOk : a.matchErr}`}
                >
                  {novaSenha === confirmarSenha ? (
                    <>
                      <Check size={12} strokeWidth={3} /> Senhas coincidem
                    </>
                  ) : (
                    <>
                      <X size={12} strokeWidth={3} /> Senhas não coincidem
                    </>
                  )}
                </div>
              )}

              <button type="submit" disabled={loading} className={a.btnPrimary}>
                {loading ? (
                  <>
                    <span className={a.spinner} /> Redefinindo...
                  </>
                ) : (
                  <>
                    Redefinir senha <Check size={17} strokeWidth={3} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleEnviarCodigo()}
                disabled={timer > 0 || loading}
                className={a.resendBtn}
              >
                <RefreshCw size={14} />
                {timer > 0 ? `Reenviar em ${timer}s` : "Reenviar código"}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className={a.pageFooter}>
        Sua loja organizada, suas vendas garantidas
      </p>
    </div>
  );
}
