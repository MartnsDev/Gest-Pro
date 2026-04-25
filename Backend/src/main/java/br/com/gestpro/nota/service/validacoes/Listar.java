package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.dto.FilterNotaFiscalDTO;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Serviço responsável por listar notas fiscais com filtros avançados e paginação.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Listar {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private final NotaFiscalRepository notaRepo;

    @Transactional(readOnly = true)
    public Map<String, Object> listar(FilterNotaFiscalDTO filter) {

        // Paginação (Default: página 1, limite 20)
        int page  = filter.getPage()  != null ? filter.getPage()  : 1;
        int limit = filter.getLimit() != null ? filter.getLimit() : 20;

        Pageable pageable = PageRequest.of(
                Math.max(0, page - 1),
                Math.min(100, limit),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        // Tratamento de datas para o filtro
        LocalDateTime inicio = parseDate(filter.getDataInicio(), true);
        LocalDateTime fim    = parseDate(filter.getDataFim(), false);

        log.info("Buscando notas fiscais - Filtros: Empresa={}, Status={}, Tipo={}",
                filter.getEmpresaId(), filter.getStatus(), filter.getTipo());

        // Chamada ao repositório com Query Methods ou @Query
        Page<NotaFiscal> resultado = notaRepo.findWithFilters(
                filter.getEmpresaId(),
                filter.getStatus(),
                filter.getTipo(),
                blankToNull(filter.getClienteNome()),
                inicio,
                fim,
                (java.awt.print.Pageable) pageable
        );

        // Montagem da resposta paginada para o Frontend
        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("data",         resultado.getContent().stream().map(this::notaResumo).collect(Collectors.toList()));
        resposta.put("total",        resultado.getTotalElements());
        resposta.put("pages",        resultado.getTotalPages());
        resposta.put("page",         page);
        resposta.put("limit",        limit);
        resposta.put("hasNext",      resultado.hasNext());
        resposta.put("hasPrevious",  resultado.hasPrevious());

        return resposta;
    }

    /**
     * Mapeia a entidade para um resumo leve.
     * Evitamos enviar campos pesados como XML ou caminhos de arquivos para a listagem.
     */
    private Map<String, Object> notaResumo(NotaFiscal n) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",              n.getId());
        m.put("numeroNota",      n.getNumeroNota());
        m.put("serie",           n.getSerie());
        m.put("tipo",            n.getTipo());
        m.put("status",          n.getStatus());
        m.put("clienteNome",     n.getClienteNome());
        m.put("clienteCpfCnpj",  n.getClienteCpfCnpj());
        m.put("valorTotal",      n.getValorTotal()); // Nome corrigido conforme nossa entidade
        m.put("chaveAcesso",     n.getChaveAcesso());
        m.put("protocolo",       n.getProtocolo());
        m.put("dataEmissao",     n.getDataEmissao());
        m.put("createdAt",       n.getCreatedAt());
        return m;
    }

    // --- Helpers de tratamento ---

    private LocalDateTime parseDate(String s, boolean startOfDay) {
        if (s == null || s.isBlank()) return null;
        try {
            LocalDate d = LocalDate.parse(s.trim(), DATE_FMT);
            return startOfDay ? d.atStartOfDay() : d.atTime(23, 59, 59);
        } catch (DateTimeParseException e) {
            log.warn("Data inválida recebida no filtro: {}", s);
            return null;
        }
    }

    private String blankToNull(String s) {
        return (s != null && !s.isBlank()) ? s.trim() : null;
    }
}