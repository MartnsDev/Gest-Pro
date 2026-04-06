package br.com.gestpro.nota.service;

import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import br.com.gestpro.nota.service.validacoes.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotaFiscalServiceImpl implements NotaFiscalInterface{

    private final NotaFiscalRepository notaRepo;
    private final ItemNotaFiscalRepository itemRepo;
    private final WebClient webClient;


    @Override
    public BuscaPorId buscarPorId(UUID id) {
        return buscarPorId(id);
    }

    @Override
    public BuscarMunicipios buscarMunicipios(String uf) {
        return buscarMunicipios(uf);
    }

    @Override
    public Cancelar cancelar(NotaFiscalDTOs.CancelarNotaDTO dto) {
        return cancelar(dto);
    }

    @Override
    public ConsultarCEP consultarCep(String cep) {
        return consultarCep(cep);
    }

    @Override
    public ConsultarCNPJ consultarCNPJ(String cnpj) {
        return consultarCNPJ(cnpj);
    }

    @Override
    public Criar criar(NotaFiscalDTOs.CriarNotaFiscalDTO dto, String usuarioId) {
        return criar(dto, usuarioId);
    }

    @Override
    public Emitir emitir(UUID id) {
        return emitir(id);
    }

    @Override
    public Listar listar(NotaFiscalDTOs.FilterNotaFiscalDTO filter) {
        return listar(filter);
    }

    @Override
    public NotaFiscalDTOs.EstatisticasDTO estatisticas(String empresaId) {
        return estatisticas(empresaId);
    }

    @Override
    public GerarDadosDanfe gerarDadosDanfe(UUID id) {
        return gerarDadosDanfe(id);
    }

}