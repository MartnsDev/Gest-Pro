package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.model.NotaFiscal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class GerarDadosDanfe {

    private final BuscaPorId buscarPorId;

    public GerarDadosDanfe(BuscaPorId buscarPorId) {
        this.buscarPorId = buscarPorId;
    }

    public Map<String, Object> gerarDadosDanfe(UUID id) {
        Map<String, Object> payload = buscarPorId.buscarPorId(id);
        NotaFiscal nf = (NotaFiscal) payload.get("nota");
        if (nf.getStatus() != NotaFiscalStatus.EMITIDA)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas notas emitidas geram DANFE.");
        payload.put("geradoEm", LocalDateTime.now().toString());
        payload.put("versao", "1.0.0");
        return payload;
    }
}
