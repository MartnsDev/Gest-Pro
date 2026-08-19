package br.com.gestpro.infra.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class CorsConfig {

    private final String frontendUrl;

    public CorsConfig(
            @Value("${app.frontend.url}")
            String frontendUrl
    ) {
        this.frontendUrl =
                normalizarOrigem(frontendUrl);
    }

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration config =
                new CorsConfiguration();

        config.setAllowCredentials(true);

        Set<String> origens =
                new LinkedHashSet<>();

        origens.add(frontendUrl);
        origens.add("https://gestpro.site");
        origens.add("https://www.gestpro.site");
        origens.add("http://localhost:3000");

        config.setAllowedOrigins(
                new ArrayList<>(origens)
        );

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of(
                "Content-Type",
                "X-CSRF-TOKEN",
                "X-Requested-With",
                "Accept"
        ));

        config.setExposedHeaders(List.of());

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }

    private String normalizarOrigem(String origem) {
        if (origem == null || origem.isBlank()) {
            throw new IllegalStateException(
                    "app.frontend.url não configurada."
            );
        }

        String valor = origem.trim();

        while (valor.endsWith("/")) {
            valor = valor.substring(
                    0,
                    valor.length() - 1
            );
        }

        return valor;
    }
}