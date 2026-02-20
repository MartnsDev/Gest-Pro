package br.com.gestpro.venda.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.caixa.FormaDePagamento;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.cliente.model.Cliente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venda")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

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

    private BigDecimal desconto = BigDecimal.ZERO;

    private BigDecimal valorFinal = BigDecimal.ZERO;

    private String observacao;

    @Enumerated(EnumType.STRING)
    private FormaDePagamento formaPagamento;

    @CreationTimestamp
    @Column(name = "data_venda", nullable = false, updatable = false)
    private LocalDateTime dataVenda;

    /**
     * Atualiza total e valor final antes de persistir
     */
    @PrePersist
    @PreUpdate
    public void calcularTotal() {
        this.total = itens.stream()
                .map(ItemVenda::getValorTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.valorFinal = total.subtract(desconto != null ? desconto : BigDecimal.ZERO).max(BigDecimal.ZERO);
    }

}
