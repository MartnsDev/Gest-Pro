package br.com.gestpro.pedidos.dto;

import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.pedidos.CanalVenda;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RegistrarPedidoDTO {

    String emailUsuario;
    Long empresaId;

    Long idCliente;

    @NotEmpty(message = "A lista de itens não pode estar vazia")
    List<ItemPedidoDTO> itens;

    @NotNull(message = "Forma de pagamento é obrigatória")
    FormaDePagamento formaPagamento;

    CanalVenda canalVenda; // null → OUTRO

    String contaDestino; // Ex.: "Mercado Pago", "Nubank"

    String enderecoEntrega;

    @PositiveOrZero(message = "Frete não pode ser negativo")
    BigDecimal custoFrete;

    @PositiveOrZero(message = "Desconto não pode ser negativo")
    BigDecimal desconto;

    String observacao;

    @Data
    public static class ItemPedidoDTO {
        @NotNull(message = "Produto é obrigatório")
        Long idProduto;

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade mínima é 1")
        Integer quantidade;
    }
}