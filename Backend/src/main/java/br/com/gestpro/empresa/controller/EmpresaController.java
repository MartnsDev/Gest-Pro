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
     * DELETE /api/v1/empresas/{id}/confirmar-exclusao
     * Valida a senha do usuário logado e exclui a empresa com todos os dados.
     */
    @DeleteMapping("/{id}/confirmar-exclusao")
    public ResponseEntity<Void> excluirComSenha(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String senha = body.get("senha");
        if (senha == null || senha.isBlank())
            return ResponseEntity.badRequest().build();

        empresaService.excluirComSenha(id, authentication.getName(), senha);
        return ResponseEntity.noContent().build();
    }

    // Rota legada mantida
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            Authentication authentication) {
        empresaService.excluir(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/exclusao-permanente")
    public ResponseEntity<Void> excluirPermanentemente(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        empresaService.excluirPermanentementeComSenha(id, auth.getName(), body.get("senha"));
        return ResponseEntity.noContent().build();
    }

}