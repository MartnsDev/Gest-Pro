package br.com.gestpro.gestpro_backend.api.dto.modules.dashboard;

public class ProdutoVendasDTO {
    private String nome;
    private Long quantidade;

    public ProdutoVendasDTO() {
    }

    public ProdutoVendasDTO(String nome, Long quantidade) {
        this.nome = nome;
        this.quantidade = quantidade;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Long getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Long quantidade) {
        this.quantidade = quantidade;
    }
}
