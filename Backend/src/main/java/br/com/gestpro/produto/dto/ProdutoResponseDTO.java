package br.com.gestpro.produto.dto;

import br.com.gestpro.produto.model.Produto;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProdutoResponseDTO {
    private Long id;
    private String nome;
    private BigDecimal preco;
    private Integer quantidadeEstoque;
    private Long quantidade;
    private Boolean ativo;
    private Long usuarioId;
    private String dataCriacao;

    public ProdutoResponseDTO(Produto produto) {
        this.id = produto.getId();
        this.nome = produto.getNome();
        this.preco = produto.getPreco();
        this.quantidadeEstoque = produto.getQuantidadeEstoque();
        this.quantidade = produto.getQuantidade();
        this.ativo = produto.getAtivo();
        this.usuarioId = produto.getUsuario().getId();
        this.dataCriacao = produto.getDataCriacao() != null ? produto.getDataCriacao().toString() : null;
    }

    // getters e setters
}



