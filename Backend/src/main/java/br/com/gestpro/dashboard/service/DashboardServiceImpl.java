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

    @Override
    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return visaoGeralOperation.planoUsuarioLogado(email);
    }

    private Empresa validarEmpresa(Long empresaId, String email) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/api/v1/dashboard"));
        if (!empresa.getDono().getEmail().equals(email))
            throw new ApiException("Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, "/api/v1/dashboard");
        return empresa;
    }

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
        return graficoServiceOperation.vendasDiariasSemana(empresaId);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardVisaoGeralResponse visaoGeral(Long empresaId, String email) {
        validarEmpresa(empresaId, email);

        // ─────────────────────────────────────────────────────────────────────
        // DADOS ANTIGOS (só PDV — mantém compatibilidade)
        // ─────────────────────────────────────────────────────────────────────
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

        // ─────────────────────────────────────────────────────────────────────
        // NOVOS KPIs: PDV + Pedidos Unificados
        // ─────────────────────────────────────────────────────────────────────
        BigDecimal faturamentoDia      = visaoGeralOperation.faturamentoDia(empresaId);
        BigDecimal faturamentoSemana   = visaoGeralOperation.faturamentoSemana(empresaId);
        BigDecimal faturamentoMes      = visaoGeralOperation.faturamentoMes(empresaId);
        long transacoesDia             = visaoGeralOperation.totalTransacoesDia(empresaId);
        BigDecimal ticketMedio         = visaoGeralOperation.ticketMedioDia(empresaId);

        // ─────────────────────────────────────────────────────────────────────
        // ORIGEM: Separação PDV vs Pedidos (para gráfico de origem)
        // ─────────────────────────────────────────────────────────────────────
        BigDecimal origemPdvMes        = visaoGeralOperation.faturamentoPdvMes(empresaId);
        BigDecimal origemPedidosMes    = visaoGeralOperation.faturamentoPedidosMes(empresaId);

        // ─────────────────────────────────────────────────────────────────────
        // DADOS ANTIGOS (compatibilidade)
        // ─────────────────────────────────────────────────────────────────────
        PlanoDTO plano        = visaoGeralOperation.planoUsuarioLogado(email);
        BigDecimal lucroDia   = visaoGeralOperation.lucroDia(empresaId);
        BigDecimal lucroMes   = visaoGeralOperation.lucroMes(empresaId);
        BigDecimal custos     = visaoGeralOperation.custoTotalEstoque(empresaId);
        BigDecimal totalInvestido = visaoGeralOperation.totalInvestido(empresaId);

        List<String> alertas = Stream.concat(
                visaoGeralOperation.alertasProdutosZerados(empresaId).stream(),
                plano.getStatusAcesso().equals("INATIVO")
                        ? Stream.of("Plano INATIVO — regularize para continuar.")
                        : Stream.empty()
        ).toList();

        // ─────────────────────────────────────────────────────────────────────
        // CONSTRUIR RESPOSTA
        // ─────────────────────────────────────────────────────────────────────
        DashboardVisaoGeralResponse response = new DashboardVisaoGeralResponse(
                vHoje, pCom, pSem, cAtivos,
                faturamentoSemana, faturamentoMes, lucroDia, lucroMes,
                plano, alertas
        );
        response.setCustos(custos);
        response.setTotalInvestido(totalInvestido);

        // ─────────────────────────────────────────────────────────────────────
        // NOVOS CAMPOS (PDV + Pedidos)
        // ─────────────────────────────────────────────────────────────────────
        response.setFaturamentoDia(faturamentoDia);
        response.setFaturamentoSemana(faturamentoSemana);
        response.setFaturamentoMes(faturamentoMes);
        response.setTransacoesDia(transacoesDia);
        response.setTicketMedioDia(ticketMedio);

        // ─────────────────────────────────────────────────────────────────────
        // ORIGEM: PDV vs Pedidos (para gráfico)
        // ─────────────────────────────────────────────────────────────────────
        response.setOrigemPdvMes(origemPdvMes);
        response.setOrigemPedidosMes(origemPedidosMes);

        return response;
    }
}
