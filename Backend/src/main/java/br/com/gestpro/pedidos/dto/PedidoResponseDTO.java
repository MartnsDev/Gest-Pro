package br.com.gestpro.pedidos.dto;

import br.com.gestpro.pedidos.model.Pedido;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class PedidoResponseDTO {

    private final Long id;
    private final Long empresaId;
    private final String nomeEmpresa;
    private final String nomeCliente;
    private final List<ItemPedidoResponseDTO> itens;
    private final BigDecimal valorTotal;
    private final BigDecimal desconto;
    private final BigDecimal valorFinal;
    private final BigDecimal custoFrete;
    private final String formaPagamento;
    private final String canalVenda;
    private final String status;
    private final String contaDestino;
    private final String enderecoEntrega;
    private final LocalDateTime dataPedido;
    private final LocalDateTime dataAtualizacao;
    private final String observacao;
    private final String motivoCancelamento;

    public PedidoResponseDTO(Pedido p) {
        this.id               = p.getId();
        this.empresaId        = p.getEmpresa().getId();
        this.nomeEmpresa      = p.getEmpresa().getNomeFantasia();
        this.nomeCliente      = p.getCliente() != null ? p.getCliente().getNome() : null;
        this.itens            = p.getItens().stream().map(ItemPedidoResponseDTO::new).collect(Collectors.toList());
        this.valorTotal       = p.getValorTotal();
        this.desconto         = p.getDesconto();
        this.valorFinal       = p.getValorFinal();
        this.custoFrete       = p.getCustoFrete();
        this.formaPagamento   = p.getFormaPagamento() != null ? p.getFormaPagamento().name() : null;
        this.canalVenda       = p.getCanalVenda() != null ? p.getCanalVenda().name() : null;
        this.status           = p.getStatus() != null ? p.getStatus().name() : null;
        this.contaDestino     = p.getContaDestino();
        this.enderecoEntrega  = p.getEnderecoEntrega();
        this.dataPedido       = p.getDataPedido();
        this.dataAtualizacao  = p.getDataAtualizacao();
        this.observacao       = p.getObservacao();
        this.motivoCancelamento = p.getMotivoCancelamento();
    }

    @Getter
    public static class ItemPedidoResponseDTO {
        private final Long idProduto;
        private final String nomeProduto;
        private final Integer quantidade;
        private final BigDecimal precoUnitario;
        private final BigDecimal subtotal;

        public ItemPedidoResponseDTO(ItemPedido item) {
            this.idProduto     = item.getProduto() != null ? item.getProduto().getId() : null;
            this.nomeProduto   = item.getProduto() != null ? item.getProduto().getNome() : null;
            this.quantidade    = item.getQuantidade();
            this.precoUnitario = item.getPrecoUnitario();
            this.subtotal      = item.getSubtotal();
        }
    }
}