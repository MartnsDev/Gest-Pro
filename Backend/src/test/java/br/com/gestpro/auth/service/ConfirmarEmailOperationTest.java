package br.com.gestpro.auth.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConfirmarEmailOperationTest {
    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ConfirmarEmailOperation operation;

    @Test
    void confirmaTokenValido() {
        Usuario usuario = new Usuario();
        usuario.setTokenConfirmacao("token-valido");
        usuario.setDataEnvioConfirmacao(LocalDateTime.now().minusHours(1));
        when(usuarioRepository.findByTokenConfirmacao("token-valido"))
                .thenReturn(Optional.of(usuario));

        assertTrue(operation.execute("token-valido"));
        assertTrue(usuario.isEmailConfirmado());
        assertNull(usuario.getTokenConfirmacao());
        assertNull(usuario.getDataEnvioConfirmacao());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void rejeitaEInvalidaTokenExpirado() {
        Usuario usuario = new Usuario();
        usuario.setTokenConfirmacao("token-expirado");
        usuario.setDataEnvioConfirmacao(LocalDateTime.now().minusHours(25));
        when(usuarioRepository.findByTokenConfirmacao("token-expirado"))
                .thenReturn(Optional.of(usuario));

        assertFalse(operation.execute("token-expirado"));
        assertFalse(usuario.isEmailConfirmado());
        assertNull(usuario.getTokenConfirmacao());
        verify(usuarioRepository).save(usuario);
    }

    @Test
    void rejeitaTokenDesconhecido() {
        when(usuarioRepository.findByTokenConfirmacao("inexistente"))
                .thenReturn(Optional.empty());

        assertFalse(operation.execute("inexistente"));
    }
}
