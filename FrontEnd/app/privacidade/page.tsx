"use client";

import Link from "next/link";
import styles from "../styles/landing.module.css";

const Logo = () => (
  <Link href="/" className={styles.logo}>
    <img
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20-%20compressada-YDiRGUkZcdkmtY26Oki6uUJnX46iVL.png"
      alt="GestPro"
      className={styles.logoImage}
      style={{ width: 36, height: 36 }}
    />
    <span className={styles.logoText} style={{ fontSize: 20 }}>
      Gest<span className={styles.logoAccent}>Pro</span>
    </span>
  </Link>
);

const BackButton = () => (
  <Link
    href="/"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      color: "rgba(241,245,249,0.6)",
      textDecoration: "none",
      fontSize: 14,
      fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
      transition: "color 0.2s",
      marginBottom: 24,
    }}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
    Voltar para a pagina inicial
  </Link>
);

export default function PrivacidadePage() {
  return (
    <main className={styles.landing}>
      {/* Background */}
      <div className={styles.background}>
        <div className={styles.backgroundBase} />
        <div className={styles.backgroundGlow1} />
        <div className={styles.backgroundGrid} />
        <div className={styles.backgroundVignette} />
      </div>

      {/* Header */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          padding: "24px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo />
          <Link
            href="/suporte"
            className={styles.btnGhost}
            style={{
              padding: "8px 20px",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Suporte
          </Link>
        </div>
      </header>

      {/* Content */}
      <div
        style={{ position: "relative", zIndex: 10, padding: "60px 28px 100px" }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <BackButton />

          <div className={styles.sectionTag} style={{ marginBottom: 16 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Documento Legal
          </div>
          <h1
            className={styles.sectionHeading}
            style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 16 }}
          >
            Politica de Privacidade
          </h1>
          <p
            style={{
              fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
              fontSize: 14,
              color: "rgba(241,245,249,0.5)",
              marginBottom: 48,
            }}
          >
            Ultima atualizacao:{" "}
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>

          <div
            className={`${styles.glass}`}
            style={{ padding: "40px 36px", borderRadius: 20 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {/* Intro */}
              <section>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    A sua privacidade e importante para nos. Esta Politica de
                    Privacidade explica como o GestPro coleta, usa, divulga e
                    protege suas informacoes pessoais quando voce utiliza nossa
                    plataforma de gestao comercial.
                  </p>
                  <p>
                    Nos comprometemos a proteger sua privacidade e a tratar seus
                    dados pessoais em conformidade com a Lei Geral de Protecao
                    de Dados (LGPD - Lei n. 13.709/2018) e demais legislacoes
                    aplicaveis.
                  </p>
                </div>
              </section>

              {/* Secao 1 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    1
                  </span>
                  Dados que Coletamos
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#f1f5f9" }}>
                      Dados de Cadastro:
                    </strong>
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    {[
                      "Nome completo",
                      "Endereco de e-mail",
                      "Numero de telefone",
                      "CPF/CNPJ",
                      "Endereco comercial",
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#f1f5f9" }}>Dados de Uso:</strong>
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    {[
                      "Informacoes de vendas e transacoes",
                      "Dados de produtos e estoque",
                      "Informacoes de clientes cadastrados",
                      "Registros de caixa e pagamentos",
                      "Logs de acesso ao sistema",
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#f1f5f9" }}>
                      Dados Tecnicos:
                    </strong>
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {[
                      "Endereco IP",
                      "Tipo de navegador e dispositivo",
                      "Sistema operacional",
                      "Paginas visitadas e tempo de permanencia",
                      "Cookies e tecnologias similares",
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 2 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    2
                  </span>
                  Como Usamos seus Dados
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    Utilizamos seus dados pessoais para:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      "Fornecer e manter nossos servicos de gestao comercial",
                      "Processar transacoes e gerenciar sua conta",
                      "Enviar comunicacoes importantes sobre o servico",
                      "Fornecer suporte tecnico e atendimento ao cliente",
                      "Melhorar nossos produtos e desenvolver novos recursos",
                      "Gerar relatorios e analises para seu negocio",
                      "Cumprir obrigacoes legais e regulatorias",
                      "Prevenir fraudes e garantir a seguranca da plataforma",
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginTop: 4, flexShrink: 0 }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 3 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    3
                  </span>
                  Compartilhamento de Dados
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    <strong style={{ color: "#10b981" }}>
                      Nao vendemos seus dados pessoais.
                    </strong>{" "}
                    Podemos compartilhar suas informacoes apenas nas seguintes
                    situacoes:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      {
                        title: "Prestadores de servico",
                        desc: "Empresas que nos ajudam a operar a plataforma (hospedagem, pagamentos, e-mail)",
                      },
                      {
                        title: "Obrigacoes legais",
                        desc: "Quando exigido por lei, ordem judicial ou autoridade competente",
                      },
                      {
                        title: "Protecao de direitos",
                        desc: "Para proteger nossos direitos, privacidade, seguranca ou propriedade",
                      },
                      {
                        title: "Com seu consentimento",
                        desc: "Em outras situacoes, sempre com sua autorizacao previa",
                      },
                    ].map((item) => (
                      <li
                        key={item.title}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginTop: 4, flexShrink: 0 }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <strong style={{ color: "#f1f5f9" }}>
                            {item.title}:
                          </strong>{" "}
                          {item.desc}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 4 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    4
                  </span>
                  Seguranca dos Dados
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    Implementamos medidas de seguranca tecnicas e
                    organizacionais para proteger seus dados pessoais:
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {[
                      {
                        icon: "🔒",
                        title: "Criptografia",
                        desc: "Dados em transito e em repouso",
                      },
                      {
                        icon: "🛡️",
                        title: "Firewall",
                        desc: "Protecao contra ataques externos",
                      },
                      {
                        icon: "🔐",
                        title: "Autenticacao",
                        desc: "Acesso seguro com 2FA opcional",
                      },
                      {
                        icon: "💾",
                        title: "Backups",
                        desc: "Copias de seguranca diarias",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        style={{
                          background: "rgba(16,185,129,0.05)",
                          border: "1px solid rgba(16,185,129,0.1)",
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <div style={{ fontSize: 24, marginBottom: 8 }}>
                          {item.icon}
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#f1f5f9",
                            marginBottom: 4,
                          }}
                        >
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "rgba(241,245,249,0.5)",
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Secao 5 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    5
                  </span>
                  Seus Direitos (LGPD)
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    De acordo com a LGPD, voce tem os seguintes direitos sobre
                    seus dados pessoais:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      {
                        title: "Acesso",
                        desc: "Solicitar copia dos seus dados pessoais",
                      },
                      {
                        title: "Correcao",
                        desc: "Corrigir dados incompletos ou desatualizados",
                      },
                      {
                        title: "Exclusao",
                        desc: "Solicitar a exclusao dos seus dados",
                      },
                      {
                        title: "Portabilidade",
                        desc: "Receber seus dados em formato estruturado",
                      },
                      {
                        title: "Revogacao",
                        desc: "Retirar consentimento a qualquer momento",
                      },
                      {
                        title: "Informacao",
                        desc: "Saber com quem seus dados foram compartilhados",
                      },
                    ].map((item) => (
                      <li
                        key={item.title}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginTop: 4, flexShrink: 0 }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <strong style={{ color: "#f1f5f9" }}>
                            {item.title}:
                          </strong>{" "}
                          {item.desc}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p
                    style={{
                      marginTop: 20,
                      padding: 16,
                      background: "rgba(16,185,129,0.05)",
                      borderRadius: 12,
                      border: "1px solid rgba(16,185,129,0.15)",
                    }}
                  >
                    Para exercer seus direitos, entre em contato pelo e-mail{" "}
                    <strong style={{ color: "#10b981" }}>
                      privacidade@gestpro.com.br
                    </strong>
                  </p>
                </div>
              </section>

              {/* Secao 6 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    6
                  </span>
                  Cookies
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    Utilizamos cookies e tecnologias similares para melhorar sua
                    experiencia:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      {
                        title: "Essenciais",
                        desc: "Necessarios para o funcionamento da plataforma",
                      },
                      {
                        title: "Funcionais",
                        desc: "Lembram suas preferencias e configuracoes",
                      },
                      {
                        title: "Analiticos",
                        desc: "Nos ajudam a entender como voce usa o sistema",
                      },
                      {
                        title: "Marketing",
                        desc: "Permitem campanhas personalizadas (com seu consentimento)",
                      },
                    ].map((item) => (
                      <li
                        key={item.title}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginTop: 4, flexShrink: 0 }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <div>
                          <strong style={{ color: "#f1f5f9" }}>
                            {item.title}:
                          </strong>{" "}
                          {item.desc}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 7 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    7
                  </span>
                  Retencao de Dados
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    Mantemos seus dados pessoais pelo tempo necessario para
                    cumprir as finalidades descritas nesta politica:
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {[
                      "Dados de conta: enquanto sua conta estiver ativa",
                      "Dados de transacoes: 5 anos apos o encerramento (obrigacao fiscal)",
                      "Logs de acesso: 6 meses (Marco Civil da Internet)",
                      "Dados de marketing: ate revogacao do consentimento",
                    ].map((item) => (
                      <li
                        key={item}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 8 */}
              <section>
                <h2
                  style={{
                    fontFamily: "var(--font-syne), 'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#f1f5f9",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#10b981",
                    }}
                  >
                    8
                  </span>
                  Contato do DPO
                </h2>
                <div
                  style={{
                    fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
                    fontSize: 15,
                    color: "rgba(241,245,249,0.7)",
                    lineHeight: 1.8,
                  }}
                >
                  <p style={{ marginBottom: 16 }}>
                    Para questoes relacionadas a privacidade e protecao de
                    dados, entre em contato com nosso Encarregado de Protecao de
                    Dados (DPO):
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      padding: 20,
                      background: "rgba(16,185,129,0.05)",
                      borderRadius: 12,
                      border: "1px solid rgba(16,185,129,0.15)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                      <strong style={{ color: "#f1f5f9" }}>
                        Encarregado de Dados (DPO)
                      </strong>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>privacidade@gestpro.com.br</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <Logo />
          <p className={styles.footerCopyright}>
            {new Date().getFullYear()} GestPro - Todos os direitos reservados
          </p>
          <div className={styles.footerLinks}>
            <Link href="/termos" className={styles.footerLink}>
              Termos
            </Link>
            <Link
              href="/privacidade"
              className={`${styles.footerLink} ${styles.footerLinkActive}`}
            >
              Privacidade
            </Link>
            <Link href="/suporte" className={styles.footerLink}>
              Suporte
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
