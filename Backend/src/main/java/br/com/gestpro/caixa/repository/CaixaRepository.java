package br.com.gestpro.caixa.repository;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.caixa.StatusCaixa;
import br.com.gestpro.caixa.model.Caixa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {

    /**
     * Busca o caixa de um usuário específico conforme o status (ex: ABERTO, FECHADO)
     */
    Optional<Caixa> findByUsuarioIdAndStatus(Long idUsuario, StatusCaixa status);

    boolean existsByUsuarioAndStatus(Usuario usuario, StatusCaixa status);

    Optional<Caixa> findTopByOrderByDataAberturaDesc();
}
