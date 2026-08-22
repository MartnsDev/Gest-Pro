package br.com.gestpro.empresa.dto;

import lombok.Data;

@Data
public class EmpresaResponse {
    private Long id;
    private String nomeFantasia;
    private String cnpj;
    private String cpf;
    private String razaoSocial;
    private String cep;
    private String logradouro;
    private String numero;
    private String bairro;
    private String cidade;
    private String uf;
    private String telefone;
    private String planoNome;
    private int limiteCaixas;
    private Boolean ativo;
}
