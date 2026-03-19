package br.com.gestpro.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PlanoDTO {
    private String tipoPlano;
    private long diasRestantes;
    private long empresasCriadas;
    private int limiteEmpresas;
    private String statusAcesso;
}