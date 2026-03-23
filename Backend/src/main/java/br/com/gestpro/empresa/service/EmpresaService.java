package br.com.gestpro.empresa.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.empresa.dto.CriarEmpresaRequest;
import br.com.gestpro.empresa.dto.EmpresaResponse;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final VerificarPlanoOperation verificarPlano;

    @Transactional
    public EmpresaResponse criar(CriarEmpresaRequest req) {
        Usuario dono = usuarioRepository.findByEmail(req.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        Object rawCount = empresaRepository.countByDonoId(dono.getId());
        long totalEmpresasDono = rawCount instanceof Number n ? n.longValue() : 0L;

        verificarPlano.validarLimiteEmpresas(dono, totalEmpresasDono);

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());
        empresa.setDono(dono);
        empresa.setAtiva(true);
        empresa.setPlano(dono.getTipoPlano());

        return mapToResponse(empresaRepository.save(empresa));
    }

    @Transactional
    public EmpresaResponse atualizar(Long id, CriarEmpresaRequest req) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        // Valida se pertence ao usuário logado
        if (!empresa.getDono().getEmail().equals(req.getEmailUsuario())) {
            throw new ApiException("Você não tem permissão para editar esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        verificarPlano.validarAcesso(empresa.getDono());

        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());

        return mapToResponse(empresaRepository.save(empresa));
    }

    @Transactional
    public void excluir(Long id, String emailUsuario) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario)) {
            throw new ApiException("Você não tem permissão para excluir esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        empresaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EmpresaResponse> listarPorUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        return empresaRepository.findByDonoId(usuario.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmpresaResponse buscarPorIdDto(Long id) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada com o ID: " + id));
        return mapToResponse(empresa);
    }

    private EmpresaResponse mapToResponse(Empresa empresa) {
        EmpresaResponse res = new EmpresaResponse();
        res.setId(empresa.getId());
        res.setNomeFantasia(empresa.getNomeFantasia());
        res.setCnpj(empresa.getCnpj());
        res.setPlanoNome(empresa.getDono().getTipoPlano().name());
        res.setLimiteCaixas(empresa.getDono().getTipoPlano().getLimiteCaixasPorEmpresa());
        return res;
    }
}