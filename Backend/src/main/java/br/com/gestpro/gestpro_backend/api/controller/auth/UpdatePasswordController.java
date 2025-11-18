package br.com.gestpro.gestpro_backend.api.controller.auth;

import br.com.gestpro.gestpro_backend.domain.service.authService.UpdatePasswordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class UpdatePasswordController {

    private final UpdatePasswordService updatePasswordService;

    public UpdatePasswordController(UpdatePasswordService updatePasswordService) {
        this.updatePasswordService = updatePasswordService;
    }

    // Passo 1: enviar código
    @PostMapping("/esqueceu-senha")
    public ResponseEntity<?> enviarCodigo(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        updatePasswordService.sendVerificationCode(email);
        return ResponseEntity.ok(Map.of("sucesso", true, "mensagem", "Código enviado!"));
    }

    // Passo 2: redefinir senha
    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String codigo = body.get("codigo");
        String novaSenha = body.get("novaSenha");

        updatePasswordService.resetPassword(email, codigo, novaSenha);
        return ResponseEntity.ok(Map.of("sucesso", true, "mensagem", "Senha atualizada!"));
    }
}
