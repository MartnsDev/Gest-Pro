package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor // <-- Lombok: Injeta o WebClient pelo construtor automaticamente
public class BuscarMunicipios {

    private static final String IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";

    private final WebClient webClient;

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> buscarMunicipios(String uf) {

        if (uf == null || uf.isBlank() || uf.trim().length() != 2) {
            throw new ApiException(
                    "UF inválida. Informe a sigla com 2 letras (ex: SP)",
                    HttpStatus.BAD_REQUEST,
                    "/api/nota-fiscal/municipios"
            );
        }

        String sigla = uf.trim().toUpperCase();

        try {
            List<?> resposta = webClient.get()
                    .uri(IBGE_BASE + "/" + sigla + "/municipios?orderBy=nome")
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(),
                            resp -> resp.bodyToMono(String.class).flatMap(body -> {
                                log.warn("IBGE retornou 4xx para a UF: {}", sigla);
                                return Mono.error(new ApiException(
                                        "UF não encontrada: " + sigla,
                                        HttpStatus.BAD_REQUEST,
                                        "/api/nota-fiscal/municipios"
                                ));
                            }))
                    .bodyToMono(List.class)
                    .block(); // Transforma a chamada assíncrona em síncrona (aguarda o retorno)

            if (resposta == null || resposta.isEmpty()) {
                return List.of();
            }

            // Simplifica o retorno: pegamos apenas 'id' e 'nome' do trambolho que o IBGE devolve
            return resposta.stream()
                    .filter(item -> item instanceof Map)
                    .map(item -> {
                        Map<?, ?> m = (Map<?, ?>) item;
                        return Map.<String, Object>of(
                                "id", m.get("id"),
                                "nome", m.get("nome")
                        );
                    })
                    .collect(Collectors.toList());

        } catch (ApiException e) {
            // Se for a nossa ApiException (UF inválida), repassa direto pro Controller
            throw e;
        } catch (Exception e) {
            // Se a API do IBGE cair (o que acontece de vez em quando), capturamos aqui
            log.error("Erro ao consultar IBGE para a UF {}: {}", sigla, e.getMessage());
            throw new ApiException(
                    "Erro ao consultar municípios do IBGE. O serviço do governo pode estar instável.",
                    HttpStatus.BAD_GATEWAY,
                    "/api/nota-fiscal/municipios"
            );
        }
    }
}