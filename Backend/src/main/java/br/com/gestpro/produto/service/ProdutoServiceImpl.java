package br.com.gestpro.produto.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.produto.dto.CriarProdutoDTO;
import br.com.gestpro.produto.model.Produto;
import br.com.gestpro.produto.repository.ProdutoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoServiceImpl implements ProdutoServiceInterface {

    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    public ProdutoServiceImpl(ProdutoRepository produtoRepository,
                              UsuarioRepository usuarioRepository) {
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public Produto criar(CriarProdutoDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos"));

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setPreco(dto.getPreco());
        produto.setQuantidadeEstoque(dto.getQuantidadeEstoque());
        produto.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
        produto.setUsuario(usuario);

        return produtoRepository.save(produto);
    }

    @Override
    @Transactional
    public Produto atualizar(Long id, CriarProdutoDTO dto) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos/" + id));

        if (!produto.getUsuario().getEmail().equals(dto.getEmailUsuario())) {
            throw new ApiException("Você não tem permissão para editar este produto.", HttpStatus.FORBIDDEN, "/api/v1/produtos/" + id);
        }

        produto.setNome(dto.getNome());
        produto.setPreco(dto.getPreco());
        produto.setQuantidadeEstoque(dto.getQuantidadeEstoque());
        if (dto.getAtivo() != null) produto.setAtivo(dto.getAtivo());

        return produtoRepository.save(produto);
    }

    @Override
    @Transactional
    public void excluir(Long id, String emailUsuario) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos/" + id));

        if (!produto.getUsuario().getEmail().equals(emailUsuario)) {
            throw new ApiException("Você não tem permissão para excluir este produto.", HttpStatus.FORBIDDEN, "/api/v1/produtos/" + id);
        }

        produtoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Produto> listarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos"));
        return produtoRepository.findByUsuario(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos/" + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    @Override
    @Transactional
    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Produto> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos"));
        return produtoRepository.findByUsuario(usuario);
    }
}