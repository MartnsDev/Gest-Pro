package br.com.gestpro.analytics.service;

import br.com.gestpro.analytics.dto.RelatorioDTO;

import java.time.LocalDateTime;

public interface RelatorioServiceInterface {
    RelatorioDTO gerarPorPeriodo(Long empresaId, LocalDateTime inicio, LocalDateTime fim, String email);
    RelatorioDTO gerarPorCaixa(Long caixaId, String email);
}