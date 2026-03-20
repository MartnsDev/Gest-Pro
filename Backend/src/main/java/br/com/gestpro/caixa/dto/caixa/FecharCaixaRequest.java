package br.com.gestpro.caixa.dto.caixa;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FecharCaixaRequest {

    // Preenchido pelo controller via JWT
    private String emailUsuario;

    @NotNull(message = "caixaId é obrigatório")
    private Long caixaId;

    @NotNull(message = "saldoFinal é obrigatório")
    private BigDecimal saldoFinal;

    private String observacao;
}