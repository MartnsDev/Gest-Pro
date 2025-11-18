package br.com.gestpro.gestpro_backend.domain.service.modulesService.caixa;

import br.com.gestpro.gestpro_backend.api.dto.modules.caixa.CaixaDTO;

import java.math.BigDecimal;

public interface CaixaServiceInterface {

    /**
     * Abre um novo caixa para o usuário
     *
     * @param emailUsuario e-mail do usuário
     * @param saldoInicial saldo inicial do caixa
     * @return CaixaDTO com os dados do caixa criado
     */
    CaixaDTO abrirCaixa(String emailUsuario, BigDecimal saldoInicial);

    /**
     * Fecha um caixa existente
     *
     * @param id id do caixa
     * @return CaixaDTO com os dados do caixa fechado
     */
    CaixaDTO fecharCaixa(Long id);

    /**
     * Busca o caixa aberto de um usuário
     *
     * @param emailUsuario e-mail do usuário
     * @return CaixaDTO do caixa aberto
     */
    CaixaDTO buscarCaixaAberto(String emailUsuario);
}
