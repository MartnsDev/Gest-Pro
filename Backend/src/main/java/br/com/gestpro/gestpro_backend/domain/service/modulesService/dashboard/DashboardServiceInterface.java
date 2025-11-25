package br.com.gestpro.gestpro_backend.domain.service.modulesService.dashboard;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.*;

import java.util.List;

public interface DashboardServiceInterface {
    Long totalVendasHoje(String email);

    Long produtosEmEstoque(String email);

    Long produtosZerados(String email);

    Long clientesAtivos(String email);

    Long vendasSemana(String email);

    PlanoDTO planoUsuarioLogado(String email);

    List<String> alertasProdutosZerados(String email);

    List<String> alertasVendasSemana(String email);

    List<MetodoPagamentoDTO> vendasPorMetodoPagamento(String email);

    List<ProdutoVendasDTO> vendasPorProduto(String email);

    List<VendasDiariasDTO> vendasDiariasSemana(String email);

    DashboardVisaoGeralResponse visaoGeral(String email);

}
