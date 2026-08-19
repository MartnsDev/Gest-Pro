package br.com.gestpro.plano.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.plano.stripe.PlanoTipo;
import br.com.gestpro.plano.stripe.model.Assinatura;
import br.com.gestpro.plano.stripe.repository.AssinaturaRepository;
import br.com.gestpro.plano.stripe.service.StripePriceProperties;
import com.stripe.exception.StripeException;
import com.stripe.model.Subscription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class AtualizarPlanoOperation {

    private static final String STATUS_ATIVO = "ATIVO";
    private static final String STATUS_INADIMPLENTE = "INADIMPLENTE";
    private static final String STATUS_CANCELADO = "CANCELADO";
    private static final String STATUS_PENDENTE = "PENDENTE";

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaRepository assinaturaRepository;
    private final StripePriceProperties stripePrices;

    /**
     * Ativa a assinatura depois de checkout.session.completed.
     *
     * O plano, status e vencimento são sempre consultados novamente na Stripe.
     * Nenhum desses dados é aceito diretamente do frontend ou do webhook.
     */
    @Transactional
    public void ativarPlano(
            String email,
            String subscriptionId,
            String customerId
    ) {
        validarSubscriptionId(subscriptionId);

        Subscription subscription =
                buscarSubscriptionStripe(subscriptionId);

        String stripeStatus = subscription.getStatus();

        if (!isAtivaNaStripe(stripeStatus)) {
            throw new IllegalStateException(
                    "Assinatura ainda não está ativa na Stripe."
            );
        }

        Usuario usuario = usuarioRepository
                .findByEmail(normalizarEmail(email))
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário do checkout não encontrado."
                ));

        validarProprietarioDaSubscription(subscription, usuario);

        /*
         * Primeiro procura pelo subscriptionId. Isso torna o processamento
         * idempotente quando a Stripe reenviar o mesmo evento.
         */
        Assinatura assinatura = assinaturaRepository
                .findByStripeSubscriptionId(subscriptionId)
                .orElseGet(() -> assinaturaRepository
                        .findByUsuarioEmail(usuario.getEmail())
                        .orElseGet(Assinatura::new));

        validarAssinaturaExistente(
                assinatura,
                usuario,
                subscriptionId
        );

        assinatura.setUsuario(usuario);
        assinatura.setStripeSubscriptionId(subscriptionId);
        assinatura.setStripeCustomerId(
                customerId != null
                        ? customerId
                        : subscription.getCustomer()
        );

        aplicarDadosDaStripe(
                assinatura,
                usuario,
                subscription
        );

        log.info(
                "Assinatura ativada: usuarioId={} subscriptionId={} plano={}",
                usuario.getId(),
                subscriptionId,
                assinatura.getPlano()
        );
    }

    /**
     * Sincroniza plano, vencimento e status.
     *
     * Deve ser usado para:
     * - invoice.payment_succeeded
     * - customer.subscription.updated
     * - upgrade/downgrade
     * - renovação mensal
     *
     * Diferentemente da versão anterior, uma alteração de plano é aplicada
     * mesmo quando current_period_end não mudou.
     */
    @Transactional
    public void sincronizarPlano(String subscriptionId) {
        validarSubscriptionId(subscriptionId);

        Subscription subscription =
                buscarSubscriptionStripe(subscriptionId);

        Assinatura assinatura =
                localizarOuCriarAssinatura(subscription);

        Usuario usuario = assinatura.getUsuario();

        aplicarDadosDaStripe(
                assinatura,
                usuario,
                subscription
        );

        log.info(
                "Assinatura sincronizada: usuarioId={} subscriptionId={} status={} plano={}",
                usuario.getId(),
                subscriptionId,
                assinatura.getStatus(),
                assinatura.getPlano()
        );
    }

    /**
     * Compatibilidade com chamadas antigas.
     */
    @Transactional
    public void renovarPlano(String subscriptionId) {
        sincronizarPlano(subscriptionId);
    }

    /**
     * Chamado em customer.subscription.deleted.
     *
     * Não muda o usuário para EXPERIMENTAL porque isso apagaria a informação
     * sobre o último plano contratado. Apenas bloqueia o acesso.
     */
    @Transactional
    public void cancelarPlano(String subscriptionId) {
        validarSubscriptionId(subscriptionId);

        Assinatura assinatura = assinaturaRepository
                .findByStripeSubscriptionId(subscriptionId)
                .orElseThrow(() -> new IllegalStateException(
                        "Assinatura cancelada não encontrada."
                ));

        Usuario usuario = assinatura.getUsuario();

        assinatura.setStatus(STATUS_CANCELADO);
        assinatura.setUltimaAtualizacao(LocalDateTime.now());

        usuario.setStatusAcesso(StatusAcesso.INATIVO);

        assinaturaRepository.save(assinatura);
        usuarioRepository.save(usuario);

        log.info(
                "Assinatura cancelada: usuarioId={} subscriptionId={}",
                usuario.getId(),
                subscriptionId
        );
    }

    /**
     * Chamado em invoice.payment_failed.
     */
    @Transactional
    public void marcarInadimplente(String subscriptionId) {
        validarSubscriptionId(subscriptionId);

        /*
         * Consulta a Stripe para permitir reconstruir a associação caso os
         * eventos invoice.payment_failed e checkout.session.completed cheguem
         * fora de ordem.
         */
        Subscription subscription =
                buscarSubscriptionStripe(subscriptionId);

        Assinatura assinatura =
                localizarOuCriarAssinatura(subscription);

        Usuario usuario = assinatura.getUsuario();

        assinatura.setPlano(extrairPlanoTipo(subscription));
        assinatura.setDataVencimento(
                extrairVencimento(subscription)
        );
        assinatura.setStripeCustomerId(
                subscription.getCustomer()
        );
        assinatura.setStatus(STATUS_INADIMPLENTE);
        assinatura.setUltimaAtualizacao(
                LocalDateTime.now()
        );

        usuario.setTipoPlano(
                TipoPlano.fromPlanoTipo(
                        assinatura.getPlano()
                )
        );
        usuario.setStatusAcesso(StatusAcesso.INATIVO);

        assinaturaRepository.save(assinatura);
        usuarioRepository.save(usuario);

        log.warn(
                "Assinatura inadimplente: usuarioId={} subscriptionId={}",
                usuario.getId(),
                subscriptionId
        );
    }

    /**
     * Atualiza a assinatura local conforme o estado atual da Stripe.
     */
    private void aplicarDadosDaStripe(
            Assinatura assinatura,
            Usuario usuario,
            Subscription subscription
    ) {
        PlanoTipo planoTipo =
                extrairPlanoTipo(subscription);

        LocalDate vencimento =
                extrairVencimento(subscription);

        String stripeStatus =
                subscription.getStatus();

        assinatura.setUsuario(usuario);
        assinatura.setStripeSubscriptionId(
                subscription.getId()
        );
        assinatura.setStripeCustomerId(
                subscription.getCustomer()
        );
        assinatura.setPlano(planoTipo);
        assinatura.setDataVencimento(vencimento);
        assinatura.setUltimaAtualizacao(
                LocalDateTime.now()
        );

        usuario.setTipoPlano(
                TipoPlano.fromPlanoTipo(planoTipo)
        );

        switch (stripeStatus) {
            case "active", "trialing" -> {
                assinatura.setStatus(STATUS_ATIVO);
                usuario.setStatusAcesso(StatusAcesso.ATIVO);
            }

            case "past_due", "unpaid" -> {
                assinatura.setStatus(STATUS_INADIMPLENTE);
                usuario.setStatusAcesso(StatusAcesso.INATIVO);
            }

            case "canceled", "incomplete_expired" -> {
                assinatura.setStatus(STATUS_CANCELADO);
                usuario.setStatusAcesso(StatusAcesso.INATIVO);
            }

            case "incomplete", "paused" -> {
                assinatura.setStatus(STATUS_PENDENTE);
                usuario.setStatusAcesso(StatusAcesso.INATIVO);
            }

            default -> {
                log.warn(
                        "Status Stripe não reconhecido: {} subscriptionId={}",
                        stripeStatus,
                        subscription.getId()
                );

                assinatura.setStatus(
                        stripeStatus == null
                                ? STATUS_PENDENTE
                                : stripeStatus.toUpperCase()
                );

                usuario.setStatusAcesso(StatusAcesso.INATIVO);
            }
        }

        assinaturaRepository.save(assinatura);
        usuarioRepository.save(usuario);
    }

    /**
     * Localiza uma assinatura pelo subscriptionId.
     *
     * Se os webhooks chegarem fora de ordem, tenta reconstruir a associação
     * usando usuarioId salvo nos metadados da Subscription.
     */
    private Assinatura localizarOuCriarAssinatura(
            Subscription subscription
    ) {
        return assinaturaRepository
                .findByStripeSubscriptionId(
                        subscription.getId()
                )
                .orElseGet(() -> {
                    Usuario usuario =
                            buscarUsuarioPelosMetadados(subscription);

                    Assinatura assinatura =
                            assinaturaRepository
                                    .findByUsuarioEmail(
                                            usuario.getEmail()
                                    )
                                    .orElseGet(Assinatura::new);

                    validarAssinaturaExistente(
                            assinatura,
                            usuario,
                            subscription.getId()
                    );

                    assinatura.setUsuario(usuario);
                    assinatura.setStripeSubscriptionId(
                            subscription.getId()
                    );
                    assinatura.setStripeCustomerId(
                            subscription.getCustomer()
                    );

                    return assinatura;
                });
    }

    /**
     * Recupera usuarioId inserido em SubscriptionData.metadata no checkout.
     */
    private Usuario buscarUsuarioPelosMetadados(
            Subscription subscription
    ) {
        Map<String, String> metadata =
                subscription.getMetadata();

        String usuarioId = metadata == null
                ? null
                : metadata.get("usuarioId");

        if (usuarioId == null || usuarioId.isBlank()) {
            throw new IllegalStateException(
                    "Subscription sem usuarioId nos metadados."
            );
        }

        final long id;

        try {
            id = Long.parseLong(usuarioId);
        } catch (NumberFormatException exception) {
            throw new IllegalStateException(
                    "usuarioId inválido nos metadados.",
                    exception
            );
        }

        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException(
                        "Usuário da subscription não encontrado."
                ));
    }

    /**
     * Confirma que os metadados da Stripe correspondem ao usuário esperado.
     */
    private void validarProprietarioDaSubscription(
            Subscription subscription,
            Usuario usuario
    ) {
        Map<String, String> metadata =
                subscription.getMetadata();

        if (metadata == null) {
            return;
        }

        String usuarioId =
                metadata.get("usuarioId");

        if (usuarioId != null
                && !usuarioId.equals(
                String.valueOf(usuario.getId())
        )) {
            throw new IllegalStateException(
                    "Subscription pertence a outro usuário."
            );
        }
    }

    /**
     * Evita substituir uma assinatura ativa por outra assinatura.
     */
    private void validarAssinaturaExistente(
            Assinatura assinatura,
            Usuario usuario,
            String novoSubscriptionId
    ) {
        if (assinatura.getUsuario() != null
                && !Objects.equals(
                assinatura.getUsuario().getId(),
                usuario.getId()
        )) {
            throw new IllegalStateException(
                    "Assinatura pertence a outro usuário."
            );
        }

        String atual =
                assinatura.getStripeSubscriptionId();

        if (atual != null
                && !atual.equals(novoSubscriptionId)
                && STATUS_ATIVO.equals(
                assinatura.getStatus()
        )) {
            throw new IllegalStateException(
                    "Usuário já possui outra assinatura ativa."
            );
        }

        assinaturaRepository
                .findByStripeSubscriptionId(
                        novoSubscriptionId
                )
                .filter(outra -> outra.getUsuario() != null)
                .filter(outra -> !Objects.equals(
                        outra.getUsuario().getId(),
                        usuario.getId()
                ))
                .ifPresent(outra -> {
                    throw new IllegalStateException(
                            "Subscription já associada a outro usuário."
                    );
                });
    }

    private Subscription buscarSubscriptionStripe(
            String subscriptionId
    ) {
        try {
            return Subscription.retrieve(
                    subscriptionId
            );
        } catch (StripeException exception) {
            log.error(
                    "Falha ao consultar subscriptionId={}",
                    subscriptionId,
                    exception
            );

            /*
             * Não inclua a mensagem interna da Stripe na resposta pública.
             * O webhook receberá erro 500 e tentará novamente.
             */
            throw new IllegalStateException(
                    "Falha temporária ao consultar a Stripe.",
                    exception
            );
        }
    }

    private LocalDate extrairVencimento(
            Subscription subscription
    ) {
        Long currentPeriodEnd =
                subscription.getCurrentPeriodEnd();

        if (currentPeriodEnd == null
                || currentPeriodEnd <= 0) {
            throw new IllegalStateException(
                    "Subscription sem current_period_end."
            );
        }

        return Instant.ofEpochSecond(currentPeriodEnd)
                .atZone(ZoneOffset.UTC)
                .toLocalDate();
    }

    private PlanoTipo extrairPlanoTipo(
            Subscription subscription
    ) {
        if (subscription.getItems() == null
                || subscription.getItems()
                .getData() == null
                || subscription.getItems()
                .getData()
                .isEmpty()
                || subscription.getItems()
                .getData()
                .get(0)
                .getPrice() == null
                || subscription.getItems()
                .getData()
                .get(0)
                .getPrice()
                .getId() == null) {
            throw new IllegalStateException(
                    "Subscription sem Price ID."
            );
        }

        String priceId = subscription
                .getItems()
                .getData()
                .get(0)
                .getPrice()
                .getId();

        return stripePrices.fromPriceId(priceId);
    }

    private void validarSubscriptionId(
            String subscriptionId
    ) {
        if (subscriptionId == null
                || subscriptionId.isBlank()
                || !subscriptionId.startsWith("sub_")) {
            throw new IllegalArgumentException(
                    "Subscription ID inválido."
            );
        }
    }

    private String normalizarEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "E-mail não informado."
            );
        }

        return email.trim().toLowerCase();
    }

    private boolean isAtivaNaStripe(String status) {
        return "active".equals(status)
                || "trialing".equals(status);
    }
}