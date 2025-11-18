package br.com.gestpro.gestpro_backend.domain.service.authService;


import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

    @Component
    public class ConfirmarEmailOperation {

        private final UsuarioRepository usuarioRepository;

        public ConfirmarEmailOperation(UsuarioRepository usuarioRepository) {
            this.usuarioRepository = usuarioRepository;
        }

        @Transactional
        public boolean execute(String token) {
            Optional<Usuario> optional = usuarioRepository.findByTokenConfirmacao(token);
            if (optional.isEmpty()) return false;

            Usuario usuario = optional.get();
            usuario.setEmailConfirmado(true);
            usuario.setTokenConfirmacao(null);

            usuarioRepository.save(usuario);
            return true;
        }
    }


