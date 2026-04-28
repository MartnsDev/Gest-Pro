package br.com.gestpro.marketplace.controller;

import br.com.gestpro.marketplace.webhook.WebhookMercadoLivreService;
import br.com.gestpro.marketplace.webhook.WebhookShopeeService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints de recebimento de webhooks dos marketplaces.

  IMPORTANTE: estas rotas devem ser liberadas no SecurityFilterChain
  (sem autenticação JWT), pois são chamadas diretamente pelos marketplaces.
  A autenticidade é garantida pela validação do HMAC em cada service.

  POST /api/v1/webhooks/shopee          eventos da Shopee
  POST /api/v1/webhooks/mercadolivre    notificações do Mercado Livre
 */
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final WebhookShopeeService shopeeService;
    private final WebhookMercadoLivreService mlService;

    /**
      Shopee exige resposta 200 em < 5 segundos.
      A validação e processamento são síncronos aqui mas podem ser movidos
      para uma fila (ex: RabbitMQ) se o volume crescer.
     */
    @PostMapping("/shopee")
    public ResponseEntity<Void> shopee(
            @RequestBody(required = false) byte[] rawBody,
            @RequestHeader(value = "Authorization", defaultValue = "") String authorization,
            @org.springframework.web.bind.annotation.RequestBody(required = false)
            JsonNode payload) {

        log.info("Webhook Shopee recebido");
        try {
            shopeeService.processar(rawBody, authorization, payload);
        } catch (Exception e) {
            // Logamos o erro mas retornamos 200 para evitar que a Shopee
            // fique reenviando o mesmo evento indefinidamente.
            log.error("Erro ao processar webhook Shopee: {}", e.getMessage(), e);
        }
        return ResponseEntity.ok().build();
    }

    /**
      Mercado Livre reenvia o evento se não receber 200 em 2s.
      Mesmo padrão: responde 200 imediatamente, loga falhas.
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