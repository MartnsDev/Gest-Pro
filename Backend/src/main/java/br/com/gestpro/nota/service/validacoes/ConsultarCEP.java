package br.com.gestpro.nota.service.validacoes;

import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

public class ConsultarCEP {

    private final WebClient webClient;

    public ConsultarCEP(WebClient webClient) {
        this.webClient = webClient;
    }

    public Map<String, Object> consultarCep(String cep) {
        String limpo = cep.replaceAll("\\D", "");
        if (limpo.length() != 8)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP inválido.");
        try {
            Map<?, ?> data = webClient.get()
                    .uri("https://viacep.com.br/ws/" + limpo + "/json/")
                    .retrieve().bodyToMono(Map.class).block();

            if (data == null || Boolean.TRUE.equals(data.get("erro")))
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP não encontrado.");

            Map<String, Object> r = new LinkedHashMap<>();
            r.put("cep",        data.get("cep"));
            r.put("logradouro", data.get("logradouro"));
            r.put("complemento",data.get("complemento"));
            r.put("bairro",     data.get("bairro"));
            r.put("cidade",     data.get("localidade"));
            r.put("estado",     data.get("uf"));
            r.put("ibge",       data.get("ibge"));
            return r;
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao consultar CEP."); }
    }
}
