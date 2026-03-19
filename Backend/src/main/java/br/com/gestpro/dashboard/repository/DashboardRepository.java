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

    /**
     * Retorna uma linha com 4 contadores como Object[].
     * Usamos CAST para String para evitar o problema de Integer vs Long do MySQL/Hibernate.
     * O retorno é List<Object[]> — contrato correto para queries nativas com múltiplas colunas.
     */
    @Query(value =
            "SELECT " +
                    " CAST((SELECT COUNT(*) FROM venda v JOIN usuarios u1 ON u1.id = v.usuario_id WHERE u1.email = :email AND DATE(v.data_venda) = CURRENT_DATE) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM produto p JOIN usuarios u2 ON u2.id = p.usuario_id WHERE u2.email = :email AND p.quantidade_estoque > 0) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM produto p2 JOIN usuarios u3 ON u3.id = p2.usuario_id WHERE u3.email = :email AND p2.quantidade_estoque = 0) AS CHAR), " +
                    " CAST((SELECT COUNT(*) FROM clientes c JOIN usuarios u4 ON u4.id = c.usuario_id WHERE u4.email = :email AND c.ativo = 1) AS CHAR)",
            nativeQuery = true)
    List<Object[]> findDashboardCountsRaw(@Param("email") String email);

    @Query(value = "SELECT COUNT(v.id) FROM venda v " +
            "JOIN usuarios u ON u.id = v.usuario_id " +
            "WHERE v.data_venda BETWEEN :inicio AND :fim AND u.email = :email",
            nativeQuery = true)
    Object contarVendasSemana(@Param("email") String email,
                              @Param("inicio") LocalDateTime inicio,
                              @Param("fim") LocalDateTime fim);
}