package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;


@Slf4j
@Service
@RequiredArgsConstructor
public class GerarDadosDanfe {

    private static final DateTimeFormatter DANFE_DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final NotaFiscalRepository     notaRepo;
    private final ItemNotaFiscalRepository itemRepo;

    // =========================================================================
    // Ponto de entrada
    // =========================================================================
    @Transactional(readOnly = true)
    public Map<String, Object> gerarDadosDanfe(Long id) {

        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Nota fiscal não encontrada: " + id));

        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);

        Map<String, Object> danfe = new LinkedHashMap<>();

        // ── Cabeçalho ──────────────────────────────────────────────────────────
        Map<String, Object> cab = new LinkedHashMap<>();
        cab.put("titulo",         tituloPorTipo(nota.getTipo().name()));
        cab.put("modelo",         modeloPorTipo(nota.getTipo().name()));
        cab.put("numero",         nota.getNumeroNota() != null
                ? String.format("%09d", nota.getNumeroNota()) : null);
        cab.put("serie",          nota.getSerie());
        cab.put("status",         nota.getStatus() != null ? nota.getStatus().name() : null);
        cab.put("dataEmissao",    nota.getDataEmissao() != null
                ? nota.getDataEmissao().format(DANFE_DATE) : null);
        cab.put("dataAutorizacao",nota.getDataAutorizacao() != null
                ? nota.getDataAutorizacao().format(DANFE_DATE) : null);
        cab.put("protocolo",      nota.getProtocolo());
        cab.put("chaveAcesso",    nota.getChaveAcesso());
        cab.put("chaveFormatada", formatarChave(nota.getChaveAcesso()));
        cab.put("createdAt",      nota.getCreatedAt() != null
                ? nota.getCreatedAt().format(DANFE_DATE) : null);
        danfe.put("cabecalho", cab);

        // ── Emitente ─────────────────────────────────────────────────────────
        // Os dados do emitente devem ser buscados via EmpresaService na camada de serviço.
        // Aqui exportamos apenas os IDs para que o frontend possa enriquecer se necessário.
        Map<String, Object> emit = new LinkedHashMap<>();
        emit.put("empresaId", nota.getEmpresaId());
        // TODO: Injetar EmpresaService e enriquecer com razaoSocial, cnpj, endereço, etc.
        danfe.put("emitente", emit);

        // ── Destinatário ─────────────────────────────────────────────────────
        Map<String, Object> dest = new LinkedHashMap<>();
        dest.put("clienteId",    nota.getClienteId());
        dest.put("nome",         nota.getClienteNome());
        dest.put("cpfCnpj",      formatarCpfCnpj(nota.getClienteCpfCnpj()));
        dest.put("cpfCnpjLimpo", digitos(nota.getClienteCpfCnpj()));
        danfe.put("destinatario", dest);

        // ── Itens ─────────────────────────────────────────────────────────────
        List<Map<String, Object>> itensMap = new ArrayList<>();
        int seq = 1;
        for (ItemNotaFiscal item : itens) {
            Map<String, Object> itemMap = new LinkedHashMap<>();
            itemMap.put("sequencia",      seq++);
            itemMap.put("numeroItem",     item.getNumeroItem());
            itemMap.put("codigoProduto",  item.getCodigoProduto());
            itemMap.put("descricao",      item.getDescricao());
            itemMap.put("ncm",            item.getNcm());
            itemMap.put("cfop",           item.getCfop());
            itemMap.put("unidade",        item.getUnidade());
            itemMap.put("quantidade",     item.getQuantidade());
            itemMap.put("valorUnitario",  item.getValorUnitario());
            itemMap.put("valorBruto",     item.getValorBruto());
            itemMap.put("valorDesconto",  item.getValorDesconto());
            itemMap.put("valorTotal",     item.getValorTotal());
            // Tributos calculados e armazenados na entidade
            itemMap.put("csosn",          item.getCsosn());
            itemMap.put("cstIcms",        item.getCstIcms());
            itemMap.put("icmsAliquota",   item.getIcmsAliquota());
            itemMap.put("icmsValor",      item.getIcmsValor());
            itemMap.put("pisAliquota",    item.getPisAliquota());
            itemMap.put("pisValor",       item.getPisValor());
            itemMap.put("cofinsAliquota", item.getCofinsAliquota());
            itemMap.put("cofinsValor",    item.getCofinsValor());
            itensMap.add(itemMap);
        }
        danfe.put("itens", itensMap);

