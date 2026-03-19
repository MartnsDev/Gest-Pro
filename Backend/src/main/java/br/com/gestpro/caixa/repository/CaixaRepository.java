package br.com.gestpro.caixa.repository;

import br.com.gestpro.caixa.StatusCaixa;
import br.com.gestpro.caixa.model.Caixa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {
    long countByEmpresaIdAndStatus(Long empresaId, StatusCaixa status);
    Optional<Caixa> findFirstByEmpresaIdAndStatus(Long empresaId, StatusCaixa status);
}