package br.com.gestpro.gestpro_backend.domain.repository.modules;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusCaixa;
import br.com.gestpro.gestpro_backend.domain.model.modules.caixa.Caixa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {


    /**
     * Busca o caixa de um usuário específico conforme o status (ex: ABERTO, FECHADO)
     */
    Optional<Caixa> findByUsuarioIdAndStatus(Long idUsuario, StatusCaixa status);

    boolean existsByUsuarioAndStatus(Usuario usuario, StatusCaixa status);

}
