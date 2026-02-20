package br.com.gestpro.cliente.repository;

import br.com.gestpro.cliente.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByEmail(String email);

    List<Cliente> findByAtivoTrue();

    // Contagem de clientes ativos de um usuário específico
    Long countByAtivoTrueAndUsuario_Email(String email);

}