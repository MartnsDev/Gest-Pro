package br.com.gestpro.dashboard.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DashboardVisaoGeralResponse {
    private Long vendasHoje;
    private Long produtosComEstoque;
    private Long produtosSemEstoque;
    private Long clientesAtivos;
    private Long vendasSemana;
    private PlanoDTO planoUsuario;
    private List<String> alertas;
}