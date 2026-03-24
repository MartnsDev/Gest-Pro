package br.com.gestpro.infra.filter;

import br.com.gestpro.auth.model.UsuarioPrincipal;
import br.com.gestpro.plano.StatusAcesso;

import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.jwt.JwtService;
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

        // 1. Tenta extrair do Header Authorization (Prioridade para LocalStorage/Mobile)
        String token = null;
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        // 2. Se não achou no Header, tenta no Cookie (Backup)
        if (token == null) {
            token = extrairTokenDoCookie(request);
        }

        try {
            if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String email = jwtService.getEmailFromToken(token);

                if (email != null) {
                    var usuarioOpt = usuarioRepository.findByEmail(email);

                    if (usuarioOpt.isPresent()) {
                        var usuario = usuarioOpt.get();

                        // Validação do Token
                        if (jwtService.validarToken(token, new UsuarioPrincipal(usuario))) {

                            // Verificação de Status de Acesso (Plano)
                            if (usuario.getStatusAcesso() != StatusAcesso.ATIVO) {
                                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                response.getWriter().write("{\"erro\": \"PLANO_INATIVO\"}");
                                return; // Interrompe aqui se o plano estiver inativo
                            }

                            // Se o plano está ATIVO, autentica o usuário
                            var userDetails = new UsuarioPrincipal(usuario);
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities()
                            );
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Use logs em vez de System.out para melhor debug no Railway
            logger.error("Erro ao validar token JWT: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extrairTokenDoCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if ("jwt_token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
