package br.com.gestpro.nota.service;

import br.com.gestpro.nota.dto.NotaFiscalDTOs;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface NotaFiscalInterface {

    Map<String, Object> buscarPorId(UUID id);
    List<Map<String, Object>> buscarMunicipios(String uf);
    Map<String, Object> cancelar(NotaFiscalDTOs.CancelarNotaDTO dto);
    Map<String, Object> consultarCep(String cep);
    Map<String, Object> consultarCNPJ(String cnpj);
    Map<String, Object> criar(NotaFiscalDTOs.CriarNotaFiscalDTO dto, String usuarioId);
    Map<String, Object> emitir(UUID id);
    Map<String, Object> listar(NotaFiscalDTOs.FilterNotaFiscalDTO filter);
    NotaFiscalDTOs.EstatisticasDTO estatisticas(String empresaId);
    Map<String, Object> gerarDadosDanfe(UUID id);
}
