package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Serviço responsável por buscar uma nota fiscal por ID,
 * incluindo seus itens.
 */
public class BuscaPorId {

    private final NotaFiscalRepository    notaRepo;
    private final ItemNotaFiscalRepository itemRepo;

    public BuscaPorId(NotaFiscalRepository notaRepo,
                      ItemNotaFiscalRepository itemRepo) {
        this.notaRepo  = notaRepo;
        this.itemRepo  = itemRepo;
    }

    /**
     * Retorna um Map com as chaves "nota" e "itens".
     * Lança 404 se a nota não existir.
     */
    public Map<String, Object> buscarPorId(UUID id) {
        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Nota fiscal não encontrada: " + id));

        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("nota", notaParaMap(nota));
        resultado.put("itens", itens.stream().map(this::itemParaMap).toList());
        return resultado;
    }

    /**
     * Retorna a entidade NotaFiscal diretamente (para uso interno entre serviços).
     */
    public NotaFiscal buscarEntidade(UUID id) {
        return notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Nota fiscal não encontrada: " + id));
    }

    // ── Serialização manual (evita dependência do Jackson nesse nível) ─────────

    public Map<String, Object> notaParaMap(NotaFiscal n) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",                    n.getId());
        m.put("numero",                n.getNumero());
        m.put("tipo",                  n.getTipo());
        m.put("status",                n.getStatus());
        m.put("empresaId",             n.getEmpresaId());
        m.put("empresaNome",           n.getEmpresaNome());
        m.put("empresaCnpj",           n.getEmpresaCnpj());
        m.put("empresaInscricaoEstadual", n.getEmpresaInscricaoEstadual());
        m.put("empresaEndereco",       n.getEmpresaEndereco());
        m.put("empresaCidade",         n.getEmpresaCidade());
        m.put("empresaEstado",         n.getEmpresaEstado());
        m.put("empresaCep",            n.getEmpresaCep());
        m.put("empresaTelefone",       n.getEmpresaTelefone());
        m.put("empresaEmail",          n.getEmpresaEmail());
        m.put("clienteId",             n.getClienteId());
        m.put("clienteNome",           n.getClienteNome());
        m.put("clienteCpfCnpj",        n.getClienteCpfCnpj());
        m.put("clienteEmail",          n.getClienteEmail());
        m.put("clienteTelefone",       n.getClienteTelefone());
        m.put("clienteEndereco",       n.getClienteEndereco());
        m.put("clienteCidade",         n.getClienteCidade());
        m.put("clienteEstado",         n.getClienteEstado());
        m.put("clienteCep",            n.getClienteCep());
        m.put("subtotal",              n.getSubtotal());
        m.put("desconto",              n.getDesconto());
        m.put("valorDesconto",         n.getValorDesconto());
        m.put("impostos",              n.getImpostos());
        m.put("valorImpostos",         n.getValorImpostos());
        m.put("total",                 n.getTotal());
        m.put("formaPagamento",        n.getFormaPagamento());
        m.put("vendaId",               n.getVendaId());
        m.put("observacoes",           n.getObservacoes());
        m.put("chaveAcesso",           n.getChaveAcesso());
        m.put("protocolo",             n.getProtocolo());
        m.put("dataEmissao",           n.getDataEmissao());
        m.put("dataCancelamento",      n.getDataCancelamento());
        m.put("motivoCancelamento",    n.getMotivoCancelamento());
        m.put("createdAt",             n.getCreatedAt());
        m.put("updatedAt",             n.getUpdatedAt());
        return m;
    }

    public Map<String, Object> itemParaMap(ItemNotaFiscal i) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",            i.getId());
        m.put("notaFiscalId",  i.getNotaFiscalId());
        m.put("produtoId",     i.getProdutoId());
        m.put("descricao",     i.getDescricao());
        m.put("codigo",        i.getCodigo());
        m.put("ncm",           i.getNcm());
        m.put("cfop",          i.getCfop());
        m.put("unidade",       i.getUnidade());
        m.put("quantidade",    i.getQuantidade());
        m.put("valorUnitario", i.getValorUnitario());
        m.put("desconto",      i.getDesconto());
        m.put("icms",          i.getIcms());
        m.put("pis",           i.getPis());
        m.put("cofins",        i.getCofins());
        m.put("valorTotal",    i.getValorTotal());
        m.put("createdAt",     i.getCreatedAt());
        return m;
    }
}
