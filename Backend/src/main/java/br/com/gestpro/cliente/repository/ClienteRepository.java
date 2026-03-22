package br.com.gestpro.cliente.repository;

import br.com.gestpro.cliente.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByEmail(String email);
    boolean existsByEmailAndEmpresaId(String email, Long empresaId);

    List<Cliente> findByAtivoTrue();
    List<Cliente> findByUsuarioEmailAndAtivoTrue(String email);
    List<Cliente> findByEmpresaIdAndAtivoTrue(Long empresaId);
    List<Cliente> findByEmpresaIdAndAtivoTrueAndTipo(Long empresaId, String tipo);
}