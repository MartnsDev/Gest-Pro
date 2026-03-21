package br.com.gestpro.dashboard.service;

import br.com.gestpro.dashboard.dto.*;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardServiceInterface {

    private final DashboardRepository    dashboardRepository;
    private final GraficoServiceOperation graficoServiceOperation;
    private final VisaoGeralOperation    visaoGeralOperation;

    @Override
    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return visaoGeralOperation.planoUsuarioLogado(email);
    }

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

    @Override
    @Transactional(readOnly = true)
    public DashboardVisaoGeralResponse visaoGeral(String email) {
        // Counts da query nativa (vendasHoje, prodCom, prodSem, clientes)
        List<Object[]> rows = dashboardRepository.findDashboardCountsRaw(email);
        Object vHoje = 0, pCom = 0, pSem = 0, cAtivos = 0;
        if (rows != null && !rows.isEmpty()) {
            Object[] row = rows.get(0);
            if (row.length >= 4) {
                vHoje   = row[0];
                pCom    = row[1];
                pSem    = row[2];
                cAtivos = row[3];
            }
        }

        PlanoDTO    plano         = visaoGeralOperation.planoUsuarioLogado(email);
        BigDecimal  vendasSemana  = visaoGeralOperation.vendasSemana(email);
        BigDecimal  vendasMes     = visaoGeralOperation.vendasMes(email);
        BigDecimal  lucroDia      = visaoGeralOperation.lucroDia(email);
        BigDecimal  lucroMes      = visaoGeralOperation.lucroMes(email);

        List<String> alertas = Stream.concat(
                visaoGeralOperation.alertasProdutosZerados(email).stream(),
                visaoGeralOperation.alertasVendasSemana(email).stream()
        ).toList();

        return new DashboardVisaoGeralResponse(
                vHoje, pCom, pSem, cAtivos,
                vendasSemana, vendasMes,
                lucroDia, lucroMes,
                plano, alertas
        );
    }
}