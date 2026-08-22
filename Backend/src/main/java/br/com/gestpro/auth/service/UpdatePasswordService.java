package br.com.gestpro.auth.service;

import br.com.gestpro.auth.EmailService;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Locale;

@Service
public class UpdatePasswordService {

    private static final Duration VALIDADE = Duration.ofMinutes(10);
    private static final Duration INTERVALO_REENVIO = Duration.ofSeconds(60);
    private static final int MAX_TENTATIVAS = 5;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final StringRedisTemplate redis;
    private final SecureRandom secureRandom = new SecureRandom();

    public UpdatePasswordService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            StringRedisTemplate redis
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.redis = redis;
    }

    public void sendVerificationCode(String rawEmail) {
        String email = normalizar(rawEmail);

        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        /*
         * Não revele se o usuário existe.
         */
        if (usuario == null) {
            passwordEncoder.encode(gerarCodigo());
            return;
        }

        Boolean primeiroEnvio = redis.opsForValue().setIfAbsent(
                envioKey(email),
                "1",
                INTERVALO_REENVIO
        );
        if (!Boolean.TRUE.equals(primeiroEnvio)) {
            return;
        }

        String codigo = gerarCodigo();
        String hash = passwordEncoder.encode(codigo);

        redis.opsForValue().set(
                codigoKey(email),
                hash,
                VALIDADE
        );

        redis.delete(tentativasKey(email));

        try {
            emailService.enviarCodigoConfirmacao(email, usuario.getNome(), codigo);
        } catch (RuntimeException exception) {
            redis.delete(codigoKey(email));
            redis.delete(tentativasKey(email));
            redis.delete(envioKey(email));
            throw exception;
        }
    }

    @Transactional
    public void resetPassword(
            String rawEmail,
            String codigo,
            String novaSenha
    ) {
        String email = normalizar(rawEmail);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(this::codigoInvalido);

        String hash = redis.opsForValue().get(codigoKey(email));

        if (hash == null) {
            throw codigoInvalido();
        }

        Long tentativas = redis.opsForValue()
                .increment(tentativasKey(email));

        if (tentativas != null && tentativas == 1) {
            redis.expire(tentativasKey(email), VALIDADE);
        }

        if (tentativas != null && tentativas > MAX_TENTATIVAS) {
            redis.delete(codigoKey(email));
            redis.delete(tentativasKey(email));
            throw codigoInvalido();
        }

        if (!passwordEncoder.matches(codigo, hash)) {
            throw codigoInvalido();
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setEmailConfirmado(true);
        usuario.setTokenConfirmacao(null);
        usuario.setDataEnvioConfirmacao(null);
        usuario.setCodigoRecuperacao(null);

        usuarioRepository.save(usuario);

        redis.delete(codigoKey(email));
        redis.delete(tentativasKey(email));
        redis.delete(envioKey(email));
    }

    private String gerarCodigo() {
        return String.format(
                "%06d",
                secureRandom.nextInt(1_000_000)
        );
    }

    private String normalizar(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String codigoKey(String email) {
        return "auth:reset:code:" + email;
    }

    private String tentativasKey(String email) {
        return "auth:reset:attempts:" + email;
    }

    private String envioKey(String email) {
        return "auth:reset:sent:" + email;
    }

    private ApiException codigoInvalido() {
        return new ApiException(
                "Código inválido ou expirado.",
                HttpStatus.BAD_REQUEST,
                "/api/auth/redefinir-senha"
        );
    }
}
