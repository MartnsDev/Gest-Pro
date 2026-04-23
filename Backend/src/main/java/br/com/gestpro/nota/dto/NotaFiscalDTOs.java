package br.com.gestpro.nota.dto;

import br.com.gestpro.nota.FormaPagamento;
import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.TipoNota;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class NotaFiscalDTOs {

    // ─── CriarItemNotaDTO ─────────────────────────────────────────────────────
    @Data
    public static class CriarItemNotaDTO {

        @NotBlank(message = "ID do produto é obrigatório")
        private String produtoId;

        @NotBlank(message = "Descrição do item é obrigatória")
        private String descricao;

        private String codigo;
        private String ncm;

        @Pattern(regexp = "\\d{4}", message = "CFOP deve ter 4 dígitos")
        private String cfop;

        @Size(max = 6, message = "Unidade deve ter no máximo 6 caracteres")
        private String unidade;

        @NotNull(message = "Quantidade é obrigatória")
        @DecimalMin(value = "0.001", message = "Quantidade deve ser maior que zero")
        private BigDecimal quantidade;

        @NotNull(message = "Valor unitário é obrigatório")
        @DecimalMin(value = "0", message = "Valor unitário não pode ser negativo")
        private BigDecimal valorUnitario;

        @DecimalMin(value = "0", message = "Desconto não pode ser negativo")
        @DecimalMax(value = "100", message = "Desconto não pode exceder 100%")
        private BigDecimal desconto;

        @DecimalMin(value = "0", message = "ICMS não pode ser negativo")
        @DecimalMax(value = "100", message = "ICMS não pode exceder 100%")
        private BigDecimal icms;

        @DecimalMin(value = "0", message = "PIS não pode ser negativo")
        @DecimalMax(value = "100", message = "PIS não pode exceder 100%")
        private BigDecimal pis;

        @DecimalMin(value = "0", message = "COFINS não pode ser negativo")
        @DecimalMax(value = "100", message = "COFINS não pode exceder 100%")
        private BigDecimal cofins;
    }

    // ─── CriarNotaFiscalDTO ───────────────────────────────────────────────────
    @Data
    public static class CriarNotaFiscalDTO {

        @NotBlank(message = "ID da empresa é obrigatório")
        private String empresaId;

        @NotNull(message = "Tipo da nota é obrigatório")
        private TipoNota tipo;

        private String clienteId;

        @NotBlank(message = "Nome do cliente é obrigatório")
        private String clienteNome;

        private String clienteCpfCnpj;

        @Email(message = "E-mail do cliente inválido")
        private String clienteEmail;

        private String clienteTelefone;
        private String clienteEndereco;
        private String clienteCidade;
        private String clienteEstado;
        private String clienteCep;

        @NotEmpty(message = "A nota deve ter pelo menos 1 item")
        @Valid
        private List<CriarItemNotaDTO> itens;

        @DecimalMin(value = "0", message = "Desconto não pode ser negativo")
        @DecimalMax(value = "100", message = "Desconto não pode exceder 100%")
        private BigDecimal desconto;

        @DecimalMin(value = "0", message = "Impostos não pode ser negativo")
        @DecimalMax(value = "100", message = "Impostos não pode exceder 100%")
        private BigDecimal impostos;

        @NotNull(message = "Forma de pagamento é obrigatória")
        private FormaPagamento formaPagamento;

        private String vendaId;
        private String observacoes;
    }

    // ─── CancelarNotaDTO ──────────────────────────────────────────────────────
    @Data
    public static class CancelarNotaDTO {

        @NotNull(message = "ID da nota é obrigatório")
        private UUID id;

        @NotBlank(message = "Motivo do cancelamento é obrigatório")
        @Size(min = 5, message = "Motivo deve ter pelo menos 5 caracteres")
        private String motivoCancelamento;
    }

    // ─── FilterNotaFiscalDTO ──────────────────────────────────────────────────
    @Data
    public static class FilterNotaFiscalDTO {

        private String empresaId;
        private NotaFiscalStatus status;
        private TipoNota tipo;
        private String clienteNome;
        private String dataInicio;
        private String dataFim;

        @Min(value = 1, message = "Página deve ser maior que zero")
        private Integer page = 1;

        @Min(value = 1, message = "Limite deve ser pelo menos 1")
        @Max(value = 100, message = "Limite máximo é 100")
        private Integer limit = 20;
    }

    // ─── EstatisticasDTO ──────────────────────────────────────────────────────
    @Data
    public static class EstatisticasDTO {
        private long total;
        private long emitidas;
        private long rascunhos;
        private long canceladas;
        private BigDecimal valorTotalMes;
    }

    // ─── NotaFiscalResponseDTO ────────────────────────────────────────────────
    @Data
    public static class NotaFiscalResponseDTO {
        private UUID id;
        private String numero;
        private TipoNota tipo;
        private NotaFiscalStatus status;
        private String empresaId;
        private String empresaNome;
        private String clienteNome;
        private String clienteCpfCnpj;
        private BigDecimal subtotal;
        private BigDecimal desconto;
        private BigDecimal valorDesconto;
        private BigDecimal impostos;
        private BigDecimal valorImpostos;
        private BigDecimal total;
        private FormaPagamento formaPagamento;
        private String chaveAcesso;
        private String protocolo;
        private LocalDateTime dataEmissao;
        private LocalDateTime createdAt;
        private List<Object> itens;
    }
}
