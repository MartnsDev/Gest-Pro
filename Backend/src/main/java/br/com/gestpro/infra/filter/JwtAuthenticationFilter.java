package br.com.gestpro.infra.filter;

import br.com.gestpro.auth.model.UsuarioPrincipal;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Set<String> ROTAS_PUBLICAS = Set.of(
            "/auth/login",
            "/auth/cadastro",
            "/auth/logout",
            "/auth/csrf",
            "/api/auth/esqueceu-senha",
            "/api/auth/redefinir-senha",
            "/api/payments/webhook"
    );

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository
    ) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();

        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || ROTAS_PUBLICAS.contains(path)
                || path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/api-docs/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = extrairTokenDoCookie(request);

        if (token == null) {
            // APIs autenticadas usam exclusivamente o JWT HttpOnly. Uma
            // autenticação antiga da sessão OAuth nunca pode substituir o
            // cookie atual nem sobreviver depois do logout.
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        // O JWT presente na requisição é a autoridade da API, mesmo que uma
        // HttpSession antiga tenha carregado outro SecurityContext.
        SecurityContextHolder.clearContext();

        try {
            String email = jwtService.getEmailFromToken(token);

            usuarioRepository.findByEmail(email).ifPresent(usuario -> {
                UsuarioPrincipal principal = new UsuarioPrincipal(usuario);

                if (jwtService.validarToken(token, principal)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    principal,
                                    null,
                                    principal.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            });
        } catch (RuntimeException ignored) {

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String extrairTokenDoCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if ("jwt_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
