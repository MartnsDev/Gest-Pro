package br.com.gestpro.empresa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CriarEmpresaRequest {

    // Preenchido pelo controller via JWT — não vem do body
    private String emailUsuario;

    @NotBlank(message = "Nome fantasia é obrigatório")
    @Size(min = 2, max = 120, message = "Nome fantasia deve ter entre 2 e 120 caracteres")
    private String nomeFantasia;

    @Size(max = 18, message = "CPF/CNPJ excede o tamanho permitido")
    private String cnpj;

    private Boolean ativo;
}
