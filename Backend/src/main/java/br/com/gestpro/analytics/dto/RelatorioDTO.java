package br.com.gestpro.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class RelatorioDTO {

    private String titulo;
    private String periodo;
    private String nomeEmpresa;
    private String geradoEm;

    // ── Resumo geral ──────────────────────────────────────────────────────
    private Long    totalVendas;
    private BigDecimal receitaTotal;
    private BigDecimal lucroTotal;
    private BigDecimal totalDescontos;
    private BigDecimal ticketMedio;
    private BigDecimal maiorVenda;
    private BigDecimal menorVenda;
    private Long    cancelamentos;
    private BigDecimal valorCancelado;

    // ── Séries ────────────────────────────────────────────────────────────
    private List<VendasDiaDTO>      vendasDiarias;
    private List<PagamentoDTO>      pagamentos;
    private List<ProdutoRelDTO>     topProdutos;
    private List<VendasHoraDTO>     vendasPorHora;
    private List<VendaItemDTO>      vendas;      // lista completa (para exportar)

    @Data @Builder
    public static class VendasDiaDTO {
        private String     dia;
        private Long       qtdVendas;
        private BigDecimal total;
        private BigDecimal desconto;
    }

    @Data @Builder
    public static class PagamentoDTO {
        private String     forma;
        private Long       qtd;
        private BigDecimal total;
        private Double     percentual;
    }

    @Data @Builder
    public static class ProdutoRelDTO {
        private String     nome;
        private Long       quantidade;
        private BigDecimal receita;
        private BigDecimal lucro;
    }

    @Data @Builder
    public static class VendasHoraDTO {
        private Integer    hora;
        private Long       qtd;
        private BigDecimal total;
    }

    @Data @Builder
    public static class VendaItemDTO {
        private Long       id;
        private String     data;
        private String     formaPagamento;
        private String     formaPagamento2;
        private BigDecimal valorFinal;
        private BigDecimal desconto;
        private BigDecimal troco;
        private String     observacao;
        private String     nomeCliente;
        private List<String> itens;
    }
}