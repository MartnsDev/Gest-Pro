package br.com.gestpro.analytics.repository;

import br.com.gestpro.analytics.model.Relatorio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
}
