package br.com.gestpro.nota.controller;


import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.service.NotaFiscalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/notas-fiscais")
@RequiredArgsConstructor
public class NotaFiscalController {

    private final NotaFiscalService service;

    /* ── CRIAR RASCUNHO ──────────────────────────────── */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> criar(
            @Valid @RequestBody NotaFiscalDTOs.CriarNotaFiscalDTO dto,
            @RequestHeader(value = "X-Usuario-Id", defaultValue = "anon") String usuarioId
    ) {
        return service.criar(dto, usuarioId);
    }

    /* ── EMITIR ──────────────────────────────────────── */
    @PatchMapping("/{id}/emitir")
    public Map<String, Object> emitir(@PathVariable UUID id) {
        return service.emitir(id);
    }

    /* ── CANCELAR ────────────────────────────────────── */
    @PatchMapping("/cancelar")
    public Map<String, Object> cancelar(@Valid @RequestBody NotaFiscalDTOs.CancelarNotaDTO dto) {
        return service.cancelar(dto);
    }

    /* ── ESTATÍSTICAS ────────────────────────────────── */
    @GetMapping("/stats/{empresaId}")
    public NotaFiscalDTOs.EstatisticasDTO estatisticas(@PathVariable String empresaId) {
        return service.estatisticas(empresaId);
    }

    /* ── CEP ─────────────────────────────────────────── */
    @GetMapping("/utils/cep/{cep}")
    public Map<String, Object> consultarCep(@PathVariable String cep) {
        return service.consultarCep(cep);
    }

    /* ── CNPJ ────────────────────────────────────────── */
    @GetMapping("/utils/cnpj/{cnpj}")
    public Map<String, Object> consultarCnpj(@PathVariable String cnpj) {
        return service.consultarCnpj(cnpj);
    }

    /* ── MUNICÍPIOS ──────────────────────────────────── */
    @GetMapping("/utils/municipios/{uf}")
    public List<Map<String, Object>> municipios(@PathVariable String uf) {
        return service.buscarMunicipios(uf);
    }

    /* ── DANFE ───────────────────────────────────────── */
    @GetMapping("/{id}/danfe")
    public Map<String, Object> danfe(@PathVariable UUID id) {
        return service.gerarDadosDanfe(id);
    }

    /* ── BUSCAR POR ID ───────────────────────────────── */
    @GetMapping("/{id}")
    public Map<String, Object> buscarPorId(@PathVariable UUID id) {
        return service.buscarPorId(id);
    }

    /* ── LISTAR ─────────────────────────────────────── */
    @GetMapping
    public Map<String, Object> listar(@ModelAttribute NotaFiscalDTOs.FilterNotaFiscalDTO filter) {
        return service.listar(filter);
    }
}