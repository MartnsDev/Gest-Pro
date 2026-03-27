package br.com.gestpro.cliente.model;

import br.com.gestpro.empresa.model.Empresa;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dividas")
@Data
@NoArgsConstructor
public class Divida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    private String descricao;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(precision = 10, scale = 2)
    private BigDecimal valorPago = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private StatusDivida status = StatusDivida.ABERTA;

    private LocalDate vencimento;
    private LocalDateTime criadoEm = LocalDateTime.now();
    private LocalDateTime quitadoEm;

    public enum StatusDivida { ABERTA, PARCIAL, QUITADA }
}