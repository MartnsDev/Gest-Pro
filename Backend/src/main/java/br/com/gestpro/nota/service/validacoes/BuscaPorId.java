package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Serviço responsável por buscar uma nota fiscal por ID,
 * incluindo seus itens e convertendo para Map.
 */
@Slf4j
@Service
@RequiredArgsConstructor // <-- Lombok injeta os repositórios automaticamente
public class BuscaPorId {

    private final NotaFiscalRepository notaRepo;
    private final ItemNotaFiscalRepository itemRepo;

    /**
     * Retorna um Map com as chaves "nota" e "itens".
     * Lança a nossa ApiException padrão (Erro 404) se a nota não existir.
     */
    public Map<String, Object> buscarPorId(Long id) { // Ajustado para Long (padrão do nosso BD)
        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Tentativa de buscar nota inexistente: ID={}", id);
                    return new ApiException(
                            "Nota fiscal não encontrada com o ID: " + id,
                            HttpStatus.NOT_FOUND,
                            "/api/nota-fiscal"
                    );
                });

        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("nota", notaParaMap(nota));
        resultado.put("itens", itens.stream().map(this::itemParaMap).collect(Collectors.toList()));
        return resultado;
    }

    /**
     * Retorna a entidade NotaFiscal diretamente (para uso interno entre serviços).
     */
    public NotaFiscal buscarEntidade(Long id) {
        return notaRepo.findById(id)
                .orElseThrow(() -> new ApiException(
                        "Nota fiscal não encontrada: " + id,
                        HttpStatus.NOT_FOUND,
                        "/api/nota-fiscal"
                ));
    }

    // ────────────────────────────────────────────────────────────────────────
    // Serialização manual (evita dependência complexa do Jackson nesse nível)
    // ────────────────────────────────────────────────────────────────────────

    Map<String, Object> notaParaMap(NotaFiscal n) {
        Map<String, Object> m = new HashMap<>();

        // Dados Base
        m.put("id", n.getId());
        m.put("numeroNota", n.getNumeroNota());
        m.put("serie", n.getSerie());
        m.put("tipo", n.getTipo());
        m.put("status", n.getStatus());

        // Relacionamentos e Identificações
        m.put("empresaId", n.getEmpresaId());
        m.put("clienteId", n.getClienteId());
        m.put("clienteNome", n.getClienteNome());
        m.put("clienteCpfCnpj", n.getClienteCpfCnpj());

        // Valores Financeiros
        m.put("valorProdutos", n.getValorProdutos());
        m.put("valorFrete", n.getValorFrete());
        m.put("valorDesconto", n.getValorDesconto());
        m.put("valorIcms", n.getValorIcms());
        m.put("valorPis", n.getValorPis());
        m.put("valorCofins", n.getValorCofins());
        m.put("valorTotal", n.getValorTotal());

        // Outros Dados da SEFAZ
        m.put("naturezaOperacao", n.getNaturezaOperacao());
        m.put("formaPagamento", n.getFormaPagamento());
        m.put("chaveAcesso", n.getChaveAcesso());
        m.put("protocolo", n.getProtocolo());
        m.put("motivoRejeicao", n.getMotivoRejeicao());
        m.put("informacoesAdicionais", n.getInformacoesAdicionais());

        // Datas
        m.put("dataEmissao", n.getDataEmissao());
        m.put("dataAutorizacao", n.getDataAutorizacao());
        m.put("createdAt", n.getCreatedAt());
        m.put("updatedAt", n.getUpdatedAt());

        return m;
    }

    private Map<String, Object> itemParaMap(ItemNotaFiscal i) {
        Map<String, Object> m = new HashMap<>();

        m.put("id", i.getId());
        m.put("produtoId", i.getProdutoId());
        m.put("codigoProduto", i.getCodigoProduto());
        m.put("descricao", i.getDescricao());
        m.put("ncm", i.getNcm());
        m.put("cfop", i.getCfop());
        m.put("unidade", i.getUnidade());

        // Quantidades e Valores
        m.put("quantidade", i.getQuantidade());
        m.put("valorUnitario", i.getValorUnitario());
        m.put("valorBruto", i.getValorBruto());
        m.put("valorDesconto", i.getValorDesconto());
        m.put("valorTotal", i.getValorTotal());

        // Tributos Internos
        m.put("csosn", i.getCsosn());
        m.put("cstIcms", i.getCstIcms());
        m.put("icmsValor", i.getIcmsValor());
        m.put("pisValor", i.getPisValor());
        m.put("cofinsValor", i.getCofinsValor());
        m.put("numeroItem", i.getNumeroItem());

        return m;
    }
}