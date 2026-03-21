package br.com.gestpro.cliente.controller;

import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.cliente.service.ClienteServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ClienteController {

    private final ClienteServiceImpl service;

    public ClienteController(ClienteServiceImpl service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Cliente> criar(
            @RequestBody Cliente cliente,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criarCliente(cliente, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> atualizar(
            @PathVariable Long id,
            @RequestBody Cliente dados,
            Authentication authentication) {
        return ResponseEntity.ok(service.atualizarCliente(id, dados, authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listar(
            @RequestParam(required = false) Long empresaId,
            Authentication authentication) {
        if (empresaId != null)
            return ResponseEntity.ok(service.listarPorEmpresa(empresaId));
        return ResponseEntity.ok(service.listarClientesAtivos(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable Long id,
            Authentication authentication) {
        service.desativarCliente(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // Mantém rota legada
    @PostMapping("/criar")
    public ResponseEntity<Cliente> criarLegado(
            @RequestBody Cliente cliente,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criarCliente(cliente, authentication.getName()));
    }

    @GetMapping("/listar")
    public ResponseEntity<List<Cliente>> listarLegado(
            @RequestParam(required = false) Long empresaId,
            Authentication authentication) {
        if (empresaId != null)
            return ResponseEntity.ok(service.listarPorEmpresa(empresaId));
        return ResponseEntity.ok(service.listarClientesAtivos(authentication.getName()));
    }

    @DeleteMapping("/desativar/{id}")
    public ResponseEntity<Void> desativarLegado(@PathVariable Long id) {
        service.desativarCliente(id);
        return ResponseEntity.noContent().build();
    }
}