package br.com.gestpro.dashboard.service;

import br.com.gestpro.analytics.repository.GraficoRepository;
import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.dashboard.dto.MetodoPagamentoDTO;
import br.com.gestpro.dashboard.dto.ProdutoVendasDTO;
import br.com.gestpro.dashboard.dto.VendasDiariasDTO;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GraficoServiceOperation {

    private final GraficoRepository   graficoRepository;
    private final DashboardRepository dashboardRepository; // para a query combinada

    // ── Métodos de pagamento por empresa ───────────────────────────────────
    @Transactional(readOnly = true)
    public List<MetodoPagamentoDTO> vendasPorMetodoPagamento(Long empresaId) {
        List<Object[]> raw = graficoRepository.countVendasPorFormaPagamentoRaw(empresaId);
        return raw.stream().map(o -> {
            FormaDePagamento forma = null;
            if (o[0] instanceof FormaDePagamento f) forma = f;
            else if (o[0] instanceof String s) {
                try { forma = FormaDePagamento.valueOf(s); } catch (Exception ignored) {}
            }
            long total = o[1] != null ? ((Number) o[1]).longValue() : 0L;
            return new MetodoPagamentoDTO(forma, total);
        }).toList();
    }

    // ── Top produtos por empresa (PDV + Pedidos) ───────────────────────────
    @Transactional(readOnly = true)
    public List<ProdutoVendasDTO> vendasPorProduto(Long empresaId) {
        return graficoRepository.countVendasPorProdutoDTO(empresaId);
    }

    // ── Vendas diárias da semana — PDV + Pedidos ───────────────────────────
    /**
     * Usa a query combinada do DashboardRepository que faz UNION ALL
     * entre venda e pedido, somando ambos por dia da semana.
     *
     * Retorno da query: Object[] = [dayofweek(int), date_str, total(double)]
     * DAYOFWEEK MySQL: 1=Dom, 2=Seg, 3=Ter, 4=Qua, 5=Qui, 6=Sex, 7=Sáb
     */
    @Transactional(readOnly = true)
    public List<VendasDiariasDTO> vendasDiariasSemana(Long empresaId) {
        LocalDate hoje       = LocalDate.now();
        LocalDateTime inicio = hoje.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime fim    = hoje.with(DayOfWeek.SUNDAY).atTime(23, 59, 59);

        List<Object[]> raw = dashboardRepository.vendasDiariasCombinadasRaw(empresaId, inicio, fim);

        // Agrupa por dia da semana (caso haja mais de uma linha por dia após o GROUP BY)
        Map<Integer, Double> porDia = raw.stream().collect(
                Collectors.toMap(
                        o -> ((Number) o[0]).intValue(),
                        o -> o[2] == null ? 0.0 : ((Number) o[2]).doubleValue(),
                        Double::sum   // soma se houver duplicata (não deveria, mas por segurança)
                )
        );

        String[] nomes        = {"", "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"};
        int[]    ordemExibicao = {2, 3, 4, 5, 6, 7, 1}; // Segunda → Domingo

        List<VendasDiariasDTO> result = new ArrayList<>();
        for (int dia : ordemExibicao) {
            result.add(new VendasDiariasDTO(nomes[dia], porDia.getOrDefault(dia, 0.0)));
        }
        return result;
    }
}