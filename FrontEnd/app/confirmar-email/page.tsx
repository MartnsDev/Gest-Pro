"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import a from "@/app/styles/auth.module.css";

type Status = "sucesso" | "erro" | "invalido" | "processando";

const REDIRECT_SECONDS = 5;

const config: Record<
  Status,
  {
    iconClass: string;
    icon: React.ReactNode;
    title: string;
    msg: string;
    progressClass: string;
  }
> = {
  sucesso: {
    iconClass: a.successIconGreen,
    icon: (
      <CheckCircle size={40} strokeWidth={1.5} style={{ color: "#10b981" }} />
    ),
    title: "E-mail confirmado!",
    msg: "Sua conta foi ativada com sucesso. Você será redirecionado para o login em instantes.",
    progressClass: a.progressGreen,
  },
  erro: {
    iconClass: a.successIconRed,
    icon: <XCircle size={40} strokeWidth={1.5} style={{ color: "#ef4444" }} />,
    title: "Falha na confirmação",
    msg: "Não foi possível confirmar o e-mail. O link pode ter expirado. Você será redirecionado para o login.",
    progressClass: a.progressRed,
  },
  invalido: {
    iconClass: a.successIconYellow,
    icon: (
      <AlertCircle size={40} strokeWidth={1.5} style={{ color: "#f59e0b" }} />
    ),
    title: "Link inválido",
    msg: "O token de confirmação é inválido ou já foi utilizado. Você será redirecionado para o login.",
    progressClass: a.progressYellow,
  },
  processando: {
    iconClass: a.successIconGray,
    icon: (
      <Loader2
        size={40}
        strokeWidth={1.5}
        style={{ color: "#94a3b8", animation: "spin 1s linear infinite" }}
      />
    ),
    title: "Verificando...",
    msg: "Estamos processando a confirmação do seu e-mail. Aguarde um momento.",
    progressClass: a.progressGray,
  },
};

export default function ConfirmarEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("processando");
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  /* resolve status from query param */
  useEffect(() => {
    const param = searchParams.get("status");
    if (param === "sucesso") setStatus("sucesso");
    else if (param === "erro") setStatus("erro");
    else setStatus("invalido");
  }, [searchParams]);

  /* start countdown only after status is known */
  useEffect(() => {
    if (status === "processando") return;
    setCountdown(REDIRECT_SECONDS);
    const tick = setInterval(() => setCountdown((p) => p - 1), 1000);
    const redirect = setTimeout(
      () => router.push("/"),
      REDIRECT_SECONDS * 1000,
    );
    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [status, router]);

  const current = config[status];
  const progress =
    status === "processando" ? 100 : (countdown / REDIRECT_SECONDS) * 100;

  return (
    <div className={a.authPage}>
      <div className={a.blob1} />
      <div className={a.blob2} />

      <div className={a.card}>
        <div className={a.cardTopBar} />
        <div className={a.cardBody}>
          {/* brand */}
          <div className={a.cardBrandBlock} style={{ marginBottom: 28 }}>
            <div className={a.brand}>
              <span className={a.brandDark}>Gest</span>
              <span className={a.brandGreen}>Pro</span>
            </div>
            <p className={a.cardTagline}>Confirmação de e-mail</p>
          </div>

          {/* status content */}
          <div className={a.successBox}>
            <div
              className={`${a.successIcon} ${current.iconClass}`}
              style={{ width: 72, height: 72 }}
            >
              {current.icon}
            </div>

            <p className={a.successTitle} style={{ fontSize: "1.18rem" }}>
              {current.title}
            </p>

            <p className={a.successDesc}>{current.msg}</p>

            {/* progress bar + countdown */}
            {status !== "processando" && (
              <>
                <div className={a.progressTrack}>
                  <div
                    className={`${a.progressBar} ${current.progressClass}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className={a.countdownText}>
                  Redirecionando em {countdown}s...
                </p>

                <button
                  className={a.btnPrimary}
                  onClick={() => router.push("/")}
                  style={{ marginTop: 8 }}
                >
                  Ir para login agora <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <p className={a.pageFooter}>
        Sua loja organizada, suas vendas garantidas
      </p>
    </div>
  );
}
