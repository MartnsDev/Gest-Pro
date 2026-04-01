package br.com.gestpro.analytics.service;

import br.com.gestpro.analytics.dto.RelatorioDTO;

import java.time.LocalDateTime;

public interface RelatorioServiceInterface {
    RelatorioDTO hoje(Long empresaId, String email);
    RelatorioDTO semana(Long empresaId, String email);
    RelatorioDTO mes(Long empresaId, String email);
    RelatorioDTO periodo(Long empresaId, String email, LocalDateTime inicio, LocalDateTime fim);
    RelatorioDTO porCaixa(Long caixaId, String email);
}