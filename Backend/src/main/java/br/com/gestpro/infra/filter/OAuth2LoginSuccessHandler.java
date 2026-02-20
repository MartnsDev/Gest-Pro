package br.com.gestpro.infra.filter;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.StatusAcesso;
import br.com.gestpro.infra.util.backups.GoogleAuthService;
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

        // Cria cookie seguro com token
        Cookie jwtCookie = new Cookie("jwt_token", token);
        jwtCookie.setHttpOnly(true);      // não acessível via JS
        jwtCookie.setSecure(false);        // colocar true em produção com HTTPS
        jwtCookie.setPath("/");            // disponível para todo domínio
        jwtCookie.setMaxAge(7 * 24 * 60 * 60); // expira em 7 dias

        response.addCookie(jwtCookie);

        // Redireciona de acordo com StatusAcesso
        String redirectUrl = usuario.getStatusAcesso() == StatusAcesso.ATIVO
                ? URL_FRONTEND + "/dashboard"
                : URL_FRONTEND + "/pagamento";

        response.sendRedirect(redirectUrl);
    }

    public String getFrontendUrl() {
        return URL_FRONTEND;
    }
}
