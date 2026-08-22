package br.com.gestpro.auth.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.infra.jwt.JwtService;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.plano.service.VerificarPlanoOperation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginGoogleOperationTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private VerificarPlanoOperation verificarPlano;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private LoginGoogleOperation operation;

    @Test
    void vinculaContaExistenteSomenteDepoisDaValidacaoOAuth() {
        Usuario usuario = usuarioExistente();
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);

        Usuario resultado = operation.execute(usuario.getEmail(), "Nome Google", "foto-google");

        assertThat(resultado.isLoginGoogle()).isTrue();
        assertThat(resultado.isEmailConfirmado()).isTrue();
        assertThat(resultado.getNome()).isEqualTo("Nome Google");
        verify(verificarPlano).validarAcessoIsolado(usuario);
    }

    @Test
    void permiteLoginQuandoPlanoEstaInativo() {
        Usuario usuario = usuarioExistente();
        usuario.setStatusAcesso(StatusAcesso.INATIVO);
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);
        doThrow(new ApiException("Plano inativo", HttpStatus.FORBIDDEN, "/pagamento"))
                .when(verificarPlano).validarAcessoIsolado(usuario);

        Usuario resultado = operation.execute(usuario.getEmail(), usuario.getNome(), null);

        assertThat(resultado).isSameAs(usuario);
        assertThat(resultado.getStatusAcesso()).isEqualTo(StatusAcesso.INATIVO);
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void criaContaGoogleCompletaSemValidarPlanoAntesDaPersistencia() {
        when(usuarioRepository.findByEmail("nova@exemplo.com")).thenReturn(Optional.empty());
        when(usuarioRepository.save(org.mockito.ArgumentMatchers.any(Usuario.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Usuario resultado = operation.execute("nova@exemplo.com", "Nova", null);

        assertThat(resultado.isLoginGoogle()).isTrue();
        assertThat(resultado.isEmailConfirmado()).isTrue();
        assertThat(resultado.getTipoPlano()).isEqualTo(TipoPlano.EXPERIMENTAL);
        assertThat(resultado.getStatusAcesso()).isEqualTo(StatusAcesso.ATIVO);
        verify(verificarPlano, never()).validarAcessoIsolado(resultado);
    }

    private Usuario usuarioExistente() {
        Usuario usuario = new Usuario();
        usuario.setId(10L);
        usuario.setEmail("conta@exemplo.com");
        usuario.setNome("Conta");
        usuario.setTipoPlano(TipoPlano.PREMIUM);
        usuario.setStatusAcesso(StatusAcesso.ATIVO);
        return usuario;
    }
}
