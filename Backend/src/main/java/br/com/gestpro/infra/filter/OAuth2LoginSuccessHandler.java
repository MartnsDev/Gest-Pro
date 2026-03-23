package br.com.gestpro.infra.filter;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.service.GoogleAuthService;
import br.com.gestpro.plano.StatusAcesso;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

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
        String nome  = attributes.get("name").toString();
        String foto  = attributes.get("picture").toString();

        // Cria ou atualiza usuário no banco
        Usuario usuario = googleAuthService.loginOrRegister(email, nome, foto);

        // Gera JWT
        String token = googleAuthService.gerarToken(usuario);

        // Redireciona com token na URL — o frontend captura e salva no próprio cookie
        // (Cookie cross-domain não funciona entre subdomínios diferentes do Railway)
        String destino = usuario.getStatusAcesso() == StatusAcesso.ATIVO
                ? "/dashboard"
                : "/pagamento";

        response.sendRedirect(URL_FRONTEND + destino + "?token=" + token);
    }

    public String getFrontendUrl() {
        return URL_FRONTEND;
    }
}