package br.com.gestpro.auth.dto.AuthDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginUsuarioDTO(

        @NotBlank(message = "E-mail é obrigatório")
        @Email(message = "E-mail inválido")
        @Size(max = 254)
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, max = 72)
        String senha
) {}