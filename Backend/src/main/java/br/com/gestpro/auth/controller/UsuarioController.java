package br.com.gestpro.auth.controller;

import br.com.gestpro.auth.dto.googleAuthDTO.UsuarioResponse;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.auth.service.AuthenticationService;
import br.com.gestpro.infra.jwt.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<?> getUsuario(@CookieValue(name = "jwt_token", required = false) String token) {
        if (token == null || !jwtService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Usuário não logado ou token inválido");
        }

        String email = jwtService.getEmailFromToken(token);
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Usuário não encontrado");
        }

        UsuarioResponse response = new UsuarioResponse(
                usuario.getNome(),
                usuario.getEmail(),
                // Se não houver foto, retorna imagem padrão
                (usuario.getFoto() != null && !usuario.getFoto().isBlank())
                        ? usuario.getFoto()
                        : "/placeholder-user.jpg",
                usuario.getStatusAcesso()
        );

        return ResponseEntity.ok(response);
    }

    // ===============================
    // Atualizar Plano
    // ===============================
    @PostMapping("/api/pagamento")
    public ResponseEntity<?> atualizarPlano(
            @RequestParam String email,
            @RequestParam int duracaoDias // recebe quantos dias o plano terá
    ) {
        // Atualiza o plano via service
        Usuario usuarioAtualizado = authenticationService.atualizarPlano(email, duracaoDias);

        // Retorna uma mensagem ou os dados atualizados do usuário
        return ResponseEntity.ok().body(
                Map.of(
                        "mensagem", "Plano atualizado com sucesso!",
                        "usuario", usuarioAtualizado
                )
        );
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
