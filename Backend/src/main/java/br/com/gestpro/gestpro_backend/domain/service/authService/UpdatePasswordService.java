package br.com.gestpro.gestpro_backend.domain.service.authService;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.service.EmailService;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class UpdatePasswordService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Mapa para guardar códigos temporariamente (email -> código + expiração)
    private final Map<String, VerificationCode> codigoMap = new HashMap<>();

    public UpdatePasswordService(UsuarioRepository usuarioRepository,
                                 PasswordEncoder passwordEncoder,
                                 EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // ============================
    // 1. Enviar código de verificação
    // ============================
    public void sendVerificationCode(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Email não encontrado", HttpStatus.NOT_FOUND, "/update-password"));

        // Gera código aleatório de 6 dígitos
        String codigo = gerarCodigo();

        // Cria expiração de 10 minutos
        LocalDateTime expiracao = LocalDateTime.now().plusMinutes(10);

        // Salva no mapa temporário
        codigoMap.put(email, new VerificationCode(codigo, expiracao));

        // Salva no usuário (opcional, caso queira persistir no DB)
        usuario.setCodigoRecuperacao(codigo);
        usuarioRepository.save(usuario);

        // Envia email
        emailService.enviarEmail(email, usuario.getNome(), "Código de recuperação", "Seu código é: " + codigo);

        System.out.println("Código enviado para " + email + ": " + codigo);
    }

    // ============================
    // 2. Redefinir senha
    // ============================
    public void resetPassword(String email, String codigo, String novaSenha) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/update-password"));

        VerificationCode verificationCode = codigoMap.get(email);

        if (verificationCode == null) {
            throw new ApiException("Código de verificação inválido ou expirado", HttpStatus.BAD_REQUEST, "/update-password");
        }

        if (!verificationCode.getCodigo().equals(codigo)) {
            throw new ApiException("Código de verificação inválido", HttpStatus.BAD_REQUEST, "/update-password");
        }

        if (verificationCode.getExpiracao().isBefore(LocalDateTime.now())) {
            codigoMap.remove(email);
            throw new ApiException("Código de verificação expirado", HttpStatus.BAD_REQUEST, "/update-password");
        }

        // Atualiza senha
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        // Remove código usado
        codigoMap.remove(email);

        System.out.println("Senha atualizada para " + email);
    }

    // ============================
    // Gera código aleatório de 6 dígitos
    // ============================
    private String gerarCodigo() {
        Random random = new Random();
        int numero = 100000 + random.nextInt(900000); // 100000 a 999999
        return String.valueOf(numero);
    }

    // ============================
    // Classe interna para armazenar código + expiração
    // ============================
    private static class VerificationCode {
        private final String codigo;
        private final LocalDateTime expiracao;

        public VerificationCode(String codigo, LocalDateTime expiracao) {
            this.codigo = codigo;
            this.expiracao = expiracao;
        }

        public String getCodigo() {
            return codigo;
        }

        public LocalDateTime getExpiracao() {
            return expiracao;
        }
    }
}
