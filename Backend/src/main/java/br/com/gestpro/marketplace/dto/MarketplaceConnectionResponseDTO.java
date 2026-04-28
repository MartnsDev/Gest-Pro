package br.com.gestpro.marketplace.dto;

import br.com.gestpro.marketplace.model.MarketplaceConnection;
import br.com.gestpro.pedidos.CanalVenda;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
class MarketplaceConnectionResponseDTO {

    private final Long id;
    private final CanalVenda marketplace;
    private final String sellerId;
    private final boolean active;
    private final LocalDateTime tokenExpiresAt;
    private final LocalDateTime createdAt;
    private final List<LinkDTO> vinculos;

    public MarketplaceConnectionResponseDTO(MarketplaceConnection c, List<LinkDTO> vinculos) {
        this.id             = c.getId();
        this.marketplace    = c.getMarketplace();
        this.sellerId       = c.getSellerId();
        this.active         = c.isActive();
        this.tokenExpiresAt = c.getTokenExpiresAt();
        this.createdAt      = c.getCreatedAt();
        this.vinculos       = vinculos;
    }

    @Getter
    public static class LinkDTO {
        private final Long id;
        private final Long produtoId;
        private final String nomeProduto;
        private final String anuncioId;
        private final String anuncioTitulo;

        public LinkDTO(br.com.gestpro.marketplace.model.MarketplaceProductLink link) {
            this.id           = link.getId();
            this.produtoId    = link.getProduto().getId();
            this.nomeProduto  = link.getProduto().getNome();
            this.anuncioId    = link.getAnuncioId();
            this.anuncioTitulo = link.getAnuncioTitulo();
        }
    }
}