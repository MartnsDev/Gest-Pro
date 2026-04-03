package br.com.gestpro.cliente.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class DividaRequest {
    private Long clienteId;
    private Long empresaId;
    private String descricao;
    private BigDecimal valor;
    private LocalDate vencimento;
}