package br.com.gestpro.configuracao.dto;

import lombok.Data;

@Data
public class TrocarSenhaDTO {
    private String codigo;
    private String novaSenha;
    private String confirmarSenha;
}