package br.com.gestpro.nota.dto;

public record EmpresaInfo(
        String nome,
        String cnpj,
        String inscricaoEstadual,
        String endereco,
        String cidade,
        String estado,
        String cep,
        String telefone,
        String email
) {}
