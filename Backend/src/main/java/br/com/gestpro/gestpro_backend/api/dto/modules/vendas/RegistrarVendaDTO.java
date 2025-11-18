package br.com.gestpro.gestpro_backend.api.dto.modules.vendas;

import br.com.gestpro.gestpro_backend.domain.model.enums.FormaDePagamento;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RegistrarVendaDTO {

    @NotBlank(message = "Email do usuário é obrigatório")
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
    public static class ItemVendaDTO {

        @NotNull(message = "Produto é obrigatório")
        private Long idProduto;

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade mínima é 1")
        private Integer quantidade;
    }
}
