package br.com.gestpro.empresa.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class VerificarCNPJ {

    private final WebClient webClient;

    public VerificarCNPJ(WebClient webClient) {
        this.webClient = webClient;
    }

    public Map<String, Object> consultarCnpj(String cnpj) {
        String limpo = cnpj.replaceAll("\\D", "");

        if (limpo.length() != 14) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido.");
        }

        Map<String, Object> data;

        try {
            // Única chamada com tratamento de erros HTTP e Timeout
            data = webClient.get()
                    .uri("https://receitaws.com.br/v1/cnpj/" + limpo)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response ->
                            Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ não encontrado ou limite de buscas atingido.")))
                    .onStatus(HttpStatusCode::is5xxServerError, response ->
                            Mono.error(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Serviço da Receita Federal indisponível.")))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block(Duration.ofSeconds(10)); // Timeout de 10s evita que a thread trave

        } catch (ResponseStatusException e) {
            throw e; // Repassa exceções mapeadas acima
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Erro ao consultar CNPJ. O serviço pode estar indisponível.");
        }

        // A ReceitaWS pode retornar HTTP 200, mas com status interno "ERROR" (ex: CNPJ rejeitado)
        if (data == null || "ERROR".equals(data.get("status"))) {
            String errorMessage = data != null && data.get("message") != null ?
                    (String) data.get("message") : "Erro desconhecido ao consultar a Receita.";
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage);
        }

        // Mapeamento dos dados para o retorno
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("cnpj", data.get("cnpj"));
        r.put("nome", data.get("nome"));
        r.put("fantasia", data.get("fantasia"));
        r.put("situacao", data.get("situacao"));
        r.put("logradouro", data.get("logradouro"));
        r.put("numero", data.get("numero"));
        r.put("complemento", data.get("complemento"));
        r.put("bairro", data.get("bairro"));
        r.put("municipio", data.get("municipio"));
        r.put("uf", data.get("uf"));
        r.put("cep", data.get("cep"));
        r.put("telefone", data.get("telefone"));
        r.put("email", data.get("email"));

        // Tratamento seguro para a lista de atividade principal
        if (data.get("atividade_principal") instanceof List<?> atv && !atv.isEmpty()) {
            if (atv.get(0) instanceof Map<?, ?> a) {
                r.put("atividadePrincipal", a.get("text"));
            }
        }

        return r;
    }
}