package br.com.gestpro.plano.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.plano.stripe.PlanoTipo;
import br.com.gestpro.plano.stripe.model.Assinatura;
import br.com.gestpro.plano.stripe.repository.AssinaturaRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Subscription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Component
@RequiredArgsConstructor
public class AtualizarPlanoOperation {

    private final UsuarioRepository    usuarioRepository;
    private final AssinaturaRepository assinaturaRepository;

    /**
     * Ativa ou atualiza o plano do usuário após confirmação de pagamento.
     * Chamado pelo webhook checkout.session.completed.
     * <p>
     * O vencimento vem de subscription.getCurrentPeriodEnd() — nunca calculado localmente.
     *
     * @param email          E-mail do cliente conforme retornado pela Stripe
     * @param subscriptionId ID da assinatura Stripe (sub_xxx)
     * @param customerId     ID do customer Stripe (cus_xxx)
     */
    @Transactional
    public void ativarPlano(String email, String subscriptionId, String customerId) {
        log.info("Ativando plano para: {} | subscription: {}", email, subscriptionId);

        Subscription subscription = buscarSubscriptionStripe(subscriptionId);

        // Valida se a assinatura está realmente ativa na Stripe antes de ativar
        String stripeStatus = subscription.getStatus();
        if (!"active".equals(stripeStatus) && !"trialing".equals(stripeStatus)) {
            log.warn("Ignorando ativarPlano: status da Stripe é '{}' para subscription {}",
                    stripeStatus, subscriptionId);
            return;
        }

        LocalDate vencimento = extrairVencimento(subscription);
        PlanoTipo planoTipo  = extrairPlanoTipo(subscription);
        TipoPlano tipoPlano  = TipoPlano.fromPlanoTipo(planoTipo);

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));

        Assinatura assinatura = assinaturaRepository
                .findByUsuarioEmail(email)
                .orElse(new Assinatura());

        assinatura.setUsuario(usuario);
        assinatura.setStripeSubscriptionId(subscriptionId);
        assinatura.setStripeCustomerId(customerId);
        assinatura.setPlano(planoTipo);
        assinatura.setDataVencimento(vencimento);
        assinatura.setStatus("ATIVO");
        assinatura.setUltimaAtualizacao(LocalDateTime.now());
        assinaturaRepository.save(assinatura);

        usuario.setTipoPlano(tipoPlano);
        usuario.setStatusAcesso(StatusAcesso.ATIVO);
        usuarioRepository.save(usuario);

        log.info("Plano {} ativado com sucesso para: {} | vence em: {}", planoTipo, email, vencimento);
    }

    /**
     * Renova o vencimento após cobrança recorrente ou atualização de plano.
     * Chamado pelos webhooks invoice.payment_succeeded e customer.subscription.updated.
     * <p>
     * Idempotente: se o vencimento recebido for igual ou anterior ao já salvo,
     * a operação é ignorada (evita race condition de webhooks fora de ordem).
     *
     * @param subscriptionId ID da assinatura Stripe
     */
    @Transactional
    public void renovarPlano(String subscriptionId) {
        log.info("Renovando plano para subscription: {}", subscriptionId);

        Subscription subscription = buscarSubscriptionStripe(subscriptionId);

        // Só renova se a Stripe confirma que está ativa
        String stripeStatus = subscription.getStatus();
        if (!"active".equals(stripeStatus) && !"trialing".equals(stripeStatus)) {
            log.warn("Ignorando renovarPlano: status da Stripe é '{}' para subscription {}",
                    stripeStatus, subscriptionId);
            return;
        }

        LocalDate novoVencimento = extrairVencimento(subscription);
        PlanoTipo planoTipo      = extrairPlanoTipo(subscription);
        TipoPlano tipoPlano      = TipoPlano.fromPlanoTipo(planoTipo);

        Assinatura assinatura = assinaturaRepository
                .findByStripeSubscriptionId(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Assinatura não encontrada: " + subscriptionId));

        // Idempotência: ignora se o novo vencimento não avançou (webhook duplicado ou fora de ordem)
        if (assinatura.getDataVencimento() != null
                && !novoVencimento.isAfter(assinatura.getDataVencimento())) {
            log.info("Ignorando renovarPlano: vencimento {} não avança o atual {} para subscription {}",
                    novoVencimento, assinatura.getDataVencimento(), subscriptionId);
            return;
        }

        assinatura.setPlano(planoTipo);
        assinatura.setDataVencimento(novoVencimento);
        assinatura.setStatus("ATIVO");
        assinatura.setUltimaAtualizacao(LocalDateTime.now());
        assinaturaRepository.save(assinatura);

        Usuario usuario = assinatura.getUsuario();
        usuario.setTipoPlano(tipoPlano);
        usuario.setStatusAcesso(StatusAcesso.ATIVO);
        usuarioRepository.save(usuario);

        log.info("Plano renovado com sucesso: {} | vence em: {}", subscriptionId, novoVencimento);
    }

    /**
     * Cancela o plano do usuário ao fim do período pago.
     * Chamado pelo webhook customer.subscription.deleted.
     * <p>
     * Rebaixa para EXPERIMENTAL (tier gratuito) e bloqueia acesso.
     *
     * @param subscriptionId ID da assinatura Stripe
     */
    @Transactional
    public void cancelarPlano(String subscriptionId) {
        log.info("Cancelando plano para subscription: {}", subscriptionId);

        assinaturaRepository
                .findByStripeSubscriptionId(subscriptionId)
                .ifPresentOrElse(assinatura -> {
                    assinatura.setStatus("CANCELADO");
                    assinatura.setUltimaAtualizacao(LocalDateTime.now());
                    assinaturaRepository.save(assinatura);

                    Usuario usuario = assinatura.getUsuario();
                    usuario.setTipoPlano(TipoPlano.EXPERIMENTAL);
                    usuario.setStatusAcesso(StatusAcesso.INATIVO);
                    usuarioRepository.save(usuario);

                    log.info("Plano cancelado para: {}", usuario.getEmail());
                }, () -> log.warn("Subscription não encontrada para cancelamento: {}", subscriptionId));
    }

    /**
     * Marca como inadimplente quando o pagamento falha após as tentativas da Stripe.
     * Chamado pelo webhook invoice.payment_failed.
     * <p>
     * Preserva o TipoPlano — apenas bloqueia o acesso. O plano será rebaixado
     * somente em customer.subscription.deleted, quando a Stripe desistir definitivamente.
     *
     * @param subscriptionId ID da assinatura Stripe
     */
    @Transactional
    public void marcarInadimplente(String subscriptionId) {
        log.warn("Marcando inadimplência para subscription: {}", subscriptionId);

        assinaturaRepository
                .findByStripeSubscriptionId(subscriptionId)
                .ifPresentOrElse(assinatura -> {
                    assinatura.setStatus("INADIMPLENTE");
                    assinatura.setUltimaAtualizacao(LocalDateTime.now());
                    assinaturaRepository.save(assinatura);

                    Usuario usuario = assinatura.getUsuario();
                    // Não rebaixa TipoPlano aqui — o usuário pode regularizar o pagamento.
                    // O acesso é apenas bloqueado até a Stripe confirmar pagamento ou cancelar.
                    usuario.setStatusAcesso(StatusAcesso.INATIVO);
                    usuarioRepository.save(usuario);

                    log.warn("Acesso bloqueado por inadimplência: {}", usuario.getEmail());
                }, () -> log.warn("Subscription não encontrada para inadimplência: {}", subscriptionId));
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private Subscription buscarSubscriptionStripe(String subscriptionId) {
        try {
            return Subscription.retrieve(subscriptionId);
        } catch (StripeException e) {
            log.error("Erro ao consultar Stripe para subscription {}: {}", subscriptionId, e.getMessage());
            throw new RuntimeException("Falha ao obter dados da Stripe: " + e.getMessage(), e);
        }
    }

    private LocalDate extrairVencimento(Subscription subscription) {
        return Instant.ofEpochSecond(subscription.getCurrentPeriodEnd())
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }

    private PlanoTipo extrairPlanoTipo(Subscription subscription) {
        String priceId = subscription.getItems().getData().get(0).getPrice().getId();
        return PlanoTipo.fromPriceId(priceId);
    }
}