package br.com.gestpro.nota;

public enum FormaPagamento {
    DINHEIRO("01", "Dinheiro"),
    CHEQUE("02", "Cheque"),
    CARTAO_CREDITO("03", "Cartão de Crédito"),
    CARTAO_DEBITO("04", "Cartão de Débito"),
    CREDITO_LOJA("05", "Crédito Loja"),
    VALE_ALIMENTACAO("10", "Vale Alimentação"),
    VALE_REFEICAO("11", "Vale Refeição"),
    VALE_PRESENTE("12", "Vale Presente"),
    VALE_COMBUSTIVEL("13", "Vale Combustível"),
    BOLETO("15", "Boleto Bancário"),
    DEPOSITO("16", "Depósito Bancário"),
    PIX("17", "Pix"),
    TRANSFERENCIA("18", "Transferência Bancária"),
    SEM_PAGAMENTO("90", "Sem Pagamento"),
    OUTROS("99", "Outros");

    private final String codigo;
    private final String descricao;

    FormaPagamento(String codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public String getCodigo() { return codigo; }
    public String getDescricao() { return descricao; }
}
