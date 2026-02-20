package br.com.gestpro.dashboard.repository;

public interface DashboardCountsProjection {
    Long getVendasHoje();

    Long getProdutosComEstoque();

    Long getProdutosSemEstoque();

    Long getClientesAtivos();
}
