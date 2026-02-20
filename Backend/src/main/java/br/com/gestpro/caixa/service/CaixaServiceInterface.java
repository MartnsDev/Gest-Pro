package br.com.gestpro.caixa.service;

import br.com.gestpro.caixa.dto.caixa.AbrirCaixaRequest;
import br.com.gestpro.caixa.dto.caixa.CaixaResponse;
import br.com.gestpro.caixa.dto.caixa.FecharCaixaRequest;
import org.springframework.dao.OptimisticLockingFailureException;

public interface CaixaServiceInterface {
    CaixaResponse abrirCaixa(AbrirCaixaRequest req);

    CaixaResponse fecharCaixa(FecharCaixaRequest req) throws OptimisticLockingFailureException;

    CaixaResponse obterResumo(Long caixaId);
}
