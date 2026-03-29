package br.com.gestpro.plano.stripe.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.plano.stripe.PlanoTipo;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assinaturas")
@Data
public class Assinatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Relacionamento 1:1 com o usuário dono da assinatura */
    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true, nullable = false)
    private Usuario usuario;

    /** ID da assinatura no Stripe */
    @Column(unique = true)
    private String stripeSubscriptionId;

    /** ID do cliente no Stripe  — útil para portais e cancelamentos */
    private String stripeCustomerId;

    /** Plano atual conforme reconhecido pelo Price ID da Stripe */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanoTipo plano;

    /**
     * Data real de vencimento vinda da Stripe (current_period_end).
     * É atualizada a cada renovação pelo webhook invoice.payment_succeeded.
     */
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataVencimento;

    /**
     * Status da assinatura: "ATIVO", "CANCELADO", "VENCIDO", "INADIMPLENTE"
     * Controlado exclusivamente pelos webhooks da Stripe.
     */
    @Column(nullable = false)
    private String status;

    /** Última atualização recebida via webhook */
    private LocalDateTime ultimaAtualizacao;
}