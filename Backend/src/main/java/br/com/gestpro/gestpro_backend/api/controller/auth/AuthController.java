package br.com.gestpro.gestpro_backend.api.controller.auth;

import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.CadastroRequestDTO;
import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginResponse;
import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginUsuarioDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.service.authService.AuthenticationService;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService authService;

    @Value("${app.base-url}")
    private String baseUrl;

    public AuthController(AuthenticationService authService) {
        this.authService = authService;
    }


    // Cadastro manual
    @PostMapping(value = "/cadastro", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> cadastrarUsuario(@Valid @ModelAttribute CadastroRequestDTO request,
                                              BindingResult bindingResult) throws IOException {

        if (bindingResult.hasErrors()) {
            Map<String, String> erros = bindingResult.getFieldErrors()
                    .stream()
                    .collect(Collectors.toMap(
                            fe -> fe.getField(),
                            fe -> fe.getDefaultMessage()
                    ));
            return ResponseEntity.badRequest().body(erros);
        }

        Usuario retornoUsuario = authService.cadastrarManual(
                request.getNome(),
                request.getEmail(),
                request.getSenha(),
                request.getFoto(),
                baseUrl,
                "/auth/cadastro"
        );

        return ResponseEntity.ok(Map.of("mensagem", "Cadastro realizado! Verifique seu e-mail para confirmar a conta."));
    }


    // Confirmar e-mail
    @GetMapping("/confirmar")
    public void confirmarEmail(@RequestParam String token, HttpServletResponse response) throws IOException {
        try {
            boolean confirmado = authService.confirmarEmail(token);
            String status = confirmado ? "sucesso" : "erro";
            response.sendRedirect("http://localhost:3000/confirmar-email?status=" + status);
        } catch (ApiException e) {
            response.sendRedirect("http://localhost:3000/confirmar-email?status=erro?motivo=usuario-confirmado-ou-token-expirado");
        }
    }


    // Login manual
    // Login manual
    @PostMapping("/login")
    @Transactional
    public ResponseEntity<LoginResponse> loginUsuario(
            @RequestBody LoginUsuarioDTO loginRequest,
            HttpServletResponse response) throws IOException {

        LoginResponse loginResponse = authService.loginManual(
                loginRequest.email(),
                loginRequest.senha(),
                "/auth/login",
                response
        );

        // Cria cookie HttpOnly com token JWT
        ResponseCookie cookie = ResponseCookie.from("jwt_token", loginResponse.token())
                .httpOnly(true)
                .secure(false) // true se usar HTTPS
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();

        // Remove token do body para segurança
        LoginResponse safeResponse = new LoginResponse(
                null,
                loginResponse.nome(),
                loginResponse.email(),
                loginResponse.tipoPlano(),
                loginResponse.foto()
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(safeResponse);
    }


}
