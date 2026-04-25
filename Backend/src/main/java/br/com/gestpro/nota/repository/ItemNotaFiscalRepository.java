package br.com.gestpro.nota.repository;

import br.com.gestpro.nota.model.ItemNotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ItemNotaFiscalRepository extends JpaRepository<ItemNotaFiscal, Long> {

    List<ItemNotaFiscal> findByNotaFiscalIdOrderByNumeroItemAsc(Long notaFiscalId);

    default List<ItemNotaFiscal> findByNotaFiscalId(Long notaFiscalId) {
        return findByNotaFiscalIdOrderByNumeroItemAsc(notaFiscalId);
    }

    @Modifying
    void deleteByNotaFiscalId(Long notaFiscalId);
}