package br.com.gestpro.marketplace.repository;

import br.com.gestpro.marketplace.model.MarketplaceConnection;
import br.com.gestpro.pedidos.CanalVenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarketplaceConnectionRepository extends JpaRepository<MarketplaceConnection, Long> {

    /** Busca conexão ativa de uma empresa para um marketplace específico */
    Optional<MarketplaceConnection> findByEmpresaIdAndMarketplaceAndActiveTrue(
            Long empresaId, CanalVenda marketplace);

    /** Busca pelo sellerId — usado na validação do webhook para identificar a empresa */
    Optional<MarketplaceConnection> findBySellerIdAndMarketplaceAndActiveTrue(
            String sellerId, CanalVenda marketplace);

    /** Lista todas as conexões ativas de uma empresa */
    List<MarketplaceConnection> findByEmpresaIdAndActiveTrue(Long empresaId);

    /** Verifica se já existe conexão para o par empresa+marketplace */
    boolean existsByEmpresaIdAndMarketplace(Long empresaId, CanalVenda marketplace);
}