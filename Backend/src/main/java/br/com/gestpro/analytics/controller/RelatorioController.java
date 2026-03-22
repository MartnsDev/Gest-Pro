package br.com.gestpro.analytics.controller;

import br.com.gestpro.analytics.dto.RelatorioDTO;
import br.com.gestpro.analytics.service.RelatorioServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.*;

@RestController
@RequestMapping("/api/v1/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioServiceInterface service;

    /** Relatório por período personalizado */
    @GetMapping("/periodo")
    public ResponseEntity<RelatorioDTO> porPeriodo(
            @RequestParam Long empresaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            Authentication authentication) {
        return ResponseEntity.ok(service.gerarPorPeriodo(empresaId, inicio, fim, authentication.getName()));
    }

    /** Relatório do dia atual */
    @GetMapping("/hoje")
    public ResponseEntity<RelatorioDTO> hoje(
            @RequestParam Long empresaId,
            Authentication authentication) {
        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fim    = LocalDate.now().atTime(23, 59, 59);
        return ResponseEntity.ok(service.gerarPorPeriodo(empresaId, inicio, fim, authentication.getName()));
    }

    /** Relatório da semana atual (seg-dom) */
    @GetMapping("/semana")
    public ResponseEntity<RelatorioDTO> semana(
            @RequestParam Long empresaId,
            Authentication authentication) {
        LocalDate hoje   = LocalDate.now();
        LocalDateTime inicio = hoje.with(DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime fim    = hoje.with(DayOfWeek.SUNDAY).atTime(23, 59, 59);
        return ResponseEntity.ok(service.gerarPorPeriodo(empresaId, inicio, fim, authentication.getName()));
    }

    /** Relatório do mês atual */
    @GetMapping("/mes")
    public ResponseEntity<RelatorioDTO> mes(
            @RequestParam Long empresaId,
            Authentication authentication) {
        LocalDate hoje   = LocalDate.now();
        LocalDateTime inicio = hoje.withDayOfMonth(1).atStartOfDay();
        LocalDateTime fim    = hoje.withDayOfMonth(hoje.lengthOfMonth()).atTime(23, 59, 59);
        return ResponseEntity.ok(service.gerarPorPeriodo(empresaId, inicio, fim, authentication.getName()));
    }

    /** Relatório de um caixa específico */
    @GetMapping("/caixa/{caixaId}")
    public ResponseEntity<RelatorioDTO> porCaixa(
            @PathVariable Long caixaId,
            Authentication authentication) {
        return ResponseEntity.ok(service.gerarPorCaixa(caixaId, authentication.getName()));
    }
}