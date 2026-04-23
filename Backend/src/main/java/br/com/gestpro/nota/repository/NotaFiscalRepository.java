package br.com.gestpro.nota.repository;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.TipoNota;
import br.com.gestpro.nota.model.NotaFiscal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, UUID> {

    long countByEmpresaId(String empresaId);

    long countByEmpresaIdAndStatus(String empresaId, NotaFiscalStatus status);

    @Query("""
        SELECT COALESCE(SUM(n.total), 0) FROM NotaFiscal n
        WHERE n.empresaId = :empresaId
          AND n.status = 'EMITIDA'
          AND n.dataEmissao BETWEEN :inicio AND :fim
        """)
    BigDecimal sumTotalEmitidoNoPeriodo(
            @Param("empresaId") String empresaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT n FROM NotaFiscal n WHERE
        (:empresaId IS NULL OR n.empresaId = :empresaId) AND
        (:status    IS NULL OR n.status    = :status)    AND
        (:tipo      IS NULL OR n.tipo      = :tipo)      AND
        (:nome      IS NULL OR LOWER(n.clienteNome) LIKE LOWER(CONCAT('%', :nome, '%'))) AND
        (:inicio    IS NULL OR n.createdAt >= :inicio)   AND
        (:fim       IS NULL OR n.createdAt <= :fim)
        """)
    Page<NotaFiscal> findWithFilters(
            @Param("empresaId") String empresaId,
            @Param("status")    NotaFiscalStatus status,
            @Param("tipo")      TipoNota tipo,
            @Param("nome")      String nome,
            @Param("inicio")    LocalDateTime inicio,
            @Param("fim")       LocalDateTime fim,
            Pageable pageable
    );

    @Query("""
        SELECT MAX(CAST(SUBSTRING(n.numero, LENGTH(:prefixo) + 1) AS long))
        FROM NotaFiscal n
        WHERE n.empresaId = :empresaId
          AND n.numero LIKE CONCAT(:prefixo, '%')
        """)
    Optional<Long> findMaxNumeroSequencial(
            @Param("empresaId") String empresaId,
            @Param("prefixo")   String prefixo
    );

    boolean existsByNumero(String numero);
}
