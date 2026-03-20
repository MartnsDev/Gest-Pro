package br.com.gestpro.caixa.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.caixa.StatusCaixa;
import br.com.gestpro.caixa.dto.caixa.*;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.caixa.repository.CaixaRepository;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CaixaServiceImpl implements CaixaServiceInterface {

    private final CaixaRepository caixaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;

    @Override
    @Transactional
    public CaixaResponse abrirCaixa(AbrirCaixaRequest req) {
        // 1. Busca o usuário pelo email do JWT
        Usuario usuario = usuarioRepository.findByEmail(req.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/caixas/abrir"));

        // 2. Busca a empresa e valida se pertence ao usuário
        Empresa empresa = empresaRepository.findById(req.getEmpresaId())
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/caixas/abrir"));

        if (!empresa.getDono().getId().equals(usuario.getId())) {
            throw new ApiException("Esta empresa não pertence ao usuário logado", HttpStatus.FORBIDDEN, "/caixas/abrir");
        }

        // 3. Valida se já existe caixa aberto para esta empresa
        long abertos = caixaRepository.countByEmpresaIdAndStatus(empresa.getId(), StatusCaixa.ABERTO);
        if (abertos > 0) {
            throw new ApiException("Já existe um caixa aberto para esta empresa.", HttpStatus.BAD_REQUEST, "/caixas/abrir");
        }

        // 4. Cria e salva o caixa
        Caixa caixa = Caixa.builder()
                .empresa(empresa)
                .usuario(usuario)
                .valorInicial(req.getSaldoInicial())
                .totalVendas(BigDecimal.ZERO)
                .dataAbertura(LocalDateTime.now())
                .status(StatusCaixa.ABERTO)
                .aberto(true)
                .terminalId(req.getTerminalId())
                .abertoPor(usuario.getNome())
                .build();

        return mapToResponse(caixaRepository.save(caixa));
    }

    @Override
    @Transactional
    public CaixaResponse fecharCaixa(FecharCaixaRequest req) {
        Caixa caixa = caixaRepository.findById(req.getCaixaId())
                .orElseThrow(() -> new ApiException("Caixa não encontrado", HttpStatus.NOT_FOUND, "/caixas/fechar"));

        // Valida se o caixa pertence ao usuário logado
        if (!caixa.getUsuario().getEmail().equals(req.getEmailUsuario())) {
            throw new ApiException("Você não tem permissão para fechar este caixa.", HttpStatus.FORBIDDEN, "/caixas/fechar");
        }

        if (!caixa.getAberto()) {
            throw new ApiException("Este caixa já está fechado.", HttpStatus.BAD_REQUEST, "/caixas/fechar");
        }

        caixa.recalcularTotalVendas();
        caixa.setValorFinal(req.getSaldoFinal());
        caixa.setDataFechamento(LocalDateTime.now());
        caixa.setAberto(false);
        caixa.setStatus(StatusCaixa.FECHADO);
        caixa.setFechadoPor(req.getEmailUsuario());

        return mapToResponse(caixaRepository.save(caixa));
    }

    @Override
    @Transactional(readOnly = true)
    public CaixaResponse obterResumo(Long caixaId, String emailUsuario) {
        Caixa caixa = caixaRepository.findById(caixaId)
                .orElseThrow(() -> new ApiException("Caixa não encontrado", HttpStatus.NOT_FOUND, "/caixas/{id}/resumo"));

        if (!caixa.getUsuario().getEmail().equals(emailUsuario)) {
            throw new ApiException("Acesso negado a este caixa.", HttpStatus.FORBIDDEN, "/caixas/{id}/resumo");
        }

        caixa.recalcularTotalVendas();
        return mapToResponse(caixa);
    }

    @Override
    @Transactional(readOnly = true)
    public CaixaResponse buscarCaixaAberto(Long empresaId, String emailUsuario) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/caixas/aberto"));

        if (!empresa.getDono().getEmail().equals(emailUsuario)) {
            throw new ApiException("Esta empresa não pertence ao usuário logado", HttpStatus.FORBIDDEN, "/caixas/aberto");
        }

        Caixa caixa = caixaRepository.findFirstByEmpresaIdAndStatus(empresaId, StatusCaixa.ABERTO)
                .orElseThrow(() -> new ApiException("Nenhum caixa aberto para esta empresa.", HttpStatus.NOT_FOUND, "/caixas/aberto"));

        caixa.recalcularTotalVendas();
        return mapToResponse(caixa);
    }

    private CaixaResponse mapToResponse(Caixa caixa) {
        return CaixaResponse.builder()
                .id(caixa.getId())
                .dataAbertura(caixa.getDataAbertura())
                .dataFechamento(caixa.getDataFechamento())
                .valorInicial(caixa.getValorInicial())
                .valorFinal(caixa.getValorFinal())
                .totalVendas(caixa.getTotalVendas())
                .status(caixa.getStatus().name())
                .aberto(caixa.getAberto())
                .usuarioId(caixa.getUsuario().getId())
                .empresaId(caixa.getEmpresa().getId())
                .build();
    }
}