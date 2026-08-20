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

    long countByDonoId(Long donoId);

    @Query("SELECT e FROM Empresa e JOIN FETCH e.dono WHERE e.id = :id")
    Optional<Empresa> findByIdWithDono(@Param("id") Long id);

    long countByDonoIdAndAtivoTrue(Long donoId);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END FROM empresas e WHERE REPLACE(REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', ''), ' ', '') = :documento", nativeQuery = true)
    boolean existsByCnpj(@Param("documento") String documento);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN TRUE ELSE FALSE END FROM empresas e WHERE e.id <> :id AND REPLACE(REPLACE(REPLACE(REPLACE(e.cnpj, '.', ''), '/', ''), '-', ''), ' ', '') = :documento", nativeQuery = true)
    boolean existsByCnpjAndIdNot(@Param("documento") String documento, @Param("id") Long id);
}
