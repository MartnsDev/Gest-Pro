package br.com.gestpro.plano.stripe;

import lombok.Getter;

@Getter
public enum PlanoTipo {

    //        empresas caixas produtos histórico
    BASICO(       1,     1,      500,       6),
    PRO(          5,     5,   999999,      12),
    PREMIUM(  99999, 99999,   999999,  999999);

    private final int limiteEmpresas;
    private final int limiteCaixas;
    private final int limiteProdutos;
    private final int mesesHistorico;

    PlanoTipo(
            int limiteEmpresas,
            int limiteCaixas,
            int limiteProdutos,
            int mesesHistorico
    ) {
        this.limiteEmpresas = limiteEmpresas;
        this.limiteCaixas = limiteCaixas;
        this.limiteProdutos = limiteProdutos;
        this.mesesHistorico = mesesHistorico;
    }
}