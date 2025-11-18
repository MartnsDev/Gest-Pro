package br.com.gestpro.gestpro_backend.domain.model.modules.venda;

import br.com.gestpro.gestpro_backend.domain.model.modules.produto.Produto;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "item_venda")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemVenda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venda_id", nullable = false)
    @JsonBackReference
    private Venda venda;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidade = 1;

    @Column(nullable = false)
    private BigDecimal precoUnitario = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    /**
     * Retorna o valor total do item (preço * quantidade)
     */
    public BigDecimal getValorTotal() {
        return precoUnitario != null && quantidade != null
                ? precoUnitario.multiply(BigDecimal.valueOf(quantidade))
                : BigDecimal.ZERO;
    }

    /**
     * Atualiza subtotal automaticamente antes de salvar ou atualizar
     */
    @PrePersist
    @PreUpdate
    public void calcularSubtotal() {
        this.subtotal = getValorTotal();
    }

    /**
     * Construtor auxiliar para criar ItemVenda a partir de Produto e quantidade
     */
    public ItemVenda(Produto produto, Integer quantidade) {
        this.produto = produto;
        this.quantidade = quantidade != null && quantidade > 0 ? quantidade : 1;
        this.precoUnitario = produto != null ? produto.getPreco() : BigDecimal.ZERO;
        this.subtotal = getValorTotal();
    }
}
