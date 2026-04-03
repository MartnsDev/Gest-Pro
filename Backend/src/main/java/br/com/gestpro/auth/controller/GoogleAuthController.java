package br.com.gestpro.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/google")
public class GoogleAuthController {

    /**
      OAuth2LoginSuccessHandler já lida com isso.
     */
    @GetMapping("/success")
    public void success() {
        // OAuth2LoginSuccessHandler já redireciona o usuário
    }
}
