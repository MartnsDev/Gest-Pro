package br.com.gestpro.gestpro_backend.domain.repository.modules;

public interface DashboardCountsProjection {
    Long getVendasHoje();

    Long getProdutosComEstoque();

    Long getProdutosSemEstoque();

    Long getClientesAtivos();
}
