package br.com.gestpro.plano.stripe.dto;

/**
 * Enum único que representa os planos pagos da Stripe.
 * É a fonte da verdade para Price IDs, limites e duração.
 * Mantém compatibilidade com TipoPlano via método toTipoPlano().
 */
public enum PlanoTipo {

    BASICO("price_1TDnfQDclXzxI403gm63pKl2", 30, 1, 1),
    PRO("price_1TDnmuDclXzxI403u86yx5Fp",   30, 5, 3),
    PREMIUM("price_1TDnnSDclXzxI403l0d9hAk0", 30, 99, 99);

    private final String stripePriceId;
    private final int duracaoDias;
    private final int limiteEmpresas;
    private final int limiteCaixas;

    PlanoTipo(String stripePriceId, int duracaoDias, int limiteEmpresas, int limiteCaixas) {
        this.stripePriceId  = stripePriceId;
        this.duracaoDias    = duracaoDias;
        this.limiteEmpresas = limiteEmpresas;
        this.limiteCaixas   = limiteCaixas;
    }

    public String getStripePriceId() { return stripePriceId; }
    public int getDuracaoDias()      { return duracaoDias; }
    public int getLimiteEmpresas()   { return limiteEmpresas; }
    public int getLimiteCaixas()     { return limiteCaixas; }

    /**
     * Encontra o PlanoTipo pelo Stripe Price ID.
     * Retorna BASICO como fallback seguro se não encontrar.
     */
    public static PlanoTipo fromPriceId(String priceId) {
        for (PlanoTipo tipo : values()) {
            if (tipo.stripePriceId.equals(priceId)) {
                return tipo;
            }
        }
        return BASICO;
    }
}