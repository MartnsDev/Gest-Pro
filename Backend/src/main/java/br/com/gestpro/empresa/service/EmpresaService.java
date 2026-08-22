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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
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

    // 1. CRIAÇÃO DE EMPRESA
    @Transactional
    public EmpresaResponse criar(CriarEmpresaRequest req) {
        Usuario dono = usuarioRepository.findByEmailForUpdate(req.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        long totalEmpresasNoSistema = empresaRepository.countByDonoId(dono.getId());
        verificarPlano.validarLimiteEmpresas(dono, totalEmpresasNoSistema);

        Map<String, Object> dadosReceita = null;

        if (req.getCnpj() != null && !req.getCnpj().isBlank()) {
            String documentoLimpo = normalizarDocumento(req.getCnpj());

            if (empresaRepository.existsByCnpj(documentoLimpo)) {
                throw new ApiException("Este CPF/CNPJ já está vinculado a outra empresa no sistema.", HttpStatus.CONFLICT, "/empresas");
            }

            dadosReceita = validarDocumentoFiscal(req.getCnpj());
        }

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(req.getNomeFantasia().trim());
        empresa.setCnpj(normalizarDocumento(req.getCnpj()));
        empresa.setDono(dono);
        empresa.setAtivo(true);
        empresa.setPlano(dono.getTipoPlano());

        // PREENCHE ENDEREÇO E RAZÃO SOCIAL AUTOMATICAMENTE
        preencherDadosReceita(empresa, dadosReceita);

        return mapToResponse(salvarEmpresa(empresa));
    }
    // 2. ATUALIZAÇÃO E RESTAURAÇÃO DE EMPRESA
    @Transactional
    public EmpresaResponse atualizar(Long id, CriarEmpresaRequest req) {
        Usuario usuarioBloqueado = usuarioRepository.findByEmailForUpdate(req.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(req.getEmailUsuario())) {
            throw new ApiException("Você não tem permissão para editar esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        verificarPlano.validarAcesso(empresa.getDono());

        String documentoNovo = normalizarDocumento(req.getCnpj());
        String documentoAtual = normalizarDocumento(empresa.getCnpj());
        boolean documentoAlterado = !java.util.Objects.equals(documentoNovo, documentoAtual);
        Map<String, Object> dadosReceita = null;

        // Valida o documento somente quando ele realmente foi alterado.
        if (documentoAlterado && documentoNovo != null) {

            // Impede que o mesmo documento seja vinculado a outra empresa.
            if (empresaRepository.existsByCnpjAndIdNot(documentoNovo, id)) {
                throw new ApiException(
                        "Este CPF/CNPJ já está sendo utilizado por outra empresa.",
                        HttpStatus.CONFLICT, "/empresas"
                );
            }

            dadosReceita = validarDocumentoFiscal(documentoNovo);
        }

        // 2. PROTEÇÃO DE RESTAURAÇÃO (Evita burlar o limite do plano)
        if (req.getAtivo() != null && req.getAtivo() && !empresa.getAtivo()) {
            long ativas = empresaRepository.countByDonoIdAndAtivoTrue(usuarioBloqueado.getId());
            int limite = usuarioBloqueado.getTipoPlano().getLimiteEmpresas();

            if (ativas >= limite) {
                throw new ApiException(
                        "Não é possível restaurar. Você já atingiu o limite de " + limite +
                                " empresa(s) ativa(s) permitido pelo seu plano.",
                        HttpStatus.FORBIDDEN, "/empresas"
                );
            }
        }

        // 3. Atualiza os dados
        empresa.setNomeFantasia(req.getNomeFantasia().trim());
        empresa.setCnpj(documentoNovo);
        if (documentoAlterado) {
            limparDadosReceita(empresa);
            preencherDadosReceita(empresa, dadosReceita);
        }

        if (req.getAtivo() != null) {
            empresa.setAtivo(req.getAtivo());
        }

        return mapToResponse(salvarEmpresa(empresa));
    }

    // 3. EXCLUSÃO E LISTAGEM
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

    @Transactional
    public void excluirComSenha(Long id, String emailUsuario, String senha) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario)) {
            throw new ApiException("Você não tem permissão para excluir esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        if (empresa.getDono().getSenha() == null
                || !passwordEncoder.matches(senha, empresa.getDono().getSenha())) {
            throw new ApiException("Senha incorreta.", HttpStatus.UNAUTHORIZED, "/empresas");
        }

        empresa.setAtivo(false); // Soft Delete
        empresaRepository.save(empresa);
    }

    @Transactional(readOnly = true)
    public List<EmpresaResponse> listarPorUsuario(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        // Retorna todas (ativas e inativas) para o frontend desenhar as abas
        return empresaRepository.findByDonoId(usuario.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmpresaResponse buscarPorIdDto(Long id, String emailUsuario) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada com o ID: " + id));
        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException("Você não tem permissão para acessar esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        return mapToResponse(empresa);
    }

    // EXCLUSÃO PERMANENTE (HARD DELETE)
    @Transactional
    public void excluirPermanentementeComSenha(Long id, String emailUsuario, String senha) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario)) {
            throw new ApiException("Você não tem permissão para excluir esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        if (empresa.getDono().getSenha() == null
                || !passwordEncoder.matches(senha, empresa.getDono().getSenha())) {
            throw new ApiException("Senha incorreta.", HttpStatus.UNAUTHORIZED, "/empresas");
        }

        // HARD DELETE: Remove definitivamente do banco de dados para liberar cota
        empresaRepository.delete(empresa);
    }

    // 4. MÉTODOS AUXILIARES (HELPERS)
    private Map<String, Object> validarDocumentoFiscal(String documentoBruto) {
        if (documentoBruto == null || documentoBruto.isBlank()) {
            return null;
        }

        String documento = documentoBruto.replaceAll("\\D", "");

        if (documento.length() == 11) {
            try {
                verificarCPF.consultarCpf(documento);
            } catch (RuntimeException cpfInvalido) {
                throw new ApiException("CPF inválido.", HttpStatus.BAD_REQUEST, "/empresas");
            }
            return null;
        }
        if (documento.length() == 14) {
            if (!verificarCNPJ.isCnpjValido(documento)) {
                throw new ApiException("CNPJ inválido.", HttpStatus.BAD_REQUEST, "/empresas");
            }
            try {
                return verificarCNPJ.consultarCnpj(documento);
            } catch (Exception consultaIndisponivel) {
                log.warn("Consulta cadastral de CNPJ indisponível; cadastro seguirá sem enriquecimento.");
                return null;
            }
        }
        throw new ApiException("Informe um CPF com 11 dígitos ou CNPJ com 14 dígitos.", HttpStatus.BAD_REQUEST, "/empresas");
    }

    private String normalizarDocumento(String documento) {
        if (documento == null || documento.isBlank()) return null;
        return documento.replaceAll("\\D", "");
    }

    private Empresa salvarEmpresa(Empresa empresa) {
        try {
            return empresaRepository.saveAndFlush(empresa);
        } catch (DataIntegrityViolationException e) {
            throw new ApiException("Este CPF/CNPJ já está vinculado a outra empresa.", HttpStatus.CONFLICT, "/empresas");
        }
    }

    private void preencherDadosReceita(Empresa empresa, Map<String, Object> dadosCnpj) {
        if (dadosCnpj == null) return;

        // Pega os campos (tenta o padrão BrasilAPI, se for nulo tenta o ReceitaWS)
        empresa.setRazaoSocial((String) dadosCnpj.getOrDefault("razao_social", dadosCnpj.get("nome")));
        empresa.setCep((String) dadosCnpj.get("cep"));
        empresa.setLogradouro((String) dadosCnpj.get("logradouro"));
        empresa.setNumero((String) dadosCnpj.get("numero"));
        empresa.setBairro((String) dadosCnpj.get("bairro"));
        empresa.setCidade((String) dadosCnpj.getOrDefault("municipio", dadosCnpj.get("cidade")));
        empresa.setUf((String) dadosCnpj.get("uf"));

        // Telefones às vezes vêm como ddd_telefone_1 ou apenas telefone
        String telefone = (String) dadosCnpj.getOrDefault("ddd_telefone_1", dadosCnpj.get("telefone"));
        if (telefone != null) {
            empresa.setTelefone(telefone.replaceAll("[^0-9]", ""));
        }
    }

    private void limparDadosReceita(Empresa empresa) {
        empresa.setRazaoSocial(null);
        empresa.setCep(null);
        empresa.setLogradouro(null);
        empresa.setNumero(null);
        empresa.setBairro(null);
        empresa.setCidade(null);
        empresa.setUf(null);
        empresa.setTelefone(null);
    }

    private EmpresaResponse mapToResponse(Empresa empresa) {
        EmpresaResponse res = new EmpresaResponse();
        res.setId(empresa.getId());
        res.setNomeFantasia(empresa.getNomeFantasia());
        String documento = normalizarDocumento(empresa.getCnpj());
        res.setCnpj(documento != null && documento.length() == 14 ? documento : null);
        res.setCpf(documento != null && documento.length() == 11 ? documento : null);
        res.setRazaoSocial(empresa.getRazaoSocial());
        res.setCep(empresa.getCep());
        res.setLogradouro(empresa.getLogradouro());
        res.setNumero(empresa.getNumero());
        res.setBairro(empresa.getBairro());
        res.setCidade(empresa.getCidade());
        res.setUf(empresa.getUf());
        res.setTelefone(empresa.getTelefone());
        res.setPlanoNome(empresa.getDono().getTipoPlano().name());
        res.setLimiteCaixas(empresa.getDono().getTipoPlano().getLimiteCaixasPorEmpresa());
        res.setAtivo(empresa.getAtivo()); // Fundamental para as abas do frontend
        return res;
    }
}
