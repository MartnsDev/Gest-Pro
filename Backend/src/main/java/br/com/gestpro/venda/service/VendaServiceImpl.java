package br.com.gestpro.venda.service;

import br.com.gestpro.venda.dto.RegistrarVendaDTO;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.produto.model.Produto;
import br.com.gestpro.venda.model.ItemVenda;
import br.com.gestpro.venda.model.Venda;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.caixa.repository.CaixaRepository;
import br.com.gestpro.cliente.repository.ClienteRepository;
import br.com.gestpro.produto.repository.ProdutoRepository;
import br.com.gestpro.venda.repository.VendaRepository;
import br.com.gestpro.infra.exception.ApiException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class VendaServiceImpl implements VendaServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(VendaServiceImpl.class);

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CaixaRepository caixaRepository;
    private final ClienteRepository clienteRepository;

    public VendaServiceImpl(VendaRepository vendaRepository,
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

    /**
     * Registra uma venda:
     * - valida dados
     * - decrementa estoque dos produtos
     * - associa itens à venda
     * - atualiza total do caixa
     * - invalida cache 'dashboard' para o usuário (cache key = email do usuário)
     */
    @Override
    @Transactional
    @CacheEvict(value = {"dashboard-v2", "grafico-metodos", "grafico-produtos", "grafico-vendas-diarias"}, key = "#email")
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

        // Processa itens: valida produto, decrementa estoque e cria ItemVenda
        for (RegistrarVendaDTO.ItemVendaDTO itemDTO : dto.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getIdProduto())
                    .orElseThrow(() -> new ApiException("Produto não encontrado: " + itemDTO.getIdProduto(), HttpStatus.BAD_REQUEST, "/api/vendas"));

            int quantidade = itemDTO.getQuantidade() != null ? itemDTO.getQuantidade() : 1;
            if (produto.getQuantidadeEstoque() < quantidade) {
                throw new ApiException("Estoque insuficiente para o produto: " + produto.getNome(), HttpStatus.BAD_REQUEST, "/api/vendas");
            }

            // decrementa estoque e persiste a alteração do produto
            produto.setQuantidadeEstoque(produto.getQuantidadeEstoque() - quantidade);
            produtoRepository.save(produto);

            ItemVenda itemVenda = new ItemVenda();
            itemVenda.setVenda(venda);
            itemVenda.setProduto(produto);
            itemVenda.setQuantidade(quantidade);
            itemVenda.setPrecoUnitario(produto.getPreco());
            itemVenda.calcularSubtotal();

            total = total.add(itemVenda.getSubtotal());
            itens.add(itemVenda);
        }

        venda.setItens(itens);

        BigDecimal desconto = dto.getDesconto() != null ? dto.getDesconto() : BigDecimal.ZERO;
        venda.setTotal(total);
        venda.setValorFinal(total.subtract(desconto).max(BigDecimal.ZERO));

        Venda salvo = vendaRepository.save(venda);

        // Atualiza o caixa: soma ao total de vendas do caixa
        BigDecimal novoTotalVendas = caixa.getTotalVendas() != null ? caixa.getTotalVendas().add(salvo.getValorFinal()) : salvo.getValorFinal();
        caixa.setTotalVendas(novoTotalVendas);
        caixaRepository.save(caixa);

        log.info("Venda registrada com sucesso. vendaId={}, usuario={}, caixaId={}, valorFinal={}",
                salvo.getId(), usuario.getEmail(), caixa.getId(), salvo.getValorFinal());

        return salvo;
    }

    @Override
    public List<Venda> listarPorCaixa(Long idCaixa) {
        return vendaRepository.findByCaixaId(idCaixa);
    }

    @Override
    public Venda buscarPorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new ApiException("Venda não encontrada", HttpStatus.NOT_FOUND, "/api/vendas/"));
    }
}
