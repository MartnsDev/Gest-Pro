package br.com.gestpro.plano;

import br.com.gestpro.plano.stripe.dto.PlanoTipo;
import lombok.Getter;

/**
 * TipoPlano é o enum interno do sistema.
 * <p>
 * - EXPERIMENTAL → único plano com duracaoDiasPadrao relevante (calculado localmente).
 * - Planos pagos  → vencimento vem exclusivamente da Stripe (current_period_end).
 *   Os campos de limite são a fonte de verdade para regras de negócio.
 */
@Getter
public enum TipoPlano {

    EXPERIMENTAL(30,  1,  1),
    BASICO      (0,  1,  1),
    PRO         (0,  5,  3),
    PREMIUM     (0, 99, 99);

    /**
     * Usado apenas pelo plano EXPERIMENTAL para calcular expiração local.
     * Para planos pagos este valor é 0 e deve ser ignorado — o vencimento real
     * vem de Assinatura.dataVencimento (espelho do current_period_end da Stripe).
     */
    private final int duracaoDiasPadrao;
    private final int limiteEmpresas;
    private final int limiteCaixasPorEmpresa;

    TipoPlano(int duracaoDiasPadrao, int limiteEmpresas, int limiteCaixasPorEmpresa) {
        this.duracaoDiasPadrao      = duracaoDiasPadrao;
        this.limiteEmpresas         = limiteEmpresas;
        this.limiteCaixasPorEmpresa = limiteCaixasPorEmpresa;
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