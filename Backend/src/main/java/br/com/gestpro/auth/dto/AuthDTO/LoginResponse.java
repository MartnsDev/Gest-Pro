package br.com.gestpro.auth.dto.AuthDTO;

import br.com.gestpro.auth.TipoPlano;

public record LoginResponse(
        String token,
        String nome,
        String email,
        TipoPlano tipoPlano,
        String foto
        // StatusAcesso statusAcesso
) {
}
