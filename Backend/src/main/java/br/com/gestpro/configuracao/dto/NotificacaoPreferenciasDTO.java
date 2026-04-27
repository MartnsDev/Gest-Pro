package br.com.gestpro.configuracao.dto;

import lombok.Data;

@Data
public class NotificacaoPreferenciasDTO {
    private boolean emailVendas;
    private boolean emailRelatorios;
    private boolean alertaEstoqueZerado;
    private boolean alertaVencimentoPlano;
}