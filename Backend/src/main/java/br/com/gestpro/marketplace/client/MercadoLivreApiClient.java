package br.com.gestpro.marketplace.client;

import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.marketplace.model.MarketplaceConnection;
import br.com.gestpro.marketplace.repository.MarketplaceConnectionRepository;
import br.com.gestpro.pedidos.CanalVenda;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Client HTTP para a API do Mercado Livre.
 *
 * Referência: https://developers.mercadolivre.com.br/pt_br/pedidos-e-entregas
 */
@Component
@RequiredArgsConstructor
public class MercadoLivreApiClient {

    @Value("${gestpro.marketplace.mercadolivre.base-url:https://api.mercadolibre.com}")
    private String baseUrl;

    private final MarketplaceConnectionRepository connectionRepository;
    private final RestClient restClient = RestClient.create();

    public JsonNode buscarDetalhePedido(String orderId, String sellerId) {
        MarketplaceConnection conn = connectionRepository
                .findBySellerIdAndMarketplaceAndActiveTrue(sellerId, CanalVenda.MERCADO_LIVRE)
                .orElseThrow(() -> new ApiException(
                        "Token ML não encontrado para seller " + sellerId,
                        HttpStatus.INTERNAL_SERVER_ERROR, "/webhook/mercadolivre"));

        return restClient.get()
                .uri(baseUrl + "/orders/" + orderId)
                .header("Authorization", "Bearer " + conn.getAccessToken())
                .retrieve()
                .body(JsonNode.class);
    }
}