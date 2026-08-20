/**
 * COMPONENTE: AuthLayout
 * Layout compartilhado para páginas de autenticação
 * (Login, Cadastro, Recuperação de Senha)
 */

import type React from "react";
import Image from "next/image";
import styles from "@/app/styles/auth.module.css";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showIllustration?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showIllustration = true,
}: AuthLayoutProps) {
  return (
    <div className={styles.authContainer}>
      {/* Cabeçalho Superior */}
      <div className={styles.authHeader}>
        <h1 className={styles.authHeaderTitle}>{title}</h1>
      </div>

      {/* Container Principal */}
      <div className={styles.authContent}>
        <div className={styles.authContentInner}>
          {/* Ilustração Lateral */}
          {showIllustration && (
            <div className={styles.authIllustration}>
              <div className={styles.authIllustrationImage}>
                <Image
                  src="/img-login-new.png"
                  alt="Ilustração Gevyro"
                  width={600}
                  height={600}
                  className="object-contain w-full h-auto"
                  priority
                />
              </div>
            </div>
          )}

          {/* Card do Formulário */}
          <div className={styles.authCard}>
            <div className={styles.authCardInner}>
              {/* Logo */}
              <div className={styles.authLogo}>
                <Image
                  src="/images/gevyro-logo-400.webp"
                  alt="Gevyro"
                  width={400}
                  height={145}
                  className="h-auto w-[200px] object-contain"
                />
              </div>

              {/* Conteúdo do Formulário */}
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className={styles.authFooter}>
        <p className={styles.authFooterText}>{subtitle}</p>
      </div>
    </div>
  );
}
