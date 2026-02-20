package br.com.gestpro.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DashboardVisaoGeralResponse {
    private Long vendasHoje;
    private Long produtosComEstoque;
    private Long produtosSemEstoque;
    private Long clientesAtivos;
    private Long vendasSemana;
    private PlanoDTO planoUsuario;
    private List<String> alertas;

    public DashboardVisaoGeralResponse() {
    }

    public DashboardVisaoGeralResponse(Long vendasHoje, Long produtosComEstoque, Long produtosSemEstoque,
                                       Long clientesAtivos, Long vendasSemana, PlanoDTO planoUsuario, List<String> alertas) {
        this.vendasHoje = vendasHoje;
        this.produtosComEstoque = produtosComEstoque;
        this.produtosSemEstoque = produtosSemEstoque;
        this.clientesAtivos = clientesAtivos;
        this.vendasSemana = vendasSemana;
        this.planoUsuario = planoUsuario;
        this.alertas = alertas;
    }

    // getters/setters para todos os campos...
    public Long getVendasHoje() {
        return vendasHoje;
    }

    public void setVendasHoje(Long vendasHoje) {
        this.vendasHoje = vendasHoje;
    }

    public Long getProdutosComEstoque() {
        return produtosComEstoque;
    }

    public void setProdutosComEstoque(Long produtosComEstoque) {
        this.produtosComEstoque = produtosComEstoque;
    }

    public Long getProdutosSemEstoque() {
        return produtosSemEstoque;
    }

    public void setProdutosSemEstoque(Long produtosSemEstoque) {
        this.produtosSemEstoque = produtosSemEstoque;
    }

    public Long getClientesAtivos() {
        return clientesAtivos;
    }

    public void setClientesAtivos(Long clientesAtivos) {
        this.clientesAtivos = clientesAtivos;
    }

    public Long getVendasSemana() {
        return vendasSemana;
    }

    public void setVendasSemana(Long vendasSemana) {
        this.vendasSemana = vendasSemana;
    }

    public PlanoDTO getPlanoUsuario() {
        return planoUsuario;
    }

    public void setPlanoUsuario(PlanoDTO planoUsuario) {
        this.planoUsuario = planoUsuario;
    }

    public List<String> getAlertas() {
        return alertas;
    }

    public void setAlertas(List<String> alertas) {
        this.alertas = alertas;
    }
}
