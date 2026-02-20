package br.com.gestpro.cliente.service;

import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.cliente.repository.ClienteRepository;
import br.com.gestpro.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteServiceImpl {

    private final ClienteRepository repository;

    public ClienteServiceImpl(ClienteRepository repository) {
        this.repository = repository;
    }

    public Cliente criarCliente(Cliente cliente) {
        if (repository.existsByEmail(cliente.getEmail())) {
            throw new ApiException("Email já cadastrado!", HttpStatus.BAD_REQUEST, "/clientes/criar");
        }
        return repository.save(cliente);
    }


    public List<Cliente> listarClientesAtivos() {
        return repository.findByAtivoTrue();
    }

    public void desativarCliente(Long id) {
        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.BAD_REQUEST, "/clientes/desativar"));
        cliente.setAtivo(false);
        repository.save(cliente);
    }
}
