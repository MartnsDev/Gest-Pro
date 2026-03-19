package br.com.gestpro.dashboard.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.dashboard.dto.PlanoDTO;
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

    /**
     * Retorna o resumo do plano do usuário logado.
     * Inclui dias restantes, empresas criadas e limites do Enum.
     */
    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    // 1. Calcula dias restantes usando o serviço especialista
                    long diasRestantes = verificarPlano.calcularDiasRestantes(usuario);

                    // 2. Busca o uso real de empresas no banco
                    long empresasCriadas = empresaRepository.countByDonoId(usuario.getId());

                    // 3. Monta o DTO com os dados do Enum (TipoPlano)
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

    /**
     * Cache de vendas semanais. Chave composta pelo e-mail e a data da segunda-feira atual.
     */
    @Cacheable(
            cacheNames = "visao:vendas-semana",
            key = "#email + ':' + T(java.time.LocalDate).now().with(T(java.time.DayOfWeek).MONDAY)"
    )
    @Transactional(readOnly = true)
    public Long vendasSemana(String email) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioSemana = hoje.with(DayOfWeek.MONDAY);
        LocalDate fimSemana = hoje.with(DayOfWeek.SUNDAY);

        return vendaRepository.countByDataVendaBetweenAndUsuarioEmail(
                inicioSemana.atStartOfDay(),
                fimSemana.atTime(23, 59, 59),
                email
        );
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