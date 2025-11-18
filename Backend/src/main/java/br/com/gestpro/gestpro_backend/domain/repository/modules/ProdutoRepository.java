package br.com.gestpro.gestpro_backend.domain.repository.modules;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.modules.produto.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Listar todos os produtos de um usuário
    List<Produto> findByUsuario(Usuario usuario);


    // Produtos com estoque zero
    List<Produto> findByQuantidadeEstoqueAndUsuarioEmail(int quantidade, String email);

    // Contagem de produtos em estoque
    Long countByQuantidadeEstoqueGreaterThanAndUsuarioEmail(int quantidade, String email);

    // Contagem de produtos zerados
    Long countByQuantidadeEstoqueAndUsuarioEmail(int quantidade, String email);


}
