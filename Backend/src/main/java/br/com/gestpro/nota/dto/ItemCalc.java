package br.com.gestpro.nota.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemCalc {
    private Long produtoId;
    private String codigoProduto;
    private String descricao;
    private String ncm;
    private String cfop;
    private String unidade;
    private BigDecimal quantidade;
    private BigDecimal valorUnitario;
    private BigDecimal valorDesconto;
    private String csosn;
    private String cstIcms;
    private BigDecimal icmsAliquota;
    private String cstPis;
    private BigDecimal pisAliquota;
    private String cstCofins;
    private BigDecimal cofinsAliquota;
    private String informacoesAdicionais;

    public BigDecimal getValorBruto() {
        return quantidade != null && valorUnitario != null
                ? quantidade.multiply(valorUnitario)
                : BigDecimal.ZERO;
    }

    public BigDecimal getValorTotal() {
        BigDecimal bruto = getValorBruto();
        BigDecimal desc = valorDesconto != null ? valorDesconto : BigDecimal.ZERO;
        return bruto.subtract(desc);
    }
}