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
import java.util.function.Function;

@Service
public class VerificarCNPJ {

    private final WebClient webClient;

    public VerificarCNPJ(WebClient webClient) {
        this.webClient = webClient;
    }

    // -------------------------------------------------------------------------
    // Registro de provedores: URL builder + adaptador de resposta
    // -------------------------------------------------------------------------
    private record CnpjProvider(
            String nome,
            Function<String, String> urlBuilder,
            Function<Map<String, Object>, Map<String, Object>> adaptador
    ) {}

    private final List<CnpjProvider> PROVIDERS = List.of(

            // 1. ReceitaWS — schema original do seu código
            new CnpjProvider(
                    "ReceitaWS",
                    cnpj -> "https://receitaws.com.br/v1/cnpj/" + cnpj,
                    data -> {
                        if ("ERROR".equals(data.get("status"))) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                    data.getOrDefault("message", "CNPJ não encontrado.").toString());
                        }
                        Map<String, Object> r = new LinkedHashMap<>();
                        r.put("cnpj",        data.get("cnpj"));
                        r.put("nome",        data.get("nome"));
                        r.put("fantasia",    data.get("fantasia"));
                        r.put("situacao",    data.get("situacao"));
                        r.put("logradouro",  data.get("logradouro"));
                        r.put("numero",      data.get("numero"));
                        r.put("complemento", data.get("complemento"));
                        r.put("bairro",      data.get("bairro"));
                        r.put("municipio",   data.get("municipio"));
                        r.put("uf",          data.get("uf"));
                        r.put("cep",         data.get("cep"));
                        r.put("telefone",    data.get("telefone"));
                        r.put("email",       data.get("email"));
                        if (data.get("atividade_principal") instanceof List<?> atv && !atv.isEmpty()) {
                            if (atv.get(0) instanceof Map<?, ?> a) r.put("atividadePrincipal", a.get("text"));
                        }
                        return r;
                    }
            ),

            // 2. BrasilAPI — campos: razao_social, nome_fantasia, situacao_cadastral,
            //                logradouro, numero, complemento, bairro, municipio, uf, cep,
            //                ddd_telefone_1, email, cnae_fiscal_descricao
            new CnpjProvider(
                    "BrasilAPI",
                    cnpj -> "https://brasilapi.com.br/api/cnpj/v1/" + cnpj,
                    data -> {
                        Map<String, Object> r = new LinkedHashMap<>();
                        r.put("cnpj",        data.get("cnpj"));
                        r.put("nome",        data.get("razao_social"));
                        r.put("fantasia",    data.get("nome_fantasia"));
                        r.put("situacao",    data.get("situacao_cadastral"));
                        r.put("logradouro",  data.get("logradouro"));
                        r.put("numero",      data.get("numero"));
                        r.put("complemento", data.get("complemento"));
                        r.put("bairro",      data.get("bairro"));
                        r.put("municipio",   data.get("municipio"));
                        r.put("uf",          data.get("uf"));
                        r.put("cep",         data.get("cep"));
                        r.put("telefone",    data.get("ddd_telefone_1"));
                        r.put("email",       data.get("email"));
                        r.put("atividadePrincipal", data.get("cnae_fiscal_descricao"));
                        return r;
                    }
            ),

            // 3. CNPJ.ws — campos: razao_social, nome_fantasia, situacao.descricao,
            //              estabelecimento.logradouro, numero, complemento, bairro,
            //              cidade.nome, estado.sigla, cep, telefones[0].numero, emails[0].email
            new CnpjProvider(
                    "CNPJ.ws",
                    cnpj -> "https://publica.cnpj.ws/cnpj/" + cnpj,
                    data -> {
                        Map<String, Object> est = castMap(data.get("estabelecimento"));
                        Map<String, Object> sit = est != null ? castMap(est.get("situacao_cadastral")) : null;
                        Map<String, Object> cid = est != null ? castMap(est.get("cidade")) : null;
                        Map<String, Object> uf  = est != null ? castMap(est.get("estado")) : null;

                        String telefone = "";
                        if (est != null && est.get("telefones") instanceof List<?> tels && !tels.isEmpty()) {
                            if (tels.get(0) instanceof Map<?, ?> t) telefone = String.valueOf(t.get("numero"));
                        }
                        String email = "";
                        if (est != null && est.get("emails") instanceof List<?> emails && !emails.isEmpty()) {
                            if (emails.get(0) instanceof Map<?, ?> e) email = String.valueOf(e.get("email"));
                        }
                        String atv = "";
                        if (est != null && est.get("atividade_principal") instanceof Map<?, ?> ap) {
                            atv = String.valueOf(ap.get("descricao"));
                        }

                        Map<String, Object> r = new LinkedHashMap<>();
                        r.put("cnpj",        est != null ? est.get("cnpj") : null);
                        r.put("nome",        data.get("razao_social"));
                        r.put("fantasia",    est != null ? est.get("nome_fantasia") : null);
                        r.put("situacao",    sit != null ? sit.get("descricao") : null);
                        r.put("logradouro",  est != null ? est.get("logradouro") : null);
                        r.put("numero",      est != null ? est.get("numero") : null);
                        r.put("complemento", est != null ? est.get("complemento") : null);
                        r.put("bairro",      est != null ? est.get("bairro") : null);
                        r.put("municipio",   cid != null ? cid.get("nome") : null);
                        r.put("uf",          uf  != null ? uf.get("sigla") : null);
                        r.put("cep",         est != null ? est.get("cep") : null);
                        r.put("telefone",    telefone);
                        r.put("email",       email);
                        r.put("atividadePrincipal", atv);
                        return r;
                    }
            ),

            // 4. OpenCNPJ — campos: cnpj, razao_social, nome_fantasia, situacao_cadastral,
            //               logradouro, numero, complemento, bairro, municipio, uf, cep
            //               (não retorna telefone/email/atividade detalhados)
            new CnpjProvider(
                    "OpenCNPJ",
                    cnpj -> "https://api.opencnpj.org/" + cnpj,
                    data -> {
                        Map<String, Object> r = new LinkedHashMap<>();
                        r.put("cnpj",        data.get("cnpj"));
                        r.put("nome",        data.get("razao_social"));
                        r.put("fantasia",    data.get("nome_fantasia"));
                        r.put("situacao",    data.get("situacao_cadastral"));
                        r.put("logradouro",  data.get("logradouro"));
                        r.put("numero",      data.get("numero"));
                        r.put("complemento", data.get("complemento"));
                        r.put("bairro",      data.get("bairro"));
                        r.put("municipio",   data.get("municipio"));
                        r.put("uf",          data.get("uf"));
                        r.put("cep",         data.get("cep"));
                        r.put("telefone",    data.getOrDefault("telefone", ""));
                        r.put("email",       data.getOrDefault("email", ""));
                        r.put("atividadePrincipal", data.get("cnae_principal"));
                        return r;
                    }
            ),

            // 5. CNPJá Open (sem autenticação, dados em cache)
            //    campos: taxId, alias, company.name, status.text,
            //            address.street, number, details, district, city.name, state, zip, phones[0], emails[0]
            new CnpjProvider(
                    "CNPJá",
                    cnpj -> "https://api.cnpja.com/office/" + cnpj + "?strategy=CACHE",
                    data -> {
                        Map<String, Object> addr    = castMap(data.get("address"));
                        Map<String, Object> company = castMap(data.get("company"));
                        Map<String, Object> status  = castMap(data.get("status"));
                        Map<String, Object> city    = addr != null ? castMap(addr.get("city")) : null;

                        String telefone = "";
                        if (data.get("phones") instanceof List<?> phones && !phones.isEmpty()) {
                            if (phones.get(0) instanceof Map<?, ?> p) {
                                telefone = p.get("area") + "" + p.get("number");
                            }
                        }
                        String email = "";
                        if (data.get("emails") instanceof List<?> emails && !emails.isEmpty()) {
                            if (emails.get(0) instanceof Map<?, ?> e) email = String.valueOf(e.get("address"));
                        }
                        String atv = "";
                        if (data.get("mainActivity") instanceof Map<?, ?> ma) atv = String.valueOf(ma.get("text"));

                        Map<String, Object> r = new LinkedHashMap<>();
                        r.put("cnpj",        data.get("taxId"));
                        r.put("nome",        company != null ? company.get("name") : null);
                        r.put("fantasia",    data.get("alias"));
                        r.put("situacao",    status  != null ? status.get("text") : null);
                        r.put("logradouro",  addr    != null ? addr.get("street") : null);
                        r.put("numero",      addr    != null ? addr.get("number") : null);
                        r.put("complemento", addr    != null ? addr.get("details") : null);
                        r.put("bairro",      addr    != null ? addr.get("district") : null);
                        r.put("municipio",   city    != null ? city.get("name") : null);
                        r.put("uf",          addr    != null ? addr.get("state") : null);
                        r.put("cep",         addr    != null ? addr.get("zip") : null);
                        r.put("telefone",    telefone);
                        r.put("email",       email);
                        r.put("atividadePrincipal", atv);
                        return r;
                    }
            )
    );

    // -------------------------------------------------------------------------
    // Consulta principal com fallback encadeado
    // -------------------------------------------------------------------------
    public Map<String, Object> consultarCnpj(String cnpj) {
        String limpo = cnpj.replaceAll("\\D", "");
        if (limpo.length() != 14) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CNPJ inválido.");
        }

        StringBuilder erros = new StringBuilder();

        for (CnpjProvider provider : PROVIDERS) {
            try {
                Map<String, Object> raw = webClient.get()
                        .uri(provider.urlBuilder().apply(limpo))
                        .retrieve()
                        .onStatus(HttpStatusCode::is4xxClientError, response ->
                                Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                        "CNPJ não encontrado ou limite atingido em " + provider.nome())))
                        .onStatus(HttpStatusCode::is5xxServerError, response ->
                                Mono.error(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                                        "Erro de servidor em " + provider.nome())))
                        .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                        .block(Duration.ofSeconds(10));

                if (raw == null) {
                    erros.append("[").append(provider.nome()).append("] Resposta vazia. ");
                    continue;
                }

                // Aplica o adaptador — pode lançar ResponseStatusException se o CNPJ for inválido
                Map<String, Object> resultado = provider.adaptador().apply(raw);
                resultado.put("fonte", provider.nome()); // bônus: informa qual API respondeu
                return resultado;

            } catch (ResponseStatusException e) {
                // Se for erro de negócio (BAD_REQUEST) — CNPJ inválido de verdade — para na hora
                if (e.getStatusCode() == HttpStatus.BAD_REQUEST) throw e;
                // Caso contrário, tenta o próximo provedor
                erros.append("[").append(provider.nome()).append("] ").append(e.getReason()).append(". ");
            } catch (Exception e) {
                erros.append("[").append(provider.nome()).append("] ").append(e.getMessage()).append(". ");
            }
        }

        // Todos os provedores falharam
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Todos os serviços de consulta de CNPJ estão indisponíveis no momento. Tente novamente mais tarde. Detalhes: " + erros);
    }

    // -------------------------------------------------------------------------
    // Utilitário para cast seguro de Map
    // -------------------------------------------------------------------------
    @SuppressWarnings("unchecked")
    private static Map<String, Object> castMap(Object obj) {
        return (obj instanceof Map<?, ?> m) ? (Map<String, Object>) m : null;
    }
}