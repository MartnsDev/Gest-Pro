package br.com.gestpro.auth.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public Usuario execute(String email, String nome, String foto, HttpServletResponse response) {

        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    // Atualiza dados vindos do Google
                    u.setNome(nome);
                    u.setFoto(foto);

                    // E-mail confiável via Google — confirma automaticamente
                    if (!u.isEmailConfirmado()) {
                        u.setEmailConfirmado(true);
                        u.setTokenConfirmacao(null);
                    }

                    // Marca como login Google se veio de cadastro manual
                    if (!u.isLoginGoogle()) {
                        u.setLoginGoogle(true);
                    }

                    // Verifica expiração do plano — atualiza status sem bloquear o login
                    try {
                        verificarPlano.validarAcesso(u);
                    } catch (Exception ignored) {
                        // Status já foi atualizado para INATIVO dentro de validarAcesso.
                        // O usuário consegue logar e é redirecionado para /pagamento.
                    }

                    return usuarioRepository.save(u);
                })
                .orElseGet(() -> {
                    // Novo usuário via Google — inicia período Experimental de 7 dias
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
                    novo.setDataPrimeiroLogin(agora); // relógio dos 7 dias começa aqui

                    return usuarioRepository.save(novo);
                });
    }
}