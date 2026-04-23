package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Serviço responsável por emitir uma nota fiscal (RASCUNHO → EMITIDA).
 *
 * Nesta versão (sem integração com SEFAZ), a emissão:
 *  1. Valida que a nota está em RASCUNHO
 *  2. Gera a chave de acesso (44 dígitos, Módulo 11)
 *  3. Gera um protocolo simulado
 *  4. Atualiza o status e registra a data de emissão
 *
 * Para integração real com a SEFAZ, substituir o bloco "simulação"
 * por chamada ao WebService estadual com o XML assinado (ICP-Brasil A1/A3).
 */
public class Emitir {

    private final NotaFiscalRepository notaRepo;
    private final BuscaPorId           buscaPorId;
    private final GerarChaveAcesso     gerarChaveAcesso;

    public Emitir(NotaFiscalRepository notaRepo,
                  BuscaPorId buscaPorId,
                  GerarChaveAcesso gerarChaveAcesso) {
        this.notaRepo         = notaRepo;
        this.buscaPorId       = buscaPorId;
        this.gerarChaveAcesso = gerarChaveAcesso;
    }

    public Map<String, Object> emitir(UUID id) {

        NotaFiscal nota = buscaPorId.buscarEntidade(id);

        // 1. Validações de negócio
        if (nota.getStatus() != NotaFiscalStatus.RASCUNHO) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Somente notas em RASCUNHO podem ser emitidas. Status atual: " + nota.getStatus());
        }

        if (nota.getTotal() == null || nota.getTotal().signum() < 0) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Total da nota não pode ser negativo para emissão");
        }

        // 2. Gerar chave de acesso
        //    cUF padrão: usamos "35" (SP) quando não há estado do emitente cadastrado.
        //    Produção: obter o cUF real a partir de empresaEstado.
        String cUF = resolverCUF(nota.getEmpresaEstado());
        String chaveAcesso = gerarChaveAcesso.gerar(nota, cUF);

        // 3. Gerar protocolo simulado (em produção, vem da SEFAZ)
        String protocolo = gerarProtocolo();

        // 4. Atualizar nota
        nota.setStatus(NotaFiscalStatus.EMITIDA);
        nota.setChaveAcesso(chaveAcesso);
        nota.setProtocolo(protocolo);
        nota.setDataEmissao(LocalDateTime.now());

        NotaFiscal salva = notaRepo.save(nota);

        Map<String, Object> resposta = buscaPorId.notaParaMap(salva);
        resposta.put("mensagem", "Nota fiscal emitida com sucesso");
        return resposta;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Mapeia a sigla do estado para o código IBGE da UF (cUF).
     * Fonte: Tabela de Codificação dos Municípios do IBGE / NT 2011/004 SEFAZ.
     */
    private String resolverCUF(String estado) {
        if (estado == null || estado.isBlank()) return "35"; // SP como padrão
        return switch (estado.toUpperCase().trim()) {
            case "AC" -> "12";
            case "AL" -> "27";
            case "AP" -> "16";
            case "AM" -> "13";
            case "BA" -> "29";
            case "CE" -> "23";
            case "DF" -> "53";
            case "ES" -> "32";
            case "GO" -> "52";
            case "MA" -> "21";
            case "MT" -> "51";
            case "MS" -> "50";
            case "MG" -> "31";
            case "PA" -> "15";
            case "PB" -> "25";
            case "PR" -> "41";
            case "PE" -> "26";
            case "PI" -> "22";
            case "RJ" -> "33";
            case "RN" -> "24";
            case "RS" -> "43";
            case "RO" -> "11";
            case "RR" -> "14";
            case "SC" -> "42";
            case "SP" -> "35";
            case "SE" -> "28";
            case "TO" -> "17";
            default   -> "35";
        };
    }

    /**
     * Gera um protocolo no formato usado pela SEFAZ:
     * "1" + cUF(2) + ano(4) + sequencial(15 dígitos)
     * Ex: 135202400000000000001
     */
    private String gerarProtocolo() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        return "1" + "35" + java.time.LocalDate.now().getYear()
                + String.format("%015d", Long.parseLong(timestamp.substring(timestamp.length() - 10)));
    }
}
