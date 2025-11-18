package br.com.gestpro.gestpro_backend.api.dto.modules.dashboard;

import lombok.Data;

@Data
public class VendasDiariasDTO {
    private String dia; // String ao invés de LocalDate
    private double totalVendas;

    public VendasDiariasDTO(String dia, double totalVendas) {
        this.dia = dia;
        this.totalVendas = totalVendas;
    }

    // getters e setters...
}
