package br.com.gestpro.gestpro_backend.domain.repository.modules;

import br.com.gestpro.gestpro_backend.domain.model.modules.cliente.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByEmail(String email);

    List<Cliente> findByAtivoTrue();

    // Contagem de clientes ativos de um usuário específico
    Long countByAtivoTrueAndUsuario_Email(String email);

}