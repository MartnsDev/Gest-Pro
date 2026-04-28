package br.com.gestpro.marketplace.webhook;

import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.pedidos.CanalVenda;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class WebhookOrderDTO {

    private String orderIdExterno;
    private String sellerId;
    private CanalVenda marketplace;
    private FormaDePagamento formaPagamento;
    private BigDecimal custoFrete;
    private String enderecoEntrega;
    private List<ItemDTO> itens;

    @Getter
    @Builder
    public static class ItemDTO {
        private String anuncioId;
        private Integer quantidade;
    }
}