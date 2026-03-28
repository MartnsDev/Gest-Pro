package br.com.gestpro.empresa.controller;

import br.com.gestpro.empresa.dto.CriarEmpresaRequest;
import br.com.gestpro.empresa.dto.EmpresaResponse;
import br.com.gestpro.empresa.service.EmpresaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;

    @PostMapping
    public ResponseEntity<EmpresaResponse> criar(
            @RequestBody @Valid CriarEmpresaRequest request,
            Authentication authentication) {
        request.setEmailUsuario(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(empresaService.criar(request));
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> listar(Authentication authentication) {
        return ResponseEntity.ok(empresaService.listarPorUsuario(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.buscarPorIdDto(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid CriarEmpresaRequest request,
            Authentication authentication) {
        request.setEmailUsuario(authentication.getName());
        return ResponseEntity.ok(empresaService.atualizar(id, request));
    }

    /**
     * PASSO 1 — Solicita o código de confirmação por e-mail antes de excluir.
     * POST /api/v1/empresas/{id}/solicitar-exclusao
     */
    @PostMapping("/{id}/solicitar-exclusao")
    public ResponseEntity<Map<String, String>> solicitarExclusao(
            @PathVariable Long id,
            Authentication authentication) {
        empresaService.solicitarCodigoExclusao(id, authentication.getName());
        return ResponseEntity.ok(Map.of("mensagem", "Código enviado para seu e-mail. Válido por 10 minutos."));
    }

    /**
     * PASSO 2 — Confirma o código e exclui a empresa com todos os dados.
     * DELETE /api/v1/empresas/{id}/confirmar-exclusao?codigo=123456
     */
    @DeleteMapping("/{id}/confirmar-exclusao")
    public ResponseEntity<Void> confirmarExclusao(
            @PathVariable Long id,
            @RequestParam String codigo,
            Authentication authentication) {
        empresaService.confirmarExclusao(id, authentication.getName(), codigo);
        return ResponseEntity.noContent().build();
    }

    // ── Rota legada mantida para compatibilidade ──────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            Authentication authentication) {
        empresaService.excluir(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}