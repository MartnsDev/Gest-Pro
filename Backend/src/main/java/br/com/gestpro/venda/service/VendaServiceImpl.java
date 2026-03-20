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
import org.springframework.cache.annotation.Caching;
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

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = "grafico:pagamento", key = "#dto.emailUsuario.toLowerCase()"),
            @CacheEvict(cacheNames = "grafico:produto",   key = "#dto.emailUsuario.toLowerCase()"),
            @CacheEvict(cacheNames = "grafico:diarias",   allEntries = true),
            @CacheEvict(cacheNames = "visao:vendas-semana", allEntries = true),
            @CacheEvict(cacheNames = "visao:estoque-zerado", key = "#dto.emailUsuario")
    })
    public Venda registrarVenda(RegistrarVendaDTO dto) {
        if (dto.getItens() == null || dto.getItens().isEmpty()) {
            throw new ApiException("Nenhum item enviado para a venda", HttpStatus.BAD_REQUEST, "/api/v1/vendas/registrar");
        }

        Usuario usuario = usuarioRepository.findByEmail(dto.getEmailUsuario())
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND, "/api/v1/vendas/registrar"));

        Caixa caixa = caixaRepository.findById(dto.getIdCaixa())
                .orElseThrow(() -> new ApiException("Caixa não encontrado", HttpStatus.NOT_FOUND, "/api/v1/vendas/registrar"));

        if (!caixa.getAberto()) {
            throw new ApiException("O caixa selecionado está fechado.", HttpStatus.BAD_REQUEST, "/api/v1/vendas/registrar");
        }

        Cliente cliente = null;
        if (dto.getIdCliente() != null) {
            cliente = clienteRepository.findById(dto.getIdCliente())
                    .orElseThrow(() -> new ApiException("Cliente não encontrado", HttpStatus.NOT_FOUND, "/api/v1/vendas/registrar"));
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
                    .orElseThrow(() -> new ApiException("Produto não encontrado: " + itemDTO.getIdProduto(), HttpStatus.NOT_FOUND, "/api/v1/vendas/registrar"));

            int quantidade = itemDTO.getQuantidade() != null ? itemDTO.getQuantidade() : 1;

            if (produto.getQuantidadeEstoque() < quantidade) {
                throw new ApiException("Estoque insuficiente para: " + produto.getNome(), HttpStatus.BAD_REQUEST, "/api/v1/vendas/registrar");
            }

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

        BigDecimal novoTotal = caixa.getTotalVendas() != null
                ? caixa.getTotalVendas().add(salvo.getValorFinal())
                : salvo.getValorFinal();
        caixa.setTotalVendas(novoTotal);
        caixaRepository.save(caixa);

        log.info("Venda registrada. vendaId={}, usuario={}, caixaId={}, valorFinal={}",
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
                .orElseThrow(() -> new ApiException("Venda não encontrada", HttpStatus.NOT_FOUND, "/api/v1/vendas/"));
    }
}