package br.com.gestpro.plano.stripe.dto;

import br.com.gestpro.plano.stripe.PlanoTipo;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull(message = "O plano é obrigatório")
        PlanoTipo plano
) {}