package br.com.gestpro.empresa.repository;

import br.com.gestpro.empresa.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    // Busca todas as empresas que pertencem a um determinado usuário
    List<Empresa> findByDonoId(Long usuarioId);

    long countByDonoId(Long id);
}