package br.com.gestpro.plano.stripe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(

        @NotNull(message = "O plano é obrigatório")
        PlanoTipo plano,

        @NotNull(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String customerEmail
) {}