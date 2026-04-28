package br.com.gestpro.marketplace.model;

import br.com.gestpro.pedidos.CanalVenda;
import br.com.gestpro.produto.model.Produto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Vínculo entre um anúncio de marketplace e um produto interno do GestPro.
 *
 * Exemplo: anúncio "MLB123456789" da Shopee → Produto id=42 ("Tomada Macho Margirius").
 * Quando um webhook chega com esse item_id, o sistema sabe qual produto baixar do estoque.
 */
@Entity
@Table(
        name = "marketplace_product_link",
        uniqueConstraints = @UniqueConstraint(columnNames = {"marketplace", "anuncio_id"})
)
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MarketplaceProductLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CanalVenda marketplace;

    /**
     * ID do anúncio na plataforma (ex: "MLB123456789" no ML, "123456789" na Shopee).
     */
    @Column(name = "anuncio_id", nullable = false, length = 200)
    private String anuncioId;

    /** Nome do anúncio para exibição — atualizado a cada sincronização */
    @Column(name = "anuncio_titulo", length = 500)
    private String anuncioTitulo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}