package br.com.gestpro.gestpro_backend.domain.model.modules.caixa;

import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.model.enums.StatusCaixa;
import br.com.gestpro.gestpro_backend.domain.model.modules.venda.Venda;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "caixa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Caixa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataAbertura = LocalDateTime.now();

    private LocalDateTime dataFechamento;

    @Column(nullable = false)
    private BigDecimal valorInicial = BigDecimal.ZERO;

    private BigDecimal valorFinal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCaixa status = StatusCaixa.ABERTO;

    @Column(nullable = false)
    private Boolean aberto = true; // default ao abrir


    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "caixa", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Venda> vendas = new ArrayList<>();
}
