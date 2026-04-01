package br.com.gestpro.analytics.controller;

import br.com.gestpro.analytics.dto.RelatorioDTO;
import br.com.gestpro.analytics.service.RelatorioServiceInterface;


import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Endpoints de relatórios — todos combinam PDV + Pedidos.
 *
 * GET /api/v1/relatorios/hoje          ?empresaId=
 * GET /api/v1/relatorios/semana        ?empresaId=
 * GET /api/v1/relatorios/mes           ?empresaId=
 * GET /api/v1/relatorios/periodo       ?empresaId= &inicio= &fim=
 * GET /api/v1/relatorios/caixa/{id}
 */
@RestController
@RequestMapping("/api/v1/relatorios")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioServiceInterface relatorioService;

    @GetMapping("/hoje")
    public ResponseEntity<RelatorioDTO> hoje(
            @RequestParam Long empresaId,
            Authentication auth) {
        return ResponseEntity.ok(relatorioService.hoje(empresaId, auth.getName()));
    }

    @GetMapping("/semana")
    public ResponseEntity<RelatorioDTO> semana(
            @RequestParam Long empresaId,
            Authentication auth) {
        return ResponseEntity.ok(relatorioService.semana(empresaId, auth.getName()));
    }

    @GetMapping("/mes")
    public ResponseEntity<RelatorioDTO> mes(
            @RequestParam Long empresaId,
            Authentication auth) {
        return ResponseEntity.ok(relatorioService.mes(empresaId, auth.getName()));
    }

    @GetMapping("/periodo")
    public ResponseEntity<RelatorioDTO> periodo(
            @RequestParam Long empresaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim,
            Authentication auth) {
        return ResponseEntity.ok(relatorioService.periodo(empresaId, auth.getName(), inicio, fim));
    }

    @GetMapping("/caixa/{caixaId}")
    public ResponseEntity<RelatorioDTO> porCaixa(
            @PathVariable Long caixaId,
            Authentication auth) {
        return ResponseEntity.ok(relatorioService.porCaixa(caixaId, auth.getName()));
    }
}