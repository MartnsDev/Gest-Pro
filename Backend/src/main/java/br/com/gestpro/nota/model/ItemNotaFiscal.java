package br.com.gestpro.nota.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "itens_nota_fiscal")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemNotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID notaFiscalId;

    @Column(nullable = false)
    private String produtoId;

    @Column(nullable = false)
    private String descricao;

    private String codigo;
    private String ncm;

    @Builder.Default
    private String cfop = "5102";

    @Builder.Default
    private String unidade = "UN";

    @Column(precision = 10, scale = 3, nullable = false)
    private BigDecimal quantidade;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal valorUnitario;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal icms = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal pis = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal cofins = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal valorTotal;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
