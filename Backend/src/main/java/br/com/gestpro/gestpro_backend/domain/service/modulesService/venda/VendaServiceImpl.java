package br.com.gestpro.gestpro_backend.domain.service.modulesService.venda;

import br.com.gestpro.gestpro_backend.api.dto.modules.vendas.RegistrarVendaDTO;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendaServiceImpl implements VendaServiceInterface {

    private final VendaService vendaService; // delega a lógica já implementada

    // Construtor para injeção de dependência
    public VendaServiceImpl(VendaService vendaService) {
        this.vendaService = vendaService;
    }

    @Override
    public Venda registrarVenda(RegistrarVendaDTO dto) {
        // Delegando para a lógica existente
        return vendaService.registrarVenda(dto);
    }

    @Override
    public List<Venda> listarPorCaixa(Long idCaixa) {
        // Delegando para a lógica existente
        return vendaService.listarPorCaixa(idCaixa);
    }

    @Override
    public Venda buscarPorId(Long id) {
        // Delegando para a lógica existente
        return vendaService.buscarPorId(id);
    }
}
