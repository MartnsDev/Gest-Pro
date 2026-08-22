package br.com.gestpro.auth.controller;

import br.com.gestpro.auth.dto.googleAuthDTO.UsuarioResponse;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.auth.service.AuthCookieService;
import br.com.gestpro.infra.exception.ApiException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final AuthCookieService authCookieService;

    public UsuarioController(
            UsuarioRepository usuarioRepository,
            AuthCookieService authCookieService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.authCookieService = authCookieService;
    }

    @GetMapping("/api/usuario")
    public ResponseEntity<UsuarioResponse> getUsuario(
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ApiException(
                    "Não autenticado.",
                    HttpStatus.UNAUTHORIZED,
                    "/api/usuario"
            );
        }

        Usuario usuario = usuarioRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException(
                        "Usuário não encontrado.",
                        HttpStatus.NOT_FOUND,
                        "/api/usuario"
                ));

        return ResponseEntity.ok(UsuarioResponse.from(usuario));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        authCookieService.remover(response);
        authCookieService.removerSessaoTemporaria(response);
        return ResponseEntity.noContent().build();
    }
}
