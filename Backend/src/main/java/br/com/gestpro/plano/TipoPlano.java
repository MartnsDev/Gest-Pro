package br.com.gestpro.plano;

import br.com.gestpro.plano.stripe.PlanoTipo;
import lombok.Getter;

@Getter
public enum TipoPlano {

    //              dias empresas caixas produtos histórico
    EXPERIMENTAL(    30,     1,     1,      300,       2),
    BASICO(           0,     1,     1,      500,       6),
    PRO(              0,     5,     5,   999999,      12),
    PREMIUM(          0, 99999, 99999,   999999,  999999);

    private final int duracaoDiasPadrao;
    private final int limiteEmpresas;
    private final int limiteCaixasPorEmpresa;
    private final int limiteProdutos;
    private final int mesesHistorico;

    TipoPlano(
            int duracaoDiasPadrao,
            int limiteEmpresas,
            int limiteCaixasPorEmpresa,
            int limiteProdutos,
            int mesesHistorico
    ) {
        this.duracaoDiasPadrao = duracaoDiasPadrao;
        this.limiteEmpresas = limiteEmpresas;
        this.limiteCaixasPorEmpresa = limiteCaixasPorEmpresa;
        this.limiteProdutos = limiteProdutos;
        this.mesesHistorico = mesesHistorico;
    }

    public boolean isProdutosIlimitado() {
        return limiteProdutos >= 999999;
    }

    public boolean isHistoricoIlimitado() {
        return mesesHistorico >= 999999;
    }

    public static TipoPlano fromPlanoTipo(PlanoTipo planoTipo) {
        return switch (planoTipo) {
            case BASICO -> BASICO;
            case PRO -> PRO;
            case PREMIUM -> PREMIUM;
        };
    }
}