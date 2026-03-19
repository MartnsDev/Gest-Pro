package br.com.gestpro.dashboard.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.dashboard.dto.PlanoDTO;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import br.com.gestpro.produto.repository.ProdutoRepository;
import br.com.gestpro.venda.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisaoGeralOperation {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final VerificarPlanoOperation verificarPlano;
    private final DashboardRepository dashboardRepository;

    /**
     * Retorna o resumo do plano do usuário logado.
     * Inclui dias restantes, empresas criadas e limites do Enum.
     */
    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    long diasRestantes = verificarPlano.calcularDiasRestantes(usuario);

                    Object rawCount = empresaRepository.countByDonoId(usuario.getId());
                    System.out.println(">>> TIPO DO COUNT: " + (rawCount == null ? "null" : rawCount.getClass().getName()));
                    System.out.println(">>> VALOR DO COUNT: " + rawCount);
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

    @Transactional(readOnly = true)
    public Long vendasSemana(String email) {
        LocalDate hoje        = LocalDate.now();
        LocalDateTime inicio  = hoje.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime fim     = hoje.with(DayOfWeek.SUNDAY).atTime(23, 59, 59);

        Object raw = dashboardRepository.contarVendasSemana(email, inicio, fim);
        System.out.println(">>> vendasSemana TIPO: " + (raw == null ? "null" : raw.getClass().getName()));
        System.out.println(">>> vendasSemana VALOR: " + raw);
        return raw instanceof Number n ? n.longValue() : 0L;
    }

    /**
     * Retorna alertas de estoque zerado (limitado a 5 para não poluir o Dashboard).
     */
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

    /**
     * Alerta fixo baseado na performance de vendas da semana.
     */
    @Transactional(readOnly = true)
    public List<String> alertasVendasSemana(String email) {
        Long vendas = vendasSemana(email);
        if (vendas < 10) { // Exemplo: meta mínima de 10 vendas/semana
            return List.of("Desempenho baixo: Menos de 10 vendas registradas esta semana.");
        }
        return List.of();
    }
}