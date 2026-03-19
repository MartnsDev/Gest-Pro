package br.com.gestpro.auth.service;

import br.com.gestpro.auth.dto.AuthDTO.LoginResponse;
import br.com.gestpro.auth.dto.AuthDTO.LoginUsuarioDTO;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.auth.service.jwtService.JwtTokenServiceInterface;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import br.com.gestpro.infra.exception.ApiException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class LoginManualOperation {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenServiceInterface jwtTokenService;
    private final VerificarPlanoOperation verificarPlano;

    public LoginManualOperation(UsuarioRepository usuarioRepository,
                                PasswordEncoder passwordEncoder,
                                JwtTokenServiceInterface jwtTokenService,
                                VerificarPlanoOperation verificarPlano) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.verificarPlano = verificarPlano;
    }

    @Transactional
    public LoginResponse execute(LoginUsuarioDTO loginRequest,
                                 String path,
                                 HttpServletResponse response) {

        // 1. Busca usuário por e-mail
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, path));

        // 2. Bloqueia se o e-mail ainda não foi confirmado
        if (!usuario.isEmailConfirmado()) {
            throw new ApiException("E-mail não confirmado. Verifique sua caixa de entrada.", HttpStatus.BAD_REQUEST, path);
        }

        // 3. Validação de Senha / Conversão de conta Google
        if (usuario.isLoginGoogle()) {
            // Se o usuário era apenas Google e agora definiu uma senha, desmarca a flag
            usuario.setSenha(passwordEncoder.encode(loginRequest.senha()));
            usuario.setLoginGoogle(false);
            usuarioRepository.save(usuario);
        } else if (!passwordEncoder.matches(loginRequest.senha(), usuario.getSenha())) {
            throw new ApiException("Senha incorreta.", HttpStatus.UNAUTHORIZED, path);
        }

        // 4. Verificação de Expiração do Plano
        // Usamos o try-catch para permitir o login mesmo se o plano venceu.
        // O método 'validarAcessoTemporario' já atualizará o status no banco para INATIVO.
        try {
            verificarPlano.validarAcessoTemporario(usuario);
        } catch (ApiException e) {
            // Ignoramos a interrupção aqui. O usuário loga, mas o status dele no token/banco será INATIVO.
            // Isso permite que o Frontend redirecione ele para a página de Planos/Pagamento.
        }

        // 5. Geração do Token JWT
        String token = jwtTokenService.gerarToken(usuario);

        // 6. Configuração do Cookie (Seguro e HttpOnly)
        Cookie jwtCookie = new Cookie("jwt_token", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Em produção (HTTPS), altere para true
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(7 * 24 * 60 * 60); // 7 dias de validade
        response.addCookie(jwtCookie);

        // 7. Resposta para o Frontend (Next.js)
        return new LoginResponse(
                token,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoPlano(),
                usuario.getFoto()
        );
    }
}