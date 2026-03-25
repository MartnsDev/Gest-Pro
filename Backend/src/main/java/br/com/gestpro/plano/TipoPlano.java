package br.com.gestpro.plano;

import br.com.gestpro.plano.stripe.dto.PlanoTipo;
import lombok.Getter;

/**
 * TipoPlano é o enum interno do sistema.
 * EXPERIMENTAL = período de teste gratuito (não existe na Stripe).
 * Os demais são mapeados a partir do PlanoTipo (Stripe) após confirmação de pagamento.
 */
@Getter
public enum TipoPlano {

    EXPERIMENTAL(30,  1,  1),
    BASICO      (30, 1,  1),
    PRO         (30, 5,  3),
    PREMIUM     (30, 99, 99);

    private final int duracaoDiasPadrao;
    private final int limiteEmpresas;
    private final int limiteCaixasPorEmpresa;

    TipoPlano(int duracaoDiasPadrao, int limiteEmpresas, int limiteCaixasPorEmpresa) {
        this.duracaoDiasPadrao       = duracaoDiasPadrao;
        this.limiteEmpresas          = limiteEmpresas;
        this.limiteCaixasPorEmpresa  = limiteCaixasPorEmpresa;
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