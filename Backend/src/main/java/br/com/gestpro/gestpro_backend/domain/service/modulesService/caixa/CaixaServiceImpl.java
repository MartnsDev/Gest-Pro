package br.com.gestpro.gestpro_backend.domain.service.modulesService.caixa;


import br.com.gestpro.gestpro_backend.api.dto.modules.caixa.CaixaDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class CaixaServiceImpl implements CaixaServiceInterface {

    private final CaixaService caixaService;

    public CaixaServiceImpl(CaixaService caixaService) {
        this.caixaService = caixaService;
    }

    @Override
    public CaixaDTO abrirCaixa(String emailUsuario, BigDecimal saldoInicial) {
        return caixaService.abrirCaixa(emailUsuario, saldoInicial);
    }

    @Override
    public CaixaDTO fecharCaixa(Long idCaixa) {
        return caixaService.fecharCaixa(idCaixa);
    }

    @Override
    public CaixaDTO buscarCaixaAberto(String emailUsuario) {
        return caixaService.buscarCaixaAberto(emailUsuario);
    }
}

