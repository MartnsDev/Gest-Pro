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

    public ProdutoServiceImpl(ProdutoRepository repo, UsuarioRepository usuarioRepo) {
        this.produtoRepository = repo;
        this.usuarioRepository = usuarioRepo;
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos"));
    }

    private void preencherCampos(Produto produto, CriarProdutoDTO dto) {
        produto.setNome(dto.getNome());
        produto.setPreco(dto.getPreco());
        produto.setQuantidadeEstoque(dto.getQuantidadeEstoque());
        produto.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);

        // Campos novos — nullable
        produto.setCategoria(dto.getCategoria());
        produto.setDescricao(dto.getDescricao());
        produto.setUnidade(dto.getUnidade());
        produto.setCodigoBarras(dto.getCodigoBarras());
        produto.setPrecoCusto(dto.getPrecoCusto());
        produto.setEstoqueMinimo(dto.getEstoqueMinimo() != null ? dto.getEstoqueMinimo() : 0);
    }

    @Override
    @Transactional
    public Produto criar(CriarProdutoDTO dto) {
        Usuario usuario = buscarUsuario(dto.getEmailUsuario());
        Produto produto = new Produto();
        preencherCampos(produto, dto);
        produto.setUsuario(usuario);
        return produtoRepository.save(produto);
    }

    @Override
    @Transactional
    public Produto atualizar(Long id, CriarProdutoDTO dto) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos/" + id));

        if (!produto.getUsuario().getEmail().equals(dto.getEmailUsuario()))
            throw new ApiException("Sem permissão para editar este produto.", HttpStatus.FORBIDDEN, "/api/v1/produtos/" + id);

        preencherCampos(produto, dto);
        return produtoRepository.save(produto);
    }

    @Override
    @Transactional
    public void excluir(Long id, String emailUsuario) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND, "/api/v1/produtos/" + id));

        if (!produto.getUsuario().getEmail().equals(emailUsuario))
            throw new ApiException("Sem permissão para excluir este produto.", HttpStatus.FORBIDDEN, "/api/v1/produtos/" + id);

        produtoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Produto> listarPorEmail(String email) {
        return produtoRepository.findByUsuario(buscarUsuario(email));
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