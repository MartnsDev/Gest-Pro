package br.com.gestpro.gestpro_backend.domain.repository.modules;

import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GraficoRepository extends JpaRepository<Venda, Long> {

    /**
     * Total de vendas agrupadas por forma de pagamento.
     */
    @Query("""
            SELECT v.formaPagamento, COUNT(v)
            FROM Venda v
            WHERE v.usuario.email = :email
            GROUP BY v.formaPagamento
            """)
    List<Object[]> countVendasPorFormaPagamentoRaw(String email);

    /**
     * Total de vendas agrupadas por produto.
     */
    @Query("""
            SELECT p.nome, SUM(iv.quantidade)
            FROM ItemVenda iv
            JOIN iv.produto p
            JOIN iv.venda v
            WHERE v.usuario.email = :email
            GROUP BY p.nome
            """)
    List<Object[]> countVendasPorProdutoRaw(String email);

    @Query(value = """
            SELECT 
                DAYOFWEEK(v.data_venda) AS dia_numero,
                DAYNAME(v.data_venda) AS dia_nome,
                COALESCE(SUM(v.valor_final), 0) AS total
            FROM venda v
            WHERE v.data_venda BETWEEN ? AND ?
              AND v.usuario_id = ?
            GROUP BY DAYOFWEEK(v.data_venda), DAYNAME(v.data_venda)
            ORDER BY dia_numero;
            """, nativeQuery = true)
    List<Object[]> countVendasDiariasRawPorUsuario(LocalDateTime inicio, LocalDateTime fim, Long usuarioId);


}
