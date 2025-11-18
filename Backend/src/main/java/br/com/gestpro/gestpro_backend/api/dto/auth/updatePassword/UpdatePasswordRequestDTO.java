package br.com.gestpro.gestpro_backend.api.dto.auth.updatePassword;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePasswordRequestDTO {

    @NotBlank
    private String email;

    @NotBlank
    private String codigoVerificacao;

    @NotBlank
    private String novaSenha;
}
