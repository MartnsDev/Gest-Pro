package br.com.gestpro.produto.model;

import br.com.gestpro.auth.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque;

    /**
     * Campo apenas de apoio, não persistido.
     * Ideal quando o frontend envia JSON com uma quantidade temporária (ex: venda).
     */
    @Transient
    private Long quantidade;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(nullable = false)
    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // -------------------------------------
    // MÉTODOS DE CICLO DE VIDA
    // -------------------------------------

    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
    }

    // -------------------------------------
    // VALIDAÇÕES DE DOMÍNIO
    // -------------------------------------

    public void setPreco(BigDecimal preco) {
        if (preco == null || preco.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Preço não pode ser nulo ou negativo");
        }
        this.preco = preco;
    }

    public void setQuantidadeEstoque(Integer quantidadeEstoque) {
        if (quantidadeEstoque == null || quantidadeEstoque < 0) {
            throw new IllegalArgumentException("Estoque não pode ser nulo ou negativo");
        }
        this.quantidadeEstoque = quantidadeEstoque;
    }
}
