package br.com.gestpro.cliente.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.cliente.repository.ClienteRepository;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;

    /**
     * Cria cliente vinculado ao usuário autenticado.
     * Se o cliente tiver empresa_id no body, vincula à empresa também.
     */
    public Cliente criarCliente(Cliente cliente, String emailUsuario) {
        if (clienteRepository.existsByEmail(cliente.getEmail())) {
            throw new ApiException("Email já cadastrado!", HttpStatus.BAD_REQUEST, "/clientes/criar");
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/clientes/criar"));

        cliente.setUsuario(usuario);

        // Vincula à empresa se vier no body (empresa já setada pelo controller via ID)
        if (cliente.getEmpresa() != null && cliente.getEmpresa().getId() != null) {
            Empresa empresa = empresaRepository.findById(cliente.getEmpresa().getId())
                    .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/clientes/criar"));
            if (!empresa.getDono().getEmail().equals(emailUsuario))
                throw new ApiException("Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, "/clientes/criar");
            cliente.setEmpresa(empresa);
        }

        return clienteRepository.save(cliente);
    }

    /** Lista clientes ativos de uma empresa específica */
    public List<Cliente> listarPorEmpresa(Long empresaId) {
        return clienteRepository.findByEmpresaIdAndAtivoTrue(empresaId);
    }

    /** Lista clientes ativos do usuário (fallback sem empresa) */
    public List<Cliente> listarClientesAtivos(String emailUsuario) {
        return clienteRepository.findByUsuarioEmailAndAtivoTrue(emailUsuario);
    }

    /** Compatibilidade com código legado sem email */
    public List<Cliente> listarClientesAtivos() {
        return clienteRepository.findByAtivoTrue();
    }

    public void desativarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.BAD_REQUEST, "/clientes/desativar"));
        cliente.setAtivo(false);
        clienteRepository.save(cliente);
    }
}