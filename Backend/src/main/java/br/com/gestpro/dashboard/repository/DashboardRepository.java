package br.com.gestpro.dashboard.repository;

import br.com.gestpro.venda.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<Venda, Long> {

    // ── Contadores por empresa ─────────────────────────────────────────────
    @Query(value =
            "SELECT " +
                    " CAST((SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "       WHERE v.empresa_id = :empresaId AND DATE(v.data_venda) = CURDATE()) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM produto p " +
                    "       WHERE p.empresa_id = :empresaId AND p.quantidade_estoque > 0) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM produto p2 " +
                    "       WHERE p2.empresa_id = :empresaId AND p2.quantidade_estoque = 0) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM clientes c " +
                    "       WHERE c.empresa_id = :empresaId AND c.ativo = 1) AS CHAR)",
            nativeQuery = true)
    List<Object[]> findDashboardCountsRaw(@Param("empresaId") Long empresaId);

    // ── Vendas da semana por empresa ───────────────────────────────────────
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "WHERE v.empresa_id = :empresaId " +
                    "AND v.data_venda >= :inicio AND v.data_venda <= :fim",
            nativeQuery = true)
    Object contarVendasSemana(
            @Param("empresaId") Long empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Vendas do mês por empresa ──────────────────────────────────────────
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "WHERE v.empresa_id = :empresaId " +
                    "AND YEAR(v.data_venda) = YEAR(NOW()) " +
                    "AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object somaVendasMes(@Param("empresaId") Long empresaId);

    // ── Lucro do dia por empresa ───────────────────────────────────────────
    @Query(value =
            "SELECT COALESCE(SUM(" +
                    "  (iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)) " +
                    "  * (v.valor_final / NULLIF(v.total, 0))" +   // ← fator de desconto proporcional
                    "), 0) " +
                    "FROM item_venda iv " +
                    "JOIN venda v   ON v.id = iv.venda_id " +
                    "JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId " +
                    "AND v.cancelada = 0 " +                        // ← também ignorava canceladas
                    "AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object lucroDia(@Param("empresaId") Long empresaId);

    // ── Lucro do mês ───────────────────────────────────────────────────────────
    @Query(value =
            "SELECT COALESCE(SUM(" +
                    "  (iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)) " +
                    "  * (v.valor_final / NULLIF(v.total, 0))" +
                    "), 0) " +
                    "FROM item_venda iv " +
                    "JOIN venda v   ON v.id = iv.venda_id " +
                    "JOIN produto p ON p.id = iv.produto_id " +
                    "WHERE v.empresa_id = :empresaId " +
                    "AND v.cancelada = 0 " +
                    "AND YEAR(v.data_venda) = YEAR(NOW()) " +
                    "AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object lucroMes(@Param("empresaId") Long empresaId);


    // Custo imobilizado (só quem tem estoque)
    @Query("SELECT COALESCE(SUM(p.precoCusto * p.quantidadeEstoque), 0) " +
            "FROM Produto p WHERE p.empresa.id = :empresaId " +
            "AND p.precoCusto IS NOT NULL AND p.quantidadeEstoque > 0")
    BigDecimal custoTotalEstoque(@Param("empresaId") Long empresaId);

    // Total já cadastrado com custo (incluindo zerados)
    @Query("SELECT COALESCE(SUM(p.precoCusto * p.quantidadeEstoque), 0) " +
            "FROM Produto p WHERE p.empresa.id = :empresaId " +
            "AND p.precoCusto IS NOT NULL")
    BigDecimal totalInvestidoCadastrado(@Param("empresaId") Long empresaId);
}