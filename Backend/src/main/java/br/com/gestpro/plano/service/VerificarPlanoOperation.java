package br.com.gestpro.plano.service;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.auth.repository.UsuarioRepository;
import br.com.gestpro.plano.StatusAcesso;
import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class VerificarPlanoOperation {

    private final UsuarioRepository usuarioRepository;

    /**
     * Valida se o período de uso ainda é válido.
     * Se expirado, atualiza o status no banco e bloqueia a operação.
     */
    @Transactional
    public void validarAcessoTemporario(Usuario usuario) {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime dataExpiracao;

        // 1. Determina a data de corte
        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {
            LocalDateTime inicio = (usuario.getDataPrimeiroLogin() != null)
                    ? usuario.getDataPrimeiroLogin() : agora;
            dataExpiracao = inicio.plusDays(usuario.getTipoPlano().getDuracaoDiasPadrao());
        } else {
            // Planos pagos (BASICO, PRO, PREMIUM)
            dataExpiracao = usuario.getDataAssinaturaPlus();
            // Adiciona a validade do plano pago (ex: 30 dias)
            if (dataExpiracao != null) {
                dataExpiracao = dataExpiracao.plusDays(usuario.getTipoPlano().getDuracaoDiasPadrao());
            }
        }

        // 2. Verifica expiração
        if (dataExpiracao == null || agora.isAfter(dataExpiracao)) {

            // Só executa o update se o status ainda for ATIVO
            if (usuario.getStatusAcesso() != StatusAcesso.INATIVO) {
                usuario.setStatusAcesso(StatusAcesso.INATIVO);
                usuarioRepository.save(usuario);
            }

            String mensagem = (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL)
                    ? "Seu período de teste expirou. Assine um plano para continuar gerenciando suas empresas!"
                    : "Sua assinatura expirou. Regularize seu pagamento para reativar o acesso ao GestPro.";

            throw new ApiException(mensagem, HttpStatus.FORBIDDEN, "/dashboard/planos");
        }
    }

    /**
     * Valida o limite de empresas cadastradas.
     */
    public void validarLimiteEmpresas(Usuario usuario, long empresasAtuais) {
        validarAcessoTemporario(usuario);

        int limite = usuario.getTipoPlano().getLimiteEmpresas();

        if (empresasAtuais >= limite) {
            String mensagem = String.format(
                    "Limite atingido! Seu plano %s permite até %d %s. Faça um upgrade para gerenciar mais negócios.",
                    usuario.getTipoPlano().name(),
                    limite,
                    limite == 1 ? "empresa" : "empresas"
            );

            throw new ApiException(mensagem, HttpStatus.FORBIDDEN, "/planos");
        }
    }

    /**
     * Valida o limite de PDVs (caixas) abertos simultaneamente por empresa.
     */
    public void validarLimiteCaixas(Usuario usuario, long caixasAbertosNaEmpresa) {
        validarAcessoTemporario(usuario);

        int limite = usuario.getTipoPlano().getLimiteCaixasPorEmpresa();

        if (caixasAbertosNaEmpresa >= limite) {
            String mensagem = String.format(
                    "Não foi possível abrir o caixa. O plano %s permite apenas %d %s aberto por empresa.",
                    usuario.getTipoPlano().name(),
                    limite,
                    limite == 1 ? "caixa" : "caixas"
            );

            throw new ApiException(mensagem, HttpStatus.FORBIDDEN, "/planos");
        }
    }

    /**
     * Calcula quantos dias restam para o fim do plano atual.
     */
    public long calcularDiasRestantes(Usuario usuario) {
        LocalDate hoje = LocalDate.now();
        LocalDate dataExpiracao;

        if (usuario.getTipoPlano() == TipoPlano.EXPERIMENTAL) {
            LocalDateTime inicio = (usuario.getDataPrimeiroLogin() != null)
                    ? usuario.getDataPrimeiroLogin() : LocalDateTime.now();
            dataExpiracao = inicio.toLocalDate().plusDays(usuario.getTipoPlano().getDuracaoDiasPadrao());
        } else {
            if (usuario.getDataAssinaturaPlus() == null) return 0;
            dataExpiracao = usuario.getDataAssinaturaPlus().toLocalDate()
                    .plusDays(usuario.getTipoPlano().getDuracaoDiasPadrao());
        }

        return Math.max(ChronoUnit.DAYS.between(hoje, dataExpiracao), 0);
    }
}