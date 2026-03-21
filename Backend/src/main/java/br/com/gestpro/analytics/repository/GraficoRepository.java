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

    // ── Formas de pagamento por empresa ────────────────────────────────────
    @Query("""
        SELECT v.formaPagamento, COUNT(v)
        FROM Venda v
        WHERE v.empresa.id = :empresaId
        GROUP BY v.formaPagamento
        """)
    List<Object[]> countVendasPorFormaPagamentoRaw(@Param("empresaId") Long empresaId);

    // ── Top 5 produtos por empresa ─────────────────────────────────────────
    @Query("""
        SELECT new br.com.gestpro.dashboard.dto.ProdutoVendasDTO(
            p.nome, SUM(iv.quantidade)
        )
        FROM ItemVenda iv
        JOIN iv.produto p
        JOIN iv.venda v
        WHERE v.empresa.id = :empresaId
        GROUP BY p.nome
        ORDER BY SUM(iv.quantidade) DESC
        """)
    List<ProdutoVendasDTO> countVendasPorProdutoDTO(@Param("empresaId") Long empresaId);

    // ── Vendas diárias por empresa ─────────────────────────────────────────
    @Query(value = """
        SELECT
            DAYOFWEEK(v.data_venda) AS dia_numero,
            DAYNAME(v.data_venda)   AS dia_nome,
            COALESCE(SUM(v.valor_final), 0) AS total
        FROM venda v
        WHERE v.data_venda BETWEEN :inicio AND :fim
          AND v.empresa_id = :empresaId
        GROUP BY dia_numero, dia_nome
        ORDER BY dia_numero
        """, nativeQuery = true)
    List<Object[]> countVendasDiariasRawPorEmpresa(
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim,
            @Param("empresaId") Long empresaId
    );
}