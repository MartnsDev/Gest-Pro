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

    // ────────────────────────────────────────────────────────────────────────
    // 1. CRIAÇÃO DE EMPRESA
    // ────────────────────────────────────────────────────────────────────────
    @Transactional
    public EmpresaResponse criar(CriarEmpresaRequest req) {
        Usuario dono = usuarioRepository.findByEmail(req.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/empresas"));

        long totalEmpresasNoSistema = empresaRepository.countByDonoId(dono.getId());
        int limiteEmpresas = dono.getTipoPlano().getLimiteEmpresas();

        if (totalEmpresasNoSistema >= limiteEmpresas) {
            throw new ApiException("Limite atingido. Seu plano permite ter no máximo " + limiteEmpresas + " empresa(s).", HttpStatus.FORBIDDEN, "/empresas");
        }

        Map<String, Object> dadosReceita = null; // Variável para guardar o resultado

        if (req.getCnpj() != null && !req.getCnpj().isBlank()) {
            String documentoLimpo = req.getCnpj().replaceAll("\\D", "");

            if (documentoLimpo.length() == 14 && empresaRepository.existsByCnpj(req.getCnpj())) {
                throw new ApiException("Este CNPJ já está vinculado a outra empresa no sistema.", HttpStatus.BAD_REQUEST, "/empresas");
            }

            // SALVA OS DADOS AQUI!
            dadosReceita = validarDocumentoFiscal(req.getCnpj());
        }

        Empresa empresa = new Empresa();
        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());
        empresa.setDono(dono);
        empresa.setAtivo(true);
        empresa.setPlano(dono.getTipoPlano());

        // PREENCHE ENDEREÇO E RAZÃO SOCIAL AUTOMATICAMENTE
        preencherDadosReceita(empresa, dadosReceita);

        return mapToResponse(empresaRepository.save(empresa));
    }
    // ────────────────────────────────────────────────────────────────────────
    // 2. ATUALIZAÇÃO E RESTAURAÇÃO DE EMPRESA
    // ────────────────────────────────────────────────────────────────────────
    @Transactional
    public EmpresaResponse atualizar(Long id, CriarEmpresaRequest req) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(req.getEmailUsuario())) {
            throw new ApiException("Você não tem permissão para editar esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        verificarPlano.validarAcesso(empresa.getDono());

        // 1. Validação de Documento apenas se o usuário trocou o CNPJ/CPF
        if (req.getCnpj() != null && !req.getCnpj().equals(empresa.getCnpj()) && !req.getCnpj().isBlank()) {
            String documentoLimpo = req.getCnpj().replaceAll("\\D", "");

            // A. Checa duplicidade SOMENTE se for CNPJ (14 dígitos)
            if (documentoLimpo.length() == 14 && empresaRepository.existsByCnpjAndIdNot(req.getCnpj(), id)) {
                throw new ApiException(
                        "Este CNPJ já está sendo utilizado por outra empresa.",
                        HttpStatus.BAD_REQUEST, "/empresas"
                );
            }

            // B. Valida na Receita
            validarDocumentoFiscal(req.getCnpj());
        }

        // 2. PROTEÇÃO DE RESTAURAÇÃO (Evita burlar o limite do plano)
        if (req.getAtivo() != null && req.getAtivo() && !empresa.getAtivo()) {
            long ativas = empresaRepository.countByDonoIdAndAtivoTrue(empresa.getDono().getId());
            int limite = empresa.getDono().getTipoPlano().getLimiteEmpresas();

            if (ativas >= limite) {
                throw new ApiException(
                        "Não é possível restaurar. Você já atingiu o limite de " + limite +
                                " empresa(s) ativa(s) permitido pelo seu plano.",
                        HttpStatus.FORBIDDEN, "/empresas"
                );
            }
        }

        // 3. Atualiza os dados
        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());

        if (req.getAtivo() != null) {
            empresa.setAtivo(req.getAtivo());
        }

        return mapToResponse(empresaRepository.save(empresa));
    }

    // ────────────────────────────────────────────────────────────────────────
    // 3. EXCLUSÃO E LISTAGEM
    // ────────────────────────────────────────────────────────────────────────
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

        if (!passwordEncoder.matches(senha, empresa.getDono().getSenha())) {
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
    public EmpresaResponse buscarPorIdDto(Long id) {
        return mapToResponse(empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada com o ID: " + id)));
    }

    // ────────────────────────────────────────────────────────────────────────
    // EXCLUSÃO PERMANENTE (HARD DELETE)
    // ────────────────────────────────────────────────────────────────────────
    @Transactional
    public void excluirPermanentementeComSenha(Long id, String emailUsuario, String senha) {
        Empresa empresa = empresaRepository.findByIdWithDono(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario)) {
            throw new ApiException("Você não tem permissão para excluir esta empresa.", HttpStatus.FORBIDDEN, "/empresas");
        }

        if (!passwordEncoder.matches(senha, empresa.getDono().getSenha())) {
            throw new ApiException("Senha incorreta.", HttpStatus.UNAUTHORIZED, "/empresas");
        }

        // HARD DELETE: Remove definitivamente do banco de dados para liberar cota
        empresaRepository.delete(empresa);
    }

    // ────────────────────────────────────────────────────────────────────────
    // 4. MÉTODOS AUXILIARES (HELPERS)
    // ────────────────────────────────────────────────────────────────────────
    private Map<String, Object> validarDocumentoFiscal(String documentoBruto) {
        if (documentoBruto == null || documentoBruto.isBlank()) {
            return null;
        }

        String documento = documentoBruto.replaceAll("\\D", "");

        try {
            if (documento.length() == 11) {
                verificarCPF.consultarCpf(documento);
                return null; // CPF geralmente não retorna endereço completo público
            } else if (documento.length() == 14) {
                // RETORNA OS DADOS DA RECEITA PARA O SERVIÇO!
                return verificarCNPJ.consultarCnpj(documento);
            } else {
                throw new ApiException("Quantidade de caracteres inválida.", HttpStatus.BAD_REQUEST, "/empresas");
            }
        } catch (Exception e) {
            if (e.getMessage() != null && (e.getMessage().contains("503") || e.getMessage().toLowerCase().contains("offline"))) {
                throw new ApiException(
                        "O serviço de consulta de CPF/CNPJ está temporariamente fora do ar. Deixe o campo vazio por enquanto.",
                        HttpStatus.SERVICE_UNAVAILABLE, "/empresas"
                );
            }
            throw e;
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

    private EmpresaResponse mapToResponse(Empresa empresa) {
        EmpresaResponse res = new EmpresaResponse();
        res.setId(empresa.getId());
        res.setNomeFantasia(empresa.getNomeFantasia());
        res.setCnpj(empresa.getCnpj());
        res.setPlanoNome(empresa.getDono().getTipoPlano().name());
        res.setLimiteCaixas(empresa.getDono().getTipoPlano().getLimiteCaixasPorEmpresa());
        res.setAtivo(empresa.getAtivo()); // Fundamental para as abas do frontend
        return res;
    }
}