package br.com.gestpro.nota;

public enum RegimeTributario {
    SIMPLES_NACIONAL(1, "Simples Nacional"),
    SIMPLES_NACIONAL_EXCESSO(2, "Simples Nacional - excesso de sublimite"),
    LUCRO_PRESUMIDO(3, "Lucro Presumido"),
    LUCRO_REAL(5, "Lucro Real");

    private final int codigo;
    private final String descricao;

    RegimeTributario(int codigo, String descricao) {
        this.codigo = codigo;
        this.descricao = descricao;
    }

    public int getCodigo() { return codigo; }
    public String getDescricao() { return descricao; }
}
