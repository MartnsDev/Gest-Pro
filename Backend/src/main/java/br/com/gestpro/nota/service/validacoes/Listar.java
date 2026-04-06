package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class Listar {

    private final NotaFiscalRepository notaRepo;

    public Listar(NotaFiscalRepository notaRepo) {
        this.notaRepo = notaRepo;
    }

    public Map<String, Object> listar(NotaFiscalDTOs.FilterNotaFiscalDTO filter) {
        int page  = filter.getPage()  != null ? filter.getPage()  - 1 : 0;
        int limit = filter.getLimit() != null ? filter.getLimit()     : 20;

        LocalDateTime inicio = null, fim = null;
        if (filter.getDataInicio() != null) inicio = LocalDateTime.parse(filter.getDataInicio() + "T00:00:00");
        if (filter.getDataFim()    != null) fim    = LocalDateTime.parse(filter.getDataFim()    + "T23:59:59");

        Page<NotaFiscal> pageResult = notaRepo.findWithFilters(
                filter.getEmpresaId(),
                filter.getStatus(),
                filter.getTipo(),
                filter.getClienteNome(),
                inicio, fim,
                PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("data",  pageResult.getContent());
        result.put("total", pageResult.getTotalElements());
        result.put("page",  page + 1);
        result.put("pages", pageResult.getTotalPages());
        return result;
    }
}
