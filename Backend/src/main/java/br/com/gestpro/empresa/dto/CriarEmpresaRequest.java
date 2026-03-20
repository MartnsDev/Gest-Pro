package br.com.gestpro.empresa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CriarEmpresaRequest {

    // Preenchido pelo controller via JWT — não vem do body
    private String emailUsuario;

    @NotBlank(message = "Nome fantasia é obrigatório")
    private String nomeFantasia;

    private String cnpj;
}