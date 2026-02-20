package br.com.gestpro.dashboard.dto;

public class VendasDiariasDTO {
    private String dia;
    private double total;

    public VendasDiariasDTO() {
    } // <- obrigatório para Jackson

    public VendasDiariasDTO(String dia, double total) {
        this.dia = dia;
        this.total = total;
    }

    public String getDia() {
        return dia;
    }

    public void setDia(String dia) {
        this.dia = dia;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

}