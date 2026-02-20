package br.com.gestpro.auth.dto.AuthDTO;

import br.com.gestpro.auth.model.Usuario;

public record AuthResponseDTO(String token, Usuario usuario) {}
