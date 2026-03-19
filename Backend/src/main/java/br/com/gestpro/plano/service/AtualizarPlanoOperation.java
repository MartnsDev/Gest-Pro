package br.com.gestpro.plano.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
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
    public Usuario atualizarPlano(String email, TipoPlano novoTipo, int duracaoDias) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/pagamento"));

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime dataBase = (usuario.getDataAssinaturaPlus() == null || usuario.getDataAssinaturaPlus().isBefore(agora))
                ? agora : usuario.getDataAssinaturaPlus();

        usuario.setDataAssinaturaPlus(dataBase.plusDays(duracaoDias));
        usuario.setTipoPlano(novoTipo); // Agora seta BASICO, PRO ou PREMIUM
        usuario.setStatusAcesso(StatusAcesso.ATIVO);

        return usuarioRepository.save(usuario);
    }
}
