package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Serviço responsável por montar o conjunto de dados necessário para
 * renderizar o DANFE (Documento Auxiliar da Nota Fiscal Eletrônica).
 *
 * O retorno é um Map com todas as seções do DANFE:
 *  - cabecalho        → dados do documento
 *  - emitente         → dados da empresa emissora
 *  - destinatario     → dados do cliente
 *  - itens            → lista de produtos/serviços
 *  - totais           → valores financeiros consolidados
 *  - pagamento        → forma de pagamento
 *  - observacoes      → informações adicionais
 *  - chaveFormatada   → chave de acesso com espaços para leitura
 *  - codigoBarras     → representação textual para geração de barcode
 */
public class GerarDadosDanfe {

    private static final DateTimeFormatter DANFE_DATE =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final DateTimeFormatter DANFE_DATE_ONLY =
            DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final NotaFiscalRepository     notaRepo;
    private final ItemNotaFiscalRepository itemRepo;

    public GerarDadosDanfe(NotaFiscalRepository notaRepo,
                           ItemNotaFiscalRepository itemRepo) {
        this.notaRepo = notaRepo;
        this.itemRepo = itemRepo;
    }

    public Map<String, Object> gerarDadosDanfe(UUID id) {

        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Nota fiscal não encontrada: " + id));

        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);

        Map<String, Object> danfe = new LinkedHashMap<>();

        // ── Cabeçalho ─────────────────────────────────────────────────────────
        Map<String, Object> cab = new LinkedHashMap<>();
        cab.put("titulo",            tituloPorTipo(nota.getTipo().name()));
        cab.put("numero",            nota.getNumero());
        cab.put("serie",             "001");
        cab.put("modelo",            modeloPorTipo(nota.getTipo().name()));
        cab.put("status",            nota.getStatus().name());
        cab.put("dataEmissao",       nota.getDataEmissao() != null
                ? nota.getDataEmissao().format(DANFE_DATE) : null);
        cab.put("dataCriacao",       nota.getCreatedAt() != null
                ? nota.getCreatedAt().format(DANFE_DATE) : null);
        cab.put("protocolo",         nota.getProtocolo());
        cab.put("chaveAcesso",       nota.getChaveAcesso());
        cab.put("chaveFormatada",    formatarChave(nota.getChaveAcesso()));
        danfe.put("cabecalho", cab);

        // ── Emitente ──────────────────────────────────────────────────────────
        Map<String, Object> emit = new LinkedHashMap<>();
        emit.put("razaoSocial",        nota.getEmpresaNome());
        emit.put("cnpj",               formatarCnpj(nota.getEmpresaCnpj()));
        emit.put("cnpjLimpo",          limpar(nota.getEmpresaCnpj()));
        emit.put("inscricaoEstadual",  nota.getEmpresaInscricaoEstadual());
        emit.put("endereco",           nota.getEmpresaEndereco());
        emit.put("cidade",             nota.getEmpresaCidade());
        emit.put("estado",             nota.getEmpresaEstado());
        emit.put("cep",                formatarCep(nota.getEmpresaCep()));
        emit.put("telefone",           nota.getEmpresaTelefone());
        emit.put("email",              nota.getEmpresaEmail());
        danfe.put("emitente", emit);

        // ── Destinatário ──────────────────────────────────────────────────────
        Map<String, Object> dest = new LinkedHashMap<>();
        dest.put("nome",         nota.getClienteNome());
        dest.put("cpfCnpj",      formatarCpfCnpj(nota.getClienteCpfCnpj()));
        dest.put("cpfCnpjLimpo", limpar(nota.getClienteCpfCnpj()));
        dest.put("email",        nota.getClienteEmail());
        dest.put("telefone",     nota.getClienteTelefone());
        dest.put("endereco",     nota.getClienteEndereco());
        dest.put("cidade",       nota.getClienteCidade());
        dest.put("estado",       nota.getClienteEstado());
        dest.put("cep",          formatarCep(nota.getClienteCep()));
        danfe.put("destinatario", dest);

