package br.com.gestpro.plano.stripe.service;

import br.com.gestpro.plano.stripe.PlanoTipo;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "stripe.price")
public class StripePriceProperties {

    private String basico;
    private String pro;
    private String premium;

    private Map<PlanoTipo, String> pricePorPlano =
            Collections.emptyMap();

    private Map<String, PlanoTipo> planoPorPrice =
            Collections.emptyMap();

    @PostConstruct
    public void inicializar() {
        validarPriceId(basico, "BASICO");
        validarPriceId(pro, "PRO");
        validarPriceId(premium, "PREMIUM");

        if (basico.equals(pro)
                || basico.equals(premium)
                || pro.equals(premium)) {
            throw new IllegalStateException(
                    "Cada plano deve possuir um Stripe Price ID diferente."
            );
        }

        EnumMap<PlanoTipo, String> porPlano =
                new EnumMap<>(PlanoTipo.class);

        porPlano.put(PlanoTipo.BASICO, basico);
        porPlano.put(PlanoTipo.PRO, pro);
        porPlano.put(PlanoTipo.PREMIUM, premium);

        Map<String, PlanoTipo> porPrice =
                new HashMap<>();

        porPrice.put(basico, PlanoTipo.BASICO);
        porPrice.put(pro, PlanoTipo.PRO);
        porPrice.put(premium, PlanoTipo.PREMIUM);

        pricePorPlano =
                Collections.unmodifiableMap(porPlano);

        planoPorPrice =
                Collections.unmodifiableMap(porPrice);
    }

    public String getPriceId(PlanoTipo plano) {
        if (plano == null) {
            throw new IllegalArgumentException(
                    "O plano não pode ser nulo."
            );
        }

        String priceId = pricePorPlano.get(plano);

        if (priceId == null) {
            throw new IllegalArgumentException(
                    "Plano não configurado na Stripe: "
                            + plano
            );
        }

        return priceId;
    }

    public PlanoTipo fromPriceId(String priceId) {
        if (priceId == null || priceId.isBlank()) {
            throw new IllegalArgumentException(
                    "Stripe Price ID não informado."
            );
        }

        PlanoTipo plano =
                planoPorPrice.get(priceId.trim());

        if (plano == null) {
            /*
             * Não coloque todos os IDs configurados na mensagem.
             */
            throw new IllegalArgumentException(
                    "Stripe Price ID não reconhecido."
            );
        }

        return plano;
    }

    private void validarPriceId(
            String priceId,
            String nomePlano
    ) {
        if (priceId == null || priceId.isBlank()) {
            throw new IllegalStateException(
                    "Stripe Price ID do plano "
                            + nomePlano
                            + " não configurado."
            );
        }

        if (!priceId.startsWith("price_")) {
            throw new IllegalStateException(
                    "Stripe Price ID inválido para o plano "
                            + nomePlano
                            + ". O valor deve começar com 'price_'."
            );
        }
    }

    public String getBasico() {
        return basico;
    }

    public void setBasico(String basico) {
        this.basico = normalizar(basico);
    }

    public String getPro() {
        return pro;
    }

    public void setPro(String pro) {
        this.pro = normalizar(pro);
    }

    public String getPremium() {
        return premium;
    }

    public void setPremium(String premium) {
        this.premium = normalizar(premium);
    }

    private String normalizar(String valor) {
        return valor == null
                ? null
                : valor.trim();
    }
}