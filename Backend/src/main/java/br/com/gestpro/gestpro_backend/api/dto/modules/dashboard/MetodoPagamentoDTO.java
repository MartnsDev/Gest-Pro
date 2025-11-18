package br.com.gestpro.gestpro_backend.api.dto.modules.dashboard;

import lombok.Data;

@Data
public class MetodoPagamentoDTO {
    private String metodo;
    private long quantidade;

    public MetodoPagamentoDTO(String metodo, long quantidade) {
        this.metodo = metodo;
        this.quantidade = quantidade;
    }
}

