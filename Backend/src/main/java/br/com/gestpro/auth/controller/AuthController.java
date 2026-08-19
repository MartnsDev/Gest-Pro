package br.com.gestpro.auth.controller;

import br.com.gestpro.auth.dto.AuthDTO.CadastroRequestDTO;
import br.com.gestpro.auth.dto.AuthDTO.LoginResponse;
import br.com.gestpro.auth.dto.AuthDTO.LoginUsuarioDTO;
import br.com.gestpro.auth.service.AuthenticationService;
import br.com.gestpro.infra.exception.ApiException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService authService;
    private final String frontendUrl;
    private final String baseUrl;

    public AuthController(
            AuthenticationService authService,
            @Value("${app.frontend.url}") String frontendUrl,
            @Value("${app.base-url}") String baseUrl
    ) {
        this.authService = authService;
        this.frontendUrl = frontendUrl;
        this.baseUrl = baseUrl;
    }

    @PostMapping(
            value = "/cadastro",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> cadastrarUsuario(
            @Valid @ModelAttribute CadastroRequestDTO request
    ) throws IOException {
        authService.cadastrarManual(
                request.getNome(),
                request.getEmail().trim().toLowerCase(),
                request.getSenha(),
                request.getFoto(),
                baseUrl,
                "/auth/cadastro"
        );


        return ResponseEntity.ok(Map.of(
                "sucesso", true,
                "mensagem",
                "Se o endereço puder ser cadastrado, enviaremos uma confirmação por e-mail."
        ));
    }

    @GetMapping("/confirmar")
    public void confirmarEmail(
            @RequestParam String token,
            HttpServletResponse response
    ) throws IOException {
        String destino;

        try {
            boolean confirmado = authService.confirmarEmail(token);
            destino = frontendUrl + "/confirmar-email?status="
                    + (confirmado ? "sucesso" : "erro");
        } catch (ApiException exception) {
            destino = frontendUrl
                    + "/confirmar-email?status=erro&motivo="
                    + URLEncoder.encode(
                    "token-invalido-ou-expirado",
                    StandardCharsets.UTF_8
            );
        }

        response.sendRedirect(destino);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUsuario(
            @Valid @RequestBody LoginUsuarioDTO request,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(
                authService.loginManual(
                        request.email(),
                        request.senha(),
                        "/auth/login",
                        response
                )
        );
    }
}