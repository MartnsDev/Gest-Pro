package br.com.gestpro.gestpro_backend.domain.service.modulesService.dashboard;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.MetodoPagamentoDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.ProdutoVendasDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.VendasDiariasDTO;
import br.com.gestpro.gestpro_backend.domain.model.enums.FormaDePagamento;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.GraficoRepository;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
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
public class GraficoServiceOperation {

    private final GraficoRepository graficoRepository;
    private final UsuarioRepository usuarioRepository;

    public GraficoServiceOperation(GraficoRepository graficoRepository,
                                   UsuarioRepository usuarioRepository) {
        this.graficoRepository = graficoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ---------------------------- GRÁFICOS ---------------------------------------------

    /**
     * Gráfico de pizza: total de vendas por método de pagamento.
     * Cache por usuário (email). TTL configurado globalmente via RedisCacheConfig.
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
                    var forma = (FormaDePagamento) o[0];
                    var total = ((Number) o[1]).longValue();
                    return new MetodoPagamentoDTO(forma, total); // seu construtor aceita (FormaDePagamento, Long)
                })
                .toList();
    }

    /**
     * Gráfico de barras: total de vendas por produto (top produtos ordenados).
     * Cache por usuário.
     */
    @Cacheable(
            cacheNames = "grafico:produto",
            key = "#email"
    )
    @Transactional(readOnly = true)
    public List<ProdutoVendasDTO> vendasPorProduto(String email) {
        // Repo já fornece ProdutoVendasDTO via constructor expression (nome, SUM(qtd))
        List<ProdutoVendasDTO> response = graficoRepository.countVendasPorProdutoDTO(email);
        return response;
    }

    /**
     * Gráfico de linha: vendas diárias da semana atual.
     * Aqui usamos query nativa; mapeamos para DTO com nomes dos dias.
     * Cache por usuário.
     */
    @Cacheable(
            cacheNames = "grafico:diarias",
            key = "#email + ':' + T(java.time.LocalDate).now().with(T(java.time.DayOfWeek).MONDAY)"
    )
    @Transactional(readOnly = true)
    public List<VendasDiariasDTO> vendasDiariasSemana(String email) {
        Long usuarioId = usuarioRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.BAD_REQUEST,
                        "api/dashboard/vendasDiariasSemana (exception)"));

        LocalDate hoje = LocalDate.now();
        LocalDate inicioSemana = hoje.with(DayOfWeek.MONDAY);
        LocalDate fimSemana = hoje.with(DayOfWeek.SUNDAY);

        LocalDateTime inicio = inicioSemana.atStartOfDay();
        LocalDateTime fim = fimSemana.atTime(23, 59, 59);

        List<Object[]> raw = graficoRepository.countVendasDiariasRawPorUsuario(inicio, fim, usuarioId);

        // Map: dia_numero (1=Sunday..7=Saturday in MySQL DAYOFWEEK) → total
        Map<Integer, Double> vendasPorDia = raw.stream()
                .collect(Collectors.toMap(
                        o -> ((Number) o[0]).intValue(),                    // dia_numero
                        o -> o[2] == null ? 0.0 : ((Number) o[2]).doubleValue()
                ));

        // Nomes padronizados (usando index 1..7 conforme MySQL)
        String[] nomesDias = {"", "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"};

        // Converte para DTOs na ordem Segunda..Domingo (se preferir mostrar Segunda primeiro)
        List<VendasDiariasDTO> result = new ArrayList<>();
        // se quiser ordem Domingo→Sábado: for i=1..7
        // geralmente prefiro Segunda→Domingo:
        int[] ordem = {2, 3, 4, 5, 6, 7, 1}; // 2=segunda ... 1=domingo
        for (int diaNumero : ordem) {
            double total = vendasPorDia.getOrDefault(diaNumero, 0.0);
            result.add(new VendasDiariasDTO(nomesDias[diaNumero], total));
        }

        return result;
    }
}
