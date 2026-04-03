package br.com.gestpro.pedidos.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.pedidos.CanalVenda;
import br.com.gestpro.pedidos.dto.ItemPedido;
import br.com.gestpro.pedidos.dto.StatusPedido;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
@Getter @Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;


    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();


    /** Soma bruta dos itens (sem desconto) */
    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal desconto = BigDecimal.ZERO;

    /** valorTotal − desconto */
    @Column(name = "valor_final", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorFinal = BigDecimal.ZERO;


    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = false, length = 30)
    private FormaDePagamento formaPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_venda", nullable = false, length = 30)
    private CanalVenda canalVenda = CanalVenda.OUTRO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusPedido status = StatusPedido.PENDENTE;

    @Column(name = "conta_destino", length = 100)
    private String contaDestino;

    @Column(name = "endereco_entrega", length = 300)
    private String enderecoEntrega;

    @Column(name = "custo_frete", precision = 10, scale = 2)
    private BigDecimal custoFrete = BigDecimal.ZERO;

    @Column(name = "data_pedido", nullable = false, updatable = false)
    private LocalDateTime dataPedido;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "data_cancelamento")
    private LocalDateTime dataCancelamento;

    @Column(name = "motivo_cancelamento", length = 300)
    private String motivoCancelamento;

    @Column(length = 500)
    private String observacao;

    @PrePersist
    public void prePersist() {
        if (dataPedido == null) dataPedido = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}