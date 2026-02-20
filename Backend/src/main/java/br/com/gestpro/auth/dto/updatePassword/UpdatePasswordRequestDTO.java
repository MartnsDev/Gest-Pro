package br.com.gestpro.auth.dto.updatePassword;

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
