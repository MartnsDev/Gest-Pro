package br.com.gestpro.nota.service.validacoes;

public class CalcularDVChave {

    private String calcularDVChave(String chave43) {
        int[] pesos = {2, 3, 4, 5, 6, 7, 8, 9};
        int soma = 0, idx = 0;
        for (int i = chave43.length() - 1; i >= 0; i--)
            soma += Character.getNumericValue(chave43.charAt(i)) * pesos[idx++ % 8];
        int resto = soma % 11;

        return resto < 2 ? "0" : String.valueOf(11 - resto);
    }
}
