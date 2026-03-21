package br.com.gestpro.cliente.repository;

import br.com.gestpro.cliente.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByEmail(String email);

    List<Cliente> findByAtivoTrue();

    // Clientes ativos de um usuário específico
    List<Cliente> findByUsuarioEmailAndAtivoTrue(String email);

    // Clientes de uma empresa específica
    List<Cliente> findByEmpresaIdAndAtivoTrue(Long empresaId);
}