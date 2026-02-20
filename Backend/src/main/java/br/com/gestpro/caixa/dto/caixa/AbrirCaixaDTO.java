package br.com.gestpro.caixa.dto.caixa;

public class AbrirCaixaDTO {

    private String emailUsuario; // quem vai abrir o caixa
    private Double saldoInicial; // valor inicial do caixa

    public AbrirCaixaDTO() {
    }

    public AbrirCaixaDTO(String emailUsuario, Double saldoInicial) {
        this.emailUsuario = emailUsuario;
        this.saldoInicial = saldoInicial;
    }

    public String getEmailUsuario() {
        return emailUsuario;
    }

    public void setEmailUsuario(String emailUsuario) {
        this.emailUsuario = emailUsuario;
    }

    public Double getSaldoInicial() {
        return saldoInicial;
    }

    public void setSaldoInicial(Double saldoInicial) {
        this.saldoInicial = saldoInicial;
    }
}
