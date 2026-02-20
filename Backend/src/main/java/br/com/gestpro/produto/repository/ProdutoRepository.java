package br.com.gestpro.produto.repository;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.produto.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Listar todos os produtos de um usuário
    List<Produto> findByUsuario(Usuario usuario);


    // Produtos com estoque zero
    List<Produto> findByQuantidadeEstoqueAndUsuarioEmail(int quantidade, String email);


}
