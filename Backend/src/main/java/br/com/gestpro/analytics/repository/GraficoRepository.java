package br.com.gestpro.analytics.repository;

import br.com.gestpro.dashboard.dto.ProdutoVendasDTO;
import br.com.gestpro.venda.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GraficoRepository extends JpaRepository<Venda, Long> {

    /**
     * Busca raw para métodos de pagamento.
     * O Hibernate mapeia o Enum automaticamente aqui.
     */
    @Query("""
            SELECT v.formaPagamento, COUNT(v)
            FROM Venda v
            WHERE v.usuario.email = :email
            GROUP BY v.formaPagamento
            """)
    List<Object[]> countVendasPorFormaPagamentoRaw(@Param("email") String email);

    /**
     * Busca Top 5 produtos mais vendidos.
     * Adicionei um LIMIT implícito via Query para não sobrecarregar o gráfico.
     */
    @Query("""
        SELECT new br.com.gestpro.dashboard.dto.ProdutoVendasDTO(
            p.nome, SUM(iv.quantidade)
        )
        FROM ItemVenda iv
        JOIN iv.produto p
        JOIN iv.venda v
        WHERE v.usuario.email = :email
        GROUP BY p.nome
        ORDER BY SUM(iv.quantidade) DESC
        """)
    List<ProdutoVendasDTO> countVendasPorProdutoDTO(@Param("email") String email);

    /**
     * Query Nativa para Vendas Diárias.
     * IMPORTANTE: O mapeamento no Service deve ler:
     * o[0] -> dia_numero (Integer)
     * o[1] -> dia_nome (String)
     * o[2] -> total (Double/BigDecimal)
     */
    @Query(value = """
            SELECT 
                DAYOFWEEK(v.data_venda) AS dia_numero,
                DAYNAME(v.data_venda) AS dia_nome,
                COALESCE(SUM(v.valor_final), 0) AS total
            FROM venda v
            WHERE v.data_venda BETWEEN :inicio AND :fim
              AND v.usuario_id = :usuarioId
            GROUP BY dia_numero, dia_nome
            ORDER BY dia_numero
            """, nativeQuery = true)
    List<Object[]> countVendasDiariasRawPorUsuario(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim,
            @Param("usuarioId") Long usuarioId
    );
}