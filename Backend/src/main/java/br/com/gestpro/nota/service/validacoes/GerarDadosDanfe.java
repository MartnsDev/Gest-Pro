package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class GerarDadosDanfe {

    private final NotaFiscalRepository    notaRepo;
    private final ItemNotaFiscalRepository itemRepo;

    public GerarDadosDanfe(NotaFiscalRepository notaRepo, ItemNotaFiscalRepository itemRepo) {
        this.notaRepo  = notaRepo;
        this.itemRepo  = itemRepo;
    }

    public Map<String, Object> gerarDadosDanfe(UUID id) {
        NotaFiscal nota = notaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nota " + id + " não encontrada."));

        if (nota.getStatus() != NotaFiscalStatus.EMITIDA)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Apenas notas emitidas geram DANFE.");

        List<ItemNotaFiscal> itens = itemRepo.findByNotaFiscalId(id);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("nota", Map.ofEntries(
                Map.entry("id",               nota.getId()),
                Map.entry("numero",           nota.getNumero()),
                Map.entry("chaveAcesso",      nota.getChaveAcesso() != null ? nota.getChaveAcesso() : ""),
                Map.entry("protocolo",        nota.getProtocolo()   != null ? nota.getProtocolo()   : ""),
                Map.entry("dataEmissao",      nota.getDataEmissao() != null ? nota.getDataEmissao().toString() : ""),
                Map.entry("status",           nota.getStatus()),
                Map.entry("tipo",             nota.getTipo()),
                Map.entry("empresaNome",      nota.getEmpresaNome()  != null ? nota.getEmpresaNome()  : ""),
                Map.entry("empresaCnpj",      nota.getEmpresaCnpj()  != null ? nota.getEmpresaCnpj()  : ""),
                Map.entry("empresaEndereco",  nota.getEmpresaEndereco() != null ? nota.getEmpresaEndereco() : ""),
                Map.entry("clienteNome",      nota.getClienteNome()  != null ? nota.getClienteNome()  : ""),
                Map.entry("clienteCpfCnpj",   nota.getClienteCpfCnpj() != null ? nota.getClienteCpfCnpj() : ""),
                Map.entry("total",            nota.getTotal()),
                Map.entry("formaPagamento",   nota.getFormaPagamento() != null ? nota.getFormaPagamento() : "")
        ));

        result.put("itens", itens.stream().map(i -> Map.of(
                "id",          i.getId(),
                "descricao",   i.getDescricao(),
                "codigo",      i.getCodigo()    != null ? i.getCodigo()    : "",
                "ncm",         i.getNcm()       != null ? i.getNcm()       : "",
                "cfop",        i.getCfop()      != null ? i.getCfop()      : "",
                "unidade",     i.getUnidade()   != null ? i.getUnidade()   : "",
                "quantidade",  i.getQuantidade(),
                "valorUnitario", i.getValorUnitario(),
                "valorTotal",  i.getValorTotal()
        )).toList());

        result.put("geradoEm", LocalDateTime.now().toString());
        result.put("versao",   "1.0.0");

        return result;
    }
}