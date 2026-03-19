package br.com.gestpro.dashboard.dto;

public record DashboardCountsDTO(
        Long vendasHoje,
        Long produtosComEstoque,
        Long produtosSemEstoque,
        Long clientesAtivos
) {
    // Construtor customizado para aceitar qualquer tipo numérico ou String do banco
    public DashboardCountsDTO(Object vendasHoje, Object produtosComEstoque,
                              Object produtosSemEstoque, Object clientesAtivos) {
        this(
                safeConvert(vendasHoje),
                safeConvert(produtosComEstoque),
                safeConvert(produtosSemEstoque),
                safeConvert(clientesAtivos)
        );
    }

    private static Long safeConvert(Object val) {
        if (val == null) return 0L;
        if (val instanceof Number n) return n.longValue();
        try {
            String str = val.toString().trim();
            if (str.isEmpty() || str.equalsIgnoreCase("null")) return 0L;
            if (str.contains(".")) str = str.split("\\.")[0];
            return Long.parseLong(str);
        } catch (Exception e) {
            return 0L;
        }
    }
}