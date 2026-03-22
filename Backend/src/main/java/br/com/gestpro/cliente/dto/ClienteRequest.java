package br.com.gestpro.cliente.dto;

import lombok.Data;

@Data
public class ClienteRequest {
    private String nome;
    private String email;
    private String telefone;
    private String cpf;
    private String cnpj;
    private String contato;
    private String observacoes;
    private String tipo;      // "CLIENTE" | "FORNECEDOR"
    private Long   empresaId;
}