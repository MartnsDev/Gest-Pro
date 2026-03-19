package br.com.gestpro.dashboard.dto;

import br.com.gestpro.caixa.FormaDePagamento;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MetodoPagamentoDTO {

    private String metodo;
    private Long total;

    // Construtor usado pela GraficoServiceOperation ao mapear Object[]
    public MetodoPagamentoDTO(FormaDePagamento forma, Long total) {
        this.metodo = forma != null ? forma.name() : "OUTRO";
        this.total  = total != null ? total : 0L;
    }
}