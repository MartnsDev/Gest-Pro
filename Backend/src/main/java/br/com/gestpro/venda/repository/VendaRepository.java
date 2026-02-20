package br.com.gestpro.venda.repository;

import br.com.gestpro.dashboard.dto.ProdutoVendasDTO;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.venda.model.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VendaRepository extends JpaRepository<Venda, Long> {

    // ----------------------------
    // MÉTODOS AUTOMÁTICOS
    // ----------------------------

    List<Venda> findByCaixaId(Long idCaixa);

    List<Venda> findByCaixa(Caixa caixa);

    Long countByDataVendaBetweenAndUsuarioEmail(LocalDateTime inicio, LocalDateTime fim, String emailUsuario);


    // MÉTODOS COM @QUERY (AGREGAÇÃO / JOIN)


    @Query("""
               SELECT new br.com.gestpro.dashboard.dto.ProdutoVendasDTO(
                    p.nome, SUM(iv.quantidade)
                )
                FROM ItemVenda iv
                JOIN iv.venda v
                JOIN iv.produto p
                WHERE v.usuario.email = :email
                GROUP BY p.nome
                ORDER BY SUM(iv.quantidade) DESC
            """)
    List<ProdutoVendasDTO> countVendasPorProduto(@Param("email") String email);


    // Total de vendas por período e usuário
    @Query("SELECT COALESCE(SUM(v.valorFinal), 0) " +
            "FROM Venda v " +
            "WHERE v.dataVenda BETWEEN :inicio AND :fim " +
            "AND v.usuario.email = :email")
    BigDecimal somarVendasPorUsuarioEPeriodo(@Param("inicio") LocalDateTime inicio,
                                             @Param("fim") LocalDateTime fim,
                                             @Param("email") String email);
}




