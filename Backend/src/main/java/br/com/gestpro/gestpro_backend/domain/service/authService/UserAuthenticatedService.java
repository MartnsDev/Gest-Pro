package br.com.gestpro.gestpro_backend.domain.service.authService;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.repository.auth.UsuarioRepository;
import br.com.gestpro.gestpro_backend.infra.jwt.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class UserAuthenticatedService {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public UserAuthenticatedService(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    public ResponseEntity<?> getUsuarioPorToken(String token) {

        // Verifica se o cookie existe
        if (token == null || token.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Usuário não está logado."));
        }

        // Valida o token JWT
        if (!jwtService.isTokenValid(token)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", "Token inválido ou expirado."));
        }

        // Extrai o e-mail do token
        String email = jwtService.getEmailFromToken(token);

        // Busca o usuário no banco
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("erro", "Usuário não encontrado."));
        }

        Usuario usuario = usuarioOpt.get();

        // Retorna apenas dados públicos e seguros
        Map<String, Object> dadosUsuario = Map.of(
                "id", usuario.getId(),
                "nome", usuario.getNome(),
                "email", usuario.getEmail(),
                "tipoPlano", usuario.getTipoPlano(),
                "foto", usuario.getFoto(),
                "statusAcesso", usuario.getStatusAcesso()
        );

        return ResponseEntity.ok(dadosUsuario);
    }

    public Usuario buscarUsuarioPorId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("ID do usuário inválido.");
        }

        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
    }


}
