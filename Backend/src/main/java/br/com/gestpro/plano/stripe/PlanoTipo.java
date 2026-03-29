package br.com.gestpro.plano.stripe;

/**
 * Enum dos planos pagos da Stripe.
 * Fonte da verdade para Price IDs e limites dos planos pagos.
 *
 * Limites alinhados com TipoPlano.java e o frontend (PLANOS array):
 *
 * BASICO   → 1 empresa, 1 caixa, 800 produtos, 6 meses histórico
 * PRO      → 5 empresas, 5 caixas, ilimitado, 12 meses histórico
 * PREMIUM  → ilimitado tudo
 *
 * IMPORTANTE: o vencimento real vem sempre de subscription.getCurrentPeriodEnd().
 */
public enum PlanoTipo {
    //           priceId                              empresas  caixas  produtos  mesesHistorico
    BASICO  ("price_1TFsKSDiO7eZ8iIh93V2Nck3",         1,       1,      500,         6),
    PRO     ("price_1TFsKrDiO7eZ8iIhczPJhCJ1",         5,       5,   999999,        12),
    PREMIUM ("price_1TFsLGDiO7eZ8iIhqeBFTRWd",     99999,   99999,   999999,    999999);

    private final String stripePriceId;
    private final int    limiteEmpresas;
    private final int    limiteCaixas;
    private final int    limiteProdutos;
    private final int    mesesHistorico;

    PlanoTipo(String stripePriceId,
              int limiteEmpresas,
              int limiteCaixas,
              int limiteProdutos,
              int mesesHistorico) {
        this.stripePriceId  = stripePriceId;
        this.limiteEmpresas = limiteEmpresas;
        this.limiteCaixas   = limiteCaixas;
        this.limiteProdutos = limiteProdutos;
        this.mesesHistorico = mesesHistorico;
    }

    public String getStripePriceId()  { return stripePriceId; }
    public int    getLimiteEmpresas() { return limiteEmpresas; }
    public int    getLimiteCaixas()   { return limiteCaixas; }
    public int    getLimiteProdutos() { return limiteProdutos; }
    public int    getMesesHistorico() { return mesesHistorico; }

    public static PlanoTipo fromPriceId(String priceId) {
        for (PlanoTipo tipo : values()) {
            if (tipo.stripePriceId.equals(priceId)) {
                return tipo;
            }
        }
        throw new IllegalArgumentException(
                "Price ID desconhecido: " + priceId +
                        ". IDs configurados: " +
                        java.util.Arrays.stream(values())
                                .map(t -> t.name() + "=" + t.stripePriceId)
                                .collect(java.util.stream.Collectors.joining(", "))
        );
    }
}