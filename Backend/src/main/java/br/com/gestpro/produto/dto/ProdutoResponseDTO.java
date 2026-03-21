package br.com.gestpro.produto.dto;

import br.com.gestpro.produto.model.Produto;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProdutoResponseDTO {
    private Long id;
    private String nome;
    private String categoria;
    private String descricao;
    private String unidade;
    private String codigoBarras;
    private BigDecimal preco;           // preço de venda
    private BigDecimal precoCusto;      // preço de custo
    private BigDecimal lucroUnitario;   // calculado
    private BigDecimal margemLucro;     // calculado em %
    private Integer quantidadeEstoque;
    private Integer estoqueMinimo;
    private Boolean ativo;
    private Long usuarioId;
    private String dataCriacao;

    public ProdutoResponseDTO(Produto p) {
        this.id                = p.getId();
        this.nome              = p.getNome();
        this.categoria         = p.getCategoria();
        this.descricao         = p.getDescricao();
        this.unidade           = p.getUnidade();
        this.codigoBarras      = p.getCodigoBarras();
        this.preco             = p.getPreco();
        this.precoCusto        = p.getPrecoCusto();
        this.lucroUnitario     = p.getLucroUnitario();
        this.margemLucro       = p.getMargemLucro();
        this.quantidadeEstoque = p.getQuantidadeEstoque();
        this.estoqueMinimo     = p.getEstoqueMinimo();
        this.ativo             = p.getAtivo();
        this.usuarioId         = p.getUsuario().getId();
        this.dataCriacao       = p.getDataCriacao() != null ? p.getDataCriacao().toString() : null;
    }
}