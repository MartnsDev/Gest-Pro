package br.com.gestpro.empresa.repository;

import br.com.gestpro.empresa.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    // Busca todas as empresas que pertencem a um determinado usuário
    List<Empresa> findByDonoId(Long usuarioId);

    @Query("SELECT COUNT(e) FROM Empresa e WHERE e.dono.id = :donoId")
    Object countByDonoId(@Param("donoId") Long donoId);

    @Query("SELECT e FROM Empresa e JOIN FETCH e.dono WHERE e.id = :id")
    Optional<Empresa> findByIdWithDono(@Param("id") Long id);
}