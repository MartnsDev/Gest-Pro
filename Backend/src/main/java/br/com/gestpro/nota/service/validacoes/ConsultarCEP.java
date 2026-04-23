package br.com.gestpro.nota.service.validacoes;

import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Consulta endereço pelo CEP via ViaCEP (https://viacep.com.br).
 * Formato de retorno normalizado para uso interno do GestPro.
 *
 * Campo retornado:
 *  - cep, logradouro, complemento, bairro, cidade, estado, ibge, gia, ddd, siafi
 */
public class ConsultarCEP {

    private static final String VIACEP_BASE = "https://viacep.com.br/ws";

    private final WebClient webClient;

    public ConsultarCEP(WebClient webClient) {
        this.webClient = webClient;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> consultarCep(String cep) {

        String cepLimpo = cep != null ? cep.replaceAll("\\D", "") : "";

        if (cepLimpo.length() != 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CEP inválido. Informe 8 dígitos (ex: 01310-100 ou 01310100)");
        }

        try {
            Map<?, ?> viaCepResp = webClient.get()
                    .uri(VIACEP_BASE + "/" + cepLimpo + "/json/")
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(),
                            resp -> resp.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(HttpStatus.NOT_FOUND,
                                            "CEP não encontrado: " + cepLimpo)))
                    .bodyToMono(Map.class)
                    .block();

            if (viaCepResp == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "CEP não encontrado: " + cepLimpo);
            }

            // ViaCEP retorna { "erro": true } quando o CEP não existe
            if (Boolean.TRUE.equals(viaCepResp.get("erro"))) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "CEP não encontrado: " + cepLimpo);
            }

            // Normaliza resposta
            Map<String, Object> resultado = new LinkedHashMap<>();
            resultado.put("cep",          formatarCep(cepLimpo));
            resultado.put("logradouro",   viaCepResp.get("logradouro"));
            resultado.put("complemento",  viaCepResp.get("complemento"));
            resultado.put("bairro",       viaCepResp.get("bairro"));
            resultado.put("cidade",       viaCepResp.get("localidade")); // ViaCEP usa "localidade"
            resultado.put("estado",       viaCepResp.get("uf"));         // ViaCEP usa "uf"
            resultado.put("ibge",         viaCepResp.get("ibge"));
            resultado.put("ddd",          viaCepResp.get("ddd"));
            resultado.put("siafi",        viaCepResp.get("siafi"));
            return resultado;

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao consultar ViaCEP: " + e.getMessage());
        }
    }

    private String formatarCep(String cep8) {
        return cep8.substring(0, 5) + "-" + cep8.substring(5);
    }
}
