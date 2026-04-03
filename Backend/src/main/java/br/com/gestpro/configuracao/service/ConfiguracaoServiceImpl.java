package br.com.gestpro.configuracao.service;

import br.com.gestpro.auth.EmailService;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.configuracao.dto.NotificacoesDTO;
import br.com.gestpro.configuracao.dto.PerfilDTO;
import br.com.gestpro.configuracao.dto.TrocarSenhaDTO;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ConfiguracaoServiceImpl implements ConfiguracaoServiceInterface {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder   passwordEncoder;
    private final EmailService      emailService;

    // Códigos temporários em memória: email → {codigo, expiracao}
    private final Map<String, CodigoTemp> codigos = new ConcurrentHashMap<>();

    private record CodigoTemp(String codigo, LocalDateTime expiracao) {}

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Perfil
    @Override
    public PerfilDTO getPerfil(String email) {
        Usuario u = buscar(email);

        // Dias restantes:
        // - Planos pagos: dataAssinaturaPlus + duração do plano
        // - EXPERIMENTAL: dataPrimeiroLogin + 7 dias
        int diasRestantes = 0;
        if (u.getTipoPlano() != null) {
            LocalDateTime referencia = u.getDataAssinaturaPlus() != null
                    ? u.getDataAssinaturaPlus()
                    : u.getDataPrimeiroLogin();

            if (referencia != null) {
                int duracaoDias = u.getTipoPlano().getDuracaoDiasPadrao();
                LocalDate fim = referencia.toLocalDate().plusDays(duracaoDias);
                diasRestantes = (int) Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), fim));
            }
        }

        // fotoUrl: prioriza upload, depois Google
        String fotoUrl = u.getFotoUpload() != null ? u.getFotoUpload() : u.getFoto();

        // data de assinatura formatada para exibição
        String dataAssinatura = null;
        if (u.getDataAssinaturaPlus() != null) {
            dataAssinatura = u.getDataAssinaturaPlus().format(FMT);
        } else if (u.getDataPrimeiroLogin() != null) {
            dataAssinatura = u.getDataPrimeiroLogin().format(FMT);
        }

        return PerfilDTO.builder()
                .id(u.getId())
                .nome(u.getNome())
                .email(u.getEmail())
                .fotoUrl(fotoUrl)
                .tipoPlano(u.getTipoPlano() != null ? u.getTipoPlano().name() : "EXPERIMENTAL")
                .diasRestantes(diasRestantes)
                .statusAcesso(u.getStatusAcesso() != null ? u.getStatusAcesso().name() : "ATIVO")
                .dataAssinatura(dataAssinatura)
                .emailConfirmado(u.isEmailConfirmado())
                .build();
    }

    // ── Atualizar nome ────────────────────────────────────────────────────
    @Override
    public void atualizarNome(String email, String novoNome) {
        if (novoNome == null || novoNome.isBlank())
            throw new ApiException("Nome inválido.", HttpStatus.BAD_REQUEST, "/configuracoes/perfil/nome");
        Usuario u = buscar(email);
        u.setNome(novoNome.trim());
        usuarioRepository.save(u);
    }

    // ── Upload de foto ────────────────────────────────────────────────────
    @Override
    public String uploadFoto(String email, MultipartFile foto) {
        if (foto == null || foto.isEmpty())
            throw new ApiException("Arquivo vazio.", HttpStatus.BAD_REQUEST, "/configuracoes/perfil/foto");

        String original = foto.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf("."))
                : ".jpg";
        String nomeArquivo = UUID.randomUUID() + ext;

        Path destino = Paths.get("uploads/fotos/" + nomeArquivo);
        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, foto.getBytes());
        } catch (IOException e) {
            throw new ApiException("Erro ao salvar foto.", HttpStatus.INTERNAL_SERVER_ERROR, "/configuracoes/perfil/foto");
        }


        String url = "/uploads/fotos/" + nomeArquivo;
        Usuario u = buscar(email);
        u.setFotoUpload(url);
        usuarioRepository.save(u);
        return url;
    }

    // ── Solicitar código de troca de senha ────────────────────────────────
    @Override
    public void solicitarCodigoTrocaSenha(String email) {
        Usuario u = buscar(email);

        // Usuários Google sem senha local não podem trocar senha por aqui
        if (u.isLoginGoogle() && u.getSenha() == null)
            throw new ApiException(
                    "Sua conta é vinculada ao Google. Troque a senha diretamente pelo Google.",
                    HttpStatus.BAD_REQUEST, "/configuracoes/senha");

        String codigo = emailService.gerarCodigo();
        codigos.put(email, new CodigoTemp(codigo, LocalDateTime.now().plusMinutes(10)));
        emailService.enviarCodigoConfirmacao(email, u.getNome(), codigo);
    }

    // ── Trocar senha ──────────────────────────────────────────────────────
    @Override
    public void trocarSenha(String email, TrocarSenhaDTO dto) {
        CodigoTemp ct = codigos.get(email);

        if (ct == null || !ct.codigo().equals(dto.getCodigo()))
            throw new ApiException("Código inválido ou não solicitado.",
                    HttpStatus.BAD_REQUEST, "/configuracoes/senha/trocar");

        if (LocalDateTime.now().isAfter(ct.expiracao())) {
            codigos.remove(email);
            throw new ApiException("Código expirado. Solicite um novo.",
                    HttpStatus.BAD_REQUEST, "/configuracoes/senha/trocar");
        }

        if (!dto.getNovaSenha().equals(dto.getConfirmarSenha()))
            throw new ApiException("As senhas não coincidem.",
                    HttpStatus.BAD_REQUEST, "/configuracoes/senha/trocar");

        if (dto.getNovaSenha().length() < 6)
            throw new ApiException("Senha deve ter ao menos 6 caracteres.",
                    HttpStatus.BAD_REQUEST, "/configuracoes/senha/trocar");

        Usuario u = buscar(email);
        u.setSenha(passwordEncoder.encode(dto.getNovaSenha()));
        usuarioRepository.save(u);
        codigos.remove(email);
    }

    // ── Notificações ──────────────────────────────────────────────────────
    @Override
    public NotificacoesDTO getNotificacoes(String email) {
        buscar(email); // valida existência
        NotificacoesDTO dto = new NotificacoesDTO();
        dto.setEmailVendas(true);
        dto.setEmailRelatorios(false);
        dto.setAlertaEstoqueZerado(true);
        dto.setAlertaVencimentoPlano(true);
        return dto;
    }

    @Override
    public void atualizarNotificacoes(String email, NotificacoesDTO dto) {
        buscar(email); // valida existência — expanda para persistir se necessário
    }

    // ── Helper ────────────────────────────────────────────────────────────
    private Usuario buscar(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Usuário não encontrado.",
                        HttpStatus.NOT_FOUND, "/configuracoes"));
    }
}