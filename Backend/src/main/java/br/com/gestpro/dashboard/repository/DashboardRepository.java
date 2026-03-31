package br.com.gestpro.dashboard.repository;

import br.com.gestpro.venda.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Dashboard Repository — consultas nativas que combinam:
 *   - Vendas PDV  (tabela `venda`,   filtro cancelada = 0)
 *   - Pedidos     (tabela `pedido`,  filtro status <> 'CANCELADO')
 *
 * Todos os KPIs de faturamento/contagem são UNIFICADOS por padrão.
 */
@Repository
public interface DashboardRepository extends JpaRepository<Venda, Long> {

    // ══════════════════════════════════════════════════════════════════════
    //  CONTADORES GERAIS
    // ══════════════════════════════════════════════════════════════════════

    @Query(value =
            "SELECT " +
                    " COALESCE(SUM(v.valor_final), 0), " +
                    " (SELECT COUNT(*) FROM produto p WHERE p.empresa_id = :empresaId AND p.quantidade_estoque > 0), " +
                    " (SELECT COUNT(*) FROM produto p2 WHERE p2.empresa_id = :empresaId AND p2.quantidade_estoque = 0), " +
                    " (SELECT COUNT(*) FROM clientes c WHERE c.empresa_id = :empresaId AND c.ativo = 1) " +
                    "FROM venda v WHERE v.empresa_id = :empresaId AND DATE(v.data_venda) = CURDATE() AND v.cancelada = 0",
            nativeQuery = true)
    List<Object[]> findDashboardCountsRaw(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  FATURAMENTO UNIFICADO (PDV + Pedidos)
    // ══════════════════════════════════════════════════════════════════════

    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) + COALESCE((SELECT SUM(p.valor_final) FROM pedido p " +
                    "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND DATE(p.data_pedido) = CURDATE()), 0) " +
                    "FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object faturamentoDia(@Param("empresaId") Long empresaId);

    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) + COALESCE((SELECT SUM(p.valor_final) FROM pedido p " +
                    "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND p.data_pedido >= :inicio AND p.data_pedido <= :fim), 0) " +
                    "FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND v.data_venda >= :inicio AND v.data_venda <= :fim",
            nativeQuery = true)
    Object faturamentoSemana(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) + COALESCE((SELECT SUM(p.valor_final) FROM pedido p " +
                    "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "AND YEAR(p.data_pedido) = YEAR(NOW()) AND MONTH(p.data_pedido) = MONTH(NOW())), 0) " +
                    "FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "AND YEAR(v.data_venda) = YEAR(NOW()) AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object faturamentoMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  CONTAGEM DE TRANSAÇÕES UNIFICADA
    // ══════════════════════════════════════════════════════════════════════

    @Query(value =
            "SELECT COALESCE((SELECT COUNT(*) FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "AND DATE(v.data_venda) = CURDATE()), 0) + " +
                    "COALESCE((SELECT COUNT(*) FROM pedido p WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "AND DATE(p.data_pedido) = CURDATE()), 0)",
            nativeQuery = true)
    Long totalTransacoesDia(@Param("empresaId") Long empresaId);

    @Query(value =
            "SELECT CASE WHEN (COALESCE((SELECT COUNT(*) FROM venda v WHERE v.empresa_id = :empresaId " +
                    "AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()), 0) + " +
                    "COALESCE((SELECT COUNT(*) FROM pedido p WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "AND DATE(p.data_pedido) = CURDATE()), 0)) = 0 THEN 0 ELSE " +
                    "(COALESCE(SUM(v.valor_final), 0) + COALESCE((SELECT SUM(p.valor_final) FROM pedido p " +
                    "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND DATE(p.data_pedido) = CURDATE()), 0)) / " +
                    "(COALESCE((SELECT COUNT(*) FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "AND DATE(v.data_venda) = CURDATE()), 0) + " +
                    "COALESCE((SELECT COUNT(*) FROM pedido p WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "AND DATE(p.data_pedido) = CURDATE()), 0)) END " +
                    "FROM venda v WHERE v.empresa_id = :empresaId",
            nativeQuery = true)
    Object ticketMedioDia(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  SEPARADOS (PDV apenas)
    // ══════════════════════════════════════════════════════════════════════

    @Query(value = "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
            "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND v.data_venda >= :inicio AND v.data_venda <= :fim",
            nativeQuery = true)
    Object contarVendasSemana(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query(value = "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
            "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
            "AND YEAR(v.data_venda) = YEAR(NOW()) AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object somaVendasMes(@Param("empresaId") Long empresaId);

    @Query(value = "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
            "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object somaVendasDia(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  SEPARADOS (Pedidos apenas)
    // ══════════════════════════════════════════════════════════════════════

    @Query(value = "SELECT COALESCE(SUM(p.valor_final), 0) FROM pedido p " +
            "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND DATE(p.data_pedido) = CURDATE()",
            nativeQuery = true)
    Object somaPedidosDia(@Param("empresaId") Long empresaId);

    @Query(value = "SELECT COALESCE(SUM(p.valor_final), 0) FROM pedido p " +
            "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
            "AND YEAR(p.data_pedido) = YEAR(NOW()) AND MONTH(p.data_pedido) = MONTH(NOW())",
            nativeQuery = true)
    Object somaPedidosMes(@Param("empresaId") Long empresaId);

    @Query(value = "SELECT COALESCE(SUM(p.valor_final), 0) FROM pedido p " +
            "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND p.data_pedido >= :inicio AND p.data_pedido <= :fim",
            nativeQuery = true)
    Object somaPedidosSemana(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    // ══════════════════════════════════════════════════════════════════════
    //  LUCRO (apenas PDV)
    // ══════════════════════════════════════════════════════════════════════

    @Query(value =
            "SELECT COALESCE(SUM((iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)) * (v.valor_final / NULLIF(v.total, 0))), 0) " +
                    "FROM item_venda iv JOIN venda v ON v.id = iv.venda_id JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object lucroDia(@Param("empresaId") Long empresaId);

    @Query(value =
            "SELECT COALESCE(SUM((iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)) * (v.valor_final / NULLIF(v.total, 0))), 0) " +
                    "FROM item_venda iv JOIN venda v ON v.id = iv.venda_id JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "AND YEAR(v.data_venda) = YEAR(NOW()) AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object lucroMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  ESTOQUE
    // ══════════════════════════════════════════════════════════════════════

    @Query("SELECT COALESCE(SUM(p.precoCusto * p.quantidadeEstoque), 0) " +
            "FROM Produto p WHERE p.empresa.id = :empresaId AND p.precoCusto IS NOT NULL AND p.quantidadeEstoque > 0")
    BigDecimal custoTotalEstoque(@Param("empresaId") Long empresaId);

    @Query("SELECT COALESCE(SUM(p.precoCusto), 0) FROM Produto p " +
            "WHERE p.empresa.id = :empresaId AND p.precoCusto IS NOT NULL")
    BigDecimal totalInvestidoCadastrado(@Param("empresaId") Long empresaId);
}