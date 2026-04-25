package br.com.gestpro.nota.service;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.*;
import br.com.gestpro.nota.model.NotaFiscal;

import java.time.YearMonth;
import java.util.List;

/**
 * Interface principal do motor fiscal.
 * Define todas as operações disponíveis para NF-e, NFC-e e NFS-e.
 */
public interface NotaFiscalInterface {

    // === CRUD ===
    NotaFiscal criar(CriarNotaRequest request);
    NotaFiscal buscarPorId(Long id);
    List<NotaFiscalResumoResponse> listar(Long empresaId, NotaFiscalStatus status);
    void excluir(Long id);

    // === CICLO DE VIDA FISCAL ===

    /**
     * Emite a nota: gera XML → assina → valida XSD → transmite SEFAZ → processa retorno.
     */
    NotaFiscal emitir(Long notaId);

    /**
     * Cancela uma nota autorizada (dentro do prazo legal de 24h).
     */
    NotaFiscal cancelar(CancelarNotaRequest request);

    /**
     * Inutiliza uma numeração que foi "pulada" por erros ou outros motivos.
     */
    void inutilizar(InutilizarRequest request);

    /**
     * Reprocessa notas em contingência quando a internet retorna.
     */
    int transmitirContingencias(Long empresaId);

    // === CONSULTAS ===
    NotaFiscal buscarPorChaveAcesso(String chaveAcesso);
    byte[] baixarXml(Long notaId);
    byte[] gerarDanfePdf(Long notaId);

    // === ÁREA DO CONTADOR ===
    byte[] gerarZipXmlsMensal(Long empresaId, YearMonth periodo);
    byte[] gerarArquivoSped(Long empresaId, YearMonth periodo, String tipoSped);

    // === ESTATÍSTICAS ===
    EstatisticasResponse getEstatisticas(Long empresaId);

    // === CEP / CNPJ ===
    Object consultarCep(String cep);
    Object consultarCnpj(String cnpj);

    // === MUNICIPIOS ===
    List<Object> buscarMunicipios(String uf);
}