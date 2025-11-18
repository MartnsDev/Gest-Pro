package br.com.gestpro.gestpro_backend.domain.service.modulesService.dashboard;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.MetodoPagamentoDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.ProdutoVendasDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.VendasDiariasDTO;
import br.com.gestpro.gestpro_backend.domain.model.enums.FormaDePagamento;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.GraficoRepository;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
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

    public GraficoServiceOperation(GraficoRepository graficoRepository, UsuarioRepository usuarioRepository) {
        this.graficoRepository = graficoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ---------------------------- GRÁFICOS ---------------------------------------------

    /**
     * Gráfico de pizza: total de vendas por método de pagamento (PIX, Cartão, Dinheiro...).
     */
    @Transactional(readOnly = true)
    public List<MetodoPagamentoDTO> vendasPorMetodoPagamento(String email) {
        List<Object[]> raw = graficoRepository.countVendasPorFormaPagamentoRaw(email);

        return raw.stream()
                .map(o -> new MetodoPagamentoDTO(
                        ((FormaDePagamento) o[0]).name(),
                        ((Number) o[1]).longValue()
                ))
                .toList();
    }

    /**
     * Gráfico de barras: total de vendas por produto.
     */
    @Transactional(readOnly = true)
    public List<ProdutoVendasDTO> vendasPorProduto(String email) {
        List<Object[]> raw = graficoRepository.countVendasPorProdutoRaw(email);

        return raw.stream()
                .map(o -> new ProdutoVendasDTO(
                        (String) o[0],
                        ((Number) o[1]).longValue()
                ))
                .toList();
    }

    /**
     * Gráfico de linha: vendas diárias da semana atual.
     */
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

        // Map: dia_da_semana (0=Domingo..6=Sábado) → total
        Map<Integer, Double> vendasPorDia = raw.stream()
                .collect(Collectors.toMap(
                        o -> ((Number) o[0]).intValue(),
                        o -> o[1] == null ? 0.0 : ((Number) o[1]).doubleValue()
                ));

        String[] nomesDias = {"Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"};

        List<VendasDiariasDTO> result = new ArrayList<>();
        for (int dia = 0; dia <= 6; dia++) {
            double total = vendasPorDia.getOrDefault(dia, 0.0);
            result.add(new VendasDiariasDTO(nomesDias[dia], total));
        }

        return result;
    }

}