        // ── Totais ────────────────────────────────────────────────────────────
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("valorProdutos", nota.getValorProdutos());
        totais.put("valorFrete",    nota.getValorFrete());
        totais.put("valorDesconto", nota.getValorDesconto());
        totais.put("valorIcms",     nota.getValorIcms());
        totais.put("valorPis",      nota.getValorPis());
        totais.put("valorCofins",   nota.getValorCofins());
        totais.put("valorTotal",    nota.getValorTotal());
        totais.put("qtdItens",      itens.size());

        // Totais calculados somando os valores já persistidos por item
        BigDecimal totalIcmsItens = itens.stream()
                .map(it -> it.getIcmsValor() != null ? it.getIcmsValor() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalPisItens = itens.stream()
                .map(it -> it.getPisValor() != null ? it.getPisValor() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalCofinsItens = itens.stream()
                .map(it -> it.getCofinsValor() != null ? it.getCofinsValor() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        totais.put("totalIcmsItens",   totalIcmsItens);
        totais.put("totalPisItens",    totalPisItens);
        totais.put("totalCofinsItens", totalCofinsItens);
        danfe.put("totais", totais);

        // ── Pagamento ─────────────────────────────────────────────────────────
        Map<String, Object> pgto = new LinkedHashMap<>();
        if (nota.getFormaPagamento() != null) {
            pgto.put("forma",      nota.getFormaPagamento().name());
            pgto.put("formaLabel", labelPagamento(nota.getFormaPagamento().name()));
            pgto.put("codigo",     nota.getFormaPagamento().getCodigo());
        }
        pgto.put("valor", nota.getValorTotal());
        danfe.put("pagamento", pgto);

        // ── Observações e rastreabilidade ────────────────────────────────────
        danfe.put("naturezaOperacao",    nota.getNaturezaOperacao());
        danfe.put("informacoesAdicionais", nota.getInformacoesAdicionais());
        danfe.put("motivoRejeicao",      nota.getMotivoRejeicao());
        danfe.put("emContingencia",      nota.getEmContingencia());

        // ── QR Code / URL de consulta ─────────────────────────────────────────
        danfe.put("codigoBarras", nota.getChaveAcesso());
        danfe.put("urlConsulta",  gerarUrlConsulta(nota));

        log.info("Dados do DANFE montados para a nota ID={}", id);
        return danfe;
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    private String tituloPorTipo(String tipo) {
        return switch (tipo) {
            case "NFE"  -> "DANFE - Documento Auxiliar da Nota Fiscal Eletrônica";
            case "NFCE" -> "DANFE NFC-e - Nota Fiscal de Consumidor Eletrônica";
            case "NFSE" -> "NFS-e - Nota Fiscal de Serviços Eletrônica";
            default     -> "Nota Fiscal";
        };
    }

    private String modeloPorTipo(String tipo) {
        return switch (tipo) {
            case "NFE"  -> "55";
            case "NFCE" -> "65";
            default     -> "99";
        };
    }

    private String formatarChave(String chave) {
        if (chave == null || chave.length() != 44) return chave;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 44; i += 4) {
            if (!sb.isEmpty()) sb.append(' ');
            sb.append(chave, i, Math.min(i + 4, 44));
        }
        return sb.toString();
    }

    private String formatarCnpj(String cnpj) {
        if (cnpj == null) return null;
        String n = digitos(cnpj);
        if (n.length() != 14) return cnpj;
        return "%s.%s.%s/%s-%s".formatted(
                n.substring(0, 2), n.substring(2, 5),
                n.substring(5, 8), n.substring(8, 12), n.substring(12));
    }

    private String formatarCpfCnpj(String doc) {
        if (doc == null) return null;
        String n = digitos(doc);
        if (n.length() == 11) {
            return "%s.%s.%s-%s".formatted(
                    n.substring(0, 3), n.substring(3, 6),
                    n.substring(6, 9), n.substring(9));
        }
        if (n.length() == 14) return formatarCnpj(n);
        return doc;
    }

    private String digitos(String s) {
        return s != null ? s.replaceAll("\\D", "") : null;
    }

    private String labelPagamento(String forma) {
        return switch (forma) {
            case "DINHEIRO"       -> "Dinheiro";
            case "CARTAO_CREDITO" -> "Cartão de Crédito";
            case "CARTAO_DEBITO"  -> "Cartão de Débito";
            case "PIX"            -> "PIX";
            case "BOLETO"         -> "Boleto Bancário";
            case "TRANSFERENCIA"  -> "Transferência Bancária";
            default               -> forma;
        };
    }

    private String gerarUrlConsulta(NotaFiscal nota) {
        if (nota.getChaveAcesso() == null) return null;
        return "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&nfe="
                + nota.getChaveAcesso();
    }
}