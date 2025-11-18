package br.com.gestpro.gestpro_backend.domain.service.modulesService.caixa;

import br.com.gestpro.gestpro_backend.api.dto.modules.caixa.CaixaDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusCaixa;
import br.com.gestpro.gestpro_backend.domain.model.modules.caixa.Caixa;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.CaixaRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.VendaRepository;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CaixaService implements CaixaServiceInterface {

    private final CaixaRepository caixaRepository;
    private final UsuarioRepository usuarioRepository;
    private final VendaRepository vendaRepository;

    public CaixaService(CaixaRepository caixaRepository,
                        UsuarioRepository usuarioRepository,
                        VendaRepository vendaRepository) {
        this.caixaRepository = caixaRepository;
        this.usuarioRepository = usuarioRepository;
        this.vendaRepository = vendaRepository;
    }

    /**
     * Abre um novo caixa para o usuário
     */
    @Override
    @Transactional
    public CaixaDTO abrirCaixa(String emailUsuario, BigDecimal saldoInicial) {

        // 1. Buscar usuário pelo e-mail
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado.",
                        HttpStatus.BAD_REQUEST,
                        "/api/caixas/abrir"
                ));

        // 2. Validar saldo inicial
        if (saldoInicial == null || saldoInicial.compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException(
                    "Saldo inicial inválido.",
                    HttpStatus.BAD_REQUEST,
                    "/api/caixas/abrir"
            );
        }

        // 3. Verificar se já existe um caixa aberto
        boolean caixaAbertoExiste = caixaRepository.existsByUsuarioAndStatus(usuario, StatusCaixa.ABERTO);
        if (caixaAbertoExiste) {
            throw new ApiException(
                    "Já existe um caixa aberto para este usuário.",
                    HttpStatus.BAD_REQUEST,
                    "/api/caixas/abrir"
            );
        }

        // 4. Criar Caixa
        Caixa caixa = new Caixa();
        caixa.setUsuario(usuario);
        caixa.setValorInicial(saldoInicial);
        caixa.setValorFinal(BigDecimal.ZERO);
        caixa.setStatus(StatusCaixa.ABERTO);
        caixa.setAberto(true); // opcional, já vem true por default
        caixa.setDataAbertura(LocalDateTime.now());
        caixa.setDataFechamento(null);

        // 5. Salvar no banco
        caixaRepository.save(caixa);

        // 6. Montar DTO
        CaixaDTO caixaDTO = new CaixaDTO();
        caixaDTO.setId(caixa.getId());
        caixaDTO.setUsuarioId(usuario.getId());
        caixaDTO.setValorInicial(caixa.getValorInicial());
        caixaDTO.setValorFinal(caixa.getValorFinal());
        caixaDTO.setStatus(caixa.getStatus());
        caixaDTO.setDataAbertura(caixa.getDataAbertura());
        caixaDTO.setDataFechamento(caixa.getDataFechamento());
        // vendasIds já inicia vazio no DTO

        return caixaDTO;
    }


    /**
     * Fecha o caixa e calcula o total de vendas
     */
    @Override
    @Transactional
    public CaixaDTO fecharCaixa(Long id) {
        Caixa caixa = caixaRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        "Caixa não encontrado.",
                        HttpStatus.NOT_FOUND,
                        "/api/caixas/fechar"
                ));

        if (caixa.getStatus() == StatusCaixa.FECHADO) {
            throw new ApiException(
                    "Este caixa já foi fechado.",
                    HttpStatus.BAD_REQUEST,
                    "/api/caixas/fechar"
            );
        }

        // Buscar vendas vinculadas ao caixa
        List<Venda> vendas = vendaRepository.findByCaixa(caixa);
        BigDecimal total = vendas.stream()
                .map(Venda::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        // Atualizar informações do caixa
        caixa.setValorFinal(total);
        caixa.setDataFechamento(LocalDateTime.now());
        caixa.setStatus(StatusCaixa.FECHADO);

        Caixa salvo = caixaRepository.save(caixa);
        return mapToDTO(salvo);
    }

    /**
     * Busca o caixa aberto do usuário
     */
    @Override
    @Transactional(readOnly = true)
    public CaixaDTO buscarCaixaAberto(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado.",
                        HttpStatus.BAD_REQUEST,
                        "/api/caixas/buscar"
                ));

        Caixa caixa = caixaRepository.findByUsuarioIdAndStatus(usuario.getId(), StatusCaixa.ABERTO)
                .orElseThrow(() -> new ApiException(
                        "Nenhum caixa aberto para este usuário.",
                        HttpStatus.NOT_FOUND,
                        "/api/caixas/buscar"
                ));

        return mapToDTO(caixa);
    }

    /**
     * Converte a entidade Caixa em DTO
     */
    private CaixaDTO mapToDTO(Caixa caixa) {
        CaixaDTO dto = new CaixaDTO();
        dto.setId(caixa.getId());
        dto.setDataAbertura(caixa.getDataAbertura());
        dto.setDataFechamento(caixa.getDataFechamento());
        dto.setValorInicial(caixa.getValorInicial());
        dto.setValorFinal(caixa.getValorFinal());
        dto.setStatus(caixa.getStatus());
        dto.setUsuarioId(caixa.getUsuario().getId());
        dto.setVendasIds(caixa.getVendas() != null
                ? caixa.getVendas().stream().map(Venda::getId).toList()
                : List.of());
        return dto;
    }
}
