package br.com.gestpro.auth.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import br.com.gestpro.infra.jwt.JwtService;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final VerificarPlanoOperation verificarPlano;

    @Transactional
    public Usuario loginOrRegister(String email, String nome, String foto) {
        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    // 1. Atualiza dados básicos do perfil vindo do Google
                    u.setNome(nome);
                    u.setFoto(foto);

                    // 2. Garante confirmação de e-mail (Google é provedor confiável)
                    if (!u.isEmailConfirmado()) {
                        u.setEmailConfirmado(true);
                        u.setTokenConfirmacao(null);
                    }

                    // 3. Marca como login Google caso tenha sido criado manualmente antes
                    if (!u.isLoginGoogle()) {
                        u.setLoginGoogle(true);
                    }

                    // 4. Delega a verificação do plano para o Operation especialista
                    // Usamos try-catch para que a expiração do plano NÃO impeça o login,
                    // mas o status 'INATIVO' seja persistido no banco.
                    try {
                        verificarPlano.validarAcesso(u);
                    } catch (Exception e) {
                        // O status já foi alterado para INATIVO dentro do validarAcessoTemporario
                        // Deixamos o fluxo seguir para o usuário conseguir ver o Dashboard/Planos
                    }

                    return usuarioRepository.save(u);
                })
                .orElseGet(() -> {
                    // Novo Usuário via Google
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
                    novo.setDataPrimeiroLogin(agora); // Início da contagem dos 7 dias

                    return usuarioRepository.save(novo);
                });
    }

    public String gerarToken(Usuario usuario) {
        return jwtService.gerarToken(usuario);
    }
}