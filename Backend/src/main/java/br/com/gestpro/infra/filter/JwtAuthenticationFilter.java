package br.com.gestpro.infra.filter;

import br.com.gestpro.auth.model.UsuarioPrincipal;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.jwt.JwtService;
import br.com.gestpro.plano.StatusAcesso;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Tenta extrair token: primeiro do cookie, depois do header Authorization
        String token = extrairTokenDoCookie(request);
        if (token == null) {
            token = extrairTokenDoHeader(request);
        }

        try {
            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                String email = jwtService.getEmailFromToken(token);

                if (email != null) {
                    var usuarioOpt = usuarioRepository.findByEmail(email);

                    if (usuarioOpt.isPresent()) {
                        var usuario = usuarioOpt.get();
                        var userDetails = new UsuarioPrincipal(usuario);

                        if (jwtService.validarToken(token, userDetails)) {

                            // Bloqueia rotas protegidas se plano inativo
                            // (exceto /pagamento e rotas de auth)
                            if (usuario.getStatusAcesso() != StatusAcesso.ATIVO) {
                                String path = request.getRequestURI();
                                boolean isRotaPermitida = path.startsWith("/auth/")
                                        || path.startsWith("/api/auth/")
                                        || path.startsWith("/api/payments/")
                                        || path.startsWith("/oauth2/")
                                        || path.equals("/api/usuario");

                                if (!isRotaPermitida) {
                                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                    response.getWriter().write("{\"erro\": \"Plano inativo\"}");
                                    return;
                                }
                            }

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            authToken.setDetails(
                                    new WebAuthenticationDetailsSource().buildDetails(request)
                            );
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Erro ao validar token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    // Lê o cookie jwt_token (login manual via HttpOnly cookie)
    private String extrairTokenDoCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if ("jwt_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // Lê o header Authorization: Bearer <token> (fallback para Google OAuth redirect)
    private String extrairTokenDoHeader(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}