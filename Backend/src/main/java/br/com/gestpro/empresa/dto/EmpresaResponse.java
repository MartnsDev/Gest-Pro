package br.com.gestpro.empresa.dto;

import lombok.Data;

@Data
public class EmpresaResponse {
    private Long id;
    private String nomeFantasia;
    private String cnpj;
    private String planoNome;
    private int limiteCaixas;
    private Boolean ativo;
}

