package br.com.gestpro.nota.service;

import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.service.validacoes.*;

import java.util.UUID;

public interface NotaFiscalInterface {

    BuscaPorId buscarPorId(UUID id);
    BuscarMunicipios buscarMunicipios(String uf);
    Cancelar cancelar(NotaFiscalDTOs.CancelarNotaDTO dto);
    ConsultarCEP consultarCep(String cep);
    ConsultarCNPJ consultarCNPJ(String cnpj);
    Criar criar(NotaFiscalDTOs.CriarNotaFiscalDTO dto, String usuarioId);
    Emitir emitir(UUID id);
    Listar listar(NotaFiscalDTOs.FilterNotaFiscalDTO filter);
    NotaFiscalDTOs.EstatisticasDTO estatisticas(String empresaId);
    GerarDadosDanfe gerarDadosDanfe(UUID id);
}
