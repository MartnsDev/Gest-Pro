package br.com.gestpro.plano.stripe.controller;

import br.com.gestpro.plano.service.AtualizarPlanoOperation;
import br.com.gestpro.plano.stripe.dto.CheckoutRequest;
import br.com.gestpro.plano.stripe.dto.PlanoTipo;
import br.com.gestpro.plano.stripe.repository.AssinaturaRepository;
import br.com.gestpro.plano.stripe.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class CheckoutController {

    private final PaymentService          paymentService;
    private final AtualizarPlanoOperation atualizarPlano;
    private final AssinaturaRepository    assinaturaRepository;

    // Jackson já está no classpath do Spring Boot — sem dependência extra
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    // ─── Criar sessão de checkout ─────────────────────────────────────────────

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckout(@Valid @RequestBody CheckoutRequest request) {
        try {
            String checkoutUrl = paymentService.createCheckoutSession(
                    request.plano(),
                    request.customerEmail()
            );
            return ResponseEntity.ok(Map.of("url", checkoutUrl));

        } catch (Exception e) {
            log.error("Erro ao criar sessão de checkout: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Não foi possível iniciar o checkout. Tente novamente."));
        }
    }

    // ─── Info da sessão ───────────────────────────────────────────────────────

    /**
     * Retorna o plano contratado a partir do session_id.
     * Usado pela página /payment/sucesso para mostrar o plano correto
     * sem depender do webhook já ter processado.
     *
     * GET /api/payments/session-info?sessionId=cs_xxx
     * Retorna: { "priceId": "price_xxx", "plano": "PRO" }
     */
    @GetMapping("/session-info")
    public ResponseEntity<Map<String, String>> getSessionInfo(@RequestParam String sessionId) {
        try {
            Session session = Session.retrieve(
                    sessionId,
                    com.stripe.param.checkout.SessionRetrieveParams.builder()
                            .addExpand("line_items")
                            .build(),
                    null
            );

            String priceId = session.getLineItems().getData().get(0).getPrice().getId();
            PlanoTipo plano = PlanoTipo.fromPriceId(priceId);

            return ResponseEntity.ok(Map.of(
                    "priceId", priceId,
                    "plano",   plano.name()
            ));

        } catch (Exception e) {
            log.error("Erro ao buscar session-info para sessionId={}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Sessão inválida ou expirada"));
        }
    }

    // ─── Webhook da Stripe ────────────────────────────────────────────────────

    /**
     * Endpoint chamado automaticamente pela Stripe após cada evento relevante.
     *
     * Usa getRawJson() + Jackson para extrair os campos necessários do payload —
     * evita qualquer dependência de GSON interno da stripe-java que pode não ser
     * acessível dependendo da versão.
     *
     * checkout.session.completed    → ativa o plano (primeiro pagamento)
     * invoice.payment_succeeded     → renova o vencimento (cobrança mensal)
     * invoice.payment_failed        → marca inadimplente e bloqueia acesso
     * customer.subscription.updated → atualiza plano (upgrade / downgrade)
     * customer.subscription.deleted → cancela o plano definitivamente
     *
     * Sempre retorna 200 — a Stripe reenvia por até 3 dias se receber != 2xx.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        // 1. Valida assinatura HMAC
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Webhook rejeitado: assinatura HMAC inválida.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Assinatura inválida");
        } catch (Exception e) {
            log.error("Webhook rejeitado: erro ao parsear payload — {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Payload inválido");
        }

        log.info("Webhook recebido: type={} | id={}", event.getType(), event.getId());

        // 2. Processa — nunca lança exceção para fora
        try {
            // Lê o objeto do evento via Jackson diretamente do rawJson
            // Isso é independente da versão da API e do GSON interno da Stripe
            String rawJson = event.getDataObjectDeserializer().getRawJson();
            JsonNode obj   = MAPPER.readTree(rawJson);

            switch (event.getType()) {

                case "checkout.session.completed" -> {
                    // Para Session ainda usamos o deserializador padrão pois
                    // precisamos de objetos tipados (getSubscription, getCustomer)
                    Session session = desserializar(event, Session.class);

                    String email = session.getCustomerEmail();
                    if (email == null) {
                        // Customer já existia na Stripe — recupera o email pelo customerId
                        email = assinaturaRepository
                                .findByStripeCustomerId(session.getCustomer())
                                .map(a -> a.getUsuario().getEmail())
                                .orElseThrow(() -> new RuntimeException(
                                        "customerEmail nulo e customer sem assinatura prévia: "
                                                + session.getCustomer()));
                    }

                    atualizarPlano.ativarPlano(email, session.getSubscription(), session.getCustomer());
                }

                case "invoice.payment_succeeded" -> {
                    // Lê billing_reason e subscription direto do JSON — sem GSON
                    String reason       = textoOuNull(obj, "billing_reason");
                    String subscription = textoOuNull(obj, "subscription");

                    log.info("invoice.payment_succeeded | billing_reason={} | subscription={}",
                            reason, subscription);

                    // subscription_create → primeiro pagamento (tratado em checkout.session.completed)
                    // subscription_cycle  → renovação mensal automática
                    // subscription_update → mudança de plano (upgrade/downgrade)
                    if ("subscription_cycle".equals(reason) || "subscription_update".equals(reason)) {
                        atualizarPlano.renovarPlano(subscription);
                    }
                }

                case "invoice.payment_failed" -> {
                    String subscription = textoOuNull(obj, "subscription");
                    log.warn("invoice.payment_failed | subscription={}", subscription);
                    atualizarPlano.marcarInadimplente(subscription);
                }

                case "customer.subscription.updated" -> {
                    String subscriptionId = textoOuNull(obj, "id");
                    log.info("customer.subscription.updated | subscription={}", subscriptionId);
                    atualizarPlano.renovarPlano(subscriptionId);
                }

                case "customer.subscription.deleted" -> {
                    String subscriptionId = textoOuNull(obj, "id");
                    log.info("customer.subscription.deleted | subscription={}", subscriptionId);
                    atualizarPlano.cancelarPlano(subscriptionId);
                }

                default -> log.debug("Evento ignorado: {}", event.getType());
            }

        } catch (Exception e) {
            log.error("Erro ao processar webhook type={} id={}: {}",
                    event.getType(), event.getId(), e.getMessage(), e);
        }

        return ResponseEntity.ok("");
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    /** Lê um campo de texto do JsonNode, retorna null se ausente ou nulo */
    private String textoOuNull(JsonNode node, String campo) {
        JsonNode valor = node.get(campo);
        return (valor != null && !valor.isNull()) ? valor.asText() : null;
    }

    /** Deserializa o objeto do evento via deserializador padrão da Stripe (usado para Session) */
    @SuppressWarnings("unchecked")
    private <T extends StripeObject> T desserializar(Event event, Class<T> clazz) {
        Optional<StripeObject> objectOpt = event.getDataObjectDeserializer().getObject();

        if (objectOpt.isEmpty()) {
            throw new RuntimeException(
                    "Objeto ausente no evento " + event.getType() +
                            " — verifique a versão da API no dashboard da Stripe."
            );
        }

        StripeObject stripeObj = objectOpt.get();

        if (!clazz.isInstance(stripeObj)) {
            throw new RuntimeException(
                    "Tipo inesperado no evento " + event.getType() +
                            " | esperado: " + clazz.getSimpleName() +
                            " | recebido: " + stripeObj.getClass().getSimpleName()
            );
        }

        return (T) stripeObj;
    }
}