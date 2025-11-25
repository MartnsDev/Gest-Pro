package br.com.gestpro.gestpro_backend.domain.service.modulesService.dashboard;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.*;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.DashboardRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

@Service
public class DashboardServiceImpl implements DashboardServiceInterface {

    private final DashboardRepository dashboardRepository;
    private final GraficoServiceOperation graficoServiceOperation;
    private final VisaoGeralOperation visaoGeralOperation;
    private final UsuarioRepository usuarioRepository; // <<-- injetado

    public DashboardServiceImpl(DashboardRepository dashboardRepository,
                                GraficoServiceOperation graficoServiceOperation,
                                VisaoGeralOperation visaoGeralOperation,
                                UsuarioRepository usuarioRepository) {
        this.dashboardRepository = dashboardRepository;
        this.graficoServiceOperation = graficoServiceOperation;
        this.visaoGeralOperation = visaoGeralOperation;
        this.usuarioRepository = usuarioRepository;
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
    public PlanoDTO planoUsuarioLogado(String emailUsuario) {
        return visaoGeralOperation.planoUsuarioLogado(emailUsuario);
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


    @Override
    @Cacheable(cacheNames = "dashboard-v2", key = "#email")
    @Transactional(readOnly = true)
    public DashboardVisaoGeralResponse visaoGeral(String email) {
        // 1) obter os contadores via query agregada (uma única consulta)
        var p = dashboardRepository.findDashboardCountsByEmail(email);
        Long vendasHoje = p != null ? p.getVendasHoje() : 0L;
        Long produtosComEstoque = p != null ? p.getProdutosComEstoque() : 0L;
        Long produtosSemEstoque = p != null ? p.getProdutosSemEstoque() : 0L;
        Long clientesAtivos = p != null ? p.getClientesAtivos() : 0L;

        // 2) calcular vendasSemana (usa o repositório já existente)
        Long vendasSemana = visaoGeralOperation.vendasSemana(email);

        // 3) carregar usuário APENAS UMA VEZ para construir o PlanoDTO
        var usuarioOpt = usuarioRepository.findByEmail(email);
        PlanoDTO plano = usuarioOpt
                .map(u -> {
                    var tipo = u.getTipoPlano() != null ? u.getTipoPlano().name() : "NENHUM";
                    var dataExp = u.getDataExpiracaoPlano();
                    long dias = dataExp != null ? java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), dataExp) : 0;
                    dias = Math.max(dias, 0);
                    return new PlanoDTO(tipo, dias);
                })
                .orElse(new PlanoDTO("NENHUM", 0));

        // 4) alertas (estes podem fazer pequenas queries, mas são aceitáveis)
        List<String> alertas = Stream.concat(
                visaoGeralOperation.alertasProdutosZerados(email).stream(),
                visaoGeralOperation.alertasVendasSemana(email).stream()
        ).toList();

        return new DashboardVisaoGeralResponse(
                vendasHoje,
                produtosComEstoque,
                produtosSemEstoque,
                clientesAtivos,
                vendasSemana,
                plano,
                alertas
        );
    }


}
