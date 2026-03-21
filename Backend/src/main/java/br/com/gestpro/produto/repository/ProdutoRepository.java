package br.com.gestpro.produto.repository;

import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.produto.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    // Listagem por usuário (compatibilidade antiga)
    List<Produto> findByUsuario(Usuario usuario);

    // Listagem por empresa — principal a partir de agora
    List<Produto> findByEmpresa(Empresa empresa);

    // Produtos zerados por empresa
    List<Produto> findByQuantidadeEstoqueAndEmpresaId(int quantidade, Long empresaId);

    // Mantém compatibilidade com alertas por email (dashboard)
    List<Produto> findByQuantidadeEstoqueAndUsuarioEmail(int quantidade, String email);
}