        // ── Itens ─────────────────────────────────────────────────────────────
        List<Map<String, Object>> itensMap = new ArrayList<>();
        int seq = 1;
        for (ItemNotaFiscal item : itens) {
            Map<String, Object> i = new LinkedHashMap<>();
            i.put("sequencia",     seq++);
            i.put("codigo",        item.getCodigo());
            i.put("descricao",     item.getDescricao());
            i.put("ncm",           item.getNcm());
            i.put("cfop",          item.getCfop());
            i.put("unidade",       item.getUnidade());
            i.put("quantidade",    item.getQuantidade());
            i.put("valorUnitario", item.getValorUnitario());
            i.put("desconto",      item.getDesconto());
            i.put("icms",          item.getIcms());
            i.put("pis",           item.getPis());
            i.put("cofins",        item.getCofins());
            i.put("valorTotal",    item.getValorTotal());

            // Valores calculados para exibição no DANFE
            BigDecimal vDesc = item.getValorUnitario()
                    .multiply(item.getQuantidade())
                    .multiply(item.getDesconto().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                    .setScale(2, RoundingMode.HALF_UP);
            i.put("valorDescontoItem", vDesc);

            BigDecimal vIcms = item.getValorTotal()
                    .multiply(item.getIcms().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                    .setScale(2, RoundingMode.HALF_UP);
            i.put("valorIcms", vIcms);

            itensMap.add(i);
        }
        danfe.put("itens", itensMap);

        // ── Totais ────────────────────────────────────────────────────────────
        Map<String, Object> totais = new LinkedHashMap<>();
        totais.put("subtotal",       nota.getSubtotal());
        totais.put("pctDesconto",    nota.getDesconto());
        totais.put("valorDesconto",  nota.getValorDesconto());
        totais.put("pctImpostos",    nota.getImpostos());
        totais.put("valorImpostos",  nota.getValorImpostos());
        totais.put("totalNota",      nota.getTotal());
        totais.put("qtdItens",       itens.size());

        // Totais de tributos por item
        BigDecimal totalIcms = itens.stream()
                .map(it -> it.getValorTotal()
                        .multiply(it.getIcms().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalPis = itens.stream()
                .map(it -> it.getValorTotal()
                        .multiply(it.getPis().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalCofins = itens.stream()
                .map(it -> it.getValorTotal()
                        .multiply(it.getCofins().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        totais.put("totalIcms",   totalIcms);
        totais.put("totalPis",    totalPis);
        totais.put("totalCofins", totalCofins);
        danfe.put("totais", totais);

        // ── Pagamento ─────────────────────────────────────────────────────────
        Map<String, Object> pgto = new LinkedHashMap<>();
        pgto.put("forma",       nota.getFormaPagamento());
        pgto.put("formaLabel",  labelPagamento(nota.getFormaPagamento().name()));
        pgto.put("valor",       nota.getTotal());
        danfe.put("pagamento", pgto);

        // ── Observações ───────────────────────────────────────────────────────
        danfe.put("observacoes",      nota.getObservacoes());
        danfe.put("motivoCancelamento", nota.getMotivoCancelamento());

        // ── QR Code / Código de barras ────────────────────────────────────────
        // Em produção, usar biblioteca ZXing para gerar o PNG do código de barras.
        // Aqui exportamos a string base para o frontend renderizar.
        danfe.put("codigoBarras",    nota.getChaveAcesso());
        danfe.put("urlConsulta",     gerarUrlConsulta(nota));

        return danfe;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String tituloPorTipo(String tipo) {
        return switch (tipo) {
            case "NFe"  -> "DANFE - Documento Auxiliar da Nota Fiscal Eletrônica";
            case "NFCE" -> "DANFE NFC-e - Nota Fiscal de Consumidor Eletrônica";
            case "NFS"  -> "Nota Fiscal de Serviços Eletrônica";
            default     -> "Nota Fiscal";
        };
    }

    private String modeloPorTipo(String tipo) {
        return switch (tipo) {
            case "NFe"  -> "55";
            case "NFCE" -> "65";
            default     -> "99";
        };
    }

    private String formatarChave(String chave) {
        if (chave == null || chave.length() != 44) return chave;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 44; i += 4) {
            if (sb.length() > 0) sb.append(' ');
            sb.append(chave, i, Math.min(i + 4, 44));
        }
        return sb.toString();
    }

    private String formatarCnpj(String cnpj) {
        if (cnpj == null) return null;
        String n = cnpj.replaceAll("\\D", "");
        if (n.length() != 14) return cnpj;
        return String.format("%s.%s.%s/%s-%s",
                n.substring(0, 2), n.substring(2, 5),
                n.substring(5, 8), n.substring(8, 12), n.substring(12));
    }

    private String formatarCpfCnpj(String doc) {
        if (doc == null) return null;
        String n = doc.replaceAll("\\D", "");
        if (n.length() == 11)
            return String.format("%s.%s.%s-%s",
                    n.substring(0, 3), n.substring(3, 6),
                    n.substring(6, 9), n.substring(9));
        if (n.length() == 14) return formatarCnpj(n);
        return doc;
    }

    private String formatarCep(String cep) {
        if (cep == null) return null;
        String n = cep.replaceAll("\\D", "");
        if (n.length() == 8) return n.substring(0, 5) + "-" + n.substring(5);
        return cep;
    }

    private String limpar(String s) {
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
        // URL padrão do portal da SEFAZ para consulta de NF-e
        if (nota.getChaveAcesso() == null) return null;
        return "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&nfe="
                + nota.getChaveAcesso();
    }
}
