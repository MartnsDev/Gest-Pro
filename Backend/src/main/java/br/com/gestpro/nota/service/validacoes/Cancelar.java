package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

public class Cancelar {

    private final NotaFiscalRepository notaRepo;
    private final BuscaPorId buscarPorId;

    public Cancelar(NotaFiscalRepository notaRepo, BuscaPorId buscarPorId) {
        this.notaRepo = notaRepo;
        this.buscarPorId = buscarPorId;
    }

    @Transactional
    public Map<String, Object> cancelar(NotaFiscalDTOs.CancelarNotaDTO dto) {
        NotaFiscal nota = notaRepo.findById(dto.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota não encontrada."));

        if (nota.getStatus() != NotaFiscalStatus.EMITIDA)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas notas emitidas podem ser canceladas.");

        long diffHoras = java.time.Duration.between(nota.getDataEmissao(), LocalDateTime.now()).toHours();
        if (diffHoras > 24)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Prazo de cancelamento expirado (máximo 24h).");

        nota.setStatus(NotaFiscalStatus.CANCELADA);
        nota.setDataCancelamento(LocalDateTime.now());
        nota.setMotivoCancelamento(dto.getMotivoCancelamento());

        notaRepo.save(nota);

        return buscarPorId.buscarPorId(dto.getId());
    }
}