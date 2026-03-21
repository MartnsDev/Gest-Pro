package br.com.gestpro.dashboard.service;

import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.dashboard.dto.PlanoDTO;
import br.com.gestpro.dashboard.repository.DashboardRepository;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import br.com.gestpro.produto.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
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

    private final ProdutoRepository       produtoRepository;
    private final UsuarioRepository       usuarioRepository;
    private final EmpresaRepository       empresaRepository;
    private final VerificarPlanoOperation verificarPlano;
    private final DashboardRepository     dashboardRepository;

    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    long dias   = verificarPlano.calcularDiasRestantes(u);
                    Object raw  = empresaRepository.countByDonoId(u.getId());
                    long criadas = raw instanceof Number n ? n.longValue() : 0L;
                    return new PlanoDTO(u.getTipoPlano().name(), dias, criadas,
                            u.getTipoPlano().getLimiteEmpresas(), u.getStatusAcesso().name());
                })
                .orElse(new PlanoDTO("NENHUM", 0, 0, 0, "INATIVO"));
    }

    @Transactional(readOnly = true)
    public BigDecimal vendasSemana(Long empresaId) {
        LocalDate hoje       = LocalDate.now();
        LocalDateTime inicio = hoje.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime fim    = hoje.with(DayOfWeek.SUNDAY).atTime(23, 59, 59);
        return parseBD(dashboardRepository.contarVendasSemana(empresaId, inicio, fim));
    }

    @Transactional(readOnly = true)
    public BigDecimal vendasMes(Long empresaId) {
        return parseBD(dashboardRepository.somaVendasMes(empresaId));
    }

    @Transactional(readOnly = true)
    public BigDecimal lucroDia(Long empresaId) {
        return parseBD(dashboardRepository.lucroDia(empresaId));
    }

    @Transactional(readOnly = true)
    public BigDecimal lucroMes(Long empresaId) {
        return parseBD(dashboardRepository.lucroMes(empresaId));
    }

    @Transactional(readOnly = true)
    public List<String> alertasProdutosZerados(Long empresaId) {
        return produtoRepository.findByQuantidadeEstoqueAndEmpresaId(0, empresaId)
                .stream()
                .map(p -> "Estoque esgotado: " + p.getNome())
                .limit(5)
                .collect(Collectors.toList());
    }

    private BigDecimal parseBD(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(obj.toString().trim()); }
        catch (Exception e) { return BigDecimal.ZERO; }
    }
}