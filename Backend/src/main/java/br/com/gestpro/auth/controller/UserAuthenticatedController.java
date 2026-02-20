package br.com.gestpro.auth.controller;

import br.com.gestpro.auth.service.UserAuthenticatedService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserAuthenticatedController {

    private final UserAuthenticatedService userAuthenticatedService;

    public UserAuthenticatedController(UserAuthenticatedService userAuthenticatedService) {
        this.userAuthenticatedService = userAuthenticatedService;
    }

    @GetMapping("/api/usuario/autenticado")
    public ResponseEntity<?> getUsuarioAutenticado(
            @CookieValue(name = "jwt_token", required = false) String token
    ) {
        return userAuthenticatedService.getUsuarioPorToken(token);
    }
}
