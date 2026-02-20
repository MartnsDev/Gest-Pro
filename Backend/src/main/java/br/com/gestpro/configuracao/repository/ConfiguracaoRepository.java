package br.com.gestpro.configuracao.repository;

import br.com.gestpro.configuracao.model.Configuracao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracaoRepository extends JpaRepository<Configuracao, Long> {
}
