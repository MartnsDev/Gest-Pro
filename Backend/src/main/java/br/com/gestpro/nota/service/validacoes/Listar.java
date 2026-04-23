package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.TipoNota;
import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Serviço responsável por listar notas fiscais com filtros e paginação.
 */
public class Listar {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final NotaFiscalRepository notaRepo;

    public Listar(NotaFiscalRepository notaRepo) {
        this.notaRepo = notaRepo;
    }

    public Map<String, Object> listar(NotaFiscalDTOs.FilterNotaFiscalDTO filter) {

        int page  = filter.getPage()  != null ? filter.getPage()  : 1;
        int limit = filter.getLimit() != null ? filter.getLimit() : 20;

        Pageable pageable = PageRequest.of(
                Math.max(0, page - 1),
                Math.min(100, limit),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        LocalDateTime inicio = parseDate(filter.getDataInicio(), true);
        LocalDateTime fim    = parseDate(filter.getDataFim(), false);

        Page<NotaFiscal> resultado = notaRepo.findWithFilters(
                blankToNull(filter.getEmpresaId()),
                filter.getStatus(),
                filter.getTipo(),
                blankToNull(filter.getClienteNome()),
                inicio,
                fim,
                pageable
        );

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("data",       resultado.getContent().stream().map(this::notaResumo).toList());
        resposta.put("total",      resultado.getTotalElements());
        resposta.put("pages",      resultado.getTotalPages());
        resposta.put("page",       page);
        resposta.put("limit",      limit);
        resposta.put("hasNext",    resultado.hasNext());
        resposta.put("hasPrevious", resultado.hasPrevious());
        return resposta;
    }

    // ── Mapa resumido para listagem (sem todos os campos de endereço) ──────────
    private Map<String, Object> notaResumo(NotaFiscal n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",              n.getId());
        m.put("numero",          n.getNumero());
        m.put("tipo",            n.getTipo());
        m.put("status",          n.getStatus());
        m.put("empresaId",       n.getEmpresaId());
        m.put("empresaNome",     n.getEmpresaNome());
        m.put("clienteNome",     n.getClienteNome());
        m.put("clienteCpfCnpj",  n.getClienteCpfCnpj());
        m.put("clienteEmail",    n.getClienteEmail());
        m.put("clienteCidade",   n.getClienteCidade());
        m.put("clienteEstado",   n.getClienteEstado());
        m.put("subtotal",        n.getSubtotal());
        m.put("desconto",        n.getDesconto());
        m.put("valorDesconto",   n.getValorDesconto());
        m.put("impostos",        n.getImpostos());
        m.put("valorImpostos",   n.getValorImpostos());
        m.put("total",           n.getTotal());
        m.put("formaPagamento",  n.getFormaPagamento());
        m.put("chaveAcesso",     n.getChaveAcesso());
        m.put("protocolo",       n.getProtocolo());
        m.put("dataEmissao",     n.getDataEmissao());
        m.put("dataCancelamento",n.getDataCancelamento());
        m.put("motivoCancelamento", n.getMotivoCancelamento());
        m.put("vendaId",         n.getVendaId());
        m.put("createdAt",       n.getCreatedAt());
        m.put("updatedAt",       n.getUpdatedAt());
        return m;
    }

    private LocalDateTime parseDate(String s, boolean startOfDay) {
        if (s == null || s.isBlank()) return null;
        try {
            LocalDate d = LocalDate.parse(s.trim(), DATE_FMT);
            return startOfDay ? d.atStartOfDay() : d.atTime(23, 59, 59);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private String blankToNull(String s) {
        return (s != null && !s.isBlank()) ? s.trim() : null;
    }
}
