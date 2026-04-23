package br.com.gestpro.auth.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.infra.jwt.JwtService;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LoginGoogleOperation {

    private final UsuarioRepository usuarioRepository;
    private final VerificarPlanoOperation verificarPlano;
    private final JwtService jwtService;

    public LoginGoogleOperation(UsuarioRepository usuarioRepository,
                                VerificarPlanoOperation verificarPlano, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.verificarPlano = verificarPlano;
        this.jwtService = jwtService;
    }

    @Transactional(noRollbackFor = {ApiException.class})
    public Usuario execute(String email, String nome, String foto) {

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
                        verificarPlano.validarAcesso(u);

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

    public String gerarToken(Usuario usuario) {
        return jwtService.gerarToken(usuario);
    }
}