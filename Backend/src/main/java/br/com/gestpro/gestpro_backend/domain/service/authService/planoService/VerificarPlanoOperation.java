package br.com.gestpro.gestpro_backend.domain.service.authService.planoService;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusAcesso;
import br.com.gestpro.gestpro_backend.domain.model.enums.TipoPlano;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class VerificarPlanoOperation {

    private final UsuarioRepository usuarioRepository;

    public VerificarPlanoOperation(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void execute(Usuario usuario) {

        LocalDateTime agora = LocalDateTime.now();
        boolean precisaSalvar = false;

        // ---------------------- Plano Experimental ----------------------
        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {

            if (usuario.getDataPrimeiroLogin() == null) {
                usuario.setDataPrimeiroLogin(agora);
                precisaSalvar = true;
            } else {
                LocalDateTime expiraExperimental =
                        usuario.getDataPrimeiroLogin().plusDays(7);

                if (agora.isAfter(expiraExperimental)) {
                    usuario.setStatusAcesso(StatusAcesso.INATIVO);
                    salvarEExpirar(usuario);
                    return;
                }
            }
        }

        // ---------------------- Plano Assinante ----------------------
        if (usuario.getTipoPlano() == TipoPlano.ASSINANTE) {

            if (usuario.getDataAssinaturaPlus() == null) {
                usuario.setDataAssinaturaPlus(agora);
                precisaSalvar = true;
            } else {
                LocalDateTime expiraAssinatura =
                        usuario.getDataAssinaturaPlus().plusDays(30);

                if (agora.isAfter(expiraAssinatura)) {
                    usuario.setStatusAcesso(StatusAcesso.INATIVO);
                    salvarEExpirar(usuario);
                    return;
                }
            }
        }

        if (precisaSalvar) {
            usuarioRepository.save(usuario);
        }

        if (usuario.getStatusAcesso() == StatusAcesso.INATIVO) {
            salvarEExpirar(usuario);
        }
    }

    private void salvarEExpirar(Usuario usuario) {
        usuarioRepository.save(usuario);
        throw new ApiException(
                "PLANO_EXPIRADO",
                HttpStatus.FORBIDDEN,
                "/auth/login"
        );
    }

    public long calcularDiasRestantes(Usuario usuario) {

        LocalDate hoje = LocalDate.now();
        LocalDate dataExpiracao;

        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {
            dataExpiracao =
                    usuario.getDataPrimeiroLogin().toLocalDate().plusDays(7);

        } else if (usuario.getTipoPlano() == TipoPlano.ASSINANTE) {
            dataExpiracao =
                    usuario.getDataAssinaturaPlus().toLocalDate().plusDays(30);

        } else {
            return 0;
        }

        long diasRestantes =
                ChronoUnit.DAYS.between(hoje, dataExpiracao);

        return Math.max(diasRestantes, 0);
    }
}
