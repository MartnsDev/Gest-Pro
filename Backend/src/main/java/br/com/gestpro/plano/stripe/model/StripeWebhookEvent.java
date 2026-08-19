package br.com.gestpro.plano.stripe.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "stripe_webhook_events",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_stripe_webhook_event_id",
                columnNames = "stripe_event_id"
        )
)
@Getter
@Setter
@NoArgsConstructor
public class StripeWebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "stripe_event_id",
            nullable = false,
            unique = true,
            length = 255
    )
    private String stripeEventId;

    @Column(nullable = false, length = 100)
    private String tipo;

    @Column(nullable = false)
    private LocalDateTime processadoEm;
}