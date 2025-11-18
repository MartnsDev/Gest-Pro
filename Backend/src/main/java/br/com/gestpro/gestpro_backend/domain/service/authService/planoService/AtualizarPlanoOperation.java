package br.com.gestpro.gestpro_backend.domain.service.authService.planoService;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusAcesso;
import br.com.gestpro.gestpro_backend.domain.model.enums.TipoPlano;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AtualizarPlanoOperation {

    private final UsuarioRepository usuarioRepository;

    public AtualizarPlanoOperation(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Atualiza o plano do usuário adicionando a duração correta conforme tipo de plano
     *
     * @param email       Email do usuário
     * @param duracaoDias Quantidade de dias do plano (ex: 30, 90, 365)
     * @return Usuario atualizado
     */
    @Transactional
    public Usuario atualizarPlano(String email, int duracaoDias) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/pagamento"));

        LocalDateTime agora = LocalDateTime.now();

        // Calcula a data atual do fim do plano
        LocalDateTime dataAtualExpiracao = usuario.getDataAssinaturaPlus();
        if (dataAtualExpiracao == null || dataAtualExpiracao.isBefore(agora)) {
            dataAtualExpiracao = agora;
        }

        // Soma os dias restantes aos dias do novo plano
        usuario.setDataAssinaturaPlus(dataAtualExpiracao.plusDays(duracaoDias));
        usuario.setTipoPlano(TipoPlano.ASSINANTE);
        usuario.setStatusAcesso(StatusAcesso.ATIVO);

        return usuarioRepository.save(usuario);
    }
}
