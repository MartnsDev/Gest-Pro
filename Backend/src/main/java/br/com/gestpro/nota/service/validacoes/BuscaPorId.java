package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class BuscaPorId {

    private final NotaFiscalRepository notaRepo;
    private final ItemNotaFiscalRepository itemRepo;

    public BuscaPorId(NotaFiscalRepository notaRepo, ItemNotaFiscalRepository itemRepo) {
        this.notaRepo = notaRepo;
        this.itemRepo = itemRepo;
    }

    public Map<String, Object> buscarPorId(UUID id) {
        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota " + id + " não encontrada."));

        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("nota", Map.of(
                "id", nota.getId(),
                "numero", nota.getNumero(),
                "clienteNome", nota.getClienteNome(),
                "total", nota.getTotal()
        ));

        result.put("itens", itens.stream().map(i -> Map.of(
                "id", i.getId(),
                "descricao", i.getDescricao(),
                "quantidade", i.getQuantidade(),
                "valor", i.getValorTotal()
        )).toList());

        return result;
    }
}
