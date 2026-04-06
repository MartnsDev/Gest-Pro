package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.repository.NotaFiscalRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Estastisticas {

    private final NotaFiscalRepository notaRepo;

    public Estastisticas(NotaFiscalRepository notaRepo) {
        this.notaRepo = notaRepo;
    }

    public NotaFiscalDTOs.EstatisticasDTO estatisticas(String empresaId) {
        LocalDateTime inicioMes = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fimMes    = inicioMes.plusMonths(1).minusSeconds(1);

        NotaFiscalDTOs.EstatisticasDTO dto = new NotaFiscalDTOs.EstatisticasDTO();
        dto.setTotal(notaRepo.countByEmpresaId(empresaId));
        dto.setEmitidas(notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.EMITIDA));
        dto.setRascunhos(notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.RASCUNHO));
        dto.setCanceladas(notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.CANCELADA));
        BigDecimal valorMes = notaRepo.sumTotalEmitidoNoPeriodo(empresaId, inicioMes, fimMes);
        dto.setValorTotalMes(valorMes != null ? valorMes : BigDecimal.ZERO);
        return dto;
    }
}
