package br.com.gestpro.gestpro_backend.domain.model.enums;

public enum TipoPlano {
    EXPERIMENTAL(7),   // 7 dias
    ASSINANTE(30);     // 30 dias padrão, mas pode mudar dependendo do plano contratado

    private final int duracaoDias;

    TipoPlano(int duracaoDias) {
        this.duracaoDias = duracaoDias;
    }

    public int getDuracaoDias() {
        return duracaoDias;
    }
}
