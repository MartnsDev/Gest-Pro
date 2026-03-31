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
 * Consultas separadas (somente PDV / somente Pedidos) ficam disponíveis
 * para o relatório de origem de vendas.
 */
@Repository
public interface DashboardRepository extends JpaRepository<Venda, Long> {

    // ══════════════════════════════════════════════════════════════════════
    //  CONTADORES GERAIS (inalterados — não dependem de Pedidos)
    // ══════════════════════════════════════════════════════════════════════

    @Query(value =
            "SELECT " +
                    // Faturamento PDV hoje
                    " CAST((SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "       WHERE v.empresa_id = :empresaId AND DATE(v.data_venda) = CURDATE() AND v.cancelada = 0) AS CHAR), " +
                    // Produtos com estoque
                    " CAST((SELECT COUNT(*) FROM produto p " +
                    "       WHERE p.empresa_id = :empresaId AND p.quantidade_estoque > 0) AS CHAR), " +
                    // Produtos zerados
                    " CAST((SELECT COUNT(*) FROM produto p2 " +
                    "       WHERE p2.empresa_id = :empresaId AND p2.quantidade_estoque = 0) AS CHAR), " +
                    // Clientes ativos
                    " CAST((SELECT COUNT(*) FROM clientes c " +
                    "       WHERE c.empresa_id = :empresaId AND c.ativo = 1) AS CHAR)",
            nativeQuery = true)
    List<Object[]> findDashboardCountsRaw(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  FATURAMENTO UNIFICADO (PDV + Pedidos) — NOVOS MÉTODOS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Faturamento total do DIA: PDV (não cancelado) + Pedidos (não cancelado)
     * ─────────────────────────────────────────────────────────────────────
     * Soma o valor_final de vendas PDV do dia com valor_final de pedidos do dia.
     */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT SUM(v.valor_final) FROM venda v " +
                    "            WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "            AND DATE(v.data_venda) = CURDATE()), 0) " +
                    "+ COALESCE((SELECT SUM(p.valor_final) FROM pedido p " +
                    "            WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "            AND DATE(p.data_pedido) = CURDATE()), 0)",
            nativeQuery = true)
    Object faturamentoDia(@Param("empresaId") Long empresaId);

    /**
     * Faturamento total da SEMANA: PDV + Pedidos
     * ─────────────────────────────────────────────────────────────────────
     * Soma o valor_final de vendas PDV da semana com valor_final de pedidos da semana.
     */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT SUM(v.valor_final) FROM venda v " +
                    "            WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "            AND v.data_venda >= :inicio AND v.data_venda <= :fim), 0) " +
                    "+ COALESCE((SELECT SUM(p.valor_final) FROM pedido p " +
                    "            WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "            AND p.data_pedido >= :inicio AND p.data_pedido <= :fim), 0)",
            nativeQuery = true)
    Object faturamentoSemana(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    /**
     * Faturamento total do MÊS: PDV + Pedidos
     * ─────────────────────────────────────────────────────────────────────
     * Soma o valor_final de vendas PDV do mês com valor_final de pedidos do mês.
     */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT SUM(v.valor_final) FROM venda v " +
                    "            WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "            AND YEAR(v.data_venda) = YEAR(NOW()) AND MONTH(v.data_venda) = MONTH(NOW())), 0) " +
                    "+ COALESCE((SELECT SUM(p.valor_final) FROM pedido p " +
                    "            WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "            AND YEAR(p.data_pedido) = YEAR(NOW()) AND MONTH(p.data_pedido) = MONTH(NOW())), 0)",
            nativeQuery = true)
    Object faturamentoMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  CONTAGEM DE TRANSAÇÕES UNIFICADA — NOVOS MÉTODOS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Número total de transações do dia (vendas PDV + pedidos)
     * ─────────────────────────────────────────────────────────────────────
     * Conta o número de registros em venda (não cancelada) + número de
     * registros em pedido (não cancelado) para o dia atual.
     */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT COUNT(*) FROM venda v " +
                    "            WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "            AND DATE(v.data_venda) = CURDATE()), 0) " +
                    "+ COALESCE((SELECT COUNT(*) FROM pedido p " +
                    "            WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "            AND DATE(p.data_pedido) = CURDATE()), 0)",
            nativeQuery = true)
    Object totalTransacoesDia(@Param("empresaId") Long empresaId);

    /**
     * Ticket médio do dia (PDV + Pedidos combinados)
     * ─────────────────────────────────────────────────────────────────────
     * Calcula a média simples: (Faturamento PDV + Faturamento Pedidos) /
     * (Qtd Vendas PDV + Qtd Pedidos) para o dia atual.
     */
    @Query(value =
            "SELECT CASE WHEN (" +
                    "    COALESCE((SELECT COUNT(*) FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()), 0) +" +
                    "    COALESCE((SELECT COUNT(*) FROM pedido p WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND DATE(p.data_pedido) = CURDATE()), 0)" +
                    "  ) = 0 THEN 0 ELSE (" +
                    "    COALESCE((SELECT SUM(v.valor_final) FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()), 0) +" +
                    "    COALESCE((SELECT SUM(p.valor_final) FROM pedido p WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND DATE(p.data_pedido) = CURDATE()), 0)" +
                    "  ) / (" +
                    "    COALESCE((SELECT COUNT(*) FROM venda v WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()), 0) +" +
                    "    COALESCE((SELECT COUNT(*) FROM pedido p WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' AND DATE(p.data_pedido) = CURDATE()), 0)" +
                    "  ) END",
            nativeQuery = true)
    Object ticketMedioDia(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  SEPARADOS (PDV apenas) — para relatório de origem
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Soma de vendas PDV apenas — da SEMANA
     * ─────────────────────────────────────────────────────────────────────
     * Usado para o gráfico de origem (PDV vs Pedidos).
     */
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "AND v.data_venda >= :inicio AND v.data_venda <= :fim",
            nativeQuery = true)
    Object contarVendasSemana(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    /**
     * Soma de vendas PDV apenas — do MÊS
     * ─────────────────────────────────────────────────────────────────────
     * Usado para o gráfico de origem (PDV vs Pedidos).
     */
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "AND YEAR(v.data_venda) = YEAR(NOW()) AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object somaVendasMes(@Param("empresaId") Long empresaId);

    /**
     * Soma de vendas PDV apenas — do DIA
     * ─────────────────────────────────────────────────────────────────────
     * Usado para o gráfico de origem (PDV vs Pedidos).
     */
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object somaVendasDia(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  SEPARADOS (Pedidos apenas) — para relatório de origem
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Soma de pedidos apenas — do DIA
     * ─────────────────────────────────────────────────────────────────────
     * Usado para o gráfico de origem (PDV vs Pedidos).
     */
    @Query(value =
            "SELECT COALESCE(SUM(p.valor_final), 0) FROM pedido p " +
                    "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "AND DATE(p.data_pedido) = CURDATE()",
            nativeQuery = true)
    Object somaPedidosDia(@Param("empresaId") Long empresaId);

    /**
     * Soma de pedidos apenas — do MÊS
     * ─────────────────────────────────────────────────────────────────────
     * Usado para o gráfico de origem (PDV vs Pedidos).
     */
    @Query(value =
            "SELECT COALESCE(SUM(p.valor_final), 0) FROM pedido p " +
                    "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "AND YEAR(p.data_pedido) = YEAR(NOW()) AND MONTH(p.data_pedido) = MONTH(NOW())",
            nativeQuery = true)
    Object somaPedidosMes(@Param("empresaId") Long empresaId);

    /**
     * Soma de pedidos apenas — da SEMANA
     * ─────────────────────────────────────────────────────────────────────
     * Usado para o gráfico de origem (PDV vs Pedidos).
     */
    @Query(value =
            "SELECT COALESCE(SUM(p.valor_final), 0) FROM pedido p " +
                    "WHERE p.empresa_id = :empresaId AND p.status <> 'CANCELADO' " +
                    "AND p.data_pedido >= :inicio AND p.data_pedido <= :fim",
            nativeQuery = true)
    Object somaPedidosSemana(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ══════════════════════════════════════════════════════════════════════
    //  LUCRO (apenas PDV — pedidos não têm custo cadastrado)
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Lucro do DIA (apenas PDV)
     * ─────────────────────────────────────────────────────────────────────
     * Pedidos não têm preço de custo, então o lucro é calculado apenas
     * sobre as vendas PDV. Fórmula: (Subtotal - Custo) * Fator de Desconto
     */
    @Query(value =
            "SELECT COALESCE(SUM((iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)) * (v.valor_final / NULLIF(v.total, 0))), 0) " +
                    "FROM item_venda iv JOIN venda v ON v.id = iv.venda_id JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object lucroDia(@Param("empresaId") Long empresaId);

    /**
     * Lucro do MÊS (apenas PDV)
     * ─────────────────────────────────────────────────────────────────────
     * Pedidos não têm preço de custo, então o lucro é calculado apenas
     * sobre as vendas PDV. Fórmula: (Subtotal - Custo) * Fator de Desconto
     */
    @Query(value =
            "SELECT COALESCE(SUM((iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)) * (v.valor_final / NULLIF(v.total, 0))), 0) " +
                    "FROM item_venda iv JOIN venda v ON v.id = iv.venda_id JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId AND v.cancelada = 0 AND YEAR(v.data_venda) = YEAR(NOW()) AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object lucroMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  ESTOQUE
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Custo total do estoque
     * ─────────────────────────────────────────────────────────────────────
     * Soma do custo cadastrado × quantidade em estoque de cada produto.
     */
    @Query("SELECT COALESCE(SUM(p.precoCusto * p.quantidadeEstoque), 0) FROM Produto p WHERE p.empresa.id = :empresaId AND p.precoCusto IS NOT NULL AND p.quantidadeEstoque > 0")
    BigDecimal custoTotalEstoque(@Param("empresaId") Long empresaId);

    /**
     * Total investido cadastrado
     * ─────────────────────────────────────────────────────────────────────
     * Soma de todos os custos cadastrados (independente de ter estoque).
     */
    @Query("SELECT COALESCE(SUM(p.precoCusto), 0) FROM Produto p WHERE p.empresa.id = :empresaId AND p.precoCusto IS NOT NULL")
    BigDecimal totalInvestidoCadastrado(@Param("empresaId") Long empresaId);
}
