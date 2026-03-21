package br.com.gestpro.produto.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CriarProdutoDTO {

    // Preenchido pelo controller via JWT
    private String emailUsuario;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    private String categoria;

    private String descricao;

    private String unidade; // UN, KG, L, CX...

    private String codigoBarras;

    /** Preço de venda — obrigatório */
    @NotNull(message = "Preço de venda é obrigatório")
    @DecimalMin(value = "0.0", message = "Preço não pode ser negativo")
    private BigDecimal preco;

    /** Preço de custo — opcional */
    @DecimalMin(value = "0.0", message = "Preço de custo não pode ser negativo")
    private BigDecimal precoCusto;

    @NotNull(message = "Quantidade em estoque é obrigatória")
    @Min(value = 0, message = "Estoque não pode ser negativo")
    private Integer quantidadeEstoque;

    @Min(value = 0, message = "Estoque mínimo não pode ser negativo")
    private Integer estoqueMinimo = 0;

    private Boolean ativo = true;
}