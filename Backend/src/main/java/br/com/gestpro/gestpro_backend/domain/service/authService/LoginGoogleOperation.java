package br.com.gestpro.gestpro_backend.domain.service.authService;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusAcesso;
import br.com.gestpro.gestpro_backend.domain.model.enums.TipoPlano;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.service.authService.planoService.VerificarPlanoOperation;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class LoginGoogleOperation {

    private final UsuarioRepository usuarioRepository;
    private final VerificarPlanoOperation verificarPlano;

    public LoginGoogleOperation(UsuarioRepository usuarioRepository,
                                VerificarPlanoOperation verificarPlano) {
        this.usuarioRepository = usuarioRepository;
        this.verificarPlano = verificarPlano;
    }

    @Transactional
    public Usuario execute(String email, String nome, String foto, HttpServletResponse response) throws IOException {

        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    // Atualiza dados básicos
                    u.setNome(nome);
                    u.setFoto(foto);

                    // Caso ainda não tenha confirmado o email (criado manualmente antes)
                    if (!u.isEmailConfirmado()) {
                        u.setEmailConfirmado(true);
                        u.setTokenConfirmacao(null);
                    }

                    // Se a conta foi criada manualmente, mas agora está logando via Google
                    if (u.getDataPrimeiroLogin() != null && !u.isLoginGoogle()) {
                        u.setLoginGoogle(true);
                    }

                    // Verifica o plano e salva
                    verificarPlano.execute(u);
                    return usuarioRepository.save(u);
                })
                .orElseGet(() -> {
                    // Criar novo usuário via login Google
                    Usuario novo = new Usuario();
                    novo.setNome(nome);
                    novo.setEmail(email);
                    novo.setSenha(null);
                    novo.setFoto(foto);
                    novo.setTipoPlano(TipoPlano.EXPERIMENTAL);
                    novo.setEmailConfirmado(true);
                    novo.setTokenConfirmacao(null);
                    novo.setStatusAcesso(StatusAcesso.ATIVO);
                    novo.setLoginGoogle(true);

                    LocalDateTime agora = LocalDateTime.now();
                    novo.setDataCriacao(agora);
                    novo.setDataPrimeiroLogin(agora);

                    return usuarioRepository.save(novo);
                });
    }
}
