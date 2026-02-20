package br.com.gestpro.caixa.controller;

import br.com.gestpro.caixa.dto.caixa.AbrirCaixaRequest;
import br.com.gestpro.caixa.dto.caixa.CaixaResponse;
import br.com.gestpro.caixa.dto.caixa.FecharCaixaRequest;
import br.com.gestpro.caixa.service.CaixaServiceInterface;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/caixas")
public class CaixaController {

    private final CaixaServiceInterface caixaService;

    public CaixaController(CaixaServiceInterface caixaService) {
        this.caixaService = caixaService;
    }

    @PostMapping("/abrir")
    public ResponseEntity<CaixaResponse> abrir(@Valid @RequestBody AbrirCaixaRequest req) {
        CaixaResponse resp = caixaService.abrirCaixa(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/fechar")
    public ResponseEntity<CaixaResponse> fechar(@Valid @RequestBody FecharCaixaRequest req) {
        CaixaResponse resp = caixaService.fecharCaixa(req);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}/resumo")
    public ResponseEntity<CaixaResponse> resumo(@PathVariable Long id) {
        CaixaResponse resp = caixaService.obterResumo(id);
        return ResponseEntity.ok(resp);
    }
}
