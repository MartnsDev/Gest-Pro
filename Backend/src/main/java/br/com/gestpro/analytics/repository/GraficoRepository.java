package br.com.gestpro.analytics.repository;

import br.com.gestpro.dashboard.dto.ProdutoVendasDTO;
import br.com.gestpro.venda.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Todos os gráficos combinam PDV (venda, cancelada=0) + Pedidos (pedido, status <> 'CANCELADO').
 */
@Repository
public interface GraficoRepository extends JpaRepository<Venda, Long> {

    // ── Formas de pagamento por empresa (PDV + Pedidos) ────────────────────
    @Query(value = """
        SELECT forma, SUM(qtd) AS total
        FROM (
            SELECT v.forma_pagamento AS forma, COUNT(*) AS qtd
            FROM venda v
            WHERE v.empresa_id = :empresaId
              AND v.cancelada = 0
            GROUP BY v.forma_pagamento

            UNION ALL

            SELECT p.forma_pagamento AS forma, COUNT(*) AS qtd
            FROM pedido p
            WHERE p.empresa_id = :empresaId
              AND p.status <> 'CANCELADO'
            GROUP BY p.forma_pagamento
        ) combinado
        GROUP BY forma
        ORDER BY total DESC
        """, nativeQuery = true)
    List<Object[]> countVendasPorFormaPagamentoRaw(@Param("empresaId") Long empresaId);

    // ── Top 5 produtos por empresa (PDV + Pedidos) ─────────────────────────
    @Query(value = """
        SELECT nome, SUM(quantidade) AS quantidade
        FROM (
            SELECT prod.nome AS nome, iv.quantidade AS quantidade
            FROM item_venda iv
            JOIN produto prod ON prod.id = iv.produto_id
            JOIN venda v      ON v.id    = iv.venda_id
            WHERE v.empresa_id = :empresaId
              AND v.cancelada = 0

            UNION ALL

            SELECT prod.nome AS nome, ip.quantidade AS quantidade
            FROM item_pedido ip
            JOIN produto prod ON prod.id  = ip.produto_id
            JOIN pedido ped   ON ped.id   = ip.pedido_id
            WHERE ped.empresa_id = :empresaId
              AND ped.status <> 'CANCELADO'
        ) combinado
        GROUP BY nome
        ORDER BY quantidade DESC
        LIMIT 5
        """, nativeQuery = true)
    List<ProdutoVendasDTO> countVendasPorProdutoRaw(@Param("empresaId") Long empresaId);

    // ── Vendas diárias por empresa (PDV + Pedidos) ─────────────────────────
    @Query(value = """
        SELECT
            DAYOFWEEK(dt)   AS dia_numero,
            DAYNAME(dt)     AS dia_nome,
            COALESCE(SUM(vf), 0) AS total
        FROM (
            SELECT v.data_venda  AS dt, v.valor_final AS vf
            FROM venda v
            WHERE v.data_venda BETWEEN :inicio AND :fim
              AND v.empresa_id = :empresaId
              AND v.cancelada = 0

            UNION ALL

            SELECT p.data_pedido AS dt, p.valor_final AS vf
            FROM pedido p
            WHERE p.data_pedido BETWEEN :inicio AND :fim
              AND p.empresa_id = :empresaId
              AND p.status <> 'CANCELADO'
        ) combinado
        GROUP BY dia_numero, dia_nome
        ORDER BY dia_numero
        """, nativeQuery = true)
    List<Object[]> countVendasDiariasRawPorEmpresa(
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim,
            @Param("empresaId") Long empresaId
    );
}