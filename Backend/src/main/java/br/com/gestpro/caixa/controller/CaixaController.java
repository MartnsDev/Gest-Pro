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

import java.util.List;

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
        return ResponseEntity.status(HttpStatus.CREATED).body(caixaService.abrirCaixa(req));
    }

    @PostMapping("/fechar")
    public ResponseEntity<CaixaResponse> fechar(
            @Valid @RequestBody FecharCaixaRequest req,
            Authentication authentication) {
        req.setEmailUsuario(authentication.getName());
        return ResponseEntity.ok(caixaService.fecharCaixa(req));
    }

    @GetMapping("/{id}/resumo")
    public ResponseEntity<CaixaResponse> resumo(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(caixaService.obterResumo(id, authentication.getName()));
    }

    @GetMapping("/aberto")
    public ResponseEntity<CaixaResponse> caixaAberto(
            @RequestParam Long empresaId,
            Authentication authentication) {
        return ResponseEntity.ok(caixaService.buscarCaixaAberto(empresaId, authentication.getName()));
    }

    /** Lista todos os caixas de uma empresa, do mais recente ao mais antigo */
    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<CaixaResponse>> listarPorEmpresa(
            @PathVariable Long empresaId,
            Authentication authentication) {
        return ResponseEntity.ok(caixaService.listarPorEmpresa(empresaId, authentication.getName()));
    }
}