package br.com.gestpro.infra.jwt;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.StatusAcesso;
import br.com.gestpro.auth.TipoPlano;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private Usuario usuario;
    private String secretKeyBase64;

    @BeforeEach
    void setup() {
        jwtService = new JwtService();

        // Gera chave segura
        Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        secretKeyBase64 = Base64.getEncoder().encodeToString(key.getEncoded());

        ReflectionTestUtils.setField(jwtService, "secretKey", secretKeyBase64);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 1000 * 60); // 1 minuto

        usuario = new Usuario();
        usuario.setEmail("teste@email.com");
        usuario.setNome("Matheus");
        usuario.setFoto("foto");
        usuario.setTipoPlano(TipoPlano.EXPERIMENTAL);
        usuario.setStatusAcesso(StatusAcesso.ATIVO);
    }

    // -------------------- GERAÇÃO --------------------

    @Test
    void deveGerarTokenValido() {
        String token = jwtService.gerarToken(usuario);

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
    }

    // -------------------- EXTRAÇÃO --------------------

    @Test
    void deveExtrairEmailDoToken() {
        String token = jwtService.gerarToken(usuario);

        String email = jwtService.getEmailFromToken(token);

        assertEquals("teste@email.com", email);
    }

    // -------------------- VALIDAÇÃO --------------------

    @Test
    void deveValidarTokenComUserDetails() {
        String token = jwtService.gerarToken(usuario);

        UserDetails userDetails = new User(
                "teste@email.com",
                "senha",
                List.of()
        );

        boolean valido = jwtService.validarToken(token, userDetails);

        assertTrue(valido);
    }

    @Test
    void deveRetornarFalseQuandoEmailNaoBate() {
        String token = jwtService.gerarToken(usuario);

        UserDetails userDetails = new User(
                "outro@email.com",
                "senha",
                List.of()
        );

        assertFalse(jwtService.validarToken(token, userDetails));
    }

    // -------------------- EXPIRAÇÃO --------------------

    @Test
    void deveDetectarTokenExpirado() throws InterruptedException {
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 1L);

        String token = jwtService.gerarToken(usuario);

        Thread.sleep(5);

        assertFalse(jwtService.isTokenValid(token));
    }

    // -------------------- TOKEN INVÁLIDO --------------------

    @Test
    void deveRetornarFalseParaTokenCorrompido() {
        String tokenInvalido = "token.quebrado.fake";

        assertFalse(jwtService.isTokenValid(tokenInvalido));
    }

    @Test
    void deveLancarExcecaoAoExtrairClaimDeTokenInvalido() {
        String tokenInvalido = "token.quebrado.fake";

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> jwtService.getEmailFromToken(tokenInvalido));

        assertTrue(ex.getMessage().contains("Erro ao extrair claims"));
    }

    // -------------------- TOKEN MANUAL EXPIRADO --------------------

    @Test
    void deveFalharValidacaoComTokenExpiradoManual() {
        Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secretKeyBase64));

        String tokenExpirado = Jwts.builder()
                .setSubject("teste@email.com")
                .setIssuedAt(new Date(System.currentTimeMillis() - 10000))
                .setExpiration(new Date(System.currentTimeMillis() - 5000))
                .signWith(key)
                .compact();

        assertFalse(jwtService.isTokenValid(tokenExpirado));
    }
}
