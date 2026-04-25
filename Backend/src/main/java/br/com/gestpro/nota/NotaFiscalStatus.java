package br.com.gestpro.nota;

public enum NotaFiscalStatus {
    DIGITACAO("Em digitação"),
    VALIDANDO("Validando"),
    AUTORIZADA("Autorizada"),
    REJEITADA("Rejeitada"),
    CANCELADA("Cancelada"),
    INUTILIZADA("Inutilizada"),
    CONTINGENCIA("Em contingência");

    private final String descricao;

    NotaFiscalStatus(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() { return descricao; }
}
