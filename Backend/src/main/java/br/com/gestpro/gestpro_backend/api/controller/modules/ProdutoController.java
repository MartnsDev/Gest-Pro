package br.com.gestpro.gestpro_backend.api.controller.modules;

import br.com.gestpro.gestpro_backend.api.dto.modules.produto.CriarProdutoDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.produto.ProdutoResponseDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.modules.produto.Produto;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.service.modulesService.produto.ProdutoServiceInterface;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoServiceInterface produtoService;
    private final UsuarioRepository usuarioRepository;

    public ProdutoController(ProdutoServiceInterface produtoService, UsuarioRepository usuarioRepository) {
        this.produtoService = produtoService;
        this.usuarioRepository = usuarioRepository;
    }

    // ✅ Criar produto (vinculado ao usuário)
    @PostMapping("/criar")
    public ResponseEntity<ProdutoResponseDTO> criarProduto(@RequestBody CriarProdutoDTO dto) {

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado",
                        HttpStatus.BAD_REQUEST,
                        "/api/produtos/criar"
                ));

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setPreco(dto.getPreco());
        produto.setQuantidadeEstoque(dto.getQuantidadeEstoque());
        produto.setQuantidade(dto.getQuantidade());
        produto.setAtivo(dto.getAtivo());
        produto.setUsuario(usuario);
        produto.setDataCriacao(LocalDateTime.now());

        Produto novoProduto = produtoService.salvar(produto);

        return ResponseEntity.ok(new ProdutoResponseDTO(novoProduto));
    }

    // ✅ Listar produtos apenas de um usuário
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Produto>> listarProdutosPorUsuario(@PathVariable Long usuarioId) {
        List<Produto> produtos = produtoService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(produtos);
    }

    // ⚠️ Endpoint global — use apenas para administração
    @GetMapping
    public ResponseEntity<List<Produto>> listarProdutos() {
        List<Produto> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }

    // ✅ Buscar produto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarProdutoPorId(@PathVariable Long id) {
        Produto produto = produtoService.buscarPorId(id);
        return ResponseEntity.ok(produto);
    }
}
