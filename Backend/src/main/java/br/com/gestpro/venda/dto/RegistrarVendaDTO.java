package br.com.gestpro.venda.dto;

import br.com.gestpro.caixa.FormaDePagamento;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarVendaDTO {

    private String emailUsuario;

    @NotNull(message = "ID do caixa é obrigatório")
    private Long idCaixa;

    private Long idCliente;

    @NotEmpty(message = "Lista de itens não pode ser vazia")
    private List<ItemVendaDTO> itens;

    @NotNull(message = "Forma de pagamento é obrigatória")
    private FormaDePagamento formaPagamento;

    @PositiveOrZero(message = "Desconto não pode ser negativo")
    private BigDecimal desconto = BigDecimal.ZERO;

    private String observacao;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemVendaDTO {

        @NotNull(message = "Produto é obrigatório")
        private Long idProduto;

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade mínima é 1")
        private Integer quantidade;
    }
}