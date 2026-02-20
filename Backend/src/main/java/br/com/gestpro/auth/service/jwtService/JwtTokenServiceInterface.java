package br.com.gestpro.auth.service.jwtService;

import br.com.gestpro.auth.model.Usuario;

public interface JwtTokenServiceInterface {
    String gerarToken(Usuario usuario);
}
