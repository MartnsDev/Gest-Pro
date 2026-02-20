package br.com.gestpro.cliente.model;

import br.com.gestpro.auth.model.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String email;
    private String telefone;
    private Boolean ativo = true;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

}
