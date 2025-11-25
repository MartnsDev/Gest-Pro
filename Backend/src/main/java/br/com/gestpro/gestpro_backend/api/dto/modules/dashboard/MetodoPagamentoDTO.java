package br.com.gestpro.gestpro_backend.api.dto.modules.dashboard;

import br.com.gestpro.gestpro_backend.domain.model.enums.FormaDePagamento;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MetodoPagamentoDTO {
    private String metodo;
    private Long total;

    public MetodoPagamentoDTO() {
    } // <- importantíssimo

    // construtor usado por SELECT new ... (mantém)
    public MetodoPagamentoDTO(FormaDePagamento forma, Long total) {
        this.metodo = forma != null ? forma.name() : null;
        this.total = total;
    }

    public String getMetodo() {
        return metodo;
    }

    public void setMetodo(String metodo) {
        this.metodo = metodo;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}
