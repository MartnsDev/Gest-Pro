package br.com.gestpro.empresa.model;

import br.com.gestpro.plano.TipoPlano;
import br.com.gestpro.auth.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "empresas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeFantasia;

    @Column(unique = true)
    private String cnpj;

    private String logotipoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario dono;

    @Enumerated(EnumType.STRING) // Salva o nome (ex: "PRO") no banco
    @Column(name = "tipo_plano", nullable = false)
    private TipoPlano plano;

    private boolean ativa = true;
}