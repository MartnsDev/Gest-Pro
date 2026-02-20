package br.com.gestpro.auth.controller;

import br.com.gestpro.auth.dto.AuthDTO.CadastroRequestDTO;
import br.com.gestpro.auth.dto.AuthDTO.LoginResponse;
import br.com.gestpro.auth.dto.AuthDTO.LoginUsuarioDTO;
import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.service.AuthenticationService;
import br.com.gestpro.infra.exception.ApiException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService authService;

    private final String URL_FRONTEND;
    private final String baseUrl;

    public AuthController(
            AuthenticationService authService,
            @Value("${app.frontend.url}") String urlFrontend,
            @Value("${app.base-url}") String baseUrl
    ) {
        this.authService = authService;
        this.URL_FRONTEND = urlFrontend;
        this.baseUrl = baseUrl;
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
            response.sendRedirect(URL_FRONTEND + "/confirmar-email?status=" + status);
        } catch (ApiException e) {
            response.sendRedirect(URL_FRONTEND + "/confirmar-email?status=erro&motivo=usuario-confirmado-ou-token-expirado");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUsuario(
            @RequestBody LoginUsuarioDTO loginRequest,
            HttpServletResponse response) {

        LoginResponse loginResponse = authService.loginManual(
                loginRequest.email(),
                loginRequest.senha(),
                "/auth/login",
                response
        );

        return ResponseEntity.ok(loginResponse);
    }
}

