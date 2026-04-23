package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.repository.NotaFiscalRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Serviço responsável por calcular estatísticas de notas fiscais de uma empresa.
 *
 * Retorna:
 * - Total de notas cadastradas
 * - Quantidade por status (EMITIDA, RASCUNHO, CANCELADA)
 * - Valor total faturado no mês corrente (apenas notas EMITIDAS)
 */
public class Estastisticas {

    private final NotaFiscalRepository notaRepo;

    public Estastisticas(NotaFiscalRepository notaRepo) {
        this.notaRepo = notaRepo;
    }

    public NotaFiscalDTOs.EstatisticasDTO estatisticas(String empresaId) {

        // Totais por status
        long total      = notaRepo.countByEmpresaId(empresaId);
        long emitidas   = notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.EMITIDA);
        long rascunhos  = notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.RASCUNHO);
        long canceladas = notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.CANCELADA);

        // Faturamento do mês corrente
        LocalDate hoje    = LocalDate.now();
        LocalDateTime ini = hoje.withDayOfMonth(1).atStartOfDay();
        LocalDateTime fim = hoje.withDayOfMonth(hoje.lengthOfMonth()).atTime(23, 59, 59);

        BigDecimal valorMes = notaRepo.sumTotalEmitidoNoPeriodo(empresaId, ini, fim);
        if (valorMes == null) valorMes = BigDecimal.ZERO;

        NotaFiscalDTOs.EstatisticasDTO dto = new NotaFiscalDTOs.EstatisticasDTO();
        dto.setTotal(total);
        dto.setEmitidas(emitidas);
        dto.setRascunhos(rascunhos);
        dto.setCanceladas(canceladas);
        dto.setValorTotalMes(valorMes);
        return dto;
    }
}
