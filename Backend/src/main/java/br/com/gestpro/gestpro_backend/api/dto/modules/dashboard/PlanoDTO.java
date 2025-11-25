package br.com.gestpro.gestpro_backend.api.dto.modules.dashboard;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class PlanoDTO {
    private String tipoPlano;
    private long diasRestantes;

    // Construtor padrão necessário para desserialização
    public PlanoDTO() {
    }

    @JsonCreator
    public PlanoDTO(@JsonProperty("tipoPlano") String tipoPlano,
                    @JsonProperty("diasRestantes") long diasRestantes) {
        this.tipoPlano = tipoPlano;
        this.diasRestantes = diasRestantes;
    }

    public String getTipoPlano() {
        return tipoPlano;
    }

    public void setTipoPlano(String tipoPlano) {
        this.tipoPlano = tipoPlano;
    }

    public long getDiasRestantes() {
        return diasRestantes;
    }

    public void setDiasRestantes(long diasRestantes) {
        this.diasRestantes = diasRestantes;
    }
}
