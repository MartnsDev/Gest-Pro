package br.com.gestpro.nota.service.validacoes;

import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class BuscarMunicipios {

    private final WebClient webClient;

    public BuscarMunicipios(WebClient webClient) {
        this.webClient = webClient;
    }

    public List<Map<String, Object>> buscarMunicipios(String uf) {
        try {
            List<?> data = webClient.get()
                    .uri("https://servicodados.ibge.gov.br/api/v1/localidades/estados/" + uf + "/municipios")
                    .retrieve().bodyToMono(List.class).block();
            if (data == null) return List.of();
            return data.stream()
                    .filter(m -> m instanceof Map)
                    .map(m -> {
                        Map<?, ?> mu = (Map<?, ?>) m;
                        Map<String, Object> item = new LinkedHashMap<>();
                        item.put("id", mu.get("id"));
                        item.put("nome", mu.get("nome"));
                        return item;
                    })
                    .toList();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao buscar municípios.");
        }
    }

}