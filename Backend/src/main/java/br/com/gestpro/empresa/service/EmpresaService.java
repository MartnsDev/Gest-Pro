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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository       empresaRepository;
    private final UsuarioRepository       usuarioRepository;
    private final VerificarPlanoOperation verificarPlano;
    private final PasswordEncoder         passwordEncoder;
    private final VerificarCNPJ           verificarCNPJ;
    private final VerificarCPF            verificarCPF;

    // CRUD padrão
    @Transactional
    public EmpresaResponse criar(CriarEmpresaRequest req) {
        Usuario dono = usuarioRepository.findByEmail(req.getEmailUsuario())
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        Object rawCount = empresaRepository.countByDonoId(dono.getId());
        long totalEmpresasDono = rawCount instanceof Number n ? n.longValue() : 0L;

        // Só entra na lógica se o campo NÃO for nulo e NÃO estiver em branco
        if (req.getCnpj() != null && !req.getCnpj().isBlank()) {

            // Limpa pontos e traços para contar apenas os números
            String documento = req.getCnpj().replaceAll("\\D", "");

            if (documento.length() == 11) {
                // É um CPF: tenta consultar
                verificarCPF.consultarCpf(documento);

            } else if (documento.length() == 14) {
                // É um CNPJ: tenta consultar
                verificarCNPJ.consultarCnpj(documento);

            } else {
                // Tem caracteres, mas a quantidade é inválida
                throw new ApiException(
                        "Erro de Validação",
                        HttpStatus.BAD_REQUEST,
                        "Quantidade de caracteres inválida. Informe 11 dígitos para CPF ou 14 para CNPJ."
                );
            }
        }


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
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(req.getEmailUsuario()))
            throw new ApiException(
                    "Você não tem permissão para editar esta empresa.",
                    HttpStatus.FORBIDDEN, "/empresas");

        verificarPlano.validarAcesso(empresa.getDono());

        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());

        return mapToResponse(empresaRepository.save(empresa));
    }

    @Transactional
    public void excluir(Long id, String emailUsuario) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException(
                    "Você não tem permissão para excluir esta empresa.",
                    HttpStatus.FORBIDDEN, "/empresas");

        empresaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EmpresaResponse> listarPorUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        return empresaRepository.findByDonoId(usuario.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmpresaResponse buscarPorIdDto(Long id) {
        return mapToResponse(empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Empresa não encontrada com o ID: " + id)));
    }

    // Exclusão com confirmação por senha
    @Transactional
    public void excluirComSenha(Long empresaId, String emailUsuario, String senhaInformada) {
        Empresa empresa = empresaRepository.findByIdWithDono(empresaId)
                .orElseThrow(() -> new ApiException(
                        "Empresa não encontrada", HttpStatus.NOT_FOUND, "/empresas"));

        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException(
                    "Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, "/empresas");

        Usuario usuario = empresa.getDono();

        // Usuário Google não tem senha — bloqueia com mensagem clara
        if (usuario.getSenha() == null || usuario.getSenha().isBlank())
            throw new ApiException(
                    "Sua conta usa login pelo Google e não possui senha cadastrada. " +
                            "Entre em contato com o suporte para excluir a empresa.",
                    HttpStatus.BAD_REQUEST, "/empresas");

        // Valida a senha informada contra o hash no banco
        if (!passwordEncoder.matches(senhaInformada, usuario.getSenha()))
            throw new ApiException(
                    "Senha incorreta. Tente novamente.",
                    HttpStatus.UNAUTHORIZED, "/empresas");

        empresaRepository.deleteById(empresaId);

        log.info("Empresa {} excluída com sucesso pelo usuário {}", empresaId, emailUsuario);
    }

    // Helpers privados
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