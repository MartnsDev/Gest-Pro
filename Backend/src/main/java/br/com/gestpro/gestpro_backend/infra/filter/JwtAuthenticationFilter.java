package br.com.gestpro.gestpro_backend.infra.filter;

import br.com.gestpro.gestpro_backend.domain.model.auth.UsuarioPrincipal;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.infra.jwt.JwtService;
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

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = null;

        // Corrigido: pega o cookie "jwt_token" que você criou no login
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        try {
            // Só processa se houver token e ninguém estiver autenticado ainda
            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                String email = jwtService.getEmailFromToken(token);

                if (email != null) {
                    var usuarioOpt = usuarioRepository.findByEmail(email);

                    if (usuarioOpt.isPresent()) {
                        var userDetails = new UsuarioPrincipal(usuarioOpt.get());

                        // Valida token antes de autenticar
                        if (jwtService.validarToken(token, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log do erro, mas não impede a continuação da requisição
            System.out.println("❌ Erro ao validar token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
