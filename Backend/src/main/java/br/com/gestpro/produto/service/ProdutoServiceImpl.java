package br.com.gestpro.produto.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.produto.model.Produto;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.produto.repository.ProdutoRepository;
import br.com.gestpro.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProdutoServiceImpl implements ProdutoServiceInterface {

    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProdutoServiceImpl(ProdutoRepository produtoRepository, UsuarioRepository usuarioRepository) {
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    @Override
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    @Override
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND, "/api/produtos/" + id));
    }

    @Override
    public List<Produto> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/produtos/usuario/" + usuarioId));

        return produtoRepository.findByUsuario(usuario);
    }
}
