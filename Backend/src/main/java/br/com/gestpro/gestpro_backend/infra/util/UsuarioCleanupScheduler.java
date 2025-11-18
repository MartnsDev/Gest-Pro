package br.com.gestpro.gestpro_backend.infra.util;

import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class UsuarioCleanupScheduler {

    private final UsuarioRepository usuarioRepository;

    @Scheduled(fixedRate = 60 * 60 * 1000) // a cada hora
    public void removerUsuariosNaoConfirmados() {
        try {
            usuarioRepository.deleteUsuariosNaoConfirmadosAntesDe(LocalDateTime.now().minusHours(24));
            log.info("Remoção de usuários não confirmados realizada.");
        } catch (Exception e) {
            log.error("Erro ao remover usuários não confirmados", e);
        }
    }
}
