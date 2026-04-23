package br.com.gestpro.auth.service;

import br.com.gestpro.auth.EmailService;
import br.com.gestpro.auth.MailTrapEmail;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class CadastroManualOperation {

    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UploadFotoOperation uploadFotoOperation;
    private final MailTrapEmail mailTrapEmail;

    public CadastroManualOperation(UsuarioRepository usuarioRepository,
                                   EmailService emailService,
                                   PasswordEncoder passwordEncoder,
                                   UploadFotoOperation uploadFotoOperation, MailTrapEmail mailTrapEmail) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.uploadFotoOperation = uploadFotoOperation;
        this.mailTrapEmail = mailTrapEmail;
    }

    @Transactional
    public Usuario execute(String nome, String email, String senha,
                           MultipartFile foto, String baseUrl, String path) throws IOException {

        Optional<Usuario> existenteOpt = usuarioRepository.findByEmail(email);

        if (existenteOpt.isPresent()) {
            Usuario existente = existenteOpt.get();

            //  Conta criada via Google -> converter para manual
            if (existente.isLoginGoogle()) {
                atualizarUsuarioGoogleExistente(existente, nome, senha, foto);
                usuarioRepository.save(existente);
                enviarEmailConfirmacao(existente, baseUrl);
                return existente;
            }

            //  Já existe mas não confirmou → reenviar email
            if (!existente.isEmailConfirmado()) {
                renovarTokenConfirmacao(existente);
                usuarioRepository.save(existente);
                enviarEmailConfirmacao(existente, baseUrl);
                return existente;
            }

            //  Já existe e está ativo
            throw new ApiException(
                    "E-mail já cadastrado.",
                    HttpStatus.BAD_REQUEST,
                    path
            );
        }

        //  Novo cadastro
        Usuario usuario = criarNovoUsuario(nome, email, senha, foto);
        usuarioRepository.save(usuario);
        enviarEmailConfirmacao(usuario, baseUrl);

        return usuario;
    }

   // Criar Novo Usuario
    private Usuario criarNovoUsuario(String nome, String email, String senha, MultipartFile foto) throws IOException {

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setTipoPlano(TipoPlano.EXPERIMENTAL);
        usuario.setStatusAcesso(StatusAcesso.ATIVO);
        usuario.setEmailConfirmado(false);
        usuario.setLoginGoogle(false);
        usuario.setDataCriacao(LocalDateTime.now());
        usuario.setDataPrimeiroLogin(LocalDateTime.now());

        if (foto != null && !foto.isEmpty()) {
            usuario.setFotoUpload(uploadFotoOperation.salvarFoto(foto, "usuarios"));
        }

        gerarTokenConfirmacao(usuario);
        return usuario;
    }

    // ATUALIZA GOOGLE → MANUAL
    private void atualizarUsuarioGoogleExistente(Usuario usuario,
                                                 String nome,
                                                 String senha,
                                                 MultipartFile foto) throws IOException {
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setLoginGoogle(false);
        usuario.setEmailConfirmado(false);

        if (nome != null && !nome.isBlank()) {
            usuario.setNome(nome);
        }

        if (foto != null && !foto.isEmpty()) {
            usuario.setFotoUpload(uploadFotoOperation.salvarFoto(foto, "usuarios"));
        }

        gerarTokenConfirmacao(usuario);
    }

    // TOKEN
    private void gerarTokenConfirmacao(Usuario usuario) {
        usuario.setTokenConfirmacao(UUID.randomUUID().toString());
        usuario.setDataEnvioConfirmacao(LocalDateTime.now());
    }

    private void renovarTokenConfirmacao(Usuario usuario) {
        gerarTokenConfirmacao(usuario);
    }

    // EMAIL
    private void enviarEmailConfirmacao(Usuario usuario, String baseUrl) {

        try {
            String linkConfirmacao = baseUrl + "/auth/confirmar?token=" + usuario.getTokenConfirmacao();
            // Produção
              emailService.enviarConfirmacao(usuario.getEmail(), linkConfirmacao);
            // Testes
            // mailTrapEmail.enviarConfirmacao(usuario.getEmail(), linkConfirmacao);
        } catch (Exception e) {
            throw new ApiException(
                    "Erro ao enviar e-mail de confirmação.",
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "/auth/cadastro"
            );
        }
    }
}