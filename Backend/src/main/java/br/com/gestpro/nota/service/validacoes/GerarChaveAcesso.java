package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.TipoNota;
import br.com.gestpro.nota.model.NotaFiscal;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class GerarChaveAcesso {

    public String gerarChaveAcesso(NotaFiscal nota) {
        String cUF   = "35";
        String aamm  = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMM"));
        String cnpj  = nota.getEmpresaCnpj() != null
                ? String.format("%-14s", nota.getEmpresaCnpj().replaceAll("\\D", "")).replace(' ', '0')
                : "00000000000000";
        String mod   = nota.getTipo() == TipoNota.NFCE ? "65" : "55";
        String serie = "001";
        String[] parts = nota.getNumero().split("-");
        String nNF   = String.format("%09d", parts.length > 2 ? Integer.parseInt(parts[2]) : 1);
        String cNF   = String.format("%08d", new Random().nextInt(99_999_999));
        String c43   = cUF + aamm + cnpj + mod + serie + nNF + "1" + cNF;
        return c43 + calcularDVChave(c43);
    }

    private String calcularDVChave(String chave43) {
        int[] pesos = {2, 3, 4, 5, 6, 7, 8, 9};
        int soma = 0, idx = 0;
        for (int i = chave43.length() - 1; i >= 0; i--)
            soma += Character.getNumericValue(chave43.charAt(i)) * pesos[idx++ % 8];
        int resto = soma % 11;
        return resto < 2 ? "0" : String.valueOf(11 - resto);
    }
}

