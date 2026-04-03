package br.com.gestpro.plano.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.plano.stripe.model.Assinatura;
import br.com.gestpro.plano.stripe.repository.AssinaturaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class VerificarPlanoOperation {

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaRepository assinaturaRepository;

    @Transactional
    public void validarAcesso(Usuario usuario) {
        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {
            validarAcessoExperimental(usuario);
        } else {
            validarAcessoPago(usuario);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void validarAcessoIsolado(Usuario usuario) {
        validarAcesso(usuario);
    }

    private void validarAcessoExperimental(Usuario usuario) {
        LocalDateTime inicio = (usuario.getDataPrimeiroLogin() != null)
                ? usuario.getDataPrimeiroLogin()
                : LocalDateTime.now();

        LocalDateTime expiracao = inicio.plusDays(TipoPlano.EXPERIMENTAL.getDuracaoDiasPadrao());

        if (LocalDateTime.now().isAfter(expiracao)) {
            bloquearUsuario(usuario);
            throw new ApiException(
                    "Seu período de teste expirou. Assine um plano para continuar gerenciando suas empresas!",
                    HttpStatus.FORBIDDEN,
                    "/dashboard/planos"
            );
        }
    }

    private void validarAcessoPago(Usuario usuario) {
        Optional<Assinatura> assinaturaOpt = assinaturaRepository.findByUsuarioEmail(usuario.getEmail());

        if (assinaturaOpt.isEmpty()) {
            bloquearUsuario(usuario);
            throw new ApiException(
                    "Nenhuma assinatura ativa encontrada. Assine um plano para continuar.",
                    HttpStatus.FORBIDDEN,
                    "/dashboard/planos"
            );
        }

        Assinatura assinatura = assinaturaOpt.get();

        if (!"ATIVO".equals(assinatura.getStatus())) {
            bloquearUsuario(usuario);
            throw new ApiException(
                    "Sua assinatura está " + formatarStatus(assinatura.getStatus()) +
                            ". Regularize seu pagamento para reativar o acesso ao GestPro.",
                    HttpStatus.FORBIDDEN,
                    "/dashboard/planos"
            );
        }

            if (assinatura.getDataVencimento().isBefore(LocalDate.now())) {
            bloquearUsuario(usuario);

            assinatura.setStatus("VENCIDO");
            assinaturaRepository.save(assinatura);
            throw new ApiException(
                    "Sua assinatura venceu em " + assinatura.getDataVencimento() +
                            ". Regularize seu pagamento para reativar o acesso ao GestPro.",
                    HttpStatus.FORBIDDEN,
                    "/dashboard/planos"
            );
        }
    }

    @Transactional
    public void validarLimiteEmpresas(Usuario usuario, long empresasAtuais) {
        validarAcesso(usuario);

        int limite = usuario.getTipoPlano().getLimiteEmpresas();

        if (empresasAtuais >= limite) {
            throw new ApiException(
                    String.format(
                            "Limite atingido! Seu plano %s permite até %d %s. " +
                                    "Faça um upgrade para gerenciar mais negócios.",
                            usuario.getTipoPlano().name(),
                            limite,
                            limite == 1 ? "empresa" : "empresas"
                    ),
                    HttpStatus.FORBIDDEN,
                    "/planos"
            );
        }
    }


    // Valida se o usuário pode abrir mais um caixa na empresa.
    @Transactional
    public void validarLimiteCaixas(Usuario usuario, long caixasAbertosNaEmpresa) {
        validarAcesso(usuario);

        int limite = usuario.getTipoPlano().getLimiteCaixasPorEmpresa();

        if (caixasAbertosNaEmpresa >= limite) {
            throw new ApiException(
                    String.format(
                            "Não foi possível abrir o caixa. O plano %s permite apenas %d %s aberto por empresa.",
                            usuario.getTipoPlano().name(),
                            limite,
                            limite == 1 ? "caixa" : "caixas"
                    ),
                    HttpStatus.FORBIDDEN,
                    "/planos"
            );
        }
    }

    public long calcularDiasRestantes(Usuario usuario) {
        LocalDate hoje = LocalDate.now();

        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {
            if (usuario.getDataPrimeiroLogin() == null) return 0;
            LocalDate expiracao = usuario.getDataPrimeiroLogin()
                    .toLocalDate()
                    .plusDays(TipoPlano.EXPERIMENTAL.getDuracaoDiasPadrao());
            return Math.max(ChronoUnit.DAYS.between(hoje, expiracao), 0);
        }

        // Planos pagos: usa dataVencimento real da Stripe
        return assinaturaRepository
                .findByUsuarioEmail(usuario.getEmail())
                .map(a -> Math.max(ChronoUnit.DAYS.between(hoje, a.getDataVencimento()), 0))
                .orElse(0L);
    }

    private void bloquearUsuario(Usuario usuario) {
        if (usuario.getStatusAcesso() != StatusAcesso.INATIVO) {
            usuario.setStatusAcesso(StatusAcesso.INATIVO);
            usuarioRepository.save(usuario);
        }
    }

    private String formatarStatus(String status) {
        return switch (status) {
            case "CANCELADO" -> "cancelada";
            case "INADIMPLENTE" -> "inadimplente";
            case "VENCIDO" -> "vencida";
            default -> status.toLowerCase();
        };
    }
}