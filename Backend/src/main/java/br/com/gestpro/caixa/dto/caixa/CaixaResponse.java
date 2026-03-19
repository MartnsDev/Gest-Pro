package br.com.gestpro.caixa.dto.caixa;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
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
    private Long empresaId;
}