package br.com.gestpro.gestpro_backend.domain.service.authService.jwtService;


import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.infra.jwt.JwtService;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService implements JwtTokenServiceInterface {

    private final JwtService jwtService;

    public JwtTokenService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public String gerarToken(Usuario usuario) {
        return jwtService.gerarToken(usuario);
    }
}
