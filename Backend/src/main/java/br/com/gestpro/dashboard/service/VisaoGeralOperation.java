package br.com.gestpro.dashboard.service;

import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.dashboard.dto.PlanoDTO;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import br.com.gestpro.produto.repository.ProdutoRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.venda.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisaoGeralOperation {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository       produtoRepository;
    private final UsuarioRepository       usuarioRepository;
    private final EmpresaRepository       empresaRepository;
    private final VerificarPlanoOperation verificarPlano;
    private final DashboardRepository     dashboardRepository;

    // ── Plano do usuário ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    long diasRestantes   = verificarPlano.calcularDiasRestantes(usuario);
                    Object rawCount      = empresaRepository.countByDonoId(usuario.getId());
                    long empresasCriadas = rawCount instanceof Number n ? n.longValue() : 0L;
                    return new PlanoDTO(
                            usuario.getTipoPlano().name(),
                            diasRestantes,
                            empresasCriadas,
                            usuario.getTipoPlano().getLimiteEmpresas(),
                            usuario.getStatusAcesso().name()
                    );
                })
                .orElse(new PlanoDTO("NENHUM", 0, 0, 0, "INATIVO"));
    }

    // ── Vendas da semana atual (Segunda a Domingo) — valor total ──────────
    @Transactional(readOnly = true)
    public BigDecimal vendasSemana(String email) {
        LocalDate hoje       = LocalDate.now();
        // Semana sempre começa na Segunda e termina no Domingo corrente
        LocalDateTime inicio = hoje.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime fim    = hoje.with(DayOfWeek.SUNDAY).atTime(23, 59, 59);

        Object raw = dashboardRepository.contarVendasSemana(email, inicio, fim);
        return parseBD(raw);
    }

    // ── Vendas do mês — valor total ────────────────────────────────────────
    @Transactional(readOnly = true)
    public BigDecimal vendasMes(String email) {
        Object raw = dashboardRepository.somaVendasMes(email);
        return parseBD(raw);
    }

    // ── Lucro do dia ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BigDecimal lucroDia(String email) {
        Object raw = dashboardRepository.lucroDia(email);
        return parseBD(raw);
    }

    // ── Lucro do mês ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public BigDecimal lucroMes(String email) {
        Object raw = dashboardRepository.lucroMes(email);
        return parseBD(raw);
    }

    // ── Alertas estoque zerado ─────────────────────────────────────────────
    @Cacheable(cacheNames = "visao:estoque-zerado", key = "#email")
    @Transactional(readOnly = true)
    public List<String> alertasProdutosZerados(String email) {
        return produtoRepository
                .findByQuantidadeEstoqueAndUsuarioEmail(0, email)
                .stream()
                .map(p -> "Estoque esgotado: " + p.getNome())
                .limit(5)
                .collect(Collectors.toList());
    }

    // ── Alertas de performance ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<String> alertasVendasSemana(String email) {
        BigDecimal vendas = vendasSemana(email);
        if (vendas.compareTo(BigDecimal.TEN) < 0) {
            return List.of("Desempenho baixo: Menos de 10 vendas registradas esta semana.");
        }
        return List.of();
    }

    // ── Helper ────────────────────────────────────────────────────────────
    private BigDecimal parseBD(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(obj.toString().trim()); }
        catch (Exception e) { return BigDecimal.ZERO; }
    }
}