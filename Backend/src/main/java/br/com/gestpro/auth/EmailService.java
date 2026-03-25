package br.com.gestpro.auth;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String remetente;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ================= TEMPLATE BASE =================
    @Async
    private String templateBase(String titulo, String conteudo) {
        return """
            <!DOCTYPE html>
            <html>
            <body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, sans-serif;">

                <div style="max-width:600px; margin:40px auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

                    <h2 style="text-align:center; color:#333; margin-bottom:20px;">
                        %s
                    </h2>

                    %s

                    <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">

                    <p style="color:#999; font-size:12px;">
                        Este é um e-mail automático. Não responda.
                    </p>

                    <p style="text-align:center; color:#bbb; font-size:12px; margin-top:10px;">
                        © 2026 GestPro
                    </p>

                </div>

            </body>
            </html>
        """.formatted(titulo, conteudo);
    }

    // ================= EMAIL GENÉRICO =================
    @Async
    public void enviarEmail(String to, String nomeUsuario, String subject, String body) {

        try {
            String nome = (nomeUsuario != null && !nomeUsuario.isBlank()) ? nomeUsuario : "usuário";

            String conteudo = """
                <p style="color:#555; font-size:16px;">
                    Olá, <strong>%s</strong>!
                </p>

                <p style="color:#555; font-size:15px;">
                    %s
                </p>

                <p style="margin-top:20px; font-size:13px; color:#777;">
                    Se precisar de ajuda, entre em contato: suporte@gestpro.com
                </p>
            """.formatted(nome, body);

            enviarHtml(to, subject, templateBase("📩 GestPro", conteudo));

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage());
        }
    }

    // ================= CONFIRMAÇÃO =================
    @Async
    public void enviarConfirmacao(String emailDestino, String linkConfirmacao) {

        String conteudo = """
            <p style="color:#555; font-size:16px;">
                Obrigado por se cadastrar no <strong>GestPro</strong>!
            </p>

            <p style="color:#555;">
                Clique no botão abaixo para ativar sua conta:
            </p>

            <div style="text-align:center; margin:30px 0;">
                <a href="%s" style="
                    background:linear-gradient(135deg, #4CAF50, #2e7d32);
                    color:white;
                    padding:14px 24px;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:bold;
                    display:inline-block;
                ">
                    ✔ Confirmar Conta
                </a>
            </div>

            <p style="font-size:13px; color:#777;">
                Ou copie o link abaixo:
            </p>

            <p style="word-break:break-all; font-size:12px; color:#555;">
                %s
            </p>
        """.formatted(linkConfirmacao, linkConfirmacao);

        enviarHtml(emailDestino, "Confirme seu e-mail - GestPro",
                templateBase("🚀 Bem-vindo ao GestPro", conteudo));
    }

    // ================= CÓDIGO =================
    @Async
    public void enviarCodigoConfirmacao(String emailDestino, String nomeUsuario, String codigo) {

        String nome = (nomeUsuario != null && !nomeUsuario.isBlank()) ? nomeUsuario : "usuário";

        String conteudo = """
            <p style="color:#555;">
                Olá, <strong>%s</strong>!
            </p>

            <p style="color:#555;">
                Use o código abaixo para confirmar sua ação:
            </p>

            <div style="text-align:center; margin:30px 0;">
                <span style="
                    font-size:28px;
                    font-weight:bold;
                    letter-spacing:5px;
                    background:#f1f1f1;
                    padding:12px 20px;
                    border-radius:8px;
                    display:inline-block;
                ">
                    %s
                </span>
            </div>

            <p style="font-size:13px; color:#777;">
                ⏱ Expira em 10 minutos.
            </p>

            <p style="font-size:13px; color:#999;">
                Nunca compartilhe este código com ninguém.
            </p>
        """.formatted(nome, codigo);

        enviarHtml(emailDestino, "Código de Confirmação - GestPro",
                templateBase("🔐 Verificação de Segurança", conteudo));
    }

    // ================= ENVIO CENTRAL =================
    private void enviarHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("GestPro <" + remetente + ">");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage());
        }
    }

    // ================= GERAR CÓDIGO =================
    public String gerarCodigo() {
        int codigo = 100000 + (int)(Math.random() * 900000);
        return String.valueOf(codigo);
    }
}