"use client";

import Link from "next/link";
import styles from "../landing.module.css";

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
    Voltar para a pagina inicial
  </Link>
);

export default function TermosPage() {
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
      <header style={{ position: "relative", zIndex: 10, padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo />
          <Link href="/suporte" className={styles.btnGhost} style={{ padding: "8px 20px", fontSize: 14, textDecoration: "none" }}>
            Suporte
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, padding: "60px 28px 100px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <BackButton />

          <div className={styles.sectionTag} style={{ marginBottom: 16 }}>Documento Legal</div>
          <h1 className={styles.sectionHeading} style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 16 }}>
            Termos de Uso
          </h1>
          <p style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 14, color: "rgba(241,245,249,0.5)", marginBottom: 48 }}>
            Ultima atualizacao: {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>

          <div className={`${styles.glass}`} style={{ padding: "40px 36px", borderRadius: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {/* Secao 1 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>1</span>
                  Aceitacao dos Termos
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>
                    Ao acessar e utilizar o GestPro, voce concorda com estes Termos de Uso e com nossa Politica de Privacidade. Se voce nao concordar com qualquer parte destes termos, nao devera utilizar nossos servicos.
                  </p>
                  <p>
                    O GestPro reserva-se o direito de modificar estes termos a qualquer momento. As alteracoes entrarao em vigor imediatamente apos sua publicacao na plataforma. O uso continuado dos servicos apos tais modificacoes constitui sua aceitacao dos novos termos.
                  </p>
                </div>
              </section>

              {/* Secao 2 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>2</span>
                  Descricao do Servico
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>O GestPro e uma plataforma de gestao comercial que oferece:</p>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {["Controle de caixa e vendas em tempo real", "Gestao de estoque e produtos", "Cadastro e acompanhamento de clientes", "Relatorios financeiros e gerenciais", "Multi empresa / filiais", "Exportacao de dados em diversos formatos"].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>3</span>
                  Cadastro e Conta de Usuario
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>Para utilizar o GestPro, voce deve:</p>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {["Ter pelo menos 18 anos de idade", "Fornecer informacoes verdadeiras e completas no cadastro", "Manter suas credenciais de acesso em sigilo", "Ser responsavel por todas as atividades em sua conta", "Notificar imediatamente sobre uso nao autorizado"].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 4 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>4</span>
                  Planos e Pagamentos
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>
                    O GestPro oferece diferentes planos de assinatura. Ao escolher um plano pago, voce concorda que:
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {["A cobranca sera recorrente conforme o ciclo do plano escolhido", "O periodo de teste gratuito de 30 dias e oferecido apenas uma vez por usuario", "O cancelamento pode ser feito a qualquer momento, sem multa", "Nao ha reembolso para periodos parciais ja pagos", "Os precos podem ser alterados com aviso previo de 30 dias"].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4, flexShrink: 0 }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 5 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>5</span>
                  Uso Aceitavel
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>Voce concorda em nao utilizar o GestPro para:</p>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {["Atividades ilegais ou fraudulentas", "Violar direitos de propriedade intelectual", "Transmitir virus ou codigos maliciosos", "Tentar acessar sistemas ou dados de outros usuarios", "Realizar engenharia reversa do software", "Revender ou redistribuir o servico sem autorizacao"].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 6 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>6</span>
                  Propriedade Intelectual
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>
                    Todo o conteudo do GestPro, incluindo mas nao limitado a textos, graficos, logotipos, icones, imagens, clips de audio, downloads digitais e compilacoes de dados, e propriedade do GestPro ou de seus fornecedores de conteudo e e protegido pelas leis brasileiras e internacionais de direitos autorais.
                  </p>
                  <p>
                    Os dados inseridos por voce na plataforma permanecem de sua propriedade. O GestPro nao utiliza seus dados comerciais para qualquer finalidade alem da prestacao do servico contratado.
                  </p>
                </div>
              </section>

              {/* Secao 7 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>7</span>
                  Limitacao de Responsabilidade
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>
                    O GestPro e fornecido &quot;como esta&quot; e &quot;conforme disponivel&quot;. Nao garantimos que o servico sera ininterrupto, seguro ou livre de erros. Em nenhum caso o GestPro sera responsavel por:
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {["Danos indiretos, incidentais ou consequentes", "Perda de dados causada por fatores externos", "Interrupcoes de servico fora de nosso controle", "Decisoes de negocios baseadas nos dados do sistema"].map((item) => (
                      <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Secao 8 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>8</span>
                  Rescisao
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>
                    O GestPro pode suspender ou encerrar seu acesso ao servico, sem aviso previo, se voce violar estes Termos de Uso ou por qualquer outra razao a nosso exclusivo criterio. Voce pode cancelar sua conta a qualquer momento atraves das configuracoes do sistema ou entrando em contato com nosso suporte.
                  </p>
                  <p>
                    Apos o cancelamento, seus dados serao mantidos por 30 dias para possivel recuperacao. Apos este periodo, serao permanentemente excluidos de nossos servidores.
                  </p>
                </div>
              </section>

              {/* Secao 9 */}
              <section>
                <h2 style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: "#f1f5f9", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#10b981" }}>9</span>
                  Contato
                </h2>
                <div style={{ fontFamily: "var(--font-manrope), 'Manrope', sans-serif", fontSize: 15, color: "rgba(241,245,249,0.7)", lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 16 }}>
                    Para duvidas sobre estes Termos de Uso, entre em contato conosco:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>suporte@gestpro.com.br</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>(11) 99999-9999</span>
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
          <p className={styles.footerCopyright}>{new Date().getFullYear()} GestPro - Todos os direitos reservados</p>
          <div className={styles.footerLinks}>
            <Link href="/termos" className={`${styles.footerLink} ${styles.footerLinkActive}`}>Termos</Link>
            <Link href="/privacidade" className={styles.footerLink}>Privacidade</Link>
            <Link href="/suporte" className={styles.footerLink}>Suporte</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
