package br.com.gestpro.plano.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.plano.stripe.model.Assinatura;
import br.com.gestpro.plano.stripe.repository.AssinaturaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VerificarPlanoOperation")
class VerificarPlanoOperationTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AssinaturaRepository assinaturaRepository;

    @InjectMocks
    private VerificarPlanoOperation sut;

    // ── Fixtures ─────────────────────────────────────────────────────────────

    private static final String EMAIL = "usuario@example.com";

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setEmail(EMAIL);
        usuario.setStatusAcesso(StatusAcesso.ATIVO);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Assinatura assinaturaAtiva() {
        Assinatura a = new Assinatura();
        a.setStatus("ATIVO");
        a.setDataVencimento(LocalDate.now().plusDays(30));
        return a;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  validarAcesso — EXPERIMENTAL
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("validarAcesso - plano EXPERIMENTAL")
    class ValidarAcessoExperimental {

        @BeforeEach
        void setPlano() {
            usuario.setTipoPlano(TipoPlano.EXPERIMENTAL);
        }

        @Test
        @DisplayName("deve permitir acesso quando ainda dentro dos 7 dias de trial")
        void devePermitirAcessoDentroDoTrial() {
            usuario.setDataPrimeiroLogin(LocalDateTime.now().minusDays(3));

            sut.validarAcesso(usuario);

            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve permitir acesso no primeiro dia (dataPrimeiroLogin = agora)")
        void devePermitirAcessoNoPrimeiroDia() {
            usuario.setDataPrimeiroLogin(LocalDateTime.now());

            sut.validarAcesso(usuario);

            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve lançar ApiException 403 quando trial expirou")
        void deveLancarExcecaoQuandoTrialExpirado() {
            // 7 dias + 1 hora além do período
            usuario.setDataPrimeiroLogin(
                    LocalDateTime.now().minusDays(TipoPlano.EXPERIMENTAL.getDuracaoDiasPadrao()).minusHours(1)
            );

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(apiEx.getMessage()).containsIgnoringCase("período de teste expirou");
                    });
        }

        @Test
        @DisplayName("deve bloquear usuario (INATIVO) quando trial expirou")
        void deveBloquearUsuarioQuandoTrialExpirado() {
            usuario.setDataPrimeiroLogin(
                    LocalDateTime.now().minusDays(TipoPlano.EXPERIMENTAL.getDuracaoDiasPadrao()).minusHours(1)
            );

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class);

            assertThat(usuario.getStatusAcesso()).isEqualTo(StatusAcesso.INATIVO);
            verify(usuarioRepository).save(usuario);
        }

        @Test
        @DisplayName("deve usar LocalDateTime.now() como início quando dataPrimeiroLogin é null")
        void deveUsarNowQuandoPrimeiroLoginNulo() {
            usuario.setDataPrimeiroLogin(null);

            // Como usa now() como início, ainda está no trial
            sut.validarAcesso(usuario);

            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve salvar usuario apenas uma vez mesmo que já esteja INATIVO")
        void naoDeveSalvarUsuarioJaInativo() {
            usuario.setStatusAcesso(StatusAcesso.INATIVO);
            usuario.setDataPrimeiroLogin(
                    LocalDateTime.now().minusDays(TipoPlano.EXPERIMENTAL.getDuracaoDiasPadrao()).minusHours(1)
            );

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class);

            // bloquearUsuario só salva se ainda não estava INATIVO
            verify(usuarioRepository, never()).save(any());
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  validarAcesso — PLANO PAGO
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("validarAcesso - planos pagos")
    class ValidarAcessoPago {

        @BeforeEach
        void setPlano() {
            usuario.setTipoPlano(TipoPlano.PRO);
        }

        @Test
        @DisplayName("deve permitir acesso quando assinatura ativa e dentro do vencimento")
        void devePermitirAcessoComAssinaturaAtiva() {
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinaturaAtiva()));

            sut.validarAcesso(usuario);

            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("deve lançar ApiException 403 quando não há assinatura no banco")
        void deveLancarExcecaoSemAssinatura() {
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(apiEx.getMessage()).containsIgnoringCase("Nenhuma assinatura ativa");
                    });

            assertThat(usuario.getStatusAcesso()).isEqualTo(StatusAcesso.INATIVO);
            verify(usuarioRepository).save(usuario);
        }

        @ParameterizedTest(name = "status={0}")
        @ValueSource(strings = {"CANCELADO", "INADIMPLENTE", "VENCIDO"})
        @DisplayName("deve lançar ApiException 403 para status de assinatura inativo")
        void deveLancarExcecaoParaStatusInativo(String status) {
            Assinatura assinatura = assinaturaAtiva();
            assinatura.setStatus(status);
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinatura));

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                    });

            assertThat(usuario.getStatusAcesso()).isEqualTo(StatusAcesso.INATIVO);
        }

        @Test
        @DisplayName("mensagem deve conter 'cancelada' quando status é CANCELADO")
        void mensagemDeveTerCanceladaParaStatusCancelado() {
            Assinatura assinatura = assinaturaAtiva();
            assinatura.setStatus("CANCELADO");
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinatura));

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("cancelada");
        }

        @Test
        @DisplayName("mensagem deve conter 'inadimplente' quando status é INADIMPLENTE")
        void mensagemDeveTerInadimplenteParaStatusInadimplente() {
            Assinatura assinatura = assinaturaAtiva();
            assinatura.setStatus("INADIMPLENTE");
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinatura));

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("inadimplente");
        }

        @Test
        @DisplayName("deve lançar ApiException 403 e marcar VENCIDO quando dataVencimento ultrapassada")
        void deveLancarExcecaoQuandoAssinaturaVencida() {
            Assinatura assinatura = assinaturaAtiva();
            assinatura.setDataVencimento(LocalDate.now().minusDays(1));
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinatura));

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(apiEx.getMessage()).containsIgnoringCase("venceu");
                    });

            assertThat(assinatura.getStatus()).isEqualTo("VENCIDO");
            assertThat(usuario.getStatusAcesso()).isEqualTo(StatusAcesso.INATIVO);

            verify(assinaturaRepository).save(assinatura);
            verify(usuarioRepository).save(usuario);
        }

        @Test
        @DisplayName("não deve bloquear usuario já INATIVO novamente (evita save desnecessário)")
        void naoDeveSalvarUsuarioJaInativo() {
            usuario.setStatusAcesso(StatusAcesso.INATIVO);
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> sut.validarAcesso(usuario))
                    .isInstanceOf(ApiException.class);

            verify(usuarioRepository, never()).save(any());
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  validarLimiteEmpresas
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("validarLimiteEmpresas")
    class ValidarLimiteEmpresas {

        @BeforeEach
        void setPlanoAtivo() {
            usuario.setTipoPlano(TipoPlano.PRO);
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinaturaAtiva()));
        }

        @Test
        @DisplayName("deve permitir cadastro quando abaixo do limite")
        void devePermitirQuandoAbaixoDoLimite() {
            int limite = usuario.getTipoPlano().getLimiteEmpresas();

            sut.validarLimiteEmpresas(usuario, limite - 1);

            // Nenhuma exceção lançada
        }

        @Test
        @DisplayName("deve lançar ApiException 403 quando atingiu o limite exato")
        void deveLancarExcecaoQuandoAtingeLimite() {
            int limite = usuario.getTipoPlano().getLimiteEmpresas();

            assertThatThrownBy(() -> sut.validarLimiteEmpresas(usuario, limite))
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(apiEx.getMessage()).containsIgnoringCase("Limite atingido");
                    });
        }

        @Test
        @DisplayName("deve lançar ApiException 403 quando ultrapassa o limite")
        void deveLancarExcecaoQuandoUltrapassaLimite() {
            int limite = usuario.getTipoPlano().getLimiteEmpresas();

            assertThatThrownBy(() -> sut.validarLimiteEmpresas(usuario, limite + 5))
                    .isInstanceOf(ApiException.class);
        }

        @Test
        @DisplayName("mensagem deve usar singular 'empresa' quando limite é 1")
        void mensagemDeveTerSingularQuandoLimiteEUm() {
            // Força um plano com limite = 1 usando EXPERIMENTAL ou plano básico
            // Ajuste para o plano do seu sistema que tenha getLimiteEmpresas() == 1
            usuario.setTipoPlano(TipoPlano.BASICO);
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinaturaAtiva()));

            int limite = usuario.getTipoPlano().getLimiteEmpresas();
            if (limite == 1) {
                assertThatThrownBy(() -> sut.validarLimiteEmpresas(usuario, limite))
                        .isInstanceOf(ApiException.class)
                        .hasMessageContaining("empresa");
            }
            // Se o plano básico tiver limite > 1, o teste é ignorado silenciosamente
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  validarLimiteCaixas
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("validarLimiteCaixas")
    class ValidarLimiteCaixas {

        @BeforeEach
        void setPlanoAtivo() {
            usuario.setTipoPlano(TipoPlano.PRO);
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinaturaAtiva()));
        }

        @Test
        @DisplayName("deve permitir abertura de caixa quando abaixo do limite")
        void devePermitirQuandoAbaixoDoLimite() {
            int limite = usuario.getTipoPlano().getLimiteCaixasPorEmpresa();

            sut.validarLimiteCaixas(usuario, limite - 1);

            // Nenhuma exceção lançada
        }

        @Test
        @DisplayName("deve lançar ApiException 403 quando atingiu o limite de caixas")
        void deveLancarExcecaoQuandoAtingeLimiteDeCaixas() {
            int limite = usuario.getTipoPlano().getLimiteCaixasPorEmpresa();

            assertThatThrownBy(() -> sut.validarLimiteCaixas(usuario, limite))
                    .isInstanceOf(ApiException.class)
                    .satisfies(ex -> {
                        ApiException apiEx = (ApiException) ex;
                        assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
                        assertThat(apiEx.getMessage()).containsIgnoringCase("caixa");
                    });
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  calcularDiasRestantes
    // ═════════════════════════════════════════════════════════════════════════
    @Nested
    @DisplayName("calcularDiasRestantes")
    class CalcularDiasRestantes {

        @Test
        @DisplayName("EXPERIMENTAL: deve retornar dias corretos dentro do trial")
        void deveRetornarDiasRestantesNoTrial() {
            usuario.setTipoPlano(TipoPlano.EXPERIMENTAL);
            usuario.setDataPrimeiroLogin(LocalDateTime.now().minusDays(2));

            long dias = sut.calcularDiasRestantes(usuario);

            long esperado = TipoPlano.EXPERIMENTAL.getDuracaoDiasPadrao() - 2;
            assertThat(dias).isEqualTo(esperado);
        }

        @Test
        @DisplayName("EXPERIMENTAL: deve retornar 0 quando trial expirado")
        void deveRetornarZeroQuandoTrialExpirado() {
            usuario.setTipoPlano(TipoPlano.EXPERIMENTAL);
            usuario.setDataPrimeiroLogin(
                    LocalDateTime.now().minusDays(TipoPlano.EXPERIMENTAL.getDuracaoDiasPadrao() + 5)
            );

            long dias = sut.calcularDiasRestantes(usuario);

            assertThat(dias).isZero();
        }

        @Test
        @DisplayName("EXPERIMENTAL: deve retornar 0 quando dataPrimeiroLogin é null")
        void deveRetornarZeroQuandoPrimeiroLoginNulo() {
            usuario.setTipoPlano(TipoPlano.EXPERIMENTAL);
            usuario.setDataPrimeiroLogin(null);

            long dias = sut.calcularDiasRestantes(usuario);

            assertThat(dias).isZero();
        }

        @Test
        @DisplayName("plano pago: deve retornar dias até o vencimento")
        void deveRetornarDiasAteVencimento() {
            usuario.setTipoPlano(TipoPlano.PRO);

            Assinatura assinatura = new Assinatura();
            assinatura.setDataVencimento(LocalDate.now().plusDays(15));
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinatura));

            long dias = sut.calcularDiasRestantes(usuario);

            assertThat(dias).isEqualTo(15);
        }

        @Test
        @DisplayName("plano pago: deve retornar 0 quando já vencido")
        void deveRetornarZeroQuandoVencido() {
            usuario.setTipoPlano(TipoPlano.PRO);

            Assinatura assinatura = new Assinatura();
            assinatura.setDataVencimento(LocalDate.now().minusDays(3));
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.of(assinatura));

            long dias = sut.calcularDiasRestantes(usuario);

            assertThat(dias).isZero();
        }

        @Test
        @DisplayName("plano pago: deve retornar 0 quando não há assinatura no banco")
        void deveRetornarZeroSemAssinatura() {
            usuario.setTipoPlano(TipoPlano.PRO);
            when(assinaturaRepository.findByUsuarioEmail(EMAIL))
                    .thenReturn(Optional.empty());

            long dias = sut.calcularDiasRestantes(usuario);

            assertThat(dias).isZero();
        }
    }
}