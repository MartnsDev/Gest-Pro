package br.com.gestpro.marketplace.repository;

import br.com.gestpro.marketplace.model.MarketplaceProductLink;
import br.com.gestpro.pedidos.CanalVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceProductLinkRepository extends JpaRepository<MarketplaceProductLink, Long> {

    /**
     * Busca o vínculo pelo ID do anúncio — chamado durante o processamento do webhook
     * para mapear item do marketplace → produto interno.
     */
    Optional<MarketplaceProductLink> findByMarketplaceAndAnuncioId(
            CanalVenda marketplace, String anuncioId);

    /** Lista todos os vínculos de um produto */
    List<MarketplaceProductLink> findByProdutoId(Long produtoId);

    /** Lista todos os vínculos de produtos de uma empresa para um marketplace */
    List<MarketplaceProductLink> findByMarketplaceAndProduto_Empresa_Id(
            CanalVenda marketplace, Long empresaId);

    boolean existsByMarketplaceAndAnuncioId(CanalVenda marketplace, String anuncioId);
}