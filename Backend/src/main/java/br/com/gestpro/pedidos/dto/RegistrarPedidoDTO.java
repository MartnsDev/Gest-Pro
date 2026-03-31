package br.com.gestpro.pedidos.dto;


import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.pedidos.CanalVenda;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Payload recebido pelo front-end para registrar um Pedido (venda rápida).
 * emailUsuario e empresaId são injetados pelo controller via JWT/path — não
 * devem vir expostos no body do cliente.
 */
@Data
public class RegistrarPedidoDTO {

    // Preenchidos pelo controller — não expostos ao cliente
    String emailUsuario;
    Long empresaId;

    // ─── Cliente opcional ────────────────────────────────────────────────
    Long idCliente;

    // ─── Itens (obrigatório ao menos 1) ─────────────────────────────────
    @NotEmpty(message = "A lista de itens não pode estar vazia")
    List<ItemPedidoDTO> itens;

    // ─── Pagamento ───────────────────────────────────────────────────────
    @NotNull(message = "Forma de pagamento é obrigatória")
    FormaDePagamento formaPagamento;

    // ─── Canal de origem ─────────────────────────────────────────────────
    CanalVenda canalVenda; // null → OUTRO

    // ─── Conta financeira de destino ─────────────────────────────────────
    String contaDestino; // Ex.: "Mercado Pago", "Nubank"

    // ─── Entrega ─────────────────────────────────────────────────────────
    String enderecoEntrega;

    @PositiveOrZero(message = "Frete não pode ser negativo")
    BigDecimal custoFrete;

    // ─── Valores opcionais ───────────────────────────────────────────────
    @PositiveOrZero(message = "Desconto não pode ser negativo")
    BigDecimal desconto;

    String observacao;

    // ─── Item interno ────────────────────────────────────────────────────
    @Data
    public static class ItemPedidoDTO {
        @NotNull(message = "Produto é obrigatório")
        Long idProduto;

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade mínima é 1")
        Integer quantidade;
    }
}