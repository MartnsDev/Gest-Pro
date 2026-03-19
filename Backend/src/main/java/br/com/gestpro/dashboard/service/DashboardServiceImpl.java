package br.com.gestpro.dashboard.service;

import br.com.gestpro.dashboard.dto.*;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor // Limpeza total: substitui o construtor manual
public class DashboardServiceImpl implements DashboardServiceInterface {

    private final DashboardRepository dashboardRepository;
    private final GraficoServiceOperation graficoServiceOperation;
    private final VisaoGeralOperation visaoGeralOperation;

    /**
     * Retorna o resumo do plano, prazos e limites de uso.
     */
    @Override
    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return visaoGeralOperation.planoUsuarioLogado(email);
    }

    // --- GRÁFICOS (Delegando para o especialista GraficoServiceOperation) ---

    @Override
    @Transactional(readOnly = true)
    public List<MetodoPagamentoDTO> vendasPorMetodoPagamento(String email) {
        return graficoServiceOperation.vendasPorMetodoPagamento(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProdutoVendasDTO> vendasPorProduto(String email) {
        return graficoServiceOperation.vendasPorProduto(email);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendasDiariasDTO> vendasDiariasSemana(String email) {
        return graficoServiceOperation.vendasDiariasSemana(email);
    }

    // --- VISÃO GERAL (Cards Superiores e Alertas) ---

    @Override
    @Transactional(readOnly = true)
    public DashboardVisaoGeralResponse visaoGeral(String email) {
        // 1. Busca contagens agregadas via Projection (Vendas hoje, Estoque, Clientes)
        var p = dashboardRepository.findDashboardCountsByEmail(email);

        // 2. Busca informações do plano e limites (X de Y empresas)
        PlanoDTO planoUsuario = visaoGeralOperation.planoUsuarioLogado(email);

        // 3. Busca métricas semanais para o card de performance
        Long vendasSemanais = visaoGeralOperation.vendasSemana(email);

        // 4. Consolida alertas de estoque e performance comercial
        List<String> alertas = Stream.concat(
                visaoGeralOperation.alertasProdutosZerados(email).stream(),
                visaoGeralOperation.alertasVendasSemana(email).stream()
        ).toList();

        return new DashboardVisaoGeralResponse(
                safeLong(p == null ? null : p.getVendasHoje()),
                safeLong(p == null ? null : p.getProdutosComEstoque()),
                safeLong(p == null ? null : p.getProdutosSemEstoque()),
                safeLong(p == null ? null : p.getClientesAtivos()),
                vendasSemanais,
                planoUsuario,
                alertas
        );
    }

    /**
     * Utilitário para evitar NullPointer ao converter counts do banco.
     */
    private Long safeLong(Number value) {
        return value == null ? 0L : value.longValue();
    }
}