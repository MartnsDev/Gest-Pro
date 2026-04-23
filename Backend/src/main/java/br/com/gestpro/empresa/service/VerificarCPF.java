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
import java.util.Map;

@Service
public class VerificarCPF {

    private final WebClient webClient;

    public VerificarCPF(WebClient webClient) {
        this.webClient = webClient;
    }

    public Map<String, Object> consultarCpf(String cpf) {
        // Limpa caracteres especiais
        String limpo = cpf.replaceAll("\\D", "");

        if (limpo.length() != 11) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF deve conter 11 dígitos.");
        }

        Map<String, Object> data;

        try {
            // Exemplo utilizando uma URL de API (Substitua pela sua URL de provedor)
            data = webClient.get()
                    .uri("https://api.exemplo.com/v1/cpf/" + limpo)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response ->
                            Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "CPF não encontrado ou limite de buscas atingido.")))
                    .onStatus(HttpStatusCode::is5xxServerError, response ->
                            Mono.error(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Serviço de consulta de CPF indisponível.")))
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block(Duration.ofSeconds(10));

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Erro ao consultar CPF. O serviço pode estar offline.");
        }

        if (data == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum dado retornado para este CPF.");
        }

        // Mapeamento organizado dos dados (Baseado em retornos comuns de APIs de CPF)
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("cpf", data.get("cpf"));
        r.put("nome", data.get("nome"));
        r.put("dataNascimento", data.get("data_nascimento"));
        r.put("situacao", data.get("situacao")); // Ex: "REGULAR"

        return r;
    }
}