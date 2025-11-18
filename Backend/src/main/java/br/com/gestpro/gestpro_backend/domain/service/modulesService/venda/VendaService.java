package br.com.gestpro.gestpro_backend.domain.service.modulesService.venda;

import br.com.gestpro.gestpro_backend.api.dto.modules.vendas.RegistrarVendaDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.modules.caixa.Caixa;
import br.com.gestpro.gestpro_backend.domain.model.modules.cliente.Cliente;
import br.com.gestpro.gestpro_backend.domain.model.modules.produto.Produto;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.ItemVenda;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.CaixaRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.ClienteRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.ProdutoRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.VendaRepository;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CaixaRepository caixaRepository;
    private final ClienteRepository clienteRepository;

    public VendaService(VendaRepository vendaRepository,
                        ProdutoRepository produtoRepository,
                        UsuarioRepository usuarioRepository,
                        CaixaRepository caixaRepository,
                        ClienteRepository clienteRepository) {
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
        this.usuarioRepository = usuarioRepository;
        this.caixaRepository = caixaRepository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public Venda registrarVenda(RegistrarVendaDTO dto) {
        if (dto.getItens() == null || dto.getItens().isEmpty()) {
            throw new ApiException("Nenhum item enviado para a venda", HttpStatus.BAD_REQUEST, "/api/vendas");
        }

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.BAD_REQUEST, "/api/vendas"));

        Caixa caixa = caixaRepository.findById(dto.getIdCaixa())
                .orElseThrow(() -> new ApiException("Caixa não encontrado", HttpStatus.BAD_REQUEST, "/api/vendas"));

        Cliente cliente = null;
        if (dto.getIdCliente() != null) {
            cliente = clienteRepository.findById(dto.getIdCliente())
                    .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.BAD_REQUEST, "/api/vendas"));
        }

        Venda venda = new Venda();
        venda.setUsuario(usuario);
        venda.setCaixa(caixa);
        venda.setCliente(cliente);
        venda.setFormaPagamento(dto.getFormaPagamento());
        venda.setObservacao(dto.getObservacao());

        List<ItemVenda> itens = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (RegistrarVendaDTO.ItemVendaDTO itemDTO : dto.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getIdProduto())
                    .orElseThrow(() -> new ApiException("Produto não encontrado: " + itemDTO.getIdProduto(), HttpStatus.BAD_REQUEST, "/api/vendas"));

            ItemVenda itemVenda = new ItemVenda();
            itemVenda.setVenda(venda);
            itemVenda.setProduto(produto);
            itemVenda.setQuantidade(itemDTO.getQuantidade() != null ? itemDTO.getQuantidade() : 1);
            itemVenda.setPrecoUnitario(produto.getPreco());
            itemVenda.calcularSubtotal();

            total = total.add(itemVenda.getSubtotal());
            itens.add(itemVenda);
        }

        venda.setItens(itens);

        BigDecimal desconto = dto.getDesconto() != null ? dto.getDesconto() : BigDecimal.ZERO;
        venda.setTotal(total);
        venda.setValorFinal(total.subtract(desconto).max(BigDecimal.ZERO));

        return vendaRepository.save(venda);
    }

    // Listar vendas por caixa
    public List<Venda> listarPorCaixa(Long idCaixa) {
        return vendaRepository.findByCaixaId(idCaixa);
    }

    // Buscar venda por ID
    public Venda buscarPorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new ApiException("Venda não encontrada", HttpStatus.NOT_FOUND, "/api/vendas/"));
    }
}
