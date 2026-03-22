package br.com.gestpro.analytics.repository;

import br.com.gestpro.analytics.model.Relatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Apenas queries nativas analíticas — não extende JpaRepository<Venda>
 * para evitar conflito com DashboardRepository e GraficoRepository.
 * A busca de Venda com itens é feita via VendaRepository existente.
 */
@Repository
public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {

    // ── Resumo geral do período ───────────────────────────────────────────
    // Retorna List para garantir que o Hibernate não colapse em Object simples
    @Query(value = """
        SELECT
          CAST(COUNT(*) AS CHAR) as total_vendas,
          CAST(COALESCE(SUM(valor_final), 0) AS CHAR) as receita_total,
          CAST(COALESCE(SUM(desconto), 0) AS CHAR) as total_descontos,
          CAST(COALESCE(AVG(valor_final), 0) AS CHAR) as ticket_medio,
          CAST(COALESCE(MAX(valor_final), 0) AS CHAR) as maior_venda,
          CAST(COALESCE(MIN(valor_final), 0) AS CHAR) as menor_venda
        FROM venda
        WHERE empresa_id = :empresaId
          AND data_venda BETWEEN :inicio AND :fim
          AND (cancelada = 0 OR cancelada IS NULL)
        """, nativeQuery = true)
    List<Object[]> resumoGeral(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Cancelamentos ─────────────────────────────────────────────────────
    @Query(value = """
        SELECT CAST(COUNT(*) AS CHAR) as qtd,
               CAST(COALESCE(SUM(valor_final), 0) AS CHAR) as total
        FROM venda
        WHERE empresa_id = :empresaId
          AND data_venda BETWEEN :inicio AND :fim
          AND cancelada = 1
        """, nativeQuery = true)
    List<Object[]> resumoCancelamentos(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Lucro total ───────────────────────────────────────────────────────
    @Query(value = """
        SELECT CAST(COALESCE(SUM(iv.subtotal - COALESCE(p.preco_custo,0) * iv.quantidade), 0) AS CHAR)
        FROM item_venda iv
        JOIN venda v ON v.id = iv.venda_id
        JOIN produto p ON p.id = iv.produto_id
        WHERE v.empresa_id = :empresaId
          AND v.data_venda BETWEEN :inicio AND :fim
          AND (v.cancelada = 0 OR v.cancelada IS NULL)
        """, nativeQuery = true)
    List<Object> lucroTotal(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Vendas diárias ────────────────────────────────────────────────────
    @Query(value = """
        SELECT DATE(data_venda) as dia,
               COUNT(*) as qtd_vendas,
               COALESCE(SUM(valor_final), 0) as total,
               COALESCE(SUM(desconto), 0) as total_desconto
        FROM venda
        WHERE empresa_id = :empresaId
          AND data_venda BETWEEN :inicio AND :fim
          AND (cancelada = 0 OR cancelada IS NULL)
        GROUP BY DATE(data_venda)
        ORDER BY dia
        """, nativeQuery = true)
    List<Object[]> vendasDiarias(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Totais por forma de pagamento ─────────────────────────────────────
    @Query(value = """
        SELECT forma_pagamento, COUNT(*) as qtd, COALESCE(SUM(valor_final), 0) as total
        FROM venda
        WHERE empresa_id = :empresaId
          AND data_venda BETWEEN :inicio AND :fim
          AND (cancelada = 0 OR cancelada IS NULL)
        GROUP BY forma_pagamento
        ORDER BY total DESC
        """, nativeQuery = true)
    List<Object[]> totaisPorFormaPagamento(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Top produtos ──────────────────────────────────────────────────────
    @Query(value = """
        SELECT p.nome,
               SUM(iv.quantidade) as qtd,
               SUM(iv.subtotal) as receita,
               SUM(iv.subtotal - COALESCE(p.preco_custo,0) * iv.quantidade) as lucro
        FROM item_venda iv
        JOIN venda v ON v.id = iv.venda_id
        JOIN produto p ON p.id = iv.produto_id
        WHERE v.empresa_id = :empresaId
          AND v.data_venda BETWEEN :inicio AND :fim
          AND (v.cancelada = 0 OR v.cancelada IS NULL)
        GROUP BY p.nome
        ORDER BY qtd DESC
        LIMIT 20
        """, nativeQuery = true)
    List<Object[]> topProdutos(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Vendas por hora ───────────────────────────────────────────────────
    @Query(value = """
        SELECT HOUR(data_venda) as hora,
               COUNT(*) as qtd,
               COALESCE(SUM(valor_final), 0) as total
        FROM venda
        WHERE empresa_id = :empresaId
          AND data_venda BETWEEN :inicio AND :fim
          AND (cancelada = 0 OR cancelada IS NULL)
        GROUP BY hora
        ORDER BY hora
        """, nativeQuery = true)
    List<Object[]> vendasPorHora(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Lista de vendas (dados básicos via nativa — sem lazy) ─────────────
    @Query(value = """
        SELECT
          v.id, v.data_venda, v.forma_pagamento, v.forma_pagamento2,
          v.valor_final, v.desconto, v.troco, v.observacao,
          c.nome as nome_cliente
        FROM venda v
        LEFT JOIN clientes c ON c.id = v.cliente_id
        WHERE v.empresa_id = :empresaId
          AND v.data_venda BETWEEN :inicio AND :fim
          AND (v.cancelada = 0 OR v.cancelada IS NULL)
        ORDER BY v.data_venda DESC
        """, nativeQuery = true)
    List<Object[]> listarVendasRaw(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Itens de uma venda ────────────────────────────────────────────────
    @Query(value = """
        SELECT p.nome, iv.quantidade, iv.subtotal
        FROM item_venda iv
        JOIN produto p ON p.id = iv.produto_id
        WHERE iv.venda_id = :vendaId
        """, nativeQuery = true)
    List<Object[]> itensDaVenda(@Param("vendaId") Long vendaId);

    // ── Itens de múltiplas vendas (para exportar em batch) ────────────────
    @Query(value = """
        SELECT iv.venda_id, p.nome, iv.quantidade, iv.subtotal
        FROM item_venda iv
        JOIN produto p ON p.id = iv.produto_id
        JOIN venda v ON v.id = iv.venda_id
        WHERE v.empresa_id = :empresaId
          AND v.data_venda BETWEEN :inicio AND :fim
          AND (v.cancelada = 0 OR v.cancelada IS NULL)
        ORDER BY iv.venda_id
        """, nativeQuery = true)
    List<Object[]> itensPorPeriodo(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}