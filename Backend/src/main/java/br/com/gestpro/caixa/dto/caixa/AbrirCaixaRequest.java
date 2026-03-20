package br.com.gestpro.caixa.dto.caixa;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AbrirCaixaRequest {

    // Preenchido pelo controller via JWT
    private String emailUsuario;

    @NotNull(message = "empresaId é obrigatório")
    private Long empresaId;

    @NotNull(message = "saldoInicial é obrigatório")
    @DecimalMin(value = "0.0", message = "Saldo inicial não pode ser negativo")
    private BigDecimal saldoInicial;

    private String terminalId;
}