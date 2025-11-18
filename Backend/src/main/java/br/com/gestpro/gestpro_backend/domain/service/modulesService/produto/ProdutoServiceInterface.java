package br.com.gestpro.gestpro_backend.domain.service.modulesService.produto;

import br.com.gestpro.gestpro_backend.domain.model.modules.produto.Produto;

import java.util.List;

public interface ProdutoServiceInterface {
    Produto salvar(Produto produto);

    List<Produto> listarTodos();

    Produto buscarPorId(Long id);

    List<Produto> listarPorUsuario(Long usuarioId);
}
