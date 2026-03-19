package br.com.gestpro.auth.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
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
                    // 1. Atualiza dados básicos vindos do Google
                    u.setNome(nome);
                    u.setFoto(foto);

                    // 2. Garante confirmação de e-mail por ser provedor confiável
                    if (!u.isEmailConfirmado()) {
                        u.setEmailConfirmado(true);
                        u.setTokenConfirmacao(null);
                    }

                    // 3. Marca como login Google se veio de um cadastro manual prévio
                    if (!u.isLoginGoogle()) {
                        u.setLoginGoogle(true);
                    }

                    // 4. Verifica se o período de acesso (Experimental ou Pago) expirou
                    // Usamos try-catch aqui para que a ApiException não impeça o login.
                    // O objetivo é atualizar o status para INATIVO no banco, mas deixar o usuário entrar no Dashboard.
                    try {
                        verificarPlano.validarAcessoTemporario(u);
                    } catch (Exception e) {
                        // Se cair aqui, o status já foi atualizado para INATIVO dentro do validarAcessoTemporario
                        // Deixamos passar para o usuário conseguir logar e ver a página de planos.
                    }

                    return usuarioRepository.save(u);
                })
                .orElseGet(() -> {
                    // 5. Fluxo para Novo Usuário (Primeiro Acesso)
                    Usuario novo = new Usuario();
                    novo.setNome(nome);
                    novo.setEmail(email);
                    novo.setSenha(null);
                    novo.setFoto(foto);
                    novo.setTipoPlano(TipoPlano.EXPERIMENTAL); // Inicia no Experimental (7 dias)
                    novo.setEmailConfirmado(true);
                    novo.setTokenConfirmacao(null);
                    novo.setStatusAcesso(StatusAcesso.ATIVO);
                    novo.setLoginGoogle(true);

                    LocalDateTime agora = LocalDateTime.now();
                    novo.setDataCriacao(agora);
                    novo.setDataPrimeiroLogin(agora); // O relógio dos 7 dias começa aqui

                    return usuarioRepository.save(novo);
                });
    }
}