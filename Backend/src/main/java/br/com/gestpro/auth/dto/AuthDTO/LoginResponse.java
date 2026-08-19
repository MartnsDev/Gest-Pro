package br.com.gestpro.auth.dto.AuthDTO;

import br.com.gestpro.plano.TipoPlano;

public record LoginResponse(
        Long id,
        String nome,
        String email,
        TipoPlano tipoPlano,
        String foto,
        String statusAcesso,
        String expiracaoPlano
) {}