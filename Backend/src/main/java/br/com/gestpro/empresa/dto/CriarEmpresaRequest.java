package br.com.gestpro.empresa.dto;

import lombok.Data;

@Data
public class CriarEmpresaRequest {
    private String nomeFantasia;
    private String cnpj;
    private Long usuarioId;
    private Long planoId;
}