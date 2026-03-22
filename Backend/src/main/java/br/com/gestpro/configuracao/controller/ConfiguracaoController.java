package br.com.gestpro.configuracao.controller;

import br.com.gestpro.auth.EmailService;
import br.com.gestpro.configuracao.dto.*;
import br.com.gestpro.configuracao.service.ConfiguracaoServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/configuracoes")
@RequiredArgsConstructor
public class ConfiguracaoController {

    private final ConfiguracaoServiceInterface service;

    /** Dados do perfil do usuário logado */
    @GetMapping("/perfil")
    public ResponseEntity<PerfilDTO> getPerfil(Authentication auth) {
        return ResponseEntity.ok(service.getPerfil(auth.getName()));
    }

    /** Atualizar nome do usuário */
    @PutMapping("/perfil/nome")
    public ResponseEntity<Map<String, String>> atualizarNome(
            @RequestBody Map<String, String> body, Authentication auth) {
        String novoNome = body.get("nome");
        service.atualizarNome(auth.getName(), novoNome);
        return ResponseEntity.ok(Map.of("mensagem", "Nome atualizado com sucesso."));
    }

    /** Upload de foto de perfil */
    @PostMapping("/perfil/foto")
    public ResponseEntity<Map<String, String>> uploadFoto(
            @RequestParam("foto") MultipartFile foto, Authentication auth) {
        String url = service.uploadFoto(auth.getName(), foto);
        return ResponseEntity.ok(Map.of("fotoUrl", url, "mensagem", "Foto atualizada!"));
    }

    /** Solicitar código de verificação para troca de senha */
    @PostMapping("/senha/solicitar-codigo")
    public ResponseEntity<Map<String, String>> solicitarCodigo(Authentication auth) {
        service.solicitarCodigoTrocaSenha(auth.getName());
        return ResponseEntity.ok(Map.of("mensagem", "Código enviado para seu e-mail."));
    }

    /** Confirmar troca de senha com código */
    @PostMapping("/senha/trocar")
    public ResponseEntity<Map<String, String>> trocarSenha(
            @RequestBody TrocarSenhaDTO dto, Authentication auth) {
        service.trocarSenha(auth.getName(), dto);
        return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso!"));
    }

    /** Preferências de notificação */
    @GetMapping("/notificacoes")
    public ResponseEntity<NotificacoesDTO> getNotificacoes(Authentication auth) {
        return ResponseEntity.ok(service.getNotificacoes(auth.getName()));
    }

    @PutMapping("/notificacoes")
    public ResponseEntity<Map<String, String>> atualizarNotificacoes(
            @RequestBody NotificacoesDTO dto, Authentication auth) {
        service.atualizarNotificacoes(auth.getName(), dto);
        return ResponseEntity.ok(Map.of("mensagem", "Preferências salvas."));
    }
}