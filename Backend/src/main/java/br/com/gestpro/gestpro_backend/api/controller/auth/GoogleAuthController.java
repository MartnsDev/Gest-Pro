package br.com.gestpro.gestpro_backend.api.controller.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/google")
public class GoogleAuthController {

    /**
     * Endpoint necessário apenas para que o Spring Security reconheça o sucesso do login.
     * Não devolve token nem dados do usuário, porque o OAuth2LoginSuccessHandler já lida com isso.
     */
    @GetMapping("/success")
    public void success() {
        // Nada aqui: o OAuth2LoginSuccessHandler já redireciona o usuário
    }
}
