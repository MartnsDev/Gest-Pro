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
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class BuscaPorId {

    private final NotaFiscalRepository     notaRepo;
    private final ItemNotaFiscalRepository itemRepo;

    // =========================================================================
    // API pública
    // =========================================================================

    @Transactional(readOnly = true)
    public Map<String, Object> buscarPorId(Long id) {
        NotaFiscal nota = buscarEntidade(id);
        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("nota",  notaParaMap(nota));
        resultado.put("itens", itens.stream().map(this::itemParaMap).collect(Collectors.toList()));
        return resultado;
    }

    @Transactional(readOnly = true)
    public NotaFiscal buscarEntidade(Long id) {
        return notaRepo.findById(id).orElseThrow(() -> {
            log.warn("Nota fiscal não encontrada: ID={}", id);
            return new ApiException(
                    "Nota fiscal não encontrada com o ID: " + id,
                    HttpStatus.NOT_FOUND,
                    "/api/nota-fiscal"
            );
        });
    }

    // =========================================================================
    // Serialização (acessível a outros serviços do pacote)
    // =========================================================================
    Map<String, Object> notaParaMap(NotaFiscal n) {
        Map<String, Object> m = new HashMap<>();
        // Identificação
        m.put("id",                  n.getId());
        m.put("empresaId",           n.getEmpresaId());
        m.put("clienteId",           n.getClienteId());
        m.put("clienteNome",         n.getClienteNome());
        m.put("clienteCpfCnpj",      n.getClienteCpfCnpj());
        // Tipo / Status / Numeração
        m.put("tipo",                n.getTipo());
        m.put("status",              n.getStatus());
        m.put("numeroNota",          n.getNumeroNota() != null
                ? String.format("%09d", n.getNumeroNota()) : null);
        m.put("serie",               n.getSerie());
        m.put("chaveAcesso",         n.getChaveAcesso());
        // Operação
        m.put("naturezaOperacao",    n.getNaturezaOperacao());
        m.put("formaPagamento",      n.getFormaPagamento());
        // Valores
        m.put("valorProdutos",       n.getValorProdutos());
        m.put("valorFrete",          n.getValorFrete());
        m.put("valorDesconto",       n.getValorDesconto());
        m.put("valorIcms",           n.getValorIcms());
        m.put("valorPis",            n.getValorPis());
        m.put("valorCofins",         n.getValorCofins());
        m.put("valorTotal",          n.getValorTotal());
        // SEFAZ
        m.put("protocolo",           n.getProtocolo());
        m.put("motivoRejeicao",      n.getMotivoRejeicao());
        m.put("informacoesAdicionais", n.getInformacoesAdicionais());
        m.put("emContingencia",      n.getEmContingencia());
        // Datas
        m.put("dataEmissao",         n.getDataEmissao());
        m.put("dataAutorizacao",     n.getDataAutorizacao());
        m.put("createdAt",           n.getCreatedAt());
        m.put("updatedAt",           n.getUpdatedAt());
        return m;
    }

    private Map<String, Object> itemParaMap(ItemNotaFiscal i) {
        Map<String, Object> m = new HashMap<>();
        // Identificação
        m.put("id",                i.getId());
        m.put("produtoId",         i.getProdutoId());
        m.put("codigoProduto",     i.getCodigoProduto());
        m.put("descricao",         i.getDescricao());
        m.put("ncm",               i.getNcm());
        m.put("cfop",              i.getCfop());
        m.put("unidade",           i.getUnidade());
        m.put("numeroItem",        i.getNumeroItem());
        // Quantidades e Valores
        m.put("quantidade",        i.getQuantidade());
        m.put("valorUnitario",     i.getValorUnitario());
        m.put("valorBruto",        i.getValorBruto());
        m.put("valorDesconto",     i.getValorDesconto());
        m.put("valorTotal",        i.getValorTotal());
        // Tributos
        m.put("csosn",             i.getCsosn());
        m.put("cstIcms",           i.getCstIcms());
        m.put("icmsBaseCalculo",   i.getIcmsBaseCalculo());
        m.put("icmsAliquota",      i.getIcmsAliquota());
        m.put("icmsValor",         i.getIcmsValor());
        m.put("cstPis",            i.getCstPis());
        m.put("pisBaseCalculo",    i.getPisBaseCalculo());
        m.put("pisAliquota",       i.getPisAliquota());
        m.put("pisValor",          i.getPisValor());
        m.put("cstCofins",         i.getCstCofins());
        m.put("cofinsBaseCalculo", i.getCofinsBaseCalculo());
        m.put("cofinsAliquota",    i.getCofinsAliquota());
        m.put("cofinsValor",       i.getCofinsValor());
        return m;
    }
}