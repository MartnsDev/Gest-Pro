package br.com.gestpro.gestpro_backend.domain.service.modulesService.dashboard;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.PlanoDTO;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.ProdutoRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.VendaRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class VisaoGeralOperation {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public VisaoGeralOperation(VendaRepository vendaRepository,
                               ProdutoRepository produtoRepository,
                               UsuarioRepository usuarioRepository) {
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Cacheable(
            cacheNames = "visao:vendas-semana",
            key = "#email + ':' + T(java.time.LocalDate).now().with(T(java.time.DayOfWeek).MONDAY)"
    )
    @Transactional(readOnly = true)
    public Long vendasSemana(String email) {
        LocalDate hoje = LocalDate.now();
        LocalDate inicioSemana = hoje.with(DayOfWeek.MONDAY);
        LocalDate fimSemana = hoje.with(DayOfWeek.SUNDAY);

        return vendaRepository
                .countByDataVendaBetweenAndUsuarioEmail(
                        inicioSemana.atStartOfDay(),
                        fimSemana.atTime(23, 59, 59),
                        email
                );
    }

    @Cacheable(cacheNames = "visao:estoque-zerado",
            key = "#email"
    )
    @Transactional(readOnly = true)
    public List<String> alertasProdutosZerados(String email) {

        List<String> alertas = produtoRepository
                .findByQuantidadeEstoqueAndUsuarioEmail(0, email)
                .stream()
                .map(p -> "Produto " + p.getNome() + " está com estoque zerado!")
                .limit(10)
                .toList();

        return alertas.isEmpty()
                ? List.of("Nenhum produto está com estoque zerado!")
                : alertas;
    }

    @Transactional(readOnly = true)
    public List<String> alertasVendasSemana(String email) {
        return vendasSemana(email) < 50
                ? List.of("Vendas da semana abaixo do esperado")
                : List.of();
    }


    @Transactional(readOnly = true)
    public PlanoDTO planoUsuarioLogado(String email) {
        return usuarioRepository.findByEmail(email)
                .map(usuario -> {
                    long dias = usuario.getDataExpiracaoPlano() != null
                            ? ChronoUnit.DAYS.between(LocalDate.now(), usuario.getDataExpiracaoPlano())
                            : 0;
                    return new PlanoDTO(usuario.getTipoPlano().name(), Math.max(dias, 0));
                })
                .orElse(new PlanoDTO("NENHUM", 0));
    }
}

