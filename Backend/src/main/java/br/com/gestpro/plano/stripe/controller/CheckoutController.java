package br.com.gestpro.plano.stripe.controller;

import br.com.gestpro.plano.service.AtualizarPlanoOperation;
import br.com.gestpro.plano.stripe.dto.CheckoutRequest;
import br.com.gestpro.plano.stripe.PlanoTipo;
import br.com.gestpro.plano.stripe.repository.AssinaturaRepository;
import br.com.gestpro.plano.stripe.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Configuration
public class CheckoutController {

    private final PaymentService          paymentService;
    private final AtualizarPlanoOperation atualizarPlano;
    private final AssinaturaRepository    assinaturaRepository;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @Value("${STRIPE_API_KEY}")
    private String stripeApiKey;


    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckout(
            @Valid @RequestBody CheckoutRequest request) {
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

            String priceId    = session.getLineItems().getData().get(0).getPrice().getId();
            PlanoTipo plano   = PlanoTipo.fromPriceId(priceId);

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
     * <p>Eventos tratados:
     * <ul>
     *   <li>checkout.session.completed    → ativa o plano (primeiro pagamento)</li>
     *   <li>invoice.payment_succeeded     → renova o vencimento (subscription_cycle / subscription_update)</li>
     *   <li>invoice.payment_failed        → marca inadimplente e bloqueia acesso</li>
     *   <li>customer.subscription.updated → renova plano APENAS se ainda ativo na Stripe</li>
     *   <li>customer.subscription.deleted → cancela o plano definitivamente</li>
     * </ul>
     *
     * <p>Sempre retorna 200 — a Stripe reenvia por até 3 dias se receber != 2xx.
     * Erros de negócio são logados mas não propagados para fora deste método.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        // 1. Valida assinatura HMAC — rejeita com 400 se inválida
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

        // 2. Processa — nunca lança exceção para fora (Stripe reentregaria indefinidamente)
        try {
            String rawJson = event.getDataObjectDeserializer().getRawJson();
            JsonNode obj   = MAPPER.readTree(rawJson);

            switch (event.getType()) {

                case "checkout.session.completed" -> handleCheckoutCompleted(event);

                case "invoice.payment_succeeded"  -> handleInvoicePaymentSucceeded(obj);

                case "invoice.payment_failed"     -> {
                    String subscription = textoOuNull(obj, "subscription");
                    log.warn("invoice.payment_failed | subscription={}", subscription);
                    if (subscription != null) {
                        atualizarPlano.marcarInadimplente(subscription);
                    }
                }

                case "customer.subscription.updated" -> handleSubscriptionUpdated(obj);

                case "customer.subscription.deleted" -> {
                    String subscriptionId = textoOuNull(obj, "id");
                    log.info("customer.subscription.deleted | subscription={}", subscriptionId);
                    if (subscriptionId != null) {
                        atualizarPlano.cancelarPlano(subscriptionId);
                    }
                }

                default -> log.debug("Evento ignorado: {}", event.getType());
            }

        } catch (Exception e) {
            log.error("Erro ao processar webhook type={} id={}: {}",
                    event.getType(), event.getId(), e.getMessage(), e);
        }

        // Sempre 200 para a Stripe não reenviar indefinidamente
        return ResponseEntity.ok("");
    }

    // ─── Handlers privados por tipo de evento ─────────────────────────────────

    /**
     * checkout.session.completed — primeiro pagamento confirmado.
     *
     * Recupera o e-mail do cliente:
     * 1. Pelo campo customerEmail da sessão (cliente novo)
     * 2. Pela assinatura existente no banco via customerId (cliente recorrente sem email no evento)
     * 3. Lança RuntimeException se nenhuma das opções resolver (será logado, não reentregue)
     */
    private void handleCheckoutCompleted(Event event) {
        Session session = desserializar(event, Session.class);

        String email = session.getCustomerEmail();

        if (email == null || email.isBlank()) {
            // Cliente já existia na Stripe — tenta recuperar pelo customerId
            String customerId = session.getCustomer();
            email = assinaturaRepository
                    .findByStripeCustomerId(customerId)
                    .map(a -> a.getUsuario().getEmail())
                    .orElse(null);

            if (email == null) {
                // Último recurso: busca a assinatura pelo subscriptionId
                // (pode ter sido criada por outro fluxo)
                email = assinaturaRepository
                        .findByStripeSubscriptionId(session.getSubscription())
                        .map(a -> a.getUsuario().getEmail())
                        .orElseThrow(() -> new RuntimeException(
                                "Não foi possível identificar o e-mail do cliente. " +
                                        "customerId=" + customerId +
                                        " | subscriptionId=" + session.getSubscription()
                        ));
            }
        }

        atualizarPlano.ativarPlano(email, session.getSubscription(), session.getCustomer());
    }

