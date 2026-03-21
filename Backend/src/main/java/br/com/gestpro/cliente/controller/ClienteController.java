package br.com.gestpro.cliente.controller;

import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.cliente.service.ClienteServiceImpl;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteServiceImpl service;

    public ClienteController(ClienteServiceImpl service) {
        this.service = service;
    }

    @PostMapping("/criar")
    public Cliente criarCliente(
            @RequestBody Cliente cliente,
            Authentication authentication) {
        // empresaId deve vir no body do cliente
        return service.criarCliente(cliente, authentication.getName());
    }

    /** Lista clientes de uma empresa específica */
    @GetMapping("/listar")
    public List<Cliente> listarClientes(
            @RequestParam(required = false) Long empresaId,
            Authentication authentication) {
        if (empresaId != null) {
            return service.listarPorEmpresa(empresaId);
        }
        return service.listarClientesAtivos(authentication.getName());
    }

    @DeleteMapping("/desativar/{id}")
    public void desativarCliente(@PathVariable Long id) {
        service.desativarCliente(id);
    }
}