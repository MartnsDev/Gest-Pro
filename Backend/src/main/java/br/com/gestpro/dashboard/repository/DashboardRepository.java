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
 * Todas as queries de faturamento somam PDV (tabela venda, cancelada=0)
 * + Pedidos (tabela pedido, status <> 'CANCELADO').
 * Lucro continua sendo apenas PDV (pedidos não possuem preco_custo por item).
 */
@Repository
public interface DashboardRepository extends JpaRepository<Venda, Long> {

    // ══════════════════════════════════════════════════════════════════════
    //  CONTADORES DO DIA — vendasHoje = PDV + Pedidos
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT " +
                    // col 0 – faturamento do dia (PDV + Pedidos)
                    " CAST((" +
                    "   COALESCE((SELECT SUM(v.valor_final) FROM venda v " +
                    "             WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "             AND DATE(v.data_venda) = CURDATE()), 0) " +
                    " + COALESCE((SELECT SUM(ped.valor_final) FROM pedido ped " +
                    "             WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "             AND DATE(ped.data_pedido) = CURDATE()), 0) " +
                    " ) AS CHAR), " +
                    // col 1 – produtos com estoque
                    " CAST((SELECT COUNT(*) FROM produto p " +
                    "       WHERE p.empresa_id = :empresaId AND p.quantidade_estoque > 0) AS CHAR), " +
                    // col 2 – produtos sem estoque
                    " CAST((SELECT COUNT(*) FROM produto p2 " +
                    "       WHERE p2.empresa_id = :empresaId AND p2.quantidade_estoque = 0) AS CHAR), " +
                    // col 3 – clientes ativos
                    " CAST((SELECT COUNT(*) FROM clientes c " +
                    "       WHERE c.empresa_id = :empresaId AND c.ativo = 1) AS CHAR)",
            nativeQuery = true)
    List<Object[]> findDashboardCountsRaw(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  FATURAMENTO SEMANAL — PDV + Pedidos
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT SUM(v.valor_final) FROM venda v " +
                    "            WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "            AND v.data_venda >= :inicio AND v.data_venda <= :fim), 0) " +
                    "+ COALESCE((SELECT SUM(ped.valor_final) FROM pedido ped " +
                    "            WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "            AND ped.data_pedido >= :inicio AND ped.data_pedido <= :fim), 0)",
            nativeQuery = true)
    Object contarVendasSemana(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    // ══════════════════════════════════════════════════════════════════════
    //  FATURAMENTO MENSAL — PDV + Pedidos
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT SUM(v.valor_final) FROM venda v " +
                    "            WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "            AND YEAR(v.data_venda) = YEAR(NOW()) " +
                    "            AND MONTH(v.data_venda) = MONTH(NOW())), 0) " +
                    "+ COALESCE((SELECT SUM(ped.valor_final) FROM pedido ped " +
                    "            WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "            AND YEAR(ped.data_pedido) = YEAR(NOW()) " +
                    "            AND MONTH(ped.data_pedido) = MONTH(NOW())), 0)",
            nativeQuery = true)
    Object somaVendasMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  LUCRO DO DIA — só PDV (pedidos não têm preco_custo por item)
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT COALESCE(SUM(" +
                    "  (iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade))" +
                    "  * (v.valor_final / NULLIF(v.total, 0))" +
                    "), 0) " +
                    "FROM item_venda iv " +
                    "JOIN venda v   ON v.id = iv.venda_id " +
                    "JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId " +
                    "  AND v.cancelada = 0 " +
                    "  AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object lucroDia(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  LUCRO DO MÊS — só PDV
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT COALESCE(SUM(" +
                    "  (iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade))" +
                    "  * (v.valor_final / NULLIF(v.total, 0))" +
                    "), 0) " +
                    "FROM item_venda iv " +
                    "JOIN venda v   ON v.id = iv.venda_id " +
                    "JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId " +
                    "  AND v.cancelada = 0 " +
                    "  AND YEAR(v.data_venda)  = YEAR(NOW()) " +
                    "  AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object lucroMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  VENDAS DIÁRIAS COMBINADAS — PDV + Pedidos (para o gráfico de barras)
    //  Retorna [dayofweek(int), date_str(String), total(double)]
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT dia, DATE_FORMAT(data_dia, '%Y-%m-%d') AS data_str, SUM(total) AS total_dia " +
                    "FROM (" +
                    "  SELECT DAYOFWEEK(v.data_venda)  AS dia, DATE(v.data_venda)  AS data_dia, v.valor_final  AS total " +
                    "  FROM venda v " +
                    "  WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "    AND v.data_venda >= :inicio AND v.data_venda <= :fim " +
                    "  UNION ALL " +
                    "  SELECT DAYOFWEEK(ped.data_pedido) AS dia, DATE(ped.data_pedido) AS data_dia, ped.valor_final AS total " +
                    "  FROM pedido ped " +
                    "  WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "    AND ped.data_pedido >= :inicio AND ped.data_pedido <= :fim " +
                    ") combinado " +
                    "GROUP BY dia, data_dia " +
                    "ORDER BY dia",
            nativeQuery = true)
    List<Object[]> vendasDiariasCombinadasRaw(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    // ══════════════════════════════════════════════════════════════════════
    //  ORIGEM SEPARADA — para relatório / gráfico de pizza PDV vs Pedidos
    // ══════════════════════════════════════════════════════════════════════

    /** Faturamento PDV do dia */
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object somaPdvDia(@Param("empresaId") Long empresaId);

    /** Faturamento Pedidos do dia */
    @Query(value =
            "SELECT COALESCE(SUM(ped.valor_final), 0) FROM pedido ped " +
                    "WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' AND DATE(ped.data_pedido) = CURDATE()",
            nativeQuery = true)
    Object somaPedidosDia(@Param("empresaId") Long empresaId);

    /** Faturamento PDV do mês */
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "  AND YEAR(v.data_venda) = YEAR(NOW()) AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object somaPdvMes(@Param("empresaId") Long empresaId);

    /** Faturamento Pedidos do mês */
    @Query(value =
            "SELECT COALESCE(SUM(ped.valor_final), 0) FROM pedido ped " +
                    "WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "  AND YEAR(ped.data_pedido) = YEAR(NOW()) AND MONTH(ped.data_pedido) = MONTH(NOW())",
            nativeQuery = true)
    Object somaPedidosMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  ESTOQUE
    // ══════════════════════════════════════════════════════════════════════

    @Query("SELECT COALESCE(SUM(p.precoCusto * p.quantidadeEstoque), 0) " +
            "FROM Produto p WHERE p.empresa.id = :empresaId " +
            "AND p.precoCusto IS NOT NULL AND p.quantidadeEstoque > 0")
    BigDecimal custoTotalEstoque(@Param("empresaId") Long empresaId);

    @Query("SELECT COALESCE(SUM(p.precoCusto), 0) " +
            "FROM Produto p WHERE p.empresa.id = :empresaId " +
            "AND p.precoCusto IS NOT NULL")
    BigDecimal totalInvestidoCadastrado(@Param("empresaId") Long empresaId);
}