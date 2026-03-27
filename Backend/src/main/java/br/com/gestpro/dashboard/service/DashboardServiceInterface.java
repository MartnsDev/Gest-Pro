package br.com.gestpro.dashboard.service;

import br.com.gestpro.dashboard.dto.*;

import java.util.List;

public interface DashboardServiceInterface {

    PlanoDTO planoUsuarioLogado(String email);

    List<MetodoPagamentoDTO> vendasPorMetodoPagamento(Long empresaId, String email);

    List<ProdutoVendasDTO> vendasPorProduto(Long empresaId, String email);

    List<VendasDiariasDTO> vendasDiariasSemana(Long empresaId, String email);

    DashboardVisaoGeralResponse visaoGeral(Long empresaId, String email);


}