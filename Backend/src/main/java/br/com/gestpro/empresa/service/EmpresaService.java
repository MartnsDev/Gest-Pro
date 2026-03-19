package br.com.gestpro.empresa.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.empresa.dto.CriarEmpresaRequest;
import br.com.gestpro.empresa.dto.EmpresaResponse;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.plano.service.VerificarPlanoOperation; // Importante!
import br.com.gestpro.infra.exception.ApiException;
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
    private final VerificarPlanoOperation verificarPlano; // Substitui o PlanoRepository

    @Transactional
    public EmpresaResponse criar(CriarEmpresaRequest req) {
        // 1. Busca o dono
        Usuario dono = usuarioRepository.findById(req.getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        // 2. Conta quantas empresas o dono já tem no banco
        long totalEmpresasDono = empresaRepository.countByDonoId(dono.getId());

        // 3. VALIDAÇÃO CRÍTICA: O plano permite criar mais uma?
        // Se o limite estourar ou o plano vencer, o 'verificarPlano' lança a ApiException
        verificarPlano.validarLimiteEmpresas(dono, totalEmpresasDono);

        // 4. Cria a empresa associada ao dono
        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());
        empresa.setDono(dono);
        empresa.setAtiva(true);

        return mapToResponse(empresaRepository.save(empresa));
    }

    @Transactional
    public EmpresaResponse atualizar(Long id, CriarEmpresaRequest req) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());

        // Se precisar validar algo na atualização, use o verificarPlano aqui também
        verificarPlano.validarAcessoTemporario(empresa.getDono());

        return mapToResponse(empresaRepository.save(empresa));
    }

    @Transactional
    public void excluir(Long id) {
        if (!empresaRepository.existsById(id)) {
            throw new EntityNotFoundException("Empresa não encontrada");
        }
        // Aqui você pode adicionar lógica para não deletar se houver vendas
        empresaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EmpresaResponse> listarPorUsuario(Long usuarioId) {
        return empresaRepository.findByDonoId(usuarioId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private EmpresaResponse mapToResponse(Empresa empresa) {
        EmpresaResponse res = new EmpresaResponse();
        res.setId(empresa.getId());
        res.setNomeFantasia(empresa.getNomeFantasia());
        res.setCnpj(empresa.getCnpj());

        // Agora os dados do plano vêm direto do Dono (Usuario)
        res.setPlanoNome(empresa.getDono().getTipoPlano().name());
        res.setLimiteCaixas(empresa.getDono().getTipoPlano().getLimiteCaixasPorEmpresa());
        return res;
    }

    @Transactional(readOnly = true)
    public EmpresaResponse buscarPorIdDto(Long id) {
        // 1. Busca a empresa ou lança 404
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada com o ID: " + id));

        // 2. Mapeia para o DTO usando o método auxiliar que já centraliza a lógica do plano
        return mapToResponse(empresa);
    }
    
}