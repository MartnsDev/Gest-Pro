package br.com.gestpro.infra.filter;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.service.GoogleAuthService;
import br.com.gestpro.plano.StatusAcesso;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleAuthService googleAuthService;
    private final String URL_FRONTEND;

    public OAuth2LoginSuccessHandler(GoogleAuthService googleAuthService,
                                     @Value("${app.frontend.url}") String URL_FRONTEND) {
        this.googleAuthService = googleAuthService;
        this.URL_FRONTEND = URL_FRONTEND;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2AuthenticationToken authToken = (OAuth2AuthenticationToken) authentication;
        var attributes = authToken.getPrincipal().getAttributes();

        String email = attributes.get("email").toString();
        String nome = attributes.get("name").toString();
        String foto = attributes.get("picture").toString();

        // Cria ou atualiza usuário
        Usuario usuario = googleAuthService.loginOrRegister(email, nome, foto);

        // Gera JWT
        String token = googleAuthService.gerarToken(usuario);

//        // Cria cookie seguro com token
//        Cookie jwtCookie = new Cookie("jwt_token", token);
//        jwtCookie.setHttpOnly(true);
//        jwtCookie.setSecure(true);
//        jwtCookie.setPath("/");
//        jwtCookie.setMaxAge(7 * 24 * 60 * 60);
//        jwtCookie.setAttribute("SameSite", "None");
//        // ---------------------------------------
//
//        response.addCookie(jwtCookie);

        String redirectUrl = usuario.getStatusAcesso() == StatusAcesso.ATIVO
                ? URL_FRONTEND + "/dashboard?token=" + token
                : URL_FRONTEND + "/pagamento?token=" + token;

        response.sendRedirect(redirectUrl);
    }

    public String getFrontendUrl() {
        return URL_FRONTEND;
    }
}
