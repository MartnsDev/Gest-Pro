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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmpresaService {

    private final EmpresaRepository       empresaRepository;
    private final UsuarioRepository       usuarioRepository;
    private final VerificarPlanoOperation verificarPlano;
    private final JavaMailSender          mailSender;

    // ─── Cache em memória para códigos de exclusão ────────────────────────
    // Chave: "empresaId:email" → {codigo, expiracao}
    private final Map<String, CodigoExclusao> codigosExclusao = new ConcurrentHashMap<>();

    private record CodigoExclusao(String codigo, LocalDateTime expiracao) {
        boolean expirado() { return LocalDateTime.now().isAfter(expiracao); }
    }

    // ─── CRUD padrão ──────────────────────────────────────────────────────

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

        if (!empresa.getDono().getEmail().equals(req.getEmailUsuario()))
            throw new ApiException("Você não tem permissão para editar esta empresa.", HttpStatus.FORBIDDEN, "/empresas");

        verificarPlano.validarAcesso(empresa.getDono());

        empresa.setNomeFantasia(req.getNomeFantasia());
        empresa.setCnpj(req.getCnpj());

        return mapToResponse(empresaRepository.save(empresa));
    }

    /**
     * Exclusão simples (rota legada) — sem código de confirmação.
     */
    @Transactional
    public void excluir(Long id, String emailUsuario) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada"));

        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException("Você não tem permissão para excluir esta empresa.", HttpStatus.FORBIDDEN, "/empresas");

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
        return mapToResponse(empresaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Empresa não encontrada com o ID: " + id)));
    }

    // ─── Exclusão com confirmação por e-mail ──────────────────────────────

    /**
     * PASSO 1 — Gera um código de 6 dígitos, salva em memória (10 min) e envia por e-mail.
     */
    public void solicitarCodigoExclusao(Long empresaId, String emailUsuario) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/empresas"));

        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException("Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, "/empresas");

        String codigo = String.format("%06d", new Random().nextInt(999999));
        String chave  = empresaId + ":" + emailUsuario;

        codigosExclusao.put(chave, new CodigoExclusao(codigo, LocalDateTime.now().plusMinutes(10)));

        enviarEmailExclusao(emailUsuario, empresa.getNomeFantasia(), codigo);
        log.info("Código de exclusão gerado para empresa {} | usuario={}", empresaId, emailUsuario);
    }

    /**
     * PASSO 2 — Valida o código e, se correto, exclui a empresa e todos os dados relacionados.
     */
    @Transactional
    public void confirmarExclusao(Long empresaId, String emailUsuario, String codigoInformado) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/empresas"));

        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException("Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, "/empresas");

        String chave  = empresaId + ":" + emailUsuario;
        CodigoExclusao registro = codigosExclusao.get(chave);

        if (registro == null)
            throw new ApiException("Nenhum código solicitado. Clique em 'Solicitar código' primeiro.",
                    HttpStatus.BAD_REQUEST, "/empresas");

        if (registro.expirado()) {
            codigosExclusao.remove(chave);
            throw new ApiException("Código expirado. Solicite um novo.", HttpStatus.BAD_REQUEST, "/empresas");
        }

        if (!registro.codigo().equals(codigoInformado.trim()))
            throw new ApiException("Código incorreto. Tente novamente.", HttpStatus.BAD_REQUEST, "/empresas");

        // Código válido — remove do cache e exclui tudo
        codigosExclusao.remove(chave);

        // O cascade no relacionamento cuida dos dados filhos (produtos, vendas, clientes, etc.)
        // Se não tiver cascade configurado, exclua manualmente aqui na ordem correta:
        // produtoRepository.deleteByEmpresaId(empresaId);
        // vendaRepository.deleteByEmpresaId(empresaId);
        // clienteRepository.deleteByEmpresaId(empresaId);
        // caixaRepository.deleteByEmpresaId(empresaId);
        empresaRepository.deleteById(empresaId);

        log.info("Empresa {} excluída com sucesso pelo usuário {}", empresaId, emailUsuario);
    }

    // ─── Helpers privados ─────────────────────────────────────────────────

    private void enviarEmailExclusao(String destinatario, String nomeEmpresa, String codigo) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(destinatario);
            msg.setSubject("GestPro — Código de confirmação para excluir empresa");
            msg.setText(
                    "Olá!\n\n" +
                            "Recebemos uma solicitação para excluir permanentemente a empresa:\n\n" +
                            "   " + nomeEmpresa + "\n\n" +
                            "Seu código de confirmação é:\n\n" +
                            "   " + codigo + "\n\n" +
                            "⚠️  ATENÇÃO: Esta ação é irreversível. Todos os produtos, vendas,\n" +
                            "clientes e relatórios desta empresa serão excluídos permanentemente.\n\n" +
                            "O código é válido por 10 minutos.\n\n" +
                            "Se você não solicitou isso, ignore este e-mail.\n\n" +
                            "— Equipe GestPro"
            );
            mailSender.send(msg);
            log.info("E-mail de exclusão enviado para {}", destinatario);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de exclusão para {}: {}", destinatario, e.getMessage());
            throw new ApiException("Falha ao enviar e-mail. Tente novamente.", HttpStatus.INTERNAL_SERVER_ERROR, "/empresas");
        }
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