package br.com.gestpro.gestpro_backend.domain.service.authService;

import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginResponse;
import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginUsuarioDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusAcesso;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.service.authService.jwtService.JwtTokenServiceInterface;
import br.com.gestpro.gestpro_backend.domain.service.authService.planoService.VerificarPlanoOperation;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;

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

        // 1. Busca usuário
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.email())
                .orElseThrow(() ->
                        new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, path));

        // 2. Verifica email confirmado
        if (!usuario.isEmailConfirmado()) {
            throw new ApiException("Email não confirmado", HttpStatus.BAD_REQUEST, path);
        }

        // 3. Valida senha
        if (usuario.isLoginGoogle()) {
            usuario.setSenha(passwordEncoder.encode(loginRequest.senha()));
            usuario.setLoginGoogle(false);
            usuarioRepository.save(usuario);
        } else if (!passwordEncoder.matches(loginRequest.senha(), usuario.getSenha())) {
            throw new ApiException("Senha inválida", HttpStatus.UNAUTHORIZED, path);
        }

        // 4. Verifica plano ANTES de gerar token
        verificarPlano.execute(usuario);

        // Se plano expirado, exceção já foi lançada aqui

        // 5. Gera token
        String token = jwtTokenService.gerarToken(usuario);

        Cookie jwtCookie = new Cookie("jwt_token", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(jwtCookie);

        // 6. Retorna resposta
        return new LoginResponse(
                token,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoPlano(),
                usuario.getFoto()
        );
    }
}
