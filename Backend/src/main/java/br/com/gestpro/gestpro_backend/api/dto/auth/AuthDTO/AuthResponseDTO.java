package br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;

public record AuthResponseDTO(String token, Usuario usuario) {}
