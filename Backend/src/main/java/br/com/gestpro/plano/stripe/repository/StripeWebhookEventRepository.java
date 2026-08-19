package br.com.gestpro.plano.stripe.repository;

import br.com.gestpro.plano.stripe.model.StripeWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StripeWebhookEventRepository
        extends JpaRepository<StripeWebhookEvent, Long> {

    boolean existsByStripeEventId(String stripeEventId);
}