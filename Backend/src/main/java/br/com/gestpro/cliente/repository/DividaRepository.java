package br.com.gestpro.cliente.repository;

import br.com.gestpro.cliente.model.Divida;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DividaRepository extends JpaRepository<Divida, Long> {
    List<Divida> findByClienteIdOrderByStatusAscCriadoEmDesc(Long clienteId);

}