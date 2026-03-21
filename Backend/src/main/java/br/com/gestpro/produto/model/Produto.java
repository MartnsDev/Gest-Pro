package br.com.gestpro.produto.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.empresa.model.Empresa;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Entity
@Table(name = "produto")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 80)
    private String categoria;

    @Column(length = 500)
    private String descricao;

    @Column(length = 60)
    private String unidade;

    @Column(name = "codigo_barras", length = 60)
    private String codigoBarras;

    @Column(name = "preco", nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "preco_custo", precision = 10, scale = 2)
    private BigDecimal precoCusto;

    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque;

    @Column(name = "estoque_minimo")
    private Integer estoqueMinimo = 0;

    @Transient
    private Long quantidade;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(nullable = false)
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) dataCriacao = LocalDateTime.now();
    }

    public void setPreco(BigDecimal preco) {
        if (preco == null || preco.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("Preço de venda não pode ser negativo");
        this.preco = preco;
    }

    public void setQuantidadeEstoque(Integer q) {
        if (q == null || q < 0)
            throw new IllegalArgumentException("Estoque não pode ser negativo");
        this.quantidadeEstoque = q;
    }

    public BigDecimal getLucroUnitario() {
        if (preco == null || precoCusto == null) return null;
        return preco.subtract(precoCusto).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getMargemLucro() {
        if (preco == null || precoCusto == null || preco.compareTo(BigDecimal.ZERO) == 0) return null;
        return preco.subtract(precoCusto)
                .divide(preco, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}