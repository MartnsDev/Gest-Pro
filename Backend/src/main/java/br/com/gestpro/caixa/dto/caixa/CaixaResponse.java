package br.com.gestpro.caixa.dto.caixa;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaixaResponse {

    private Long id;

    private LocalDateTime dataAbertura;

    private LocalDateTime dataFechamento;

    private BigDecimal valorInicial;

    private BigDecimal valorFinal;

    private BigDecimal totalVendas;

    private String status;

    private Boolean aberto;

    private Long usuarioId;
}
