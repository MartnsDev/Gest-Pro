package br.com.gestpro.infra.filter;

import br.com.gestpro.auth.model.UsuarioPrincipal;
import br.com.gestpro.plano.StatusAcesso;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class PlanAccessFilter
        extends OncePerRequestFilter {

    private static final Set<String> ROTAS_PERMITIDAS = Set.of(
            "/api/usuario",
            "/api/payments/create-checkout-session",
            "/api/payments/session-info",
            "/api/payments/portal",
            "/api/v1/dashboard/vendas/plano-usuario"
    );

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) {
        String path = request.getServletPath();

        if ("OPTIONS".equalsIgnoreCase(
                request.getMethod()
        )) {
            return true;
        }

        /*
         * Este filtro protege somente APIs.
         */
        if (!path.startsWith("/api/")) {
            return true;
        }

        if (ROTAS_PERMITIDAS.contains(path)) {
            return true;
        }

        return path.startsWith("/api/auth/")
                || path.equals("/api/payments/webhook");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        /*
         * Se não houver autenticação, deixa o Spring Security produzir 401.
         */
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof UsuarioPrincipal principal)) {
            filterChain.doFilter(request, response);
            return;
        }

        StatusAcesso status =
                principal.getUsuario()
                        .getStatusAcesso();

        if (status == StatusAcesso.ATIVO) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(
                HttpServletResponse.SC_FORBIDDEN
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        response.setCharacterEncoding("UTF-8");

        response.setHeader(
                "Cache-Control",
                "no-store"
        );

        response.getWriter().write(
                "{\"erro\":\"PLANO_INATIVO\","
                        + "\"mensagem\":\"Regularize sua assinatura para continuar.\"}"
        );
    }
}