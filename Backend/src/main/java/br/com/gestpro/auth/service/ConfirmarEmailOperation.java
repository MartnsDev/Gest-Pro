package br.com.gestpro.auth.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
            if (usuario.getDataEnvioConfirmacao() == null
                    || usuario.getDataEnvioConfirmacao().isBefore(LocalDateTime.now().minusHours(24))) {
                usuario.setTokenConfirmacao(null);
                usuarioRepository.save(usuario);
                return false;
            }

            usuario.setEmailConfirmado(true);
            usuario.setTokenConfirmacao(null);
            usuario.setDataEnvioConfirmacao(null);

            usuarioRepository.save(usuario);
            return true;
        }
    }

