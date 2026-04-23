package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Serviço responsável por cancelar uma nota fiscal (EMITIDA → CANCELADA).
 *
 * Regras de negócio:
 * - Somente notas EMITIDAS podem ser canceladas.
 * - Após cancelamento, a nota fica com status CANCELADA e
 *   registra data e motivo do cancelamento.
 *
 * Produção: o cancelamento de NF-e exige envio do evento de cancelamento
 * ao WebService da SEFAZ dentro de 24h (prazo pode variar por estado).
 */
public class Cancelar {

    private final NotaFiscalRepository notaRepo;
    private final BuscaPorId           buscaPorId;

    public Cancelar(NotaFiscalRepository notaRepo,
                    BuscaPorId buscaPorId) {
        this.notaRepo   = notaRepo;
        this.buscaPorId = buscaPorId;
    }

    public Map<String, Object> cancelar(NotaFiscalDTOs.CancelarNotaDTO dto) {

        NotaFiscal nota = buscaPorId.buscarEntidade(dto.getId());

        // 1. Validação de status
        if (nota.getStatus() == NotaFiscalStatus.CANCELADA) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Esta nota já está cancelada");
        }

        if (nota.getStatus() == NotaFiscalStatus.RASCUNHO) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Rascunhos não precisam ser cancelados — exclua a nota diretamente");
        }

        // 2. Validação do motivo
        String motivo = dto.getMotivoCancelamento();
        if (motivo == null || motivo.isBlank() || motivo.trim().length() < 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Motivo do cancelamento deve ter pelo menos 5 caracteres");
        }

        // 3. Executar cancelamento
        nota.setStatus(NotaFiscalStatus.CANCELADA);
        nota.setDataCancelamento(LocalDateTime.now());
        nota.setMotivoCancelamento(motivo.trim());

        NotaFiscal salva = notaRepo.save(nota);

        Map<String, Object> resposta = buscaPorId.notaParaMap(salva);
        resposta.put("mensagem", "Nota fiscal cancelada com sucesso");
        return resposta;
    }
}
