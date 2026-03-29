package br.com.gestpro.plano;

import br.com.gestpro.plano.stripe.PlanoTipo;
import lombok.Getter;

/**
 * TipoPlano é o enum interno do sistema.
 *
 * Limites alinhados com o frontend (PLANOS array):
 *
 * EXPERIMENTAL → 30 dias, 1 empresa, 1 caixa, 300 produtos, 2 meses de histórico
 * BASICO       → 1 empresa, 1 caixa, 800 produtos, 6 meses de histórico
 * PRO          → 5 empresas, 5 caixas, ilimitado, 12 meses de histórico
 * PREMIUM      → ilimitado tudo, histórico ilimitado
 *
 * - EXPERIMENTAL → vencimento calculado localmente (dataPrimeiroLogin + duracaoDiasPadrao)
 * - Planos pagos → vencimento vem exclusivamente da Stripe (current_period_end)
 */
@Getter
public enum TipoPlano {
    //                     dias  empresas  caixas  produtos  mesesHistorico
    EXPERIMENTAL(          30,      1,       1,      300,         2),
    BASICO      (           0,      1,       1,      500,         6),
    PRO         (           0,      5,       5,   999999,        12),
    PREMIUM     (           0,  99999,   99999,   999999,    999999);

    /**
     * Usado APENAS pelo EXPERIMENTAL para calcular expiração local.
     * Para planos pagos este valor é 0 e deve ser ignorado —
     * o vencimento real vem de Assinatura.dataVencimento (Stripe).
     */
    private final int duracaoDiasPadrao;
    private final int limiteEmpresas;
    private final int limiteCaixasPorEmpresa;

    /**
     * Limite de produtos cadastrados por empresa.
     * 999999 = ilimitado na prática.
     */
    private final int limiteProdutos;

    /**
     * Quantos meses de histórico (vendas, relatórios) o usuário pode consultar.
     * 999999 = ilimitado na prática.
     */
    private final int mesesHistorico;

    TipoPlano(int duracaoDiasPadrao,
              int limiteEmpresas,
              int limiteCaixasPorEmpresa,
              int limiteProdutos,
              int mesesHistorico) {
        this.duracaoDiasPadrao      = duracaoDiasPadrao;
        this.limiteEmpresas         = limiteEmpresas;
        this.limiteCaixasPorEmpresa = limiteCaixasPorEmpresa;
        this.limiteProdutos         = limiteProdutos;
        this.mesesHistorico         = mesesHistorico;
    }

    /** Retorna true se o plano tem produtos ilimitados. */
    public boolean isProdutosIlimitado() {
        return limiteProdutos >= 999999;
    }

    /** Retorna true se o histórico é ilimitado. */
    public boolean isHistoricoIlimitado() {
        return mesesHistorico >= 999999;
    }

    /**
     * Converte um PlanoTipo (Stripe) para TipoPlano (sistema interno).
     */
    public static TipoPlano fromPlanoTipo(PlanoTipo planoTipo) {
        return switch (planoTipo) {
            case BASICO   -> BASICO;
            case PRO      -> PRO;
            case PREMIUM  -> PREMIUM;
        };
    }
}