    /**
     * invoice.payment_succeeded — pagamento de fatura confirmado.
     *
     * Só aciona renovação para:
     * - subscription_cycle  → cobrança mensal automática
     * - subscription_update → upgrade ou downgrade de plano
     *
     * subscription_create é ignorado aqui pois já é tratado em checkout.session.completed.
     */
    private void handleInvoicePaymentSucceeded(JsonNode obj) {
        String reason       = textoOuNull(obj, "billing_reason");
        String subscription = textoOuNull(obj, "subscription");

        log.info("invoice.payment_succeeded | billing_reason={} | subscription={}", reason, subscription);

        if (subscription == null) {
            log.warn("invoice.payment_succeeded sem subscriptionId — ignorado");
            return;
        }

        if ("subscription_cycle".equals(reason) || "subscription_update".equals(reason)) {
            atualizarPlano.renovarPlano(subscription);
        } else {
            log.debug("invoice.payment_succeeded ignorado para billing_reason={}", reason);
        }
    }

    /**
     * customer.subscription.updated — plano atualizado (upgrade, downgrade, cancelamento agendado).
     *
     * ATENÇÃO: este evento também dispara quando cancel_at_period_end = true.
     * Nesse caso NÃO renovamos — o plano será cancelado em customer.subscription.deleted.
     *
     * Só renova se:
     * 1. cancel_at_period_end = false (não está agendado para cancelar)
     * 2. status = "active" ou "trialing" na Stripe
     */
    private void handleSubscriptionUpdated(JsonNode obj) {
        String subscriptionId    = textoOuNull(obj, "id");
        String status            = textoOuNull(obj, "status");
        JsonNode cancelAtEnd     = obj.get("cancel_at_period_end");

        log.info("customer.subscription.updated | subscription={} | status={} | cancel_at_period_end={}",
                subscriptionId, status, cancelAtEnd);

        if (subscriptionId == null) {
            log.warn("customer.subscription.updated sem id — ignorado");
            return;
        }

        boolean cancelAgendado = cancelAtEnd != null && cancelAtEnd.asBoolean(false);

        if (cancelAgendado) {
            log.info("Assinatura {} agendada para cancelamento — renovação ignorada.", subscriptionId);
            return;
        }

        if (!"active".equals(status) && !"trialing".equals(status)) {
            log.info("customer.subscription.updated ignorado: status={} para subscription={}",
                    status, subscriptionId);
            return;
        }

        // AtualizarPlanoOperation.renovarPlano() tem idempotência interna:
        // ignora se o vencimento da Stripe não avançou o já salvo no banco.
        atualizarPlano.renovarPlano(subscriptionId);
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    /** Lê um campo de texto do JsonNode; retorna null se ausente ou nulo. */
    private String textoOuNull(JsonNode node, String campo) {
        JsonNode valor = node.get(campo);
        return (valor != null && !valor.isNull()) ? valor.asText() : null;
    }

    /**
     * Deserializa o objeto do evento via deserializador padrão da Stripe.
     * Lança RuntimeException se o objeto estiver ausente ou for de tipo inesperado.
     */
    @SuppressWarnings("unchecked")
    private <T extends StripeObject> T desserializar(Event event, Class<T> clazz) {
        Optional<StripeObject> objectOpt = event.getDataObjectDeserializer().getObject();

        if (objectOpt.isEmpty()) {
            throw new RuntimeException(
                    "Objeto ausente no evento " + event.getType() +
                            " — verifique se a versão da API no webhook bate com a do SDK."
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


    @jakarta.annotation.PostConstruct
    public void setupStripe() {
        // Isso define a chave globalmente para o SDK do Stripe usar
        com.stripe.Stripe.apiKey = stripeApiKey;
        log.info("Stripe SDK inicializado com a chave: {}...", stripeApiKey.substring(0, 7));
    }
}