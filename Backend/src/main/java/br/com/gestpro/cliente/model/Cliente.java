package br.com.gestpro.cliente.model;

import br.com.gestpro.auth.model.Usuario;
import br.com.gestpro.empresa.model.Empresa;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clientes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String telefone;
    private String cpf;
    private Boolean ativo = true;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;
}