package br.com.gestpro.produto.service;

import br.com.gestpro.produto.model.Produto;

import java.util.List;

public interface ProdutoServiceInterface {
    Produto salvar(Produto produto);

    List<Produto> listarTodos();

    Produto buscarPorId(Long id);

    List<Produto> listarPorUsuario(Long usuarioId);
}
