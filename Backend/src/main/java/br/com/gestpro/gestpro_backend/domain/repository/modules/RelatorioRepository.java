package br.com.gestpro.gestpro_backend.domain.repository.modules;

import br.com.gestpro.gestpro_backend.domain.model.modules.relatorio.Relatorio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
}
