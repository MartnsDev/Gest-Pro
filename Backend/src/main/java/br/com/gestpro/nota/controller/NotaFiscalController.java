package br.com.gestpro.nota.controller;

import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.service.NotaFiscalServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller REST do módulo de Notas Fiscais.
 *
 * Base path: /notas-fiscais
 *
 * Endpoints:
 *  POST   /notas-fiscais                       → criar rascunho
 *  PATCH  /notas-fiscais/{id}/emitir           → emitir nota
 *  PATCH  /notas-fiscais/cancelar              → cancelar nota
 *  GET    /notas-fiscais                       → listar (com filtros)
 *  GET    /notas-fiscais/{id}                  → buscar por ID
 *  GET    /notas-fiscais/{id}/danfe            → dados do DANFE
 *  GET    /notas-fiscais/stats/{empresaId}     → estatísticas
 *  GET    /notas-fiscais/utils/cep/{cep}       → consulta CEP
 *  GET    /notas-fiscais/utils/cnpj/{cnpj}     → consulta CNPJ
 *  GET    /notas-fiscais/utils/municipios/{uf} → lista municípios
 */
@RestController
@RequestMapping("/notas-fiscais")
@RequiredArgsConstructor
public class NotaFiscalController {

    private final NotaFiscalServiceImpl notaFiscalService;

    // ── CRIAR RASCUNHO ────────────────────────────────────────────────────────
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> criar(
            @Valid @RequestBody NotaFiscalDTOs.CriarNotaFiscalDTO dto,
            @RequestHeader(value = "X-Usuario-Id", defaultValue = "anon") String usuarioId
    ) {
        return notaFiscalService.criar(dto, usuarioId);
    }

    // ── EMITIR ────────────────────────────────────────────────────────────────
    @PatchMapping("/{id}/emitir")
    public Map<String, Object> emitir(@PathVariable UUID id) {
        return notaFiscalService.emitir(id);
    }

    // ── CANCELAR ──────────────────────────────────────────────────────────────
    @PatchMapping("/cancelar")
    public Map<String, Object> cancelar(
            @Valid @RequestBody NotaFiscalDTOs.CancelarNotaDTO dto
    ) {
        return notaFiscalService.cancelar(dto);
    }

    // ── ESTATÍSTICAS ──────────────────────────────────────────────────────────
    @GetMapping("/stats/{empresaId}")
    public NotaFiscalDTOs.EstatisticasDTO estatisticas(
            @PathVariable String empresaId
    ) {
        return notaFiscalService.estatisticas(empresaId);
    }

    // ── CEP ───────────────────────────────────────────────────────────────────
    @GetMapping("/utils/cep/{cep}")
    public Map<String, Object> consultarCep(@PathVariable String cep) {
        return notaFiscalService.consultarCep(cep);
    }

    // ── CNPJ ──────────────────────────────────────────────────────────────────
    @GetMapping("/utils/cnpj/{cnpj}")
    public Map<String, Object> consultarCnpj(@PathVariable String cnpj) {
        return notaFiscalService.consultarCNPJ(cnpj);
    }

    // ── MUNICÍPIOS ────────────────────────────────────────────────────────────
    @GetMapping("/utils/municipios/{uf}")
    public List<Map<String, Object>> municipios(@PathVariable String uf) {
        return notaFiscalService.buscarMunicipios(uf);
    }

    // ── DANFE ─────────────────────────────────────────────────────────────────
    @GetMapping("/{id}/danfe")
    public Map<String, Object> danfe(@PathVariable UUID id) {
        return notaFiscalService.gerarDadosDanfe(id);
    }

    // ── BUSCAR POR ID ─────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public Map<String, Object> buscarPorId(@PathVariable UUID id) {
        return notaFiscalService.buscarPorId(id);
    }

    // ── LISTAR ───────────────────────────────────────────────────────────────
    @GetMapping
    public Map<String, Object> listar(
            @ModelAttribute NotaFiscalDTOs.FilterNotaFiscalDTO filter
    ) {
        return notaFiscalService.listar(filter);
    }
}
