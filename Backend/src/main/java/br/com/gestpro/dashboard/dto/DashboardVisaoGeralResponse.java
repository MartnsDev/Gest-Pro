package br.com.gestpro.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardVisaoGeralResponse {

    // Campos antigos
    private Object vendaHoje;
    private Object produtoComEstoque;
    private Object produtoSemEstoque;
    private Object clientesAtivos;
    private BigDecimal vendasSemana;
    private BigDecimal vendasMes;
    private BigDecimal lucroDia;
    private BigDecimal lucroMes;
    private PlanoDTO plano;
    private List<String> alertas;
    private BigDecimal custos;
    private BigDecimal totalInvestido;

    // ─────────────────────────────────────────────────────────────────────
    // NOVOS CAMPOS: PDV + Pedidos Unificados
    // ─────────────────────────────────────────────────────────────────────
    private BigDecimal faturamentoDia;
    private BigDecimal faturamentoSemana;
    private BigDecimal faturamentoMes;
    private Long transacoesDia;
    private BigDecimal ticketMedioDia;

    // ─────────────────────────────────────────────────────────────────────
    // ORIGEM: PDV vs Pedidos (gráfico de origem)
    // ─────────────────────────────────────────────────────────────────────
    private BigDecimal origemPdvMes;
    private BigDecimal origemPedidosMes;

    // Construtor antigo (compatibilidade)
    public DashboardVisaoGeralResponse(Object vendaHoje, Object produtoComEstoque,
                                       Object produtoSemEstoque, Object clientesAtivos, BigDecimal vendasSemana,
                                       BigDecimal vendasMes, BigDecimal lucroDia, BigDecimal lucroMes,
                                       PlanoDTO plano, List<String> alertas) {
        this.vendaHoje = vendaHoje;
        this.produtoComEstoque = produtoComEstoque;
        this.produtoSemEstoque = produtoSemEstoque;
        this.clientesAtivos = clientesAtivos;
        this.vendasSemana = vendasSemana;
        this.vendasMes = vendasMes;
        this.lucroDia = lucroDia;
        this.lucroMes = lucroMes;
        this.plano = plano;
        this.alertas = alertas;
    }
}
