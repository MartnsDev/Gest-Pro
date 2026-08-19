package br.com.gestpro.auth.service;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class AuthCookieService {

    private final CookieSecurityProperties properties;

    public AuthCookieService(
            CookieSecurityProperties properties
    ) {
        this.properties = properties;
    }

    public void adicionar(
            HttpServletResponse response,
            String token
    ) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT não pode ser vazio."
            );
        }

        ResponseCookie cookie = ResponseCookie
                .from("jwt_token", token)
                .httpOnly(true)
                .secure(properties.isSecure())
                .sameSite(properties.getSameSite())
                .path("/")
                .maxAge(Duration.ofSeconds(
                        properties.getMaxAgeSeconds()
                ))
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );
    }

    public void remover(
            HttpServletResponse response
    ) {
        ResponseCookie cookie = ResponseCookie
                .from("jwt_token", "")
                .httpOnly(true)
                .secure(properties.isSecure())
                .sameSite(properties.getSameSite())
                .path("/")
                .maxAge(Duration.ZERO)
                .build();

        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookie.toString()
        );
    }
}