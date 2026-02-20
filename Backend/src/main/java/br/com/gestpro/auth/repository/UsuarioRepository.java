package br.com.gestpro.auth.repository;

import br.com.gestpro.auth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {


    Optional<Usuario> findByEmail(String email);


    Optional<Usuario> findByTokenConfirmacao(String token);


    // ou ainda mais eficiente:
    @Modifying
    @Transactional
    @Query("DELETE FROM Usuario u WHERE u.emailConfirmado = false AND u.senha IS NOT NULL AND u.dataCriacao < :limite")
    void deleteUsuariosNaoConfirmadosAntesDe(@Param("limite") LocalDateTime limite);

}
