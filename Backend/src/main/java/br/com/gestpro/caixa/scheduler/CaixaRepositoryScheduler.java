package br.com.gestpro.caixa.scheduler;

// Adicione este método ao seu CaixaRepository existente:

import br.com.gestpro.caixa.model.Caixa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CaixaRepositoryScheduler extends JpaRepository<Caixa, Long> {

    // --- métodos que você provavelmente já tem ---
    Optional<Caixa> findByEmpresaIdAndAbertoTrue(Long empresaId);

    List<Caixa> findByEmpresaIdOrderByDataAberturaDesc(Long empresaId);

    // --- NOVO: busca caixas abertos cuja abertura é anterior ao limite (24h atrás) ---
    List<Caixa> findByAbertoTrueAndDataAberturaLessThanEqual(LocalDateTime limite);
}