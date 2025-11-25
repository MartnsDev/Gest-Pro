package br.com.gestpro.gestpro_backend.domain.repository.modules;

import br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.ProdutoVendasDTO;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GraficoRepository extends JpaRepository<Venda, Long> {

    /**
     * Retorna DTOs direto via constructor expression (JPQL).
     * Nota: o constructor expression chama o construtor (String, Long) em MetodoPagamentoDTO.
     */

    @Query("""
                SELECT v.formaPagamento, COUNT(v)
                FROM Venda v
                WHERE v.usuario.email = :email
                GROUP BY v.formaPagamento
            """)
    List<Object[]> countVendasPorFormaPagamentoRaw(String email);


    /**
     * Retorna ProdutoVendasDTO (nome do produto, soma das quantidades).
     * Usa ItemVenda relacionamento para agregação.
     */
    @Query("""
            SELECT new br.com.gestpro.gestpro_backend.api.dto.modules.dashboard.ProdutoVendasDTO(
                p.nome, SUM(iv.quantidade)
            )
            FROM ItemVenda iv
            JOIN iv.produto p
            JOIN iv.venda v
            WHERE v.usuario.email = :email
            GROUP BY p.nome
            ORDER BY SUM(iv.quantidade) DESC
            """)
    List<ProdutoVendasDTO> countVendasPorProdutoDTO(String email);

    /**
     * Para vendas diárias usamos query nativa porque usamos funções de data específicas.
     * Retorna linhas: (dia_numero, dia_nome, total)
     * Mapeamento é feito no service.
     */
    @Query(value = """
            SELECT 
                DAYOFWEEK(v.data_venda) AS dia_numero,
                DAYNAME(v.data_venda) AS dia_nome,
                COALESCE(SUM(v.valor_final), 0) AS total
            FROM venda v
            WHERE v.data_venda BETWEEN ?1 AND ?2
              AND v.usuario_id = ?3
            GROUP BY DAYOFWEEK(v.data_venda), DAYNAME(v.data_venda)
            ORDER BY dia_numero
            """, nativeQuery = true)
    List<Object[]> countVendasDiariasRawPorUsuario(LocalDateTime inicio, LocalDateTime fim, Long usuarioId);
}
