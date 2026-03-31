package br.com.gestpro.pedidos.Repository;

import br.com.gestpro.pedidos.dto.StatusPedido;
import br.com.gestpro.pedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    /** Lista todos os pedidos de uma empresa, do mais recente ao mais antigo */
    List<Pedido> findByEmpresaIdOrderByDataPedidoDesc(Long empresaId);

    /** Lista por empresa e status */
    List<Pedido> findByEmpresaIdAndStatusOrderByDataPedidoDesc(Long empresaId, StatusPedido status);

    /** Soma do valorFinal de pedidos não cancelados por empresa e período */
    @Query("""
            SELECT COALESCE(SUM(p.valorFinal), 0)
            FROM Pedido p
            WHERE p.empresa.id = :empresaId
              AND p.status <> 'CANCELADO'
              AND p.dataPedido BETWEEN :inicio AND :fim
            """)
    BigDecimal somarPorEmpresaEPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);

    /** Contagem por status para o painel */
    long countByEmpresaIdAndStatus(Long empresaId, StatusPedido status);
}