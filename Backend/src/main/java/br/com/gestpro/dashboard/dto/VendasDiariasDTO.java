package br.com.gestpro.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VendasDiariasDTO {
    private String dia;
    private double total;

    public VendasDiariasDTO(String dia, double total) {
        this.dia = dia;
        this.total = total;
    }
}