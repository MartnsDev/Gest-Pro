package br.com.gestpro.auth.service.jwtService;


import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.infra.jwt.JwtService;
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
