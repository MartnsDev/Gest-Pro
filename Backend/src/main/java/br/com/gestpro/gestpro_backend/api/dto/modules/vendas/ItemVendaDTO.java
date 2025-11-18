package br.com.gestpro.gestpro_backend.api.dto.modules.vendas;

import br.com.gestpro.gestpro_backend.domain.model.modules.venda.ItemVenda;
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
