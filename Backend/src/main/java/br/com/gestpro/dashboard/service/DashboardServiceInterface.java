package br.com.gestpro.dashboard.service;

import br.com.gestpro.dashboard.dto.*;

import java.util.List;

public interface DashboardServiceInterface {

    PlanoDTO planoUsuarioLogado(String email);

    List<MetodoPagamentoDTO> vendasPorMetodoPagamento(String email);

    List<ProdutoVendasDTO> vendasPorProduto(String email);

    List<VendasDiariasDTO> vendasDiariasSemana(String email);

    DashboardVisaoGeralResponse visaoGeral(String email);

}
