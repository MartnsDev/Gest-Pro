package br.com.gestpro.dashboard.repository;

/**
 * Os nomes dos métodos devem coincidir com os ALIASES (AS ...) da query nativa.
 */
public interface DashboardCountsProjection {
    Long getVendasHoje();
    Long getProdutosComEstoque();
    Long getProdutosSemEstoque();
    Long getClientesAtivos();
}