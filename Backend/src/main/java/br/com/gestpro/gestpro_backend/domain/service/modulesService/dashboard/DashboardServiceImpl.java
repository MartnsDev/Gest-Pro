package br.com.gestpro.gestpro_backend.domain.service.modulesService.dashboard;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.MetodoPagamentoDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.ProdutoVendasDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.VendasDiariasDTO;
import br.com.gestpro.gestpro_backend.domain.repository.modules.DashboardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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
     * Total de vendas realizadas hoje pelo usuário logado.
     */
    @Override
    @Transactional
    public Long totalVendasHoje(String email) {
        return dashboardRepository.contarVendasHoje(email);
    }

    /**
     * Quantidade total de produtos com estoque > 0.
     */
    @Override
    @Transactional
    public Long produtosEmEstoque(String email) {
        return dashboardRepository.contarProdutosEmEstoque(email);
    }

    /**
     * Quantidade de produtos com estoque zerado.
     */
    @Override
    @Transactional
    public Long produtosZerados(String email) {
        return dashboardRepository.contarProdutosZerados(email);
    }

    /**
     * Quantidade de clientes ativos vinculados ao usuário.
     */
    @Override
    @Transactional
    public Long clientesAtivos(String email) {
        return dashboardRepository.contarClientesAtivos(email);
    }

    @Override
    @Transactional
    public Long vendasSemana(String email) {
        LocalDate hoje = LocalDate.now();
        // Segunda-feira da semana atual
        LocalDate inicio = hoje.with(java.time.DayOfWeek.MONDAY);
        // Domingo da mesma semana
        LocalDate fim = hoje.with(java.time.DayOfWeek.SUNDAY);
        // Converte para LocalDateTime
        LocalDateTime inicioSemana = inicio.atStartOfDay();
        LocalDateTime fimSemana = fim.atTime(23, 59, 59);

        return dashboardRepository.contarVendasSemana(email, inicioSemana, fimSemana);
    }

    //Alertas

    /**
     * Retorna o plano atual do usuário logado (EXPERIMENTAL, ASSINANTE, etc.).
     */
    @Override
    @Transactional
    public String planoUsuarioLogado(String emailUsuario) {
        return visaoGeralOperation.planoUsuarioLogado(emailUsuario).toString();
    }

    /**
     * Gera alertas de produtos zerados.
     * Exemplo: lista de produtos com estoque 0 para mostrar no dashboard.
     */
    @Override
    @Transactional
    public List<String> alertasProdutosZerados(String emailUsuario) {
        return visaoGeralOperation.alertasProdutosZerados(emailUsuario); // implementar depois conforme necessidade
    }

    /**
     * Gera alertas relacionados às vendas da semana.
     * Exemplo: caso o número de vendas esteja abaixo da média.
     */
    @Override
    @Transactional
    public List<String> alertasVendasSemana(String email) {
        return visaoGeralOperation.alertasVendasSemana(email);
    }


    // Graficos
    @Override
    @Transactional
    public List<MetodoPagamentoDTO> vendasPorMetodoPagamento(String email) {
        return graficoServiceOperation.vendasPorMetodoPagamento(email);
    }

    @Override
    @Transactional
    public List<ProdutoVendasDTO> vendasPorProduto(String email) {
        return graficoServiceOperation.vendasPorProduto(email);
    }

    @Override
    @Transactional
    public List<VendasDiariasDTO> vendasDiariasSemana(String email) {
        return graficoServiceOperation.vendasDiariasSemana(email);
    }


}
