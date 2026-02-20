package br.com.gestpro.caixa.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.caixa.StatusCaixa;
import br.com.gestpro.venda.model.Venda;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "caixa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Caixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // armazenar quando foi aberto; não atualizável
    @Column(name = "data_abertura", nullable = false, updatable = false)
    private LocalDateTime dataAbertura = LocalDateTime.now();

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;

    @Column(name = "valor_inicial", nullable = false, precision = 19, scale = 4)
    private BigDecimal valorInicial = BigDecimal.ZERO;

    @Column(name = "valor_final", precision = 19, scale = 4)
    private BigDecimal valorFinal;

    @Column(name = "total_vendas", precision = 19, scale = 4, nullable = false)
    private BigDecimal totalVendas = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCaixa status = StatusCaixa.ABERTO;

    @Column(nullable = false)
    private Boolean aberto = true;

    @Column(name = "aberto_por", nullable = false)
    private String abertoPor;

    @Column(name = "fechado_por")
    private String fechadoPor;


    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "caixa", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Venda> vendas = new ArrayList<>();

    @Version
    private Long version; // optimistic lock

    // helpers para manter o lado bidirecional consistente
    public void adicionarVenda(Venda venda) {
        vendas.add(venda);
        venda.setCaixa(this);
        recalcularTotalVendas();
    }

    public void removerVenda(Venda venda) {
        vendas.remove(venda);
        venda.setCaixa(null);
        recalcularTotalVendas();
    }

    public void recalcularTotalVendas() {
        this.totalVendas = vendas.stream()
                .filter(Objects::nonNull)
                .map(Venda::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void fechar(BigDecimal valorFinal, String fechadoPor) {
        this.valorFinal = valorFinal;
        this.dataFechamento = LocalDateTime.now();
        this.aberto = false;
        this.status = StatusCaixa.FECHADO;
        // Opção de dizer quem fechou (fechadoPor) - Adicionável
    }
}
