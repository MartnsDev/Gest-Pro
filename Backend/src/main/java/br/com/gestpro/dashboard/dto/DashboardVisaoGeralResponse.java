package br.com.gestpro.dashboard.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class DashboardVisaoGeralResponse {

    private Long vendasHoje;
    private Long produtosComEstoque;
    private Long produtosSemEstoque;
    private Long clientesAtivos;
    private Long vendasSemanais;
    private PlanoDTO plano;
    private List<String> alertas;

    // Construtor que aceita Object nos 4 primeiros campos para lidar com
    // Integer/Long/String vindos de queries nativas do MySQL via Hibernate
    public DashboardVisaoGeralResponse(
            Object vendasHoje,
            Object prodComEstoque,
            Object prodSemEstoque,
            Object clientesAtivos,
            Long vendasSemanais,
            PlanoDTO plano,
            List<String> alertas
    ) {
        this.vendasHoje          = safeParse(vendasHoje);
        this.produtosComEstoque  = safeParse(prodComEstoque);
        this.produtosSemEstoque  = safeParse(prodSemEstoque);
        this.clientesAtivos      = safeParse(clientesAtivos);
        this.vendasSemanais      = vendasSemanais != null ? vendasSemanais : 0L;
        this.plano               = plano;
        this.alertas             = alertas;
    }

    private Long safeParse(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number n) return n.longValue();
        try {
            String str = obj.toString().trim();
            if (str.isEmpty() || str.equalsIgnoreCase("null")) return 0L;
            if (str.contains(".")) str = str.split("\\.")[0];
            return Long.parseLong(str);
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}