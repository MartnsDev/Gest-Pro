package br.com.gestpro.gestpro_backend.domain.service.modulesService.venda;

import br.com.gestpro.gestpro_backend.api.dto.modules.vendas.RegistrarVendaDTO;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;

import java.util.List;

public interface VendaServiceInterface {
    Venda registrarVenda(RegistrarVendaDTO dto);

    List<Venda> listarPorCaixa(Long idCaixa);

    Venda buscarPorId(Long id);

}
