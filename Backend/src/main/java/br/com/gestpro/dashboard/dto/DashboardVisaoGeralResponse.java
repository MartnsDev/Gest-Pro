package br.com.gestpro.dashboard.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class DashboardVisaoGeralResponse {

    private BigDecimal vendasHoje;
    private Long       produtosComEstoque;
    private Long       produtosSemEstoque;
    private Long       clientesAtivos;

    // Semana (Segunda a Domingo corrente)
    private BigDecimal vendasSemanais;

    // Mês corrente
    private BigDecimal vendasMes;

    // Lucros
    private BigDecimal lucroDia;
    private BigDecimal lucroMes;

    private PlanoDTO      planoUsuario;
    private List<String>  alertas;

    public DashboardVisaoGeralResponse(
            Object vendasHoje,
            Object prodComEstoque,
            Object prodSemEstoque,
            Object clientesAtivos,
            Object vendasSemanais,
            Object vendasMes,
            Object lucroDia,
            Object lucroMes,
            PlanoDTO plano,
            List<String> alertas
    ) {
        this.vendasHoje         = parseBD(vendasHoje);
        this.produtosComEstoque = parseLong(prodComEstoque);
        this.produtosSemEstoque = parseLong(prodSemEstoque);
        this.clientesAtivos     = parseLong(clientesAtivos);
        this.vendasSemanais     = parseBD(vendasSemanais);
        this.vendasMes          = parseBD(vendasMes);
        this.lucroDia           = parseBD(lucroDia);
        this.lucroMes           = parseBD(lucroMes);
        this.planoUsuario       = plano;
        this.alertas            = alertas;
    }

    private BigDecimal parseBD(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        if (obj instanceof BigDecimal bd) return bd;
        if (obj instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try { return new BigDecimal(obj.toString().trim()); }
        catch (Exception e) { return BigDecimal.ZERO; }
    }

    private Long parseLong(Object obj) {
        if (obj == null) return 0L;
        if (obj instanceof Number n) return n.longValue();
        try {
            String s = obj.toString().trim();
            if (s.contains(".")) s = s.split("\\.")[0];
            return Long.parseLong(s);
        } catch (Exception e) { return 0L; }
    }
}