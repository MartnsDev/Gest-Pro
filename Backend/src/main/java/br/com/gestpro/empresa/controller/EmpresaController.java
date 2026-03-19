package br.com.gestpro.empresa.controller;

import br.com.gestpro.empresa.dto.CriarEmpresaRequest;
import br.com.gestpro.empresa.dto.EmpresaResponse;
import br.com.gestpro.empresa.service.EmpresaService;
import br.com.gestpro.infra.jwt.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/empresas")
@RequiredArgsConstructor
public class EmpresaController {

    private final EmpresaService empresaService;
    private final JwtService jwtService;

    @PostMapping
    public ResponseEntity<EmpresaResponse> criar(
            @RequestHeader("Authorization") String token,
            @RequestBody @Valid CriarEmpresaRequest request) {

        // Extrai o ID do usuário do token para garantir segurança
        Long usuarioId = jwtService.getUsuarioIdFromToken(token.replace("Bearer ", ""));
        request.setUsuarioId(usuarioId);

        EmpresaResponse response = empresaService.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> listar(@RequestHeader("Authorization") String token) {
        Long usuarioId = jwtService.getUsuarioIdFromToken(token.replace("Bearer ", ""));

        List<EmpresaResponse> empresas = empresaService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(empresas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.buscarPorIdDto(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponse> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid CriarEmpresaRequest request) {

        return ResponseEntity.ok(empresaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        empresaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}