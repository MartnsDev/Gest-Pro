package br.com.gestpro.empresa.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class VerificarCPF {

    // -------------------------------------------------------------------------
    // Validação matemática local — sem API, sem custo, sem LGPD
    // -------------------------------------------------------------------------
    public Map<String, Object> consultarCpf(String cpf) {
        String limpo = cpf.replaceAll("\\D", "");

        if (limpo.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CPF deve conter 11 dígitos.");
        }

        if (!isFormatoValido(limpo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CPF inválido: todos os dígitos são iguais.");
        }

        if (!isDigitosValidos(limpo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CPF inválido: dígitos verificadores incorretos.");
        }

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("cpf",      formatarCpf(limpo));
        r.put("valido",   true);
        r.put("situacao", "FORMATO_VALIDO");
        r.put("obs",      "Validação matemática confirmada. Para verificar situação cadastral " +
                "na Receita Federal, integre com SintegraWS, CPF.CNPJ ou serviço similar " +
                "mediante token e conformidade com a LGPD.");
        return r;
    }

    // -------------------------------------------------------------------------
    // Rejeita CPFs com todos os dígitos iguais (000.000.000-00, etc.)
    // -------------------------------------------------------------------------
    private boolean isFormatoValido(String cpf) {
        return !cpf.chars().allMatch(c -> c == cpf.charAt(0));
    }

    // -------------------------------------------------------------------------
    // Algoritmo oficial da Receita Federal para os dois dígitos verificadores
    // -------------------------------------------------------------------------
    private boolean isDigitosValidos(String cpf) {
        return calcularDigito(cpf, 9) == Character.getNumericValue(cpf.charAt(9))
                && calcularDigito(cpf, 10) == Character.getNumericValue(cpf.charAt(10));
    }

    private int calcularDigito(String cpf, int posicoes) {
        int soma = 0;
        for (int i = 0; i < posicoes; i++) {
            soma += Character.getNumericValue(cpf.charAt(i)) * (posicoes + 1 - i);
        }
        int resto = (soma * 10) % 11;
        return (resto == 10 || resto == 11) ? 0 : resto;
    }

    // -------------------------------------------------------------------------
    // Formata: 12345678901 → 123.456.789-01
    // -------------------------------------------------------------------------
    private String formatarCpf(String cpf) {
        return cpf.replaceAll("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
    }
}