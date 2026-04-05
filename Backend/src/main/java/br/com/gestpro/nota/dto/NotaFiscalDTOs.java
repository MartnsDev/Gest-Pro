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

    // ─── CriarItemNotaDTO ─────────────────────────────────
    @Data
    public static class CriarItemNotaDTO {

        @NotBlank
        private String produtoId;

        @NotBlank
        private String descricao;

        private String codigo;
        private String ncm;
        private String cfop;
        private String unidade;

        @NotNull
        @DecimalMin("0.001")
        private BigDecimal quantidade;

        @NotNull
        @DecimalMin("0")
        private BigDecimal valorUnitario;

        @DecimalMin("0") @DecimalMax("100")
        private BigDecimal desconto;

        @DecimalMin("0") @DecimalMax("100")
        private BigDecimal icms;

        @DecimalMin("0") @DecimalMax("100")
        private BigDecimal pis;

        @DecimalMin("0") @DecimalMax("100")
        private BigDecimal cofins;
    }

    // ─── CriarNotaFiscalDTO ───────────────────────────────
    @Data
    public static class CriarNotaFiscalDTO {

        @NotBlank
        private String empresaId;

        @NotNull
        private TipoNota tipo;

        private String clienteId;

        @NotBlank
        private String clienteNome;

        private String clienteCpfCnpj;

        @Email
        private String clienteEmail;

        private String clienteTelefone;
        private String clienteEndereco;
        private String clienteCidade;
        private String clienteEstado;
        private String clienteCep;

        @NotEmpty
        @Valid
        private List<CriarItemNotaDTO> itens;

        @DecimalMin("0") @DecimalMax("100")
        private BigDecimal desconto;

        @DecimalMin("0") @DecimalMax("100")
        private BigDecimal impostos;

        @NotNull
        private FormaPagamento formaPagamento;

        private String vendaId;
        private String observacoes;
    }

    // ─── CancelarNotaDTO ──────────────────────────────────
    @Data
    public static class CancelarNotaDTO {

        @NotNull
        private UUID id;

        @NotBlank
        private String motivoCancelamento;
    }

    // ─── FilterNotaFiscalDTO ──────────────────────────────
    @Data
    public static class FilterNotaFiscalDTO {

        private String empresaId;
        private NotaFiscalStatus status;
        private TipoNota tipo;
        private String clienteNome;
        private String dataInicio;
        private String dataFim;

        @Min(1)
        private Integer page = 1;

        @Min(1) @Max(100)
        private Integer limit = 20;
    }

    // ─── EstatisticasDTO ──────────────────────────────────
    @Data
    public static class EstatisticasDTO {
        private long total;
        private long emitidas;
        private long rascunhos;
        private long canceladas;
        private BigDecimal valorTotalMes;
    }

    // ─── NotaFiscalResponseDTO ────────────────────────────
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