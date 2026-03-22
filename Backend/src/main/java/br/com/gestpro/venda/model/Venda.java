package br.com.gestpro.venda.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.empresa.model.Empresa;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venda")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caixa_id", nullable = false)
    private Caixa caixa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemVenda> itens = new ArrayList<>();

    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal valorFinal = BigDecimal.ZERO;

    @Column(name = "valor_recebido")
    private BigDecimal valorRecebido;

    @Column(name = "troco")
    private BigDecimal troco;

    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento")
    private FormaDePagamento formaPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento2")
    private FormaDePagamento formaPagamento2;

    @Column(name = "valor_pagamento2")
    private BigDecimal valorPagamento2;

    @Column(nullable = false)
    private Boolean cancelada = false;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @Column(name = "motivo_cancelamento")
    private String motivoCancelamento;

    @CreationTimestamp
    @Column(name = "data_venda", nullable = false, updatable = false)
    private LocalDateTime dataVenda;
}