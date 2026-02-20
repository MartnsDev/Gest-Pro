package br.com.gestpro.auth.model;

import br.com.gestpro.auth.StatusAcesso;
import br.com.gestpro.auth.TipoPlano;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    private String senha;

    @Column(name = "foto_google")
    private String foto; // foto obtida via login Google

    @Column
    private String fotoUpload; // caminho da foto enviada manualmente

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_plano", nullable = false)
    private TipoPlano tipoPlano = TipoPlano.EXPERIMENTAL;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_primeiro_login")
    private LocalDateTime dataPrimeiroLogin;

    @Column(name = "data_assinatura_plus")
    private LocalDateTime dataAssinaturaPlus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_acesso", nullable = false)
    private StatusAcesso statusAcesso = StatusAcesso.ATIVO;

    @Column(nullable = false)
    private boolean emailConfirmado = false;

    @Column
    private String tokenConfirmacao;

    @Column
    private LocalDateTime dataEnvioConfirmacao;

    @Column
    private String codigoRecuperacao;

    @Column(name = "login_google", nullable = false)
    private boolean loginGoogle = false;

    // ==============================
    // Regras automáticas de persistência
    // ==============================
    @PrePersist
    public void prePersist() {
        if (dataCriacao == null) dataCriacao = LocalDateTime.now();
        if (dataPrimeiroLogin == null) dataPrimeiroLogin = LocalDateTime.now();
        if (statusAcesso == null) statusAcesso = StatusAcesso.ATIVO;
        if (tipoPlano == null) tipoPlano = TipoPlano.EXPERIMENTAL;

        if (tipoPlano == TipoPlano.ASSINANTE && dataAssinaturaPlus == null) {
            dataAssinaturaPlus = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        if (tipoPlano == TipoPlano.ASSINANTE && dataAssinaturaPlus == null) {
            dataAssinaturaPlus = LocalDateTime.now();
        }
    }

    // ==============================
    // Método para calcular expiração do plano
    // ==============================
    public LocalDate getDataExpiracaoPlano() {
        if (tipoPlano == TipoPlano.EXPERIMENTAL) {
            // Plano experimental dura X dias a partir da criação
            return dataCriacao.toLocalDate().plusDays(tipoPlano.getDuracaoDias());
        } else if (tipoPlano == TipoPlano.ASSINANTE) {
            // Plano assinante: retorna data de expiração a partir da assinatura
            return dataAssinaturaPlus != null
                    ? dataAssinaturaPlus.toLocalDate().plusDays(tipoPlano.getDuracaoDias())
                    : LocalDate.MAX;
        }
        // fallback
        return LocalDate.now();
    }

    // ==============================
    // Método auxiliar para calcular dias restantes
    // ==============================
    public long getDiasRestantesPlano() {
        LocalDate hoje = LocalDate.now();
        LocalDate expira = getDataExpiracaoPlano();
        long dias = java.time.temporal.ChronoUnit.DAYS.between(hoje, expira);
        return Math.max(dias, 0);
    }
}
