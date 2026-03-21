package br.com.gestpro.caixa.service;

import br.com.gestpro.caixa.dto.caixa.AbrirCaixaRequest;
import br.com.gestpro.caixa.dto.caixa.CaixaResponse;
import br.com.gestpro.caixa.dto.caixa.FecharCaixaRequest;

import java.util.List;

public interface CaixaServiceInterface {
    CaixaResponse abrirCaixa(AbrirCaixaRequest req);
    CaixaResponse fecharCaixa(FecharCaixaRequest req);
    CaixaResponse obterResumo(Long caixaId, String emailUsuario);
    CaixaResponse buscarCaixaAberto(Long empresaId, String emailUsuario);
    List<CaixaResponse> listarPorEmpresa(Long empresaId, String emailUsuario);
}