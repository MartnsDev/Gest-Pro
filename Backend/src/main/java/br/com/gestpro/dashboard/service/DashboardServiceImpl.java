package br.com.gestpro.dashboard.service;

import br.com.gestpro.dashboard.dto.*;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardServiceInterface {

    private final DashboardRepository     dashboardRepository;
    private final GraficoServiceOperation graficoServiceOperation;
    private final VisaoGeralOperation     visaoGeralOperation;
    private final EmpresaRepository       empresaRepository;

    // ── Plano ──────────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return visaoGeralOperation.planoUsuarioLogado(email);
    }

    // ── Validação de permissão ─────────────────────────────────────────────
    private Empresa validarEmpresa(Long empresaId, String email) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/api/v1/dashboard"));
        if (!empresa.getDono().getEmail().equals(email))
            throw new ApiException("Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, "/api/v1/dashboard");
        return empresa;
    }

    // ── Gráficos ───────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public List<MetodoPagamentoDTO> vendasPorMetodoPagamento(Long empresaId, String email) {
        validarEmpresa(empresaId, email);
        return graficoServiceOperation.vendasPorMetodoPagamento(empresaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProdutoVendasDTO> vendasPorProduto(Long empresaId, String email) {
        validarEmpresa(empresaId, email);
        return graficoServiceOperation.vendasPorProduto(empresaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendasDiariasDTO> vendasDiariasSemana(Long empresaId, String email) {
        validarEmpresa(empresaId, email);
        // vendasDiariasSemana agora usa a query combinada PDV + Pedidos
        return graficoServiceOperation.vendasDiariasSemana(empresaId);
    }

    // ── Visão geral ────────────────────────────────────────────────────────
    @Override
    @Transactional(readOnly = true)
    public DashboardVisaoGeralResponse visaoGeral(Long empresaId, String email) {
        validarEmpresa(empresaId, email);

        // ── Contadores do dia (vendasHoje já inclui PDV + Pedidos na query) ──
        List<Object[]> rows = dashboardRepository.findDashboardCountsRaw(empresaId);
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

        // ── Dados agregados (semana/mês já combinam PDV + Pedidos) ────────
        PlanoDTO   plano          = visaoGeralOperation.planoUsuarioLogado(email);
        BigDecimal vendasSemana   = visaoGeralOperation.vendasSemana(empresaId);
        BigDecimal vendasMes      = visaoGeralOperation.vendasMes(empresaId);
        BigDecimal lucroDia       = visaoGeralOperation.lucroDia(empresaId);
        BigDecimal lucroMes       = visaoGeralOperation.lucroMes(empresaId);
        BigDecimal custos         = visaoGeralOperation.custoTotalEstoque(empresaId);
        BigDecimal totalInvestido = visaoGeralOperation.totalInvestido(empresaId);

        // ── Origem separada (PDV vs Pedidos) para gráfico de pizza ────────
        BigDecimal pdvDia     = parseBD(dashboardRepository.somaPdvDia(empresaId));
        BigDecimal pedidosDia = parseBD(dashboardRepository.somaPedidosDia(empresaId));
        BigDecimal pdvMes     = parseBD(dashboardRepository.somaPdvMes(empresaId));
        BigDecimal pedidosMes = parseBD(dashboardRepository.somaPedidosMes(empresaId));

        // ── Alertas ────────────────────────────────────────────────────────
        List<String> alertas = Stream.concat(
                visaoGeralOperation.alertasProdutosZerados(empresaId).stream(),
                "INATIVO".equals(plano.getStatusAcesso())
                        ? Stream.of("Plano INATIVO — regularize para continuar.")
                        : Stream.empty()
        ).toList();

        // ── Montar resposta ────────────────────────────────────────────────
        DashboardVisaoGeralResponse response = new DashboardVisaoGeralResponse(
                vHoje, pCom, pSem, cAtivos,
                vendasSemana, vendasMes, lucroDia, lucroMes,
                plano, alertas
        );
        response.setCustos(custos);
        response.setTotalInvestido(totalInvestido);
        response.setPdvDia(pdvDia);
        response.setPedidosDia(pedidosDia);
        response.setPdvMes(pdvMes);
        response.setPedidosMes(pedidosMes);

        return response;
    }

    // ── Helper local ───────────────────────────────────────────────────────
    private BigDecimal parseBD(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(obj.toString().trim()); }
        catch (Exception e) { return BigDecimal.ZERO; }
    }
}