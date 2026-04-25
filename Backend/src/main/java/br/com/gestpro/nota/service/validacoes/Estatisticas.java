package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.EstatisticasResponse;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Serviço responsável por calcular as estatísticas do Dashboard de notas fiscais.
 * * Retorna:
 * - Quantidade de notas por status (Autorizada, Rejeitada, Cancelada)
 * - Valor total faturado no mês corrente (soma apenas das notas AUTORIZADAS)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Estatisticas {

    private final NotaFiscalRepository notaRepo;

    // Colocamos readOnly = true porque é apenas consulta (melhora a performance no banco)
    @Transactional(readOnly = true)
    public EstatisticasResponse calcularEstatisticas(Long empresaId) {

        log.info("Calculando métricas do dashboard fiscal para a Empresa ID={}", empresaId);

        // 1. Contagens rápidas por status (Adequado aos novos Enums)
        long autorizadas = notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.AUTORIZADA);
        long rejeitadas  = notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.REJEITADA);
        long canceladas  = notaRepo.countByEmpresaIdAndStatus(empresaId, NotaFiscalStatus.CANCELADA);

        // Se quiser exibir os rascunhos no front, basta usar a mesma lógica com NotaFiscalStatus.DIGITACAO

        // 2. Cálculo do Faturamento do mês corrente
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioMes = hoje.withDayOfMonth(1).atStartOfDay();
        LocalDateTime fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth()).atTime(23, 59, 59);

        // IMPORTANTE: Lá no seu NotaFiscalRepository, crie ou ajuste esse método para receber o Long e o Enum.
        // Faturamento só contabiliza o que a SEFAZ disse "OK" (AUTORIZADA).
        BigDecimal valorMes = notaRepo.sumValorTotalByEmpresaIdAndStatusAndDataEmissaoBetween(
                empresaId, NotaFiscalStatus.AUTORIZADA, inicioMes, fimMes
        );

        if (valorMes == null) {
            valorMes = BigDecimal.ZERO;
        }

        // 3. Montando a resposta usando o DTO interno que criamos lá no NotaFiscalServiceImpl
        return EstatisticasResponse.builder()
                .totalAutorizadas(autorizadas)
                .totalRejeitadas(rejeitadas)
                .totalCanceladas(canceladas)
                .valorTotalMes(valorMes)
                .build();
    }
}