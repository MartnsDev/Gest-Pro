package br.com.gestpro.plano;

import lombok.Getter;

@Getter
public enum TipoPlano {
    EXPERIMENTAL(7, 1, 1), // 7 dias, 1 empresa, 1 caixa
    BASICO(30, 1, 1),      // 30 dias, 1 empresa, 1 caixa
    PRO(30, 2, 3),         // 30 dias, 2 empresas, 3 caixas
    PREMIUM(30, 99, 99);   // 30 dias, ilimitado

    private final int duracaoDiasPadrao;
    private final int limiteEmpresas;
    private final int limiteCaixasPorEmpresa;

    TipoPlano(int duracaoDiasPadrao, int limiteEmpresas, int limiteCaixasPorEmpresa) {
        this.duracaoDiasPadrao = duracaoDiasPadrao;
        this.limiteEmpresas = limiteEmpresas;
        this.limiteCaixasPorEmpresa = limiteCaixasPorEmpresa;
    }
}