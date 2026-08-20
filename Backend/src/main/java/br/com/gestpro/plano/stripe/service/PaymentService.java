package br.com.gestpro.plano.stripe.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.plano.stripe.PlanoTipo;
import br.com.gestpro.plano.stripe.model.Assinatura;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Locale;

@Service
public class PaymentService {

    private final StripePriceProperties prices;
    private final String stripeApiKey;
    private final String frontendUrl;

    public PaymentService(
            StripePriceProperties prices,
            @Value("${stripe.api.key}") String stripeApiKey,
            @Value("${app.frontend.url}") String frontendUrl
    ) {
        this.prices = prices;
        this.stripeApiKey = stripeApiKey;
        this.frontendUrl = removerBarraFinal(frontendUrl);
    }

    @PostConstruct
    public void inicializarStripe() {
        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            throw new IllegalStateException(
                    "STRIPE_API_KEY não configurada."
            );
        }

        Stripe.apiKey = stripeApiKey;
    }

    public String criarCheckout(
            Usuario usuario,
            PlanoTipo plano,
            Assinatura assinaturaAtual
    ) throws StripeException {

        /*
         * Impede uma segunda assinatura para quem já possui uma ativa.
         * Upgrade/downgrade deve ser feito pelo Billing Portal.
         */
        if (assinaturaAtual != null
                && assinaturaAtual.getStripeSubscriptionId() != null
                && assinaturaEstaAtiva(
                assinaturaAtual.getStripeSubscriptionId()
        )) {
            throw new AssinaturaJaAtivaException();
        }

        String priceId = prices.getPriceId(plano);

        SessionCreateParams.Builder builder =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                        .setSuccessUrl(
                                frontendUrl
                                        + "/payment/sucesso"
                                        + "?session_id={CHECKOUT_SESSION_ID}"
                        )
                        .setCancelUrl(
                                frontendUrl
                                        + "/pagamento?canceled=true"
                        )
                        .setClientReferenceId(
                                String.valueOf(usuario.getId())
                        )
                        .putMetadata(
                                "usuarioId",
                                String.valueOf(usuario.getId())
                        )
                        .putMetadata("plano", plano.name())
                        .setPaymentMethodCollection(
                                SessionCreateParams
                                        .PaymentMethodCollection
                                        .ALWAYS
                        )
                        .setSubscriptionData(
                                SessionCreateParams.SubscriptionData
                                        .builder()
                                        .putMetadata(
                                                "usuarioId",
                                                String.valueOf(usuario.getId())
                                        )
                                        .putMetadata(
                                                "plano",
                                                plano.name()
                                        )
                                        .build()
                        )
                        .addLineItem(
                                SessionCreateParams.LineItem
                                        .builder()
                                        .setQuantity(1L)
                                        .setPrice(priceId)
                                        .build()
                        );

        /*
         * Reutiliza o Customer Stripe se ele já existir.
         */
        if (assinaturaAtual != null
                && assinaturaAtual.getStripeCustomerId() != null
                && !assinaturaAtual.getStripeCustomerId().isBlank()) {
            builder.setCustomer(
                    assinaturaAtual.getStripeCustomerId()
            );
        } else {
            builder.setCustomerEmail(
                    usuario.getEmail()
                            .trim()
                            .toLowerCase(Locale.ROOT)
            );
        }

        /*
         * Evita criar várias sessões em cliques/retries próximos.
         * Uma janela diferente permitirá uma nova tentativa.
         */
        long janelaCincoMinutos =
                Instant.now().getEpochSecond() / 300;

        String idempotencyKey =
                "checkout:"
                        + usuario.getId()
                        + ":"
                        + plano.name()
                        + ":"
                        + janelaCincoMinutos;

        RequestOptions requestOptions =
                RequestOptions.builder()
                        .setIdempotencyKey(idempotencyKey)
                        .build();

        Session session = Session.create(
                builder.build(),
                requestOptions
        );

        if (session.getUrl() == null
                || !session.getUrl().startsWith("https://")) {
            throw new IllegalStateException(
                    "A Stripe não retornou uma URL segura."
            );
        }

        return session.getUrl();
    }


    public String criarPortal(Assinatura assinatura)
            throws StripeException {

        if (assinatura == null
                || assinatura.getStripeCustomerId() == null
                || assinatura.getStripeCustomerId().isBlank()) {
            throw new IllegalArgumentException(
                    "Cliente Stripe não encontrado."
            );
        }

        com.stripe.param.billingportal.SessionCreateParams params =
                com.stripe.param.billingportal.SessionCreateParams.builder()
                        .setCustomer(
                                assinatura.getStripeCustomerId()
                        )
                        .setReturnUrl(
                                frontendUrl + "/dashboard?section=planos"
                        )
                        .build();

        com.stripe.model.billingportal.Session session =
                com.stripe.model.billingportal.Session.create(params);

        if (session.getUrl() == null
                || !session.getUrl().startsWith("https://")) {
            throw new IllegalStateException(
                    "A Stripe não retornou uma URL segura."
            );
        }

        return session.getUrl();
    }

    private boolean assinaturaEstaAtiva(
            String subscriptionId
    ) throws StripeException {
        Subscription subscription =
                Subscription.retrieve(subscriptionId);

        return "active".equals(subscription.getStatus())
                || "trialing".equals(subscription.getStatus())
                || "past_due".equals(subscription.getStatus());
    }

    private static String removerBarraFinal(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalStateException(
                    "app.frontend.url não configurada."
            );
        }

        return url.endsWith("/")
                ? url.substring(0, url.length() - 1)
                : url;
    }

    public static class AssinaturaJaAtivaException
            extends RuntimeException {

        public AssinaturaJaAtivaException() {
            super("Já existe uma assinatura ativa.");
        }
    }
}
