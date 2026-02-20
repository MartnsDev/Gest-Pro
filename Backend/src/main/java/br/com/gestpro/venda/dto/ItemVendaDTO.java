package br.com.gestpro.venda.dto;

import br.com.gestpro.venda.model.ItemVenda;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ItemVendaDTO {

    private Long idProduto;
    private String nomeProduto;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal subtotal;

    public ItemVendaDTO(ItemVenda item) {
        this.idProduto = item.getProduto() != null ? item.getProduto().getId() : null;
        this.nomeProduto = item.getProduto() != null ? item.getProduto().getNome() : null;
        this.quantidade = item.getQuantidade();
        this.precoUnitario = item.getPrecoUnitario();
        this.subtotal = item.getSubtotal();
    }
}
