package br.com.gestpro.gestpro_backend.domain.service.authService;

import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginResponse;
import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginUsuarioDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.service.authService.jwtService.JwtTokenServiceInterface;
import br.com.gestpro.gestpro_backend.domain.service.authService.planoService.VerificarPlanoOperation;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class LoginManualOperation {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final VerificarPlanoOperation verificarPlano;
    private final JwtTokenServiceInterface jwtTokenService;

    public LoginManualOperation(UsuarioRepository usuarioRepository,
                                PasswordEncoder passwordEncoder,
                                VerificarPlanoOperation verificarPlano,
                                JwtTokenServiceInterface jwtTokenService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.verificarPlano = verificarPlano;
        this.jwtTokenService = jwtTokenService;
    }


    @Transactional
    public LoginResponse execute(LoginUsuarioDTO loginRequest, String path) {

        // 1. Busca usuário por email
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, path));

        // 2. Verifica se email foi confirmado
        if (!usuario.isEmailConfirmado()) {
            throw new ApiException("Email não confirmado", HttpStatus.BAD_REQUEST, path);
        }

        // 3. Se usuário era login Google, converte para manual
        if (usuario.isLoginGoogle()) {
            usuario.setSenha(passwordEncoder.encode(loginRequest.senha()));
            usuario.setLoginGoogle(false);
            usuarioRepository.save(usuario);
        } else {
            // 4. Verifica senha para usuários manuais
            if (!passwordEncoder.matches(loginRequest.senha(), usuario.getSenha())) {
                throw new ApiException("Senha inválida", HttpStatus.UNAUTHORIZED, path);
            }
        }

        // 5. Verifica plano EXPERIMENTAL ou ASSINANTE
        verificarPlano.execute(usuario);

        // 6. Gera token JWT
        String token = jwtTokenService.gerarToken(usuario);

        // 7. Retorna dados do usuário + token
        return new LoginResponse(
                token,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipoPlano(),
                usuario.getFoto()
        );
    }

}
