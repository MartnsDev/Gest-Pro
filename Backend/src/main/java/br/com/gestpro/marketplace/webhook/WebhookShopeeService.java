package br.com.gestpro.marketplace.webhook;

import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.marketplace.client.ShopeeApiClient;
import br.com.gestpro.pedidos.CanalVenda;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;


import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

/**
 * Adapter para o webhook da Shopee.
 *
 * Documentação de referência:
 * https://open.shopee.com/documents/v2/v2.push.get_push_config
 *
 * Fluxo:
 *  1. Shopee envia POST com header Authorization contendo HMAC-SHA256
 *  2. Validamos o HMAC com o partner_key configurado
 *  3. Se o code == 4 (ORDER_STATUS_UPDATE), buscamos detalhes e criamos o pedido
 */
@Service
@RequiredArgsConstructor
public class WebhookShopeeService {

    private static final Logger log = LoggerFactory.getLogger(WebhookShopeeService.class);

    @Value("${gestpro.marketplace.shopee.partner-key:CONFIGURE_ME}")
    private String shopeePartnerKey;

    @Value("${gestpro.marketplace.shopee.partner-id:0}")
    private String shopeePartnerId;

    private final WebhookProcessorService processor;
    private final ShopeeApiClient shopeeApiClient; // declarado abaixo

    /**
     * Ponto de entrada chamado pelo WebhookController.
     *
     * @param rawBody  corpo bruto da requisição (bytes originais para validar HMAC)
     * @param authorization  header Authorization enviado pela Shopee
     * @param payload  corpo já deserializado como JsonNode
     */
    public void processar(byte[] rawBody, String authorization, JsonNode payload) {
        validarAssinatura(rawBody, authorization);

        int code = payload.path("code").asInt(-1);

        // code 4 = novo pedido / atualização de status
        if (code != 4) {
            log.debug("Evento Shopee ignorado (code={})", code);
            return;
        }

        String shopId   = payload.path("shop_id").asText();
        String orderId  = payload.path("data").path("ordersn").asText();

        // Busca detalhes completos via API da Shopee
        JsonNode detalhes = shopeeApiClient.buscarDetalhePedido(shopId, orderId);

        WebhookOrderDTO order = converterParaOrderDTO(shopId, orderId, detalhes);
        processor.processarPedido(order);
    }

    // ─── Validação HMAC ────────────────────────────────────────────────────────

    private void validarAssinatura(byte[] rawBody, String authorization) {
        try {
            // Shopee assina: partner_id + url_path + timestamp + access_token + shop_id
            // O header Authorization contém o HMAC-SHA256 em hex
            String expectedHmac = calcularHmac(rawBody, shopeePartnerKey);
            if (!expectedHmac.equalsIgnoreCase(authorization)) {
                log.warn("Assinatura Shopee inválida. Recebida: {}", authorization);
                throw new ApiException("Assinatura inválida.", HttpStatus.UNAUTHORIZED, "/webhook/shopee");
            }
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao validar assinatura Shopee", e);
            throw new ApiException("Erro na validação da assinatura.", HttpStatus.INTERNAL_SERVER_ERROR, "/webhook/shopee");
        }
    }

    private String calcularHmac(byte[] data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(data));
    }

    // ─── Conversão do payload ─────────────────────────────────────────────────

    private WebhookOrderDTO converterParaOrderDTO(String shopId, String orderId, JsonNode detalhe) {
        List<WebhookOrderDTO.ItemDTO> itens = new ArrayList<>();
        JsonNode itemList = detalhe.path("item_list");

        if (itemList.isArray()) {
            for (JsonNode item : itemList) {
                // Na Shopee, o ID do anúncio é o item_id
                String anuncioId = item.path("item_id").asText();
                int qty = item.path("model_quantity_purchased").asInt(1);
                itens.add(WebhookOrderDTO.ItemDTO.builder()
                        .anuncioId(anuncioId)
                        .quantidade(qty)
                        .build());
            }
        }

        // Shopee sempre usa cartão de crédito ou saldo — mapeamos como OUTRO genericamente
        // O operador pode ajustar manualmente se necessário
        FormaDePagamento forma = mapearFormaPagamento(
                detalhe.path("payment_method").asText(""));

        BigDecimal frete = detalhe.path("actual_shipping_cost").decimalValue();
        String endereco  = formatarEnderecoShopee(detalhe.path("recipient_address"));

        return WebhookOrderDTO.builder()
                .orderIdExterno(orderId)
                .sellerId(shopId)
                .marketplace(CanalVenda.SHOPEE)
                .formaPagamento(forma)
                .custoFrete(frete)
                .enderecoEntrega(endereco)
                .itens(itens)
                .build();
    }

    private FormaDePagamento mapearFormaPagamento(String paymentMethod) {
        return switch (paymentMethod.toLowerCase()) {
            case "credit_card", "debit_card" -> FormaDePagamento.CARTAO_CREDITO;
            case "bank_transfer"             -> FormaDePagamento.PIX;
            default                          -> FormaDePagamento.OUTRO;
        };
    }

    private String formatarEnderecoShopee(JsonNode addr) {
        if (addr.isMissingNode()) return null;
        return String.format("%s, %s, %s - %s",
                addr.path("full_address").asText(""),
                addr.path("district").asText(""),
                addr.path("city").asText(""),
                addr.path("zipcode").asText(""));
    }
}