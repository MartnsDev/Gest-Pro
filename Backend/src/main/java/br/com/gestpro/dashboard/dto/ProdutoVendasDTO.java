package br.com.gestpro.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoVendasDTO {
    private String nome;
    private Long quantidade;

    public ProdutoVendasDTO(String nome, Number quantidade) {
        this.nome = nome;
        this.quantidade = quantidade != null ? quantidade.longValue() : 0L;
    }
}