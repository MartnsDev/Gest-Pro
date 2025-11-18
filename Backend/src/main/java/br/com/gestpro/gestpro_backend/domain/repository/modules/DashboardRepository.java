package br.com.gestpro.gestpro_backend.domain.repository.modules;

import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface DashboardRepository extends JpaRepository<Venda, Long> {

    @Query("""
                SELECT COUNT(v)
                FROM Venda v
                WHERE v.usuario.email = :email
                  AND v.dataVenda = CURRENT_DATE
            """)
    Long contarVendasHoje(@Param("email") String email);


    @Query("SELECT COUNT(p) FROM Produto p WHERE p.usuario.email = :email AND p.quantidadeEstoque > 0")
    Long contarProdutosEmEstoque(@Param("email") String email);

    @Query("SELECT COUNT(p) FROM Produto p WHERE p.usuario.email = :email AND p.quantidadeEstoque = 0")
    Long contarProdutosZerados(@Param("email") String email);

    @Query("SELECT COUNT(c) FROM Cliente c WHERE c.usuario.email = :email AND c.ativo = true")
    Long contarClientesAtivos(@Param("email") String email);


    @Query("""
                SELECT COUNT(v)
                FROM Venda v
                WHERE v.usuario.email = :email
                AND v.dataVenda BETWEEN :inicio AND :fim
            """)
    Long contarVendasSemana(@Param("email") String email,
                            @Param("inicio") LocalDateTime inicio,
                            @Param("fim") LocalDateTime fim);

}
