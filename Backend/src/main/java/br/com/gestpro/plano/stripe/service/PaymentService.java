package br.com.gestpro.plano.stripe.service;

import br.com.gestpro.plano.stripe.PlanoTipo;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Configura a chave da Stripe uma única vez ao iniciar o contexto Spring.
     * Evita setar a chave a cada requisição.
     */
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }

    /**
     * Cria uma sessão de checkout no Stripe para assinatura.
     *
     * successUrl → /payment/sucesso?session_id={CHECKOUT_SESSION_ID}
     *   A página de sucesso usa o session_id para identificar o plano contratado
     *   via GET /api/payments/session-info, sem depender do webhook.
     *
     * cancelUrl → /dashboard?section=planos&canceled=true
     *   Volta para a seção de planos com banner amarelo de cancelamento.
     */
    public String createCheckoutSession(PlanoTipo tipo, String customerEmail) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(frontendUrl + "/payment/sucesso?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/dashboard?section=planos&canceled=true")
                .setCustomerEmail(customerEmail)
                .setPaymentMethodCollection(SessionCreateParams.PaymentMethodCollection.ALWAYS)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPrice(tipo.getStripePriceId())
                                .build()
                )
                .build();

        return Session.create(params).getUrl();
    }
}