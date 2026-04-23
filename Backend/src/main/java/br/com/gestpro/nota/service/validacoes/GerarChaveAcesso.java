package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.TipoNota;
import br.com.gestpro.nota.model.NotaFiscal;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

/**
 * Gera a chave de acesso de 44 dígitos conforme o padrão NF-e/NFC-e.
 * Formato: cUF(2) + AAMM(4) + CNPJ(14) + mod(2) + serie(3) + nNF(9) + tpEmis(1) + cNF(8) + cDV(1)
 *
 * Para fins de rascunho/demo (sem certificado A1), gera uma chave numérica válida.
 * Em produção, a chave é assinada junto com o XML pela SEFAZ.
 */
public class GerarChaveAcesso {

    private static final DateTimeFormatter AAMM = DateTimeFormatter.ofPattern("yyMM");
    private static final Random RNG = new Random();

    /**
     * Gera a chave de acesso baseada nos dados da nota.
     *
     * @param nota  Entidade NotaFiscal já persistida (com número sequencial)
     * @param cUF   Código IBGE da UF do emitente (ex: 35 = SP)
     * @return      String com 44 dígitos
     */
    public String gerar(NotaFiscal nota, String cUF) {
        String aamm    = AAMM.format(LocalDateTime.now());
        String cnpj    = limparCnpj(nota.getEmpresaCnpj());
        String modelo  = modeloPorTipo(nota.getTipo());
        String serie   = "001";
        String nNF     = String.format("%09d", extrairNumeroSequencial(nota.getNumero()));
        String tpEmis  = "1"; // 1 = emissão normal
        String cNF     = String.format("%08d", RNG.nextInt(100_000_000));

        String corpo = cUF + aamm + cnpj + modelo + serie + nNF + tpEmis + cNF;

        // Garante 43 dígitos antes do dígito verificador
        if (corpo.length() != 43) {
            corpo = corpo.substring(0, Math.min(corpo.length(), 43));
            while (corpo.length() < 43) corpo = "0" + corpo;
        }

        String cDV = String.valueOf(calcularDigitoVerificador(corpo));
        return corpo + cDV;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String modeloPorTipo(TipoNota tipo) {
        return switch (tipo) {
            case NFe  -> "55";
            case NFCE -> "65";
            case NFS  -> "99"; // NFS-e não usa chave SEFAZ, mas mantemos para uniformidade
        };
    }

    private String limparCnpj(String cnpj) {
        if (cnpj == null) return "00000000000000";
        String limpo = cnpj.replaceAll("\\D", "");
        return String.format("%-14s", limpo).replace(' ', '0').substring(0, 14);
    }

    private long extrairNumeroSequencial(String numero) {
        if (numero == null) return 1L;
        // Número no formato "NF-2024-000001" → extrai apenas os dígitos finais
        String[] partes = numero.split("[^0-9]+");
        for (int i = partes.length - 1; i >= 0; i--) {
            if (!partes[i].isEmpty()) {
                try { return Long.parseLong(partes[i]); } catch (NumberFormatException ignored) {}
            }
        }
        return 1L;
    }

    /**
     * Módulo 11 — padrão da SEFAZ para dígito verificador da chave de acesso.
     */
    public int calcularDigitoVerificador(String chave43) {
        int soma = 0;
        int peso = 2;
        for (int i = chave43.length() - 1; i >= 0; i--) {
            soma += Character.getNumericValue(chave43.charAt(i)) * peso;
            peso = (peso == 9) ? 2 : peso + 1;
        }
        int resto = soma % 11;
        return (resto == 0 || resto == 1) ? 0 : 11 - resto;
    }
}
