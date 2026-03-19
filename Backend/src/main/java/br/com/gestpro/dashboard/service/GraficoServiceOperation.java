package br.com.gestpro.dashboard.service;

import br.com.gestpro.dashboard.dto.MetodoPagamentoDTO;
import br.com.gestpro.dashboard.dto.ProdutoVendasDTO;
import br.com.gestpro.dashboard.dto.VendasDiariasDTO;
import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.analytics.repository.GraficoRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
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
@RequiredArgsConstructor // Mantém o padrão de injeção via construtor do Lombok
public class GraficoServiceOperation {

    private final GraficoRepository graficoRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Gráfico de pizza: total de vendas por método de pagamento.
     */
    @Cacheable(
            cacheNames = "grafico:pagamento",
            key = "#email.toLowerCase()"
    )
    @Transactional(readOnly = true)
    public List<MetodoPagamentoDTO> vendasPorMetodoPagamento(String email) {
        List<Object[]> raw = graficoRepository.countVendasPorFormaPagamentoRaw(email);

        return raw.stream()
                .map(o -> {
                    // Proteção contra valores nulos vindos do banco
                    FormaDePagamento forma = (o[0] != null) ? (FormaDePagamento) o[0] : null;
                    long total = (o[1] != null) ? ((Number) o[1]).longValue() : 0L;
                    return new MetodoPagamentoDTO(forma, total);
                })
                .toList();
    }

    /**
     * Gráfico de barras: Top produtos ordenados.
     */
    @Cacheable(
            cacheNames = "grafico:produto",
            key = "#email.toLowerCase()"
    )
    @Transactional(readOnly = true)
    public List<ProdutoVendasDTO> vendasPorProduto(String email) {
        return graficoRepository.countVendasPorProdutoDTO(email);
    }

    /**
     * Gráfico de linha: vendas diárias da semana atual (Segunda a Domingo).
     */
    @Cacheable(
            cacheNames = "grafico:diarias",
            key = "#email.toLowerCase() + ':' + T(java.time.LocalDate).now().with(T(java.time.DayOfWeek).MONDAY)"
    )
    @Transactional(readOnly = true)
    public List<VendasDiariasDTO> vendasDiariasSemana(String email) {
        // Busca o ID de forma segura e limpa
        Long usuarioId = usuarioRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "dashboard/graficos"));

        // Define o intervalo da semana (Segunda 00:00:00 até Domingo 23:59:59)
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicio = hoje.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime fim = hoje.with(DayOfWeek.SUNDAY).atTime(23, 59, 59);

        List<Object[]> raw = graficoRepository.countVendasDiariasRawPorUsuario(inicio, fim, usuarioId);

        // Mapeia os resultados: Dia do MySQL (1=Dom, 2=Seg...) -> Valor
        Map<Integer, Double> vendasPorDia = raw.stream()
                .collect(Collectors.toMap(
                        o -> ((Number) o[0]).intValue(),
                        o -> o[2] == null ? 0.0 : ((Number) o[2]).doubleValue(),
                        (existente, novo) -> existente // Caso haja duplicatas inesperadas
                ));

        String[] nomesDias = {"", "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"};

        // Ordem cronológica iniciando na Segunda para o gráfico de linha ficar legível
        int[] ordemExibicao = {2, 3, 4, 5, 6, 7, 1};

        List<VendasDiariasDTO> result = new ArrayList<>();
        for (int diaNumero : ordemExibicao) {
            double total = vendasPorDia.getOrDefault(diaNumero, 0.0);
            result.add(new VendasDiariasDTO(nomesDias[diaNumero], total));
        }

        return result;
    }
}