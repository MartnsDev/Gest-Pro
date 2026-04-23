package br.com.gestpro.nota.service.validacoes;

import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Consulta dados de empresa pelo CNPJ via API pública ReceitaWS.
 * Endpoint: https://www.receitaws.com.br/v1/cnpj/{cnpj}
 *
 * Campos retornados normalizados:
 *  - cnpj, nome, fantasia, situacao, tipo, porte,
 *    logradouro, numero, complemento, bairro, municipio, uf, cep,
 *    telefone, email, abertura, capital_social, simples, simei
 *
 * Obs: ReceitaWS tem limite de 3 req/min no plano gratuito.
 * Para produção, considerar: https://open.cnpja.com ou BrasilAPI.
 */
public class ConsultarCNPJ {

    private static final String RECEITA_BASE = "https://brasilapi.com.br/api/cnpj/v1";

    private final WebClient webClient;

    public ConsultarCNPJ(WebClient webClient) {
        this.webClient = webClient;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> consultarCnpj(String cnpj) {

        String cnpjLimpo = cnpj != null ? cnpj.replaceAll("\\D", "") : "";

        if (cnpjLimpo.length() != 14) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CNPJ inválido. Informe 14 dígitos");
        }

        if (!validarCnpj(cnpjLimpo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CNPJ com dígito verificador inválido: " + cnpjLimpo);
        }

        try {
            Map<?, ?> apiResp = webClient.get()
                    .uri(RECEITA_BASE + "/" + cnpjLimpo)
                    .header("Accept", "application/json")
                    .retrieve()
                    .onStatus(status -> status.value() == 404,
                            resp -> resp.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(HttpStatus.NOT_FOUND,
                                            "CNPJ não encontrado: " + cnpjLimpo)))
                    .onStatus(status -> status.is4xxClientError(),
                            resp -> resp.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                            "Erro ao consultar CNPJ: " + body)))
                    .bodyToMono(Map.class)
                    .block();

            if (apiResp == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "CNPJ não encontrado: " + cnpjLimpo);
            }

            // BrasilAPI CNPJ response normalization
            Map<String, Object> resultado = new LinkedHashMap<>();
            resultado.put("cnpj",          formatarCnpj(cnpjLimpo));
            resultado.put("cnpjLimpo",     cnpjLimpo);
            resultado.put("nome",          apiResp.get("razao_social"));
            resultado.put("fantasia",      apiResp.get("nome_fantasia"));
            resultado.put("situacao",      apiResp.get("descricao_situacao_cadastral"));
            resultado.put("tipo",          apiResp.get("descricao_identificador_matriz_filial"));
            resultado.put("porte",         apiResp.get("descricao_porte"));
            resultado.put("naturezaJuridica", apiResp.get("natureza_juridica"));
            resultado.put("abertura",      apiResp.get("data_inicio_atividade"));

            // Endereço
            resultado.put("logradouro",    apiResp.get("logradouro"));
            resultado.put("numero",        apiResp.get("numero"));
            resultado.put("complemento",   apiResp.get("complemento"));
            resultado.put("bairro",        apiResp.get("bairro"));
            resultado.put("municipio",     apiResp.get("municipio"));
            resultado.put("uf",            apiResp.get("uf"));
            resultado.put("cep",           apiResp.get("cep"));

            // Contato
            resultado.put("telefone",      extrairTelefone(apiResp));
            resultado.put("email",         apiResp.get("email"));

            // Regime fiscal
            resultado.put("capitalSocial", apiResp.get("capital_social"));

            return resultado;

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao consultar CNPJ: " + e.getMessage());
        }
    }

    // ── Validação dígito verificador ──────────────────────────────────────────

    private boolean validarCnpj(String cnpj) {
        if (cnpj.chars().distinct().count() == 1) return false; // "00000000000000" etc.
        int[] pesos1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] pesos2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        return calcDig(cnpj, pesos1) == Character.getNumericValue(cnpj.charAt(12))
                && calcDig(cnpj, pesos2) == Character.getNumericValue(cnpj.charAt(13));
    }

    private int calcDig(String cnpj, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) soma += Character.getNumericValue(cnpj.charAt(i)) * pesos[i];
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private String formatarCnpj(String cnpj) {
        return String.format("%s.%s.%s/%s-%s",
                cnpj.substring(0, 2), cnpj.substring(2, 5),
                cnpj.substring(5, 8), cnpj.substring(8, 12), cnpj.substring(12));
    }

    @SuppressWarnings("unchecked")
    private String extrairTelefone(Map<?, ?> resp) {
        // BrasilAPI retorna lista de telefones
        Object qsa = resp.get("qsa");
        Object tel = resp.get("ddd_telefone_1");
        if (tel instanceof String s && !s.isBlank()) return s.trim();
        return null;
    }
}
