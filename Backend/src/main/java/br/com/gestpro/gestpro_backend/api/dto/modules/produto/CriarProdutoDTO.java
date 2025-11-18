package br.com.gestpro.gestpro_backend.api.dto.modules.produto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CriarProdutoDTO {
    private String nome;
    private BigDecimal preco;
    private Integer quantidadeEstoque;
    private Long quantidade;
    private Boolean ativo;
    private Long usuarioId;

    // getters e setters
}

