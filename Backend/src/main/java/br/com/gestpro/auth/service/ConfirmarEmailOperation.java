package br.com.gestpro.auth.service;


import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
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


