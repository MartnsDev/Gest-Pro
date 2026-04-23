package br.com.gestpro.nota.service;

import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import br.com.gestpro.nota.service.validacoes.*;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Implementação principal do serviço de notas fiscais.
 *
 * Cada operação é delegada a uma classe especializada no pacote validacoes,
 * seguindo o padrão de decomposição por responsabilidade única (SRP).
 */
@Service
public class NotaFiscalServiceImpl implements NotaFiscalInterface {

    private final BuscaPorId       buscaPorId;
    private final BuscarMunicipios buscarMunicipios;
    private final Cancelar         cancelar;
    private final ConsultarCEP     consultarCEP;
    private final ConsultarCNPJ    consultarCNPJ;
    private final Criar            criar;
    private final Emitir           emitir;
    private final Listar           listar;
    private final Estastisticas    estatisticas;
    private final GerarDadosDanfe  gerarDadosDanfe;

    public NotaFiscalServiceImpl(
            NotaFiscalRepository notaRepo,
            ItemNotaFiscalRepository itemRepo,
            WebClient webClient
    ) {
        this.buscaPorId       = new BuscaPorId(notaRepo, itemRepo);
        this.buscarMunicipios = new BuscarMunicipios(webClient);
        this.consultarCEP     = new ConsultarCEP(webClient);
        this.consultarCNPJ    = new ConsultarCNPJ(webClient);
        this.cancelar         = new Cancelar(notaRepo, buscaPorId);
        this.criar            = new Criar(itemRepo, buscaPorId, notaRepo);
        GerarChaveAcesso gerarChaveAcesso = new GerarChaveAcesso();
        this.emitir           = new Emitir(notaRepo, buscaPorId, gerarChaveAcesso);
        this.listar           = new Listar(notaRepo);
        this.estatisticas     = new Estastisticas(notaRepo);
        this.gerarDadosDanfe  = new GerarDadosDanfe(notaRepo, itemRepo);
    }

    @Override
    public Map<String, Object> buscarPorId(UUID id) {
        return buscaPorId.buscarPorId(id);
    }

    @Override
    public List<Map<String, Object>> buscarMunicipios(String uf) {
        return buscarMunicipios.buscarMunicipios(uf);
    }

    @Override
    public Map<String, Object> cancelar(NotaFiscalDTOs.CancelarNotaDTO dto) {
        return cancelar.cancelar(dto);
    }

    @Override
    public Map<String, Object> consultarCep(String cep) {
        return consultarCEP.consultarCep(cep);
    }

    @Override
    public Map<String, Object> consultarCNPJ(String cnpj) {
        return consultarCNPJ.consultarCnpj(cnpj);
    }

    @Override
    public Map<String, Object> criar(NotaFiscalDTOs.CriarNotaFiscalDTO dto, String usuarioId) {
        return criar.criar(dto, usuarioId);
    }

    @Override
    public Map<String, Object> emitir(UUID id) {
        return emitir.emitir(id);
    }

    @Override
    public Map<String, Object> listar(NotaFiscalDTOs.FilterNotaFiscalDTO filter) {
        return listar.listar(filter);
    }

    @Override
    public NotaFiscalDTOs.EstatisticasDTO estatisticas(String empresaId) {
        return estatisticas.estatisticas(empresaId);
    }

    @Override
    public Map<String, Object> gerarDadosDanfe(UUID id) {
        return gerarDadosDanfe.gerarDadosDanfe(id);
    }
}
