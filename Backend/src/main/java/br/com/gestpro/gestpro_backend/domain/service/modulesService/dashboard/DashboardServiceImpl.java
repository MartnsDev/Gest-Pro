package br.com.gestpro.gestpro_backend.domain.service.modulesService.dashboard;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.*;
import br.com.gestpro.gestpro_backend.domain.repository.modules.DashboardRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
public class DashboardServiceImpl implements DashboardServiceInterface {

    private final DashboardRepository dashboardRepository;
    private final GraficoServiceOperation graficoServiceOperation;
    private final VisaoGeralOperation visaoGeralOperation;

    public DashboardServiceImpl(DashboardRepository dashboardRepository,
                                GraficoServiceOperation graficoServiceOperation,
                                VisaoGeralOperation visaoGeralOperation) {
        this.dashboardRepository = dashboardRepository;
        this.graficoServiceOperation = graficoServiceOperation;
        this.visaoGeralOperation = visaoGeralOperation;
    }


    /**
     * Retorna o plano atual do usuário logado (EXPERIMENTAL, ASSINANTE, etc.).
     */
    @Override
    @Transactional
    public PlanoDTO planoUsuarioLogado(String email) {
        return visaoGeralOperation.planoUsuarioLogado(email);
    }


    // Graficos
    @Override
    @Cacheable(cacheNames = "grafico-metodos", key = "#email", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<MetodoPagamentoDTO> vendasPorMetodoPagamento(String email) {
        return graficoServiceOperation.vendasPorMetodoPagamento(email);
    }

    @Override
    @Cacheable(cacheNames = "grafico-produtos", key = "#email", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<ProdutoVendasDTO> vendasPorProduto(String email) {
        return graficoServiceOperation.vendasPorProduto(email);
    }

    @Override
    @Cacheable(cacheNames = "grafico-vendas-diarias", key = "#email")
    @Transactional(readOnly = true)
    public List<VendasDiariasDTO> vendasDiariasSemana(String email) {
        return graficoServiceOperation.vendasDiariasSemana(email);
    }


    @Override
    @Transactional(readOnly = true)
    public DashboardVisaoGeralResponse visaoGeral(String email) {

        var p = dashboardRepository.findDashboardCountsByEmail(email);

        // Garante conversão correta de Integer para Long
        Long vendasHoje = safeLong(p == null ? null : p.getVendasHoje());
        Long produtosComEstoque = safeLong(p == null ? null : p.getProdutosComEstoque());
        Long produtosSemEstoque = safeLong(p == null ? null : p.getProdutosSemEstoque());
        Long clientesAtivos = safeLong(p == null ? null : p.getClientesAtivos());

        Long vendasSemanais = visaoGeralOperation.vendasSemana(email);
        PlanoDTO planoUsuario = planoUsuarioLogado(email);

        List<String> alertas = Stream.concat(
                visaoGeralOperation.alertasProdutosZerados(email).stream(),
                visaoGeralOperation.alertasVendasSemana(email).stream()
        ).toList();

        DashboardVisaoGeralResponse response = new DashboardVisaoGeralResponse(
                vendasHoje,
                produtosComEstoque,
                produtosSemEstoque,
                clientesAtivos,
                vendasSemanais,
                planoUsuario,
                alertas
        );

        return response;
    }

    /**
     * Converte qualquer Number para Long de forma segura
     */
    private Long safeLong(Number value) {
        if (value == null) return 0L;
        return value.longValue();
    }


}
