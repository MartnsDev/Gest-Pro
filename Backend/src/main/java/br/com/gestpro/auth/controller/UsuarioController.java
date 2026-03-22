package br.com.gestpro.auth.controller;

import br.com.gestpro.auth.dto.UsuarioResponse;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.auth.service.AuthenticationService;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.infra.jwt.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
//@RequestMapping("/api")
public class UsuarioController {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final AuthenticationService authenticationService;

    public UsuarioController(JwtService jwtService,
                             UsuarioRepository usuarioRepository,
                             AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.authenticationService = authenticationService;
    }


    @GetMapping("/api/usuario")
    public ResponseEntity<UsuarioResponse> getUsuario(Authentication authentication) {
        Usuario u = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ApiException("Usuário não encontrado.",
                        HttpStatus.NOT_FOUND, "/api/usuario"));

        return ResponseEntity.ok(UsuarioResponse.from(u));
    }

    // ===============================
    // Logout
    // ===============================
    @PostMapping("/auth/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt_token", null); // mesmo nome usado no login
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // apenas HTTPS em produção
        cookie.setPath("/");
        cookie.setMaxAge(0); // expira imediatamente

        response.addCookie(cookie);

        return ResponseEntity.ok("Logout realizado com sucesso.");
    }

}
