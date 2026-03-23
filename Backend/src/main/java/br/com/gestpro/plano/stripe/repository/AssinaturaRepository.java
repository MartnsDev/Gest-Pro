package br.com.gestpro.plano.stripe.repository;

import br.com.gestpro.plano.stripe.model.Assinatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssinaturaRepository extends JpaRepository<Assinatura, Long> {

    Optional<Assinatura> findByUsuarioEmail(String email);

    Optional<Assinatura> findByStripeSubscriptionId(String subscriptionId);

    Optional<Assinatura> findByStripeCustomerId(String customerId);
}