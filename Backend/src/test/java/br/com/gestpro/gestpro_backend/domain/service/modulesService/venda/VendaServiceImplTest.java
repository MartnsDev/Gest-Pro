package br.com.gestpro.gestpro_backend.domain.service.modulesService.venda;

import br.com.gestpro.gestpro_backend.api.dto.modules.vendas.RegistrarVendaDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.vendas.RegistrarVendaDTO.ItemVendaDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.modules.caixa.Caixa;
import br.com.gestpro.gestpro_backend.domain.model.modules.produto.Produto;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.CaixaRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.ClienteRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.ProdutoRepository;
import br.com.gestpro.gestpro_backend.domain.repository.modules.VendaRepository;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendaServiceImplTest {

    @Mock
    private VendaRepository vendaRepository;
    @Mock
    private ProdutoRepository produtoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CaixaRepository caixaRepository;
    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private VendaServiceImpl vendaService;

    @BeforeEach
    void setup() {
        // MockitoExtension já inicializa os mocks automaticamente
    }

    @Test
    void registrarVenda_sucesso() {
        // preparar DTO
        ItemVendaDTO item = ItemVendaDTO.builder().idProduto(1L).quantidade(2).build();
        RegistrarVendaDTO dto = RegistrarVendaDTO.builder()
                .emailUsuario("u@teste.com")
                .idCaixa(10L)
                .itens(List.of(item))
                .desconto(BigDecimal.ZERO)
                .build();

        // mocks
        Usuario usuario = new Usuario();
        usuario.setId(5L);
        when(usuarioRepository.findByEmail("u@teste.com")).thenReturn(Optional.of(usuario));

        Caixa caixa = new Caixa();
        caixa.setId(10L);
        caixa.setTotalVendas(BigDecimal.ZERO);
        when(caixaRepository.findById(10L)).thenReturn(Optional.of(caixa));

        Produto produto = new Produto();
        produto.setId(1L);
        produto.setNome("Produto X");
        produto.setPreco(new BigDecimal("10.00"));
        produto.setQuantidadeEstoque(5);
        when(produtoRepository.findById(1L)).thenReturn(Optional.of(produto));

        when(vendaRepository.save(any(Venda.class))).thenAnswer(invocation -> {
            Venda v = invocation.getArgument(0);
            v.setId(100L);
            return v;
        });

        // executar
        Venda resultado = vendaService.registrarVenda(dto);

        // verificações básicas
        assertNotNull(resultado, "Venda não deve ser nula");
        assertEquals(100L, resultado.getId(), "ID da venda salva deve ser 100L");

        // produto estoque diminuiu de 5 para 3
        assertEquals(3, produto.getQuantidadeEstoque(), "Estoque do produto deve ter sido decrementado");

        // interações com repositórios
        verify(produtoRepository, times(1)).save(produto);
        verify(caixaRepository, times(1)).save(caixa);
        verify(vendaRepository, times(1)).save(any(Venda.class));
    }

    @Test
    void registrarVenda_estoqueInsuficiente_deveLancarApiException() {
        ItemVendaDTO item = ItemVendaDTO.builder().idProduto(2L).quantidade(10).build();
        RegistrarVendaDTO dto = RegistrarVendaDTO.builder()
                .emailUsuario("u2@teste.com")
                .idCaixa(11L)
                .itens(List.of(item))
                .build();

        Usuario usuario = new Usuario();
        usuario.setId(6L);
        when(usuarioRepository.findByEmail("u2@teste.com")).thenReturn(Optional.of(usuario));

        Caixa caixa = new Caixa();
        caixa.setId(11L);
        caixa.setTotalVendas(BigDecimal.ZERO);
        when(caixaRepository.findById(11L)).thenReturn(Optional.of(caixa));

        Produto produto = new Produto();
        produto.setId(2L);
        produto.setNome("Produto Y");
        produto.setPreco(new BigDecimal("5.00"));
        produto.setQuantidadeEstoque(3); // estoque insuficiente
        when(produtoRepository.findById(2L)).thenReturn(Optional.of(produto));

        ApiException ex = assertThrows(ApiException.class, () -> vendaService.registrarVenda(dto));
        assertTrue(ex.getMessage().contains("Estoque insuficiente"));

        // Não deve salvar nada se houve erro
        verify(produtoRepository, never()).save(any());
        verify(vendaRepository, never()).save(any());
    }
}
