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
 * Queries de faturamento somam PDV (venda, cancelada=0) + Pedidos (pedido, status <> 'CANCELADO').
 * Lucro PDV = calculado via preco_custo dos itens.
 * Lucro Pedidos = estimado como (valor_final - custo_frete), pois pedidos não têm
 *   item com preco_custo. Quando preco_custo médio dos produtos vendidos estiver
 *   disponível via JOIN com item_pedido, usa-se o mesmo cálculo do PDV.
 */
@Repository
public interface DashboardRepository extends JpaRepository<Venda, Long> {

    // ══════════════════════════════════════════════════════════════════════
    //  CONTADORES DO DIA — vendasHoje = PDV + Pedidos
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT " +
                    " CAST((" +
                    "   COALESCE((SELECT SUM(v.valor_final) FROM venda v " +
                    "             WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "             AND DATE(v.data_venda) = CURDATE()), 0) " +
                    " + COALESCE((SELECT SUM(ped.valor_final) FROM pedido ped " +
                    "             WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "             AND DATE(ped.data_pedido) = CURDATE()), 0) " +
                    " ) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM produto p " +
                    "       WHERE p.empresa_id = :empresaId AND p.quantidade_estoque > 0) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM produto p2 " +
                    "       WHERE p2.empresa_id = :empresaId AND p2.quantidade_estoque = 0) AS CHAR), " +
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
    //  LUCRO DO DIA — PDV + estimativa de Pedidos
    //  Pedidos: usa preco_custo dos produtos vendidos via item_pedido JOIN produto
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            // Lucro PDV do dia
            "SELECT COALESCE((" +
                    "  SELECT SUM(" +
                    "    (iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade))" +
                    "    * (v.valor_final / NULLIF(v.total, 0))" +
                    "  ) FROM item_venda iv " +
                    "  JOIN venda v   ON v.id = iv.venda_id " +
                    "  JOIN produto p ON p.id = iv.produto_id " +
                    "  WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "    AND DATE(v.data_venda) = CURDATE()" +
                    "), 0) " +
                    // + Lucro Pedidos do dia (receita - custo dos itens via item_pedido JOIN produto)
                    "+ COALESCE((" +
                    "  SELECT SUM(" +
                    "    ip.subtotal - (COALESCE(prod.preco_custo, 0) * ip.quantidade)" +
                    "  ) FROM item_pedido ip " +
                    "  JOIN pedido ped  ON ped.id = ip.pedido_id " +
                    "  JOIN produto prod ON prod.id = ip.produto_id " +
                    "  WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "    AND DATE(ped.data_pedido) = CURDATE()" +
                    "), 0)",
            nativeQuery = true)
    Object lucroDia(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  LUCRO DO MÊS — PDV + Pedidos
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT COALESCE((" +
                    "  SELECT SUM(" +
                    "    (iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade))" +
                    "    * (v.valor_final / NULLIF(v.total, 0))" +
                    "  ) FROM item_venda iv " +
                    "  JOIN venda v   ON v.id = iv.venda_id " +
                    "  JOIN produto p ON p.id = iv.produto_id " +
                    "  WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "    AND YEAR(v.data_venda) = YEAR(NOW()) " +
                    "    AND MONTH(v.data_venda) = MONTH(NOW())" +
                    "), 0) " +
                    "+ COALESCE((" +
                    "  SELECT SUM(" +
                    "    ip.subtotal - (COALESCE(prod.preco_custo, 0) * ip.quantidade)" +
                    "  ) FROM item_pedido ip " +
                    "  JOIN pedido ped   ON ped.id = ip.pedido_id " +
                    "  JOIN produto prod ON prod.id = ip.produto_id " +
                    "  WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "    AND YEAR(ped.data_pedido) = YEAR(NOW()) " +
                    "    AND MONTH(ped.data_pedido) = MONTH(NOW())" +
                    "), 0)",
            nativeQuery = true)
    Object lucroMes(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  LUCRO POR PERÍODO — PDV + Pedidos (usado pelo RelatorioService)
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT COALESCE((" +
                    "  SELECT SUM(" +
                    "    (iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade))" +
                    "    * (v.valor_final / NULLIF(v.total, 0))" +
                    "  ) FROM item_venda iv " +
                    "  JOIN venda v   ON v.id = iv.venda_id " +
                    "  JOIN produto p ON p.id = iv.produto_id " +
                    "  WHERE v.empresa_id = :empresaId AND v.cancelada = 0 " +
                    "    AND v.data_venda >= :inicio AND v.data_venda <= :fim" +
                    "), 0) " +
                    "+ COALESCE((" +
                    "  SELECT SUM(" +
                    "    ip.subtotal - (COALESCE(prod.preco_custo, 0) * ip.quantidade)" +
                    "  ) FROM item_pedido ip " +
                    "  JOIN pedido ped   ON ped.id = ip.pedido_id " +
                    "  JOIN produto prod ON prod.id = ip.produto_id " +
                    "  WHERE ped.empresa_id = :empresaId AND ped.status <> 'CANCELADO' " +
                    "    AND ped.data_pedido >= :inicio AND ped.data_pedido <= :fim" +
                    "), 0)",
            nativeQuery = true)
    Object lucroPorPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    // ══════════════════════════════════════════════════════════════════════
    //  VENDAS DIÁRIAS COMBINADAS — PDV + Pedidos (gráfico de barras)
    // ══════════════════════════════════════════════════════════════════════
    @Query(value =
            "SELECT dia, DATE_FORMAT(data_dia, '%Y-%m-%d') AS data_str, SUM(total) AS total_dia " +
                    "FROM (" +
                    "  SELECT DAYOFWEEK(v.data_venda) AS dia, DATE(v.data_venda) AS data_dia, v.valor_final AS total " +
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
    //  ORIGEM SEPARADA — para gráfico de pizza PDV vs Pedidos
    // ══════════════════════════════════════════════════════════════════════
    @Query(value = "SELECT COALESCE(SUM(v.valor_final),0) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND DATE(v.data_venda)=CURDATE()", nativeQuery = true)
    Object somaPdvDia(@Param("empresaId") Long empresaId);

    @Query(value = "SELECT COALESCE(SUM(ped.valor_final),0) FROM pedido ped WHERE ped.empresa_id=:empresaId AND ped.status<>'CANCELADO' AND DATE(ped.data_pedido)=CURDATE()", nativeQuery = true)
    Object somaPedidosDia(@Param("empresaId") Long empresaId);

    @Query(value = "SELECT COALESCE(SUM(v.valor_final),0) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND YEAR(v.data_venda)=YEAR(NOW()) AND MONTH(v.data_venda)=MONTH(NOW())", nativeQuery = true)
    Object somaPdvMes(@Param("empresaId") Long empresaId);

    @Query(value = "SELECT COALESCE(SUM(ped.valor_final),0) FROM pedido ped WHERE ped.empresa_id=:empresaId AND ped.status<>'CANCELADO' AND YEAR(ped.data_pedido)=YEAR(NOW()) AND MONTH(ped.data_pedido)=MONTH(NOW())", nativeQuery = true)
    Object somaPedidosMes(@Param("empresaId") Long empresaId);

    /** Faturamento só PDV em um período (para campo receitaPdv do relatório) */
    @Query(value = "SELECT COALESCE(SUM(v.valor_final),0) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim", nativeQuery = true)
    Object somaPdvPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /** Faturamento só Pedidos em um período (para campo receitaPedidos do relatório) */
    @Query(value = "SELECT COALESCE(SUM(p.valor_final),0) FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim", nativeQuery = true)
    Object somaPedidosPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    // ══════════════════════════════════════════════════════════════════════
    //  ESTOQUE
    // ══════════════════════════════════════════════════════════════════════
    @Query("SELECT COALESCE(SUM(p.precoCusto * p.quantidadeEstoque), 0) FROM Produto p WHERE p.empresa.id = :empresaId AND p.precoCusto IS NOT NULL AND p.quantidadeEstoque > 0")
    BigDecimal custoTotalEstoque(@Param("empresaId") Long empresaId);

    @Query("SELECT COALESCE(SUM(p.precoCusto), 0) FROM Produto p WHERE p.empresa.id = :empresaId AND p.precoCusto IS NOT NULL")
    BigDecimal totalInvestidoCadastrado(@Param("empresaId") Long empresaId);

    // ══════════════════════════════════════════════════════════════════════
    //  QUERIES PARA RELATÓRIOS — período customizável
    // ══════════════════════════════════════════════════════════════════════

    /** Faturamento PDV + Pedidos em um período */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT SUM(v.valor_final) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim),0)" +
                    "+ COALESCE((SELECT SUM(p.valor_final) FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim),0)",
            nativeQuery = true)
    Object faturamentoPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Total de transações (vendas PDV + pedidos) em um período */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT COUNT(*) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim),0)" +
                    "+ COALESCE((SELECT COUNT(*) FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim),0)",
            nativeQuery = true)
    Object totalTransacoesPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Desconto total em um período (PDV + Pedidos) */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT SUM(v.desconto) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim),0)" +
                    "+ COALESCE((SELECT SUM(p.desconto) FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim),0)",
            nativeQuery = true)
    Object descontoTotalPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Cancelamentos PDV no período */
    @Query(value = "SELECT COUNT(*) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=1 AND v.data_venda>=:inicio AND v.data_venda<=:fim", nativeQuery = true)
    Object cancelamentosPdvPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /** Cancelamentos Pedidos no período */
    @Query(value = "SELECT COUNT(*) FROM pedido p WHERE p.empresa_id=:empresaId AND p.status='CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim", nativeQuery = true)
    Object cancelamentosPedidosPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /** Valor cancelado PDV no período */
    @Query(value = "SELECT COALESCE(SUM(v.valor_final),0) FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=1 AND v.data_venda>=:inicio AND v.data_venda<=:fim", nativeQuery = true)
    Object valorCanceladoPdvPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /** Valor cancelado Pedidos no período */
    @Query(value = "SELECT COALESCE(SUM(p.valor_final),0) FROM pedido p WHERE p.empresa_id=:empresaId AND p.status='CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim", nativeQuery = true)
    Object valorCanceladoPedidosPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /** Maior venda no período (PDV + Pedidos) */
    @Query(value =
            "SELECT COALESCE(MAX(t.vf),0) FROM (" +
                    "  SELECT v.valor_final AS vf FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim " +
                    "  UNION ALL " +
                    "  SELECT p.valor_final FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim" +
                    ") t",
            nativeQuery = true)
    Object maiorVendaPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /** Menor venda no período (PDV + Pedidos, excluindo zeros) */
    @Query(value =
            "SELECT COALESCE(MIN(t.vf),0) FROM (" +
                    "  SELECT v.valor_final AS vf FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.valor_final>0 AND v.data_venda>=:inicio AND v.data_venda<=:fim " +
                    "  UNION ALL " +
                    "  SELECT p.valor_final FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.valor_final>0 AND p.data_pedido>=:inicio AND p.data_pedido<=:fim" +
                    ") t",
            nativeQuery = true)
    Object menorVendaPeriodo(@Param("empresaId") Long empresaId, @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    /** Pico de vendas por hora — PDV + Pedidos */
    @Query(value =
            "SELECT HOUR(dt) AS hora, COUNT(*) AS qtd, SUM(vf) AS total FROM (" +
                    "  SELECT v.data_venda AS dt, v.valor_final AS vf FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim " +
                    "  UNION ALL " +
                    "  SELECT p.data_pedido, p.valor_final FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim" +
                    ") comb GROUP BY hora ORDER BY hora",
            nativeQuery = true)
    List<Object[]> vendasPorHoraPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Top produtos (PDV + Pedidos) em um período */
    @Query(value =
            "SELECT nome, SUM(quantidade) AS qtd, SUM(receita) AS receita, SUM(lucro) AS lucro FROM (" +
                    "  SELECT prod.nome AS nome, iv.quantidade AS quantidade, iv.subtotal AS receita," +
                    "    (iv.subtotal - COALESCE(prod.preco_custo,0)*iv.quantidade)*(v.valor_final/NULLIF(v.total,0)) AS lucro " +
                    "  FROM item_venda iv JOIN venda v ON v.id=iv.venda_id JOIN produto prod ON prod.id=iv.produto_id " +
                    "  WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim " +
                    "  UNION ALL " +
                    "  SELECT prod.nome, ip.quantidade, ip.subtotal," +
                    "    (ip.subtotal - COALESCE(prod.preco_custo,0)*ip.quantidade) AS lucro " +
                    "  FROM item_pedido ip JOIN pedido ped ON ped.id=ip.pedido_id JOIN produto prod ON prod.id=ip.produto_id " +
                    "  WHERE ped.empresa_id=:empresaId AND ped.status<>'CANCELADO' AND ped.data_pedido>=:inicio AND ped.data_pedido<=:fim " +
                    ") comb GROUP BY nome ORDER BY qtd DESC LIMIT 20",
            nativeQuery = true)
    List<Object[]> topProdutosPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Pagamentos PDV no período */
    @Query(value =
            "SELECT v.forma_pagamento AS forma, COUNT(*) AS qtd, SUM(v.valor_final) AS total " +
                    "FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim " +
                    "GROUP BY v.forma_pagamento",
            nativeQuery = true)
    List<Object[]> pagamentosPdvPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Pagamentos Pedidos no período */
    @Query(value =
            "SELECT p.forma_pagamento AS forma, COUNT(*) AS qtd, SUM(p.valor_final) AS total " +
                    "FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim " +
                    "GROUP BY p.forma_pagamento",
            nativeQuery = true)
    List<Object[]> pagamentosPedidosPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Vendas diárias PDV + Pedidos em um período (para gráfico) */
    @Query(value =
            "SELECT DATE(dt) AS dia, SUM(vf) AS total FROM (" +
                    "  SELECT v.data_venda AS dt, v.valor_final AS vf FROM venda v WHERE v.empresa_id=:empresaId AND v.cancelada=0 AND v.data_venda>=:inicio AND v.data_venda<=:fim " +
                    "  UNION ALL " +
                    "  SELECT p.data_pedido, p.valor_final FROM pedido p WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' AND p.data_pedido>=:inicio AND p.data_pedido<=:fim" +
                    ") comb GROUP BY dia ORDER BY dia",
            nativeQuery = true)
    List<Object[]> vendasDiariasPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Vendas PDV individuais de um período (para listagem no relatório) */
    @Query(value =
            "SELECT v.id, v.data_venda, v.forma_pagamento, v.forma_pagamento2, " +
                    "v.valor_final, v.desconto, v.troco, v.observacao, " +
                    "COALESCE(cli.nome,'') AS nome_cliente, 'PDV' AS origem " +
                    "FROM venda v LEFT JOIN clientes cli ON cli.id = v.cliente_id " +
                    "WHERE v.empresa_id=:empresaId AND v.cancelada=0 " +
                    "AND v.data_venda>=:inicio AND v.data_venda<=:fim ORDER BY v.data_venda DESC",
            nativeQuery = true)
    List<Object[]> vendasPdvPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Pedidos individuais de um período (para listagem no relatório) */
    @Query(value =
            "SELECT p.id, p.data_pedido, p.forma_pagamento, p.canal_venda, " +
                    "p.valor_final, p.desconto, p.custo_frete, p.observacao, " +
                    "COALESCE(cli.nome,'') AS nome_cliente, 'PEDIDO' AS origem " +
                    "FROM pedido p LEFT JOIN clientes cli ON cli.id = p.cliente_id " +
                    "WHERE p.empresa_id=:empresaId AND p.status<>'CANCELADO' " +
                    "AND p.data_pedido>=:inicio AND p.data_pedido<=:fim ORDER BY p.data_pedido DESC",
            nativeQuery = true)
    List<Object[]> pedidosPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim
    );

    /** Itens de uma venda PDV */
    @Query(value =
            "SELECT prod.nome, iv.quantidade, iv.preco_unitario, iv.subtotal " +
                    "FROM item_venda iv JOIN produto prod ON prod.id=iv.produto_id WHERE iv.venda_id=:vendaId",
            nativeQuery = true)
    List<Object[]> itensPorVendaId(@Param("vendaId") Long vendaId);

    /** Itens de um pedido */
    @Query(value =
            "SELECT prod.nome, ip.quantidade, ip.preco_unitario, ip.subtotal " +
                    "FROM item_pedido ip JOIN produto prod ON prod.id=ip.produto_id WHERE ip.pedido_id=:pedidoId",
            nativeQuery = true)
    List<Object[]> itensPorPedidoId(@Param("pedidoId") Long pedidoId);
}