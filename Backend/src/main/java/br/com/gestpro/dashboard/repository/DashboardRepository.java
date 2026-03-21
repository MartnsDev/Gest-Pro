package br.com.gestpro.dashboard.repository;

import br.com.gestpro.venda.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DashboardRepository extends JpaRepository<Venda, Long> {

    // ── Contadores principais ──────────────────────────────────────────────
    // Usa DATE(data_venda) = CURDATE() direto — banco configurado em America/Sao_Paulo
    @Query(value =
            "SELECT " +
                    // vendas hoje — valor_final
                    " CAST((SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "       JOIN usuarios u1 ON u1.id = v.usuario_id " +
                    "       WHERE u1.email = :email " +
                    "       AND DATE(v.data_venda) = CURDATE()) AS CHAR), " +
                    // produtos com estoque
                    " CAST((SELECT COUNT(*) FROM produto p " +
                    "       JOIN usuarios u2 ON u2.id = p.usuario_id " +
                    "       WHERE u2.email = :email AND p.quantidade_estoque > 0) AS CHAR), " +
                    // produtos sem estoque
                    " CAST((SELECT COUNT(*) FROM produto p2 " +
                    "       JOIN usuarios u3 ON u3.id = p2.usuario_id " +
                    "       WHERE u3.email = :email AND p2.quantidade_estoque = 0) AS CHAR), " +
                    // clientes ativos
                    " CAST((SELECT COUNT(*) FROM clientes c " +
                    "       JOIN usuarios u4 ON u4.id = c.usuario_id " +
                    "       WHERE u4.email = :email AND c.ativo = 1) AS CHAR)",
            nativeQuery = true)
    List<Object[]> findDashboardCountsRaw(@Param("email") String email);

    // ── Vendas da semana (Segunda a Domingo corrente) ──────────────────────
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "JOIN usuarios u ON u.id = v.usuario_id " +
                    "WHERE u.email = :email " +
                    "AND v.data_venda >= :inicio AND v.data_venda <= :fim",
            nativeQuery = true)
    Object contarVendasSemana(
            @Param("email") String email,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    // ── Vendas do mês corrente ─────────────────────────────────────────────
    @Query(value =
            "SELECT COALESCE(SUM(v.valor_final), 0) FROM venda v " +
                    "JOIN usuarios u ON u.id = v.usuario_id " +
                    "WHERE u.email = :email " +
                    "AND YEAR(v.data_venda) = YEAR(NOW()) " +
                    "AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object somaVendasMes(@Param("email") String email);

    // ── Lucro do dia ───────────────────────────────────────────────────────
    // lucro = subtotal do item - (preco_custo do produto * quantidade)
    // Se preco_custo for NULL, assume 0 (produto sem custo cadastrado)
    @Query(value =
            "SELECT COALESCE(SUM(" +
                    "  iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)" +
                    "), 0) " +
                    "FROM item_venda iv " +
                    "JOIN venda v   ON v.id  = iv.venda_id " +
                    "JOIN produto p ON p.id  = iv.produto_id " +
                    "JOIN usuarios u ON u.id = v.usuario_id " +
                    "WHERE u.email = :email " +
                    "AND DATE(v.data_venda) = CURDATE()",
            nativeQuery = true)
    Object lucroDia(@Param("email") String email);

    // ── Lucro do mês ──────────────────────────────────────────────────────
    @Query(value =
            "SELECT COALESCE(SUM(" +
                    "  iv.subtotal - (COALESCE(p.preco_custo, 0) * iv.quantidade)" +
                    "), 0) " +
                    "FROM item_venda iv " +
                    "JOIN venda v   ON v.id  = iv.venda_id " +
                    "JOIN produto p ON p.id  = iv.produto_id " +
                    "JOIN usuarios u ON u.id = v.usuario_id " +
                    "WHERE u.email = :email " +
                    "AND YEAR(v.data_venda) = YEAR(NOW()) " +
                    "AND MONTH(v.data_venda) = MONTH(NOW())",
            nativeQuery = true)
    Object lucroMes(@Param("email") String email);
}