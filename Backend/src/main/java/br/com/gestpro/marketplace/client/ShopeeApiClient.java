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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

/**
 * Client HTTP para a API da Shopee.
 * Usa o access_token armazenado em MarketplaceConnection para autenticar.
 *
 * Referência: https://open.shopee.com/documents/v2/v2.order.get_order_detail
 *
 * CORREÇÃO: toda chamada autenticada da API v2 da Shopee exige "sign" e
 * "timestamp" na query string. A versão anterior não enviava nenhum dos
 * dois, então toda chamada retornava 401 (invalid signature) da Shopee.
 * sign = HMAC_SHA256(partner_id + path + timestamp + access_token + shop_id, partner_key)
 */
@Component
@RequiredArgsConstructor
public class ShopeeApiClient {

    private static final String PATH_ORDER_DETAIL = "/api/v2/order/get_order_detail";

    @Value("${gestpro.marketplace.shopee.base-url:https://partner.shopeemobile.com}")
    private String baseUrl;

    @Value("${gestpro.marketplace.shopee.partner-id:0}")
    private String partnerId;

    @Value("${gestpro.marketplace.shopee.partner-key:}")
    private String partnerKey;

    private final MarketplaceConnectionRepository connectionRepository;
    private final RestClient restClient = RestClient.create();

    public JsonNode buscarDetalhePedido(String shopId, String orderId) {
        MarketplaceConnection conn = connectionRepository
                .findBySellerIdAndMarketplaceAndActiveTrue(shopId, CanalVenda.SHOPEE)
                .orElseThrow(() -> new ApiException(
                        "Token Shopee não encontrado para shop " + shopId,
                        HttpStatus.INTERNAL_SERVER_ERROR, "/webhook/shopee"));

        long timestamp = Instant.now().getEpochSecond();
        String accessToken = conn.getAccessToken();
        String sign = assinar(PATH_ORDER_DETAIL, timestamp, accessToken, shopId);

        return restClient.get()
                .uri(baseUrl + PATH_ORDER_DETAIL
                        + "?partner_id=" + partnerId
                        + "&timestamp=" + timestamp
                        + "&sign=" + sign
                        + "&shop_id=" + shopId
                        + "&access_token=" + accessToken
                        + "&order_sn_list=" + orderId
                        + "&response_optional_fields=item_list,recipient_address,actual_shipping_cost,payment_method")
                .retrieve()
                .body(JsonNode.class);
    }

    private String assinar(String path, long timestamp, String accessToken, String shopId) {
        String baseString = partnerId + path + timestamp + accessToken + shopId;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(partnerKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(baseString.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new ApiException("Erro ao assinar requisição Shopee", HttpStatus.INTERNAL_SERVER_ERROR, "/webhook/shopee");
        }
    }
}