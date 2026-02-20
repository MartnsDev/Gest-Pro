package br.com.gestpro.cliente.controller;

import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.cliente.service.ClienteServiceImpl;
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
    public Cliente criarCliente(@RequestBody Cliente cliente) {
        return service.criarCliente(cliente);
    }

    @GetMapping("/listar")
    public List<Cliente> listarClientes() {
        return service.listarClientesAtivos();
    }

    @DeleteMapping("desativar/{id}")
    public void desativarCliente(@PathVariable Long id) {
        service.desativarCliente(id);
    }
}
