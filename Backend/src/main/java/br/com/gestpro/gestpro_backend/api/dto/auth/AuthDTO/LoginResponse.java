package br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO;

import br.com.gestpro.gestpro_backend.domain.model.enums.TipoPlano;

public record LoginResponse(
        String token,
        String nome,
        String email,
        TipoPlano tipoPlano,
        String foto
        // StatusAcesso statusAcesso
) {
}
