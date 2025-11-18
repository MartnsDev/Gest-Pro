package br.com.gestpro.gestpro_backend.infra.filter;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusAcesso;
import br.com.gestpro.gestpro_backend.infra.util.backups.GoogleAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleAuthService googleAuthService;

    public OAuth2LoginSuccessHandler(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
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
        String redirectUrl;
        if (usuario.getStatusAcesso() == StatusAcesso.ATIVO) {
            redirectUrl = "http://localhost:3000/dashboard";
        } else {
            redirectUrl = "http://localhost:3000/pagamento";
        }

        response.sendRedirect(redirectUrl);
    }
}
