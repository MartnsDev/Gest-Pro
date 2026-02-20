package br.com.gestpro.dashboard.repository;

import br.com.gestpro.venda.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface DashboardRepository extends JpaRepository<Venda, Long> {

    @Query(value =
            "SELECT COALESCE(COUNT(v.id), 0) " +
                    "FROM venda v " +
                    "JOIN usuarios u ON u.id = v.usuario_id " +
                    "WHERE u.email = :email " +
                    "AND DATE(v.data_venda) = CURRENT_DATE",
            nativeQuery = true)
    Long contarVendasHoje(@Param("email") String email);


    @Query(value = "SELECT COUNT(p.id) " +
            "FROM produto p " +
            "JOIN usuarios u ON u.id = p.usuario_id " +
            "WHERE u.email = :email AND p.quantidade_estoque > 0", nativeQuery = true)
    Long contarProdutosEmEstoque(@Param("email") String email);

    @Query(value = "SELECT COUNT(p.id) " +
            "FROM produto p " +
            "JOIN usuarios u ON u.id = p.usuario_id " +
            "WHERE u.email = :email AND p.quantidade_estoque = 0", nativeQuery = true)
    Long contarProdutosZerados(@Param("email") String email);

    @Query(value = "SELECT COUNT(c.id) " +
            "FROM clientes c " +
            "JOIN usuarios u ON u.id = c.usuario_id " +
            "WHERE u.email = :email AND c.ativo = 1", nativeQuery = true)
    Long contarClientesAtivos(@Param("email") String email);

    @Query(value = "SELECT COUNT(v.id) " +
            "FROM venda v " +
            "LEFT JOIN usuarios u ON u.id = v.usuario_id " +
            "WHERE v.data_venda BETWEEN :inicio AND :fim AND u.email = :email", nativeQuery = true)
    Long contarVendasSemana(@Param("email") String email,
                            @Param("inicio") LocalDateTime inicio,
                            @Param("fim") LocalDateTime fim);

    /**
     * Query agregada que retorna a projection DashboardCountsProjection.
     */
    @Query(value =
            "SELECT " +
                    "  COALESCE((SELECT COUNT(v.id) FROM venda v JOIN usuarios u1 ON u1.id = v.usuario_id " +
                    "            WHERE u1.email = :email AND DATE(v.data_venda) = CURRENT_DATE), 0) AS vendasHoje, " +
                    "  COALESCE((SELECT COUNT(p.id) FROM produto p JOIN usuarios u2 ON u2.id = p.usuario_id " +
                    "            WHERE u2.email = :email AND p.quantidade_estoque > 0), 0) AS produtosComEstoque, " +
                    "  COALESCE((SELECT COUNT(p2.id) FROM produto p2 JOIN usuarios u3 ON u3.id = p2.usuario_id " +
                    "            WHERE u3.email = :email AND p2.quantidade_estoque = 0), 0) AS produtosSemEstoque, " +
                    "  COALESCE((SELECT COUNT(c.id) FROM clientes c JOIN usuarios u4 ON u4.id = c.usuario_id " +
                    "            WHERE u4.email = :email AND c.ativo = 1), 0) AS clientesAtivos",
            nativeQuery = true)
    DashboardCountsProjection findDashboardCountsByEmail(@Param("email") String email);

}
