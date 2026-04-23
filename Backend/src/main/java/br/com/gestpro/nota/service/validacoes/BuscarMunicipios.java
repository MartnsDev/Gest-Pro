package br.com.gestpro.nota.service.validacoes;

import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Consulta a lista de municípios de uma UF via API do IBGE.
 * Endpoint: https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios
 *
 * Retorna lista com { "id": 3550308, "nome": "São Paulo" }
 */
public class BuscarMunicipios {

    private static final String IBGE_BASE =
            "https://servicodados.ibge.gov.br/api/v1/localidades/estados";

    private final WebClient webClient;

    public BuscarMunicipios(WebClient webClient) {
        this.webClient = webClient;
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> buscarMunicipios(String uf) {

        if (uf == null || uf.isBlank() || uf.trim().length() != 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "UF inválida. Informe a sigla com 2 letras (ex: SP)");
        }

        String sigla = uf.trim().toUpperCase();

        try {
            List<?> resposta = webClient.get()
                    .uri(IBGE_BASE + "/" + sigla + "/municipios?orderBy=nome")
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(),
                            resp -> resp.bodyToMono(String.class).map(body ->
                                    new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                            "UF não encontrada: " + sigla)))
                    .bodyToMono(List.class)
                    .block();

            if (resposta == null) return List.of();

            // Simplifica o retorno: apenas id e nome
            return resposta.stream()
                    .filter(item -> item instanceof Map)
                    .map(item -> {
                        Map<?, ?> m = (Map<?, ?>) item;
                        return Map.<String, Object>of(
                                "id",   m.get("id"),
                                "nome", m.get("nome")
                        );
                    })
                    .toList();

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Erro ao consultar municípios do IBGE: " + e.getMessage());
        }
    }
}
