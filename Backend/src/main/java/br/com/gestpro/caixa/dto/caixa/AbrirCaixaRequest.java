package br.com.gestpro.caixa.dto.caixa;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AbrirCaixaRequest {
    @NotNull private Long usuarioId;
    @NotNull private Long empresaId;
    @NotNull @DecimalMin("0.0") private BigDecimal saldoInicial;
    private String terminalId;
}