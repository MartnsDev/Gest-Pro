package br.com.gestpro.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanoDTO {
    private String tipoPlano;
    private long diasRestantes;
    private long empresasCriadas;
    private int limiteEmpresas;
    private String statusAcesso;
}