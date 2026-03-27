package br.com.gestpro.cliente.repository;

import br.com.gestpro.cliente.model.Divida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface DividaRepository extends JpaRepository<Divida, Long> {
    List<Divida> findByClienteIdOrderByStatusAscCriadoEmDesc(Long clienteId);
    List<Divida> findByEmpresaIdAndStatus(Long empresaId, Divida.StatusDivida status);

    @Query("SELECT COALESCE(SUM(d.valor - d.valorPago), 0) FROM Divida d " +
            "WHERE d.cliente.id = :clienteId AND d.status <> 'QUITADA'")
    BigDecimal totalDevidoByCliente(@Param("clienteId") Long clienteId);
}