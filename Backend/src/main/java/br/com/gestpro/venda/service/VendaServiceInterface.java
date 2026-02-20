package br.com.gestpro.venda.service;

import br.com.gestpro.venda.dto.RegistrarVendaDTO;
import br.com.gestpro.venda.model.Venda;

import java.util.List;

public interface VendaServiceInterface {
    Venda registrarVenda(RegistrarVendaDTO dto);

    List<Venda> listarPorCaixa(Long idCaixa);

    Venda buscarPorId(Long id);
}
