package br.com.gestpro.marketplace.controller;

import br.com.gestpro.marketplace.webhook.WebhookMercadoLivreService;
import br.com.gestpro.marketplace.webhook.WebhookShopeeService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de recebimento de webhooks dos marketplaces.
 *
 * Estas rotas são públicas para receber eventos assinados dos marketplaces.
 * (sem autenticação JWT), pois são chamadas diretamente pelos marketplaces.
 * A autenticidade é garantida pela validação do HMAC em cada service.
 *
 *  POST /api/v1/webhooks/shopee          eventos da Shopee
 *  POST /api/v1/webhooks/mercadolivre    notificações do Mercado Livre
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final WebhookShopeeService shopeeService;
    private final WebhookMercadoLivreService mlService;
    private final ObjectMapper objectMapper;

    /**
     * O corpo original é usado na validação da assinatura.
     * O JsonNode é montado a partir do rawBody manualmente, porque o corpo
     * da requisição HTTP só pode ser lido uma vez — ter dois parâmetros
     * @RequestBody fazia o segundo falhar silenciosamente (por isso nenhum
     * pedido da Shopee estava sendo criado).
     *
     * Shopee exige resposta 200 em < 5 segundos.
     */
    @PostMapping("/shopee")
    public ResponseEntity<Void> shopee(
            @RequestBody(required = false) byte[] rawBody,
            @RequestHeader(value = "Authorization", defaultValue = "") String authorization) {

        log.info("Webhook Shopee recebido");
        try {
            if (rawBody == null || rawBody.length == 0) {
                log.warn("Webhook Shopee recebido com corpo vazio");
                return ResponseEntity.ok().build();
            }
            JsonNode payload = objectMapper.readTree(rawBody);
            shopeeService.processar(rawBody, authorization, payload);
        } catch (Exception e) {
            // Logamos o erro mas retornamos 200 para evitar que a Shopee
            // fique reenviando o mesmo evento indefinidamente.
            log.error("Erro ao processar webhook Shopee: {}", e.getMessage(), e);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Mercado Livre reenvia o evento se não receber 200 em 2s.
     * Mesmo padrão: responde 200 imediatamente, loga falhas.
     */
    @PostMapping("/mercadolivre")
    public ResponseEntity<Void> mercadoLivre(
            @RequestHeader(value = "x-signature",  defaultValue = "") String xSignature,
            @RequestHeader(value = "x-request-id", defaultValue = "") String xRequestId,
            @RequestBody JsonNode payload) {

        log.info("Webhook ML recebido topic={}", payload.path("topic").asText());
        try {
            mlService.processar(xSignature, xRequestId, payload);
        } catch (Exception e) {
            log.error("Erro ao processar webhook ML: {}", e.getMessage(), e);
        }
        return ResponseEntity.ok().build();
    }
}
