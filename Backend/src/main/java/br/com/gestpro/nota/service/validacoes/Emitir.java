package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class Emitir {

    private final NotaFiscalRepository notaRepo;
    private final BuscaPorId buscarPorId;
    private final GerarChaveAcesso gerarChaveAcesso;

    public Emitir(NotaFiscalRepository notaRepo, BuscaPorId buscarPorId, GerarChaveAcesso gerarChaveAcesso) {
        this.notaRepo = notaRepo;
        this.buscarPorId = buscarPorId;
        this.gerarChaveAcesso = gerarChaveAcesso;
    }

    @Transactional
    public Map<String, Object> emitir(UUID id) {
        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota não encontrada."));

        if (nota.getStatus() != NotaFiscalStatus.RASCUNHO)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas rascunhos podem ser emitidos.");

        nota.setStatus(NotaFiscalStatus.EMITIDA);
        nota.setChaveAcesso(gerarChaveAcesso.gerarChaveAcesso(nota));
        nota.setProtocolo(gerarProtocolo());
        nota.setDataEmissao(LocalDateTime.now());
        notaRepo.save(nota);

        return buscarPorId.buscarPorId(id);
    }

    private String gerarProtocolo() {
        String ts = String.valueOf(System.currentTimeMillis());
        return "1" + (ts.length() >= 14 ? ts.substring(ts.length() - 14) : String.format("%014d", Long.parseLong(ts)));
    }

}
