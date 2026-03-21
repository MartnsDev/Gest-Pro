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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;

    private Empresa validarEmpresa(Long empresaId, String emailUsuario) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, "/clientes"));
        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException("Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, "/clientes");
        return empresa;
    }

    @Transactional
    public Cliente criarCliente(Cliente cliente, String emailUsuario) {
        Long empresaId = cliente.getEmpresa() != null ? cliente.getEmpresa().getId() : null;

        if (cliente.getEmail() != null && !cliente.getEmail().isBlank() && empresaId != null) {
            if (clienteRepository.existsByEmailAndEmpresaId(cliente.getEmail(), empresaId))
                throw new ApiException("Email já cadastrado nesta empresa!", HttpStatus.BAD_REQUEST, "/clientes/criar");
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/clientes/criar"));

        cliente.setUsuario(usuario);
        cliente.setAtivo(true);

        if (empresaId != null) {
            Empresa empresa = validarEmpresa(empresaId, emailUsuario);
            cliente.setEmpresa(empresa);
        }

        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente atualizarCliente(Long id, Cliente dados, String emailUsuario) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.NOT_FOUND, "/clientes/" + id));

        if (!cliente.getUsuario().getEmail().equals(emailUsuario))
            throw new ApiException("Sem permissão.", HttpStatus.FORBIDDEN, "/clientes/" + id);

        if (dados.getNome()     != null) cliente.setNome(dados.getNome());
        if (dados.getTelefone() != null) cliente.setTelefone(dados.getTelefone());
        if (dados.getEmail()    != null) cliente.setEmail(dados.getEmail());
        if (dados.getCpf()      != null) cliente.setCpf(dados.getCpf());

        return clienteRepository.save(cliente);
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.NOT_FOUND, "/clientes/" + id));
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarPorEmpresa(Long empresaId) {
        return clienteRepository.findByEmpresaIdAndAtivoTrue(empresaId);
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarClientesAtivos(String emailUsuario) {
        return clienteRepository.findByUsuarioEmailAndAtivoTrue(emailUsuario);
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarClientesAtivos() {
        return clienteRepository.findByAtivoTrue();
    }

    @Transactional
    public void desativarCliente(Long id, String emailUsuario) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.NOT_FOUND, "/clientes/" + id));
        if (!cliente.getUsuario().getEmail().equals(emailUsuario))
            throw new ApiException("Sem permissão.", HttpStatus.FORBIDDEN, "/clientes/" + id);
        cliente.setAtivo(false);
        clienteRepository.save(cliente);
    }

    @Transactional
    public void desativarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.NOT_FOUND, "/clientes/" + id));
        cliente.setAtivo(false);
        clienteRepository.save(cliente);
    }
}