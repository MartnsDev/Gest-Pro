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

    BASICO  ("price_1TDnfQDclXzxI403gm63pKl2", 1,  1),
    PRO     ("price_1TDnmuDclXzxI403u86yx5Fp",  5,  3),
    PREMIUM ("price_1TDnnSDclXzxI403l0d9hAk0", 99, 99);

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

    /**
     * Encontra o PlanoTipo pelo Stripe Price ID.
     * Lança IllegalArgumentException se não encontrar — nunca mascara price IDs
     * desconhecidos com um fallback silencioso.
     */
    public static PlanoTipo fromPriceId(String priceId) {
        for (PlanoTipo tipo : values()) {
            if (tipo.stripePriceId.equals(priceId)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException("Price ID desconhecido: " + priceId);
    }
}