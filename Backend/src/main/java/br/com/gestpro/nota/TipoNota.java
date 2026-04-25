package br.com.gestpro.nota;

public enum TipoNota {
    NFE("55", "NF-e - Nota Fiscal Eletrônica"),
    NFCE("65", "NFC-e - Nota Fiscal de Consumidor Eletrônica"),
    NFSE(null, "NFS-e - Nota Fiscal de Serviço Eletrônica");

    private final String modelo;
    private final String descricao;

    TipoNota(String modelo, String descricao) {
        this.modelo = modelo;
        this.descricao = descricao;
    }

    public String getModelo() { return modelo; }
    public String getDescricao() { return descricao; }
}