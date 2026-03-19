package br.com.gestpro.caixa.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.caixa.StatusCaixa;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.venda.model.Venda;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "caixas")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Caixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "data_abertura", nullable = false, updatable = false)
    private LocalDateTime dataAbertura;

    @Column(name = "data_fechamento")
    private LocalDateTime dataFechamento;

    @Column(name = "valor_inicial", nullable = false, precision = 19, scale = 4)
    private BigDecimal valorInicial;

    @Column(name = "valor_final", precision = 19, scale = 4)
    private BigDecimal valorFinal;

    @Column(name = "total_vendas", precision = 19, scale = 4, nullable = false)
    private BigDecimal totalVendas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCaixa status;

    @Column(nullable = false)
    private Boolean aberto;

    private String terminalId;
    private String abertoPor;
    private String fechadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "caixa", cascade = CascadeType.ALL)
    private List<Venda> vendas = new ArrayList<>();

    @Version
    private Long version;

    public void recalcularTotalVendas() {
        this.totalVendas = vendas.stream()
                .map(v -> v.getTotal() != null ? v.getTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}