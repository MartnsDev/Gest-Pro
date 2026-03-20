package br.com.gestpro.caixa.controller;

import br.com.gestpro.caixa.dto.caixa.AbrirCaixaRequest;
import br.com.gestpro.caixa.dto.caixa.CaixaResponse;
import br.com.gestpro.caixa.dto.caixa.FecharCaixaRequest;
import br.com.gestpro.caixa.service.CaixaServiceInterface;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/caixas")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CaixaController {

    private final CaixaServiceInterface caixaService;

    public CaixaController(CaixaServiceInterface caixaService) {
        this.caixaService = caixaService;
    }

    @PostMapping("/abrir")
    public ResponseEntity<CaixaResponse> abrir(
            @Valid @RequestBody AbrirCaixaRequest req,
            Authentication authentication) {
        req.setEmailUsuario(authentication.getName());
        CaixaResponse resp = caixaService.abrirCaixa(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/fechar")
    public ResponseEntity<CaixaResponse> fechar(
            @Valid @RequestBody FecharCaixaRequest req,
            Authentication authentication) {
        req.setEmailUsuario(authentication.getName());
        CaixaResponse resp = caixaService.fecharCaixa(req);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}/resumo")
    public ResponseEntity<CaixaResponse> resumo(
            @PathVariable Long id,
            Authentication authentication) {
        CaixaResponse resp = caixaService.obterResumo(id, authentication.getName());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/aberto")
    public ResponseEntity<CaixaResponse> caixaAberto(
            @RequestParam Long empresaId,
            Authentication authentication) {
        CaixaResponse resp = caixaService.buscarCaixaAberto(empresaId, authentication.getName());
        return ResponseEntity.ok(resp);
    }
}