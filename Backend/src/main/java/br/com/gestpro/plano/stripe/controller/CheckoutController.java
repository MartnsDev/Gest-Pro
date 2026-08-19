package br.com.gestpro.plano.stripe.controller;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.plano.service.AtualizarPlanoOperation;
import br.com.gestpro.plano.stripe.PlanoTipo;
import br.com.gestpro.plano.stripe.dto.CheckoutRequest;
import br.com.gestpro.plano.stripe.model.Assinatura;
import br.com.gestpro.plano.stripe.model.StripeWebhookEvent;
import br.com.gestpro.plano.stripe.repository.AssinaturaRepository;
import br.com.gestpro.plano.stripe.repository.StripeWebhookEventRepository;
import br.com.gestpro.plano.stripe.service.PaymentService;
import br.com.gestpro.plano.stripe.service.StripePriceProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionRetrieveParams;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class CheckoutController {

    private static final ObjectMapper MAPPER =
            new ObjectMapper();

    private final PaymentService paymentService;
    private final AtualizarPlanoOperation atualizarPlano;
    private final AssinaturaRepository assinaturaRepository;
    private final UsuarioRepository usuarioRepository;
    private final StripePriceProperties prices;
    private final StripeWebhookEventRepository eventRepository;

    @Value("${stripe.webhook.secret}")
    private String endpointSecret;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckout(
            @Valid @RequestBody CheckoutRequest request,
            Authentication authentication
    ) {
        Usuario usuario = obterUsuario(authentication);

        Assinatura assinaturaAtual =
                assinaturaRepository
                        .findByUsuarioEmail(usuario.getEmail())
                        .orElse(null);

        try {
            String checkoutUrl =
                    paymentService.criarCheckout(
                            usuario,
                            request.plano(),
                            assinaturaAtual
                    );

            return ResponseEntity.ok(
                    Map.of("url", checkoutUrl)
            );
        } catch (
                PaymentService.AssinaturaJaAtivaException exception
        ) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "error",
                            "Você já possui uma assinatura ativa. "
                                    + "Use o portal para alterar o plano."
                    ));
        } catch (Exception exception) {
            log.error(
                    "Erro ao criar checkout: usuarioId={} plano={}",
                    usuario.getId(),
                    request.plano(),
                    exception
            );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error",
                            "Não foi possível iniciar o checkout."
                    ));
        }
    }

    @PostMapping("/portal")
    public ResponseEntity<Map<String, String>> portal(
            Authentication authentication
    ) {
        Usuario usuario = obterUsuario(authentication);

        Assinatura assinatura =
                assinaturaRepository
                        .findByUsuarioEmail(usuario.getEmail())
                        .orElseThrow(() -> new ApiException(
                                "Assinatura não encontrada.",
                                HttpStatus.NOT_FOUND,
                                "/api/payments/portal"
                        ));

        try {
            return ResponseEntity.ok(Map.of(
                    "url",
                    paymentService.criarPortal(assinatura)
            ));
        } catch (Exception exception) {
            log.error(
                    "Erro ao abrir portal: usuarioId={}",
                    usuario.getId(),
                    exception
            );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error",
                            "Não foi possível abrir o portal."
                    ));
        }
    }

    @GetMapping("/session-info")
    public ResponseEntity<Map<String, String>> sessionInfo(
            @RequestParam String sessionId,
            Authentication authentication
    ) {
        Usuario usuario = obterUsuario(authentication);

        if (sessionId == null
                || !sessionId.startsWith("cs_")) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error",
                            "Sessão inválida."
                    ));
        }

        try {
            Session session = Session.retrieve(
                    sessionId,
                    SessionRetrieveParams.builder()
                            .addExpand("line_items")
                            .build(),
                    null
            );

            /*
             * Impede consultar sessão de outro usuário.
             */
            if (!String.valueOf(usuario.getId())
                    .equals(session.getClientReferenceId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "error",
                                "Sessão não pertence ao usuário."
                        ));
            }

            if (session.getLineItems() == null
                    || session.getLineItems().getData().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error",
                                "Sessão sem itens."
                        ));
            }

            String priceId = session.getLineItems()
                    .getData()
                    .get(0)
                    .getPrice()
                    .getId();

            PlanoTipo plano = prices.fromPriceId(priceId);

            String status = session.getStatus();
            String paymentStatus = session.getPaymentStatus();

            if (!"complete".equals(status)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(
                                "error",
                                "Checkout ainda não concluído."
                        ));
            }

            return ResponseEntity.ok(Map.of(
                    "plano", plano.name(),
                    "status", status,
                    "paymentStatus",
                    paymentStatus == null
                            ? "unknown"
                            : paymentStatus
            ));
        } catch (Exception exception) {
            log.warn(
                    "Falha ao consultar sessão: usuarioId={} sessionId={}",
                    usuario.getId(),
                    sessionId,
                    exception
            );

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "error",
                            "Sessão inválida ou expirada."
                    ));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {
        final Event event;

        try {
            event = Webhook.constructEvent(
                    payload,
                    signature,
                    endpointSecret
            );
        } catch (SignatureVerificationException exception) {
            log.warn("Webhook Stripe com assinatura inválida.");
            return ResponseEntity.badRequest()
                    .body("Assinatura inválida.");
        } catch (Exception exception) {
            log.warn("Payload Stripe inválido.", exception);
            return ResponseEntity.badRequest()
                    .body("Payload inválido.");
        }

        /*
         * Evento duplicado: já foi processado com sucesso.
         */
        if (eventRepository.existsByStripeEventId(event.getId())) {
            return ResponseEntity.ok("");
        }

        try {
            processarEvento(event);
            registrarEvento(event);

            return ResponseEntity.ok("");
        } catch (Exception exception) {
            /*
             * Retorne 500 para a Stripe reenviar.
             * Nunca registre como processado antes da conclusão.
             */
            log.error(
                    "Falha no webhook Stripe: eventId={} type={}",
                    event.getId(),
                    event.getType(),
                    exception
            );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Falha temporária.");
        }
    }

    private void processarEvento(Event event)
            throws Exception {

        JsonNode objeto = MAPPER.readTree(
                event.getDataObjectDeserializer().getRawJson()
        );

        switch (event.getType()) {
            case "checkout.session.completed" ->
                    checkoutConcluido(event);

            case "invoice.payment_succeeded" ->
                    pagamentoConfirmado(objeto);

            case "invoice.payment_failed" -> {
                String subscriptionId =
                        textoOuNull(objeto, "subscription");

                if (subscriptionId != null) {
                    atualizarPlano.marcarInadimplente(
                            subscriptionId
                    );
                }
            }

            case "customer.subscription.updated" ->
                    assinaturaAtualizada(objeto);

            case "customer.subscription.deleted" -> {
                String subscriptionId =
                        textoOuNull(objeto, "id");

                if (subscriptionId != null) {
                    atualizarPlano.cancelarPlano(
                            subscriptionId
                    );
                }
            }

            default -> log.debug(
                    "Evento Stripe ignorado: {}",
                    event.getType()
            );
        }
    }

    private void checkoutConcluido(Event event) {
        Session session =
                desserializar(event, Session.class);

        String usuarioId = session.getMetadata()
                .get("usuarioId");

        if (usuarioId == null || usuarioId.isBlank()) {
            usuarioId = session.getClientReferenceId();
        }

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new IllegalStateException(
                    "Checkout sem usuarioId."
            );
        }

        Usuario usuario = usuarioRepository
                .findById(Long.valueOf(usuarioId))
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário do checkout não encontrado."
                ));

        if (session.getSubscription() == null
                || session.getCustomer() == null) {
            throw new IllegalStateException(
                    "Checkout sem subscription/customer."
            );
        }

        atualizarPlano.ativarPlano(
                usuario.getEmail(),
                session.getSubscription(),
                session.getCustomer()
        );
    }

    private void pagamentoConfirmado(JsonNode objeto) {
        String motivo =
                textoOuNull(objeto, "billing_reason");

        String subscriptionId =
                textoOuNull(objeto, "subscription");

        if (subscriptionId == null) {
            return;
        }

        if ("subscription_cycle".equals(motivo)
                || "subscription_update".equals(motivo)) {
            atualizarPlano.sincronizarPlano(
                    subscriptionId
            );
        }
    }

    private void assinaturaAtualizada(JsonNode objeto) {
        String subscriptionId =
                textoOuNull(objeto, "id");

        String status =
                textoOuNull(objeto, "status");

        if (subscriptionId == null) {
            return;
        }

        if ("active".equals(status)
                || "trialing".equals(status)
                || "past_due".equals(status)) {
            atualizarPlano.sincronizarPlano(
                    subscriptionId
            );
        }
    }

    @Transactional
    protected void registrarEvento(Event event) {
        StripeWebhookEvent processado =
                new StripeWebhookEvent();

        processado.setStripeEventId(event.getId());
        processado.setTipo(event.getType());
        processado.setProcessadoEm(
                LocalDateTime.now()
        );

        eventRepository.saveAndFlush(processado);
    }

    private Usuario obterUsuario(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ApiException(
                    "Não autenticado.",
                    HttpStatus.UNAUTHORIZED,
                    "/api/payments"
            );
        }

        return usuarioRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado.",
                        HttpStatus.NOT_FOUND,
                        "/api/payments"
                ));
    }

    private String textoOuNull(
            JsonNode node,
            String campo
    ) {
        JsonNode valor = node.get(campo);

        return valor != null && !valor.isNull()
                ? valor.asText()
                : null;
    }

    @SuppressWarnings("unchecked")
    private <T extends StripeObject> T desserializar(
            Event event,
            Class<T> tipo
    ) {
        Optional<StripeObject> objeto =
                event.getDataObjectDeserializer().getObject();

        if (objeto.isEmpty()
                || !tipo.isInstance(objeto.get())) {
            throw new IllegalStateException(
                    "Objeto Stripe incompatível para "
                            + event.getType()
            );
        }

        return (T) objeto.get();
    }
}