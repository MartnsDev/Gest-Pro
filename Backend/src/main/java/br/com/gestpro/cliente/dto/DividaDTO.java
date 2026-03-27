package br.com.gestpro.cliente.dto;

import br.com.gestpro.cliente.model.Divida;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DividaDTO {
    private Long id;
    private String descricao;
    private BigDecimal valor;
    private BigDecimal valorPago;
    private BigDecimal saldoRestante;
    private String status;
    private LocalDate vencimento;
    private LocalDateTime criadoEm;
    private LocalDateTime quitadoEm;

    public DividaDTO(Divida d) {
        this.id = d.getId();
        this.descricao = d.getDescricao();
        this.valor = d.getValor();
        this.valorPago = d.getValorPago() != null ? d.getValorPago() : BigDecimal.ZERO;
        this.saldoRestante = d.getValor().subtract(this.valorPago);
        this.status = d.getStatus().name();
        this.vencimento = d.getVencimento();
        this.criadoEm = d.getCriadoEm();
        this.quitadoEm = d.getQuitadoEm();
    }
}