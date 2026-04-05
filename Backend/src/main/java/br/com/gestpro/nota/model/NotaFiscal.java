package br.com.gestpro.nota.model;

import br.com.gestpro.nota.FormaPagamento;
import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.TipoNota;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notas_fiscais")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNota tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotaFiscalStatus status = NotaFiscalStatus.RASCUNHO;

    // Emissor
    @Column(nullable = false)
    private String empresaId;
    private String empresaNome;
    private String empresaCnpj;
    private String empresaInscricaoEstadual;
    private String empresaEndereco;
    private String empresaCidade;
    private String empresaEstado;
    private String empresaCep;
    private String empresaTelefone;
    private String empresaEmail;

    // Destinatário
    private String clienteId;

    @Column(nullable = false)
    private String clienteNome;

    private String clienteCpfCnpj;
    private String clienteEmail;
    private String clienteTelefone;
    private String clienteEndereco;
    private String clienteCidade;
    private String clienteEstado;
    private String clienteCep;

    // Financeiro
    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorDesconto = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal impostos = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal valorImpostos = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal total = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FormaPagamento formaPagamento = FormaPagamento.DINHEIRO;

    private String vendaId;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    private String chaveAcesso;
    private String protocolo;
    private LocalDateTime dataEmissao;
    private LocalDateTime dataCancelamento;

    @Column(columnDefinition = "TEXT")
    private String motivoCancelamento;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}