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
 * Client HTTP para a API da Shopee.
 * Usa o access_token armazenado em MarketplaceConnection para autenticar.
 *
 * Referência: https://open.shopee.com/documents/v2/v2.order.get_order_detail
 */
@Component
@RequiredArgsConstructor
public class ShopeeApiClient {

    @Value("${gestpro.marketplace.shopee.base-url:https://partner.shopeemobile.com}")
    private String baseUrl;

    @Value("${gestpro.marketplace.shopee.partner-id:0}")
    private String partnerId;

    private final MarketplaceConnectionRepository connectionRepository;
    private final RestClient restClient = RestClient.create();

    public JsonNode buscarDetalhePedido(String shopId, String orderId) {
        MarketplaceConnection conn = connectionRepository
                .findBySellerIdAndMarketplaceAndActiveTrue(shopId, CanalVenda.SHOPEE)
                .orElseThrow(() -> new ApiException(
                        "Token Shopee não encontrado para shop " + shopId,
                        HttpStatus.INTERNAL_SERVER_ERROR, "/webhook/shopee"));

        return restClient.get()
                .uri(baseUrl + "/api/v2/order/get_order_detail"
                        + "?partner_id=" + partnerId
                        + "&shop_id=" + shopId
                        + "&access_token=" + conn.getAccessToken()
                        + "&order_sn_list=" + orderId
                        + "&response_optional_fields=item_list,recipient_address,actual_shipping_cost,payment_method")
                .retrieve()
                .body(JsonNode.class);
    }
}

