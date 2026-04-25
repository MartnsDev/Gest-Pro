package br.com.gestpro.nota.repository;

import br.com.gestpro.nota.model.ItemNotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ItemNotaFiscalRepository extends JpaRepository<ItemNotaFiscal, UUID> {
    List<ItemNotaFiscal> findByNotaFiscalId(Long notaFiscalId);
    void deleteByNotaFiscalId(UUID notaFiscalId);
}
