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

    private final EmpresaRepository        empresaRepository;
    private final UsuarioRepository        usuarioRepository;
    private final VerificarPlanoOperation verificarPlano;
    private final PasswordEncoder          passwordEncoder;
    private final VerificarCNPJ            verificarCNPJ;
    private final VerificarCPF             verificarCPF;

    @Transactional
    public EmpresaResponse criar(CriarEmpresaRequest req) {
        Usuario dono = usuarioRepository.findByEmail(req.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        long totalEmpresasAtivas = empresaRepository.countByDonoIdAndAtivoTrue(dono.getId());
        int limiteEmpresas = dono.getTipoPlano().getLimiteEmpresas();

        if (totalEmpresasAtivas >= limiteEmpresas) {
            throw new ApiException(
                    "Limite atingido. Seu plano permite gerenciar no máximo " + limiteEmpresas + " empresa(s) ativa(s).",
                    HttpStatus.FORBIDDEN, "/empresas"
            );
        }

        // CHAMA A API AQUI: Se der erro, ele nem chega na linha de baixo
        validarDocumentoFiscal(req.getCnpj());

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());
        empresa.setDono(dono);
        empresa.setAtivo(true);
        empresa.setPlano(dono.getTipoPlano());

        return mapToResponse(empresaRepository.save(empresa));
    }

    @Transactional
    public EmpresaResponse atualizar(Long id, CriarEmpresaRequest req) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(req.getEmailUsuario()))
            throw new ApiException("Você não tem permissão para editar esta empresa.", HttpStatus.FORBIDDEN, "/empresas");

        verificarPlano.validarAcesso(empresa.getDono());

        // Se o usuário tentar mudar o CNPJ na edição, valida na API de novo!
        if (req.getCnpj() != null && !req.getCnpj().equals(empresa.getCnpj())) {
            validarDocumentoFiscal(req.getCnpj());
        }

        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());

        if (req.getAtivo() != null) {
            empresa.setAtivo(req.getAtivo());
        }

        return mapToResponse(empresaRepository.save(empresa));
    }

    @Transactional
    public void excluir(Long id, String emailUsuario) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario)) {
            throw new ApiException("Você não tem permissão para excluir esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        empresa.setAtivo(false); // Soft Delete
        empresaRepository.save(empresa);
    }

    @Transactional(readOnly = true)
    public List<EmpresaResponse> listarPorUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        // Opcional: Se quiser que o endpoint só retorne as ativas por padrão,
        // mude o repositório. Como o frontend tem abas, mandar todas é ideal.
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

    @Transactional
    public void excluirComSenha(Long id, String emailUsuario, String senha) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario)) {
            throw new ApiException("Você não tem permissão para excluir esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        if (!passwordEncoder.matches(senha, empresa.getDono().getSenha())) {
            throw new ApiException("Senha incorreta.", HttpStatus.UNAUTHORIZED, "/empresas");
        }

        empresa.setAtivo(false); // Soft Delete
        empresaRepository.save(empresa);
    }

    private EmpresaResponse mapToResponse(Empresa empresa) {
        EmpresaResponse res = new EmpresaResponse();
        res.setId(empresa.getId());
        res.setNomeFantasia(empresa.getNomeFantasia());
        res.setCnpj(empresa.getCnpj());
        res.setPlanoNome(empresa.getDono().getTipoPlano().name());
        res.setLimiteCaixas(empresa.getDono().getTipoPlano().getLimiteCaixasPorEmpresa());

        res.setAtivo(empresa.getAtivo());

        return res;
    }

    private void validarDocumentoFiscal(String documentoBruto) {
        if (documentoBruto == null || documentoBruto.isBlank()) {
            return; // Documento é opcional, passa direto se estiver vazio.
        }

        String documento = documentoBruto.replaceAll("\\D", "");

        try {
            if (documento.length() == 11) {
                verificarCPF.consultarCpf(documento);
            } else if (documento.length() == 14) {
                verificarCNPJ.consultarCnpj(documento);
            } else {
                throw new ApiException(
                        "Quantidade de caracteres inválida. Informe 11 dígitos para CPF ou 14 para CNPJ.",
                        HttpStatus.BAD_REQUEST,
                        "/empresas"
                );
            }
        } catch (Exception e) {
            // Verifica se o erro gerado pela sua classe VerificarCPF/CNPJ contém "503" ou "offline"
            if (e.getMessage() != null && (e.getMessage().contains("503") || e.getMessage().toLowerCase().contains("offline"))) {
                throw new ApiException(
                        "O serviço de consulta de CPF/CNPJ está temporariamente fora do ar. Como o documento é opcional, você pode deixar o campo vazio para cadastrar a loja agora e preenchê-lo mais tarde.",
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "/empresas"
                );
            }

            throw e;
        }
    }
}