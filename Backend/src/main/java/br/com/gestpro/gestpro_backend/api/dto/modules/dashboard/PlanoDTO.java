package br.com.gestpro.gestpro_backend.api.dto.modules.dashboard;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class PlanoDTO {
    private String tipoPlano;
    private long diasRestantes;

    public PlanoDTO() {
    }

    public PlanoDTO(String tipoPlano, long diasRestantes) {
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
