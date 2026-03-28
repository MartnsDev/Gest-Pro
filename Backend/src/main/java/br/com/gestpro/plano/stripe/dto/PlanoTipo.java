package br.com.gestpro.plano.stripe.dto;

/**
 * Enum único que representa os planos pagos da Stripe.
 * É a fonte da verdade para Price IDs e limites dos planos pagos.
 * <p>
 * IMPORTANTE: duracaoDias NÃO é usado para calcular vencimento.
 * O vencimento real vem sempre de subscription.getCurrentPeriodEnd() via Stripe.
 * Este campo existe apenas para exibição informativa na UI.
 */
public enum PlanoTipo {

    BASICO  ("price_1TFsKSDiO7eZ8iIh93V2Nck3",   1,  1),
    PRO     ("price_1TFsKrDiO7eZ8iIhczPJhCJ1",      5,  3),
    PREMIUM ("price_1TFsLGDiO7eZ8iIhqeBFTRWd", 99, 99);

    private final String stripePriceId;
    private final int    limiteEmpresas;
    private final int    limiteCaixas;

    PlanoTipo(String stripePriceId, int limiteEmpresas, int limiteCaixas) {
        this.stripePriceId  = stripePriceId;
        this.limiteEmpresas = limiteEmpresas;
        this.limiteCaixas   = limiteCaixas;
    }

    public String getStripePriceId() { return stripePriceId; }
    public int    getLimiteEmpresas() { return limiteEmpresas; }
    public int    getLimiteCaixas()   { return limiteCaixas; }

    public static PlanoTipo fromPriceId(String priceId) {
        for (PlanoTipo tipo : values()) {
            if (tipo.stripePriceId.equals(priceId)) {
                return tipo;
            }
        }
        //  Log detalhado para facilitar debug futuro
        throw new IllegalArgumentException(
                "Price ID desconhecido: " + priceId +
                        ". IDs configurados: " +
                        java.util.Arrays.stream(values())
                                .map(t -> t.name() + "=" + t.stripePriceId)
                                .collect(java.util.stream.Collectors.joining(", "))
        );
    }
}