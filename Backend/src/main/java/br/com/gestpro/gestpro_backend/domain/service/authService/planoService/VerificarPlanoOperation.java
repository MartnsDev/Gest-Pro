package br.com.gestpro.gestpro_backend.domain.service.authService.planoService;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusAcesso;
import br.com.gestpro.gestpro_backend.domain.model.enums.TipoPlano;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

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

    public void execute(Usuario usuario, HttpServletResponse response) throws IOException {
        LocalDateTime agora = LocalDateTime.now();
        boolean precisaSalvar = false;

        // ---------------------- Plano Experimental ----------------------
        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {
            if (usuario.getDataPrimeiroLogin() == null) {
                usuario.setDataPrimeiroLogin(agora);
                precisaSalvar = true;
            } else {
                LocalDateTime expiraExperimental = usuario.getDataPrimeiroLogin().plusDays(7);
                if (agora.isAfter(expiraExperimental)) {
                    usuario.setStatusAcesso(StatusAcesso.INATIVO);
                    salvarEExpirar(usuario, response);
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
                LocalDateTime expiraAssinatura = usuario.getDataAssinaturaPlus().plusDays(30);
                if (agora.isAfter(expiraAssinatura)) {
                    usuario.setStatusAcesso(StatusAcesso.INATIVO);
                    salvarEExpirar(usuario, response);
                    return;
                }
            }
        }

        if (precisaSalvar) {
            usuarioRepository.save(usuario);
        }

        if (usuario.getStatusAcesso() == StatusAcesso.INATIVO) {
            salvarEExpirar(usuario, response);
        }
    }

    private void salvarEExpirar(Usuario usuario, HttpServletResponse response) throws IOException {
        usuarioRepository.save(usuario);
        response.sendRedirect("http://localhost:3000/pagamento");
    }

    public long calcularDiasRestantes(Usuario usuario) {
        LocalDate hoje = LocalDate.now();
        LocalDate dataExpiracao;

        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {
            dataExpiracao = usuario.getDataPrimeiroLogin().toLocalDate().plusDays(7);
        } else if (usuario.getTipoPlano() == TipoPlano.ASSINANTE) {
            dataExpiracao = usuario.getDataAssinaturaPlus().toLocalDate().plusDays(30);
        } else {
            return 0;
        }

        long diasRestantes = ChronoUnit.DAYS.between(hoje, dataExpiracao);
        return Math.max(diasRestantes, 0);
    }
}
