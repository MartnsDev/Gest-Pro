package br.com.gestpro.cliente.dto;

import br.com.gestpro.cliente.model.Cliente;
import lombok.Getter;

@Getter
public class ClienteDTO {
    private Long    id;
    private String  nome;
    private String  email;
    private String  telefone;
    private String  cpf;
    private String  cnpj;
    private String  contato;
    private String  observacoes;
    private String  tipo;        // "CLIENTE" | "FORNECEDOR"
    private Boolean ativo;
    private Long    empresaId;

    public ClienteDTO(Cliente c) {
        this.id          = c.getId();
        this.nome        = c.getNome();
        this.email       = c.getEmail();
        this.telefone    = c.getTelefone();
        this.cpf         = c.getCpf();
        this.cnpj        = c.getCnpj();
        this.contato     = c.getContato();
        this.observacoes = c.getObservacoes();
        this.tipo        = c.getTipo() != null ? c.getTipo() : "CLIENTE";
        this.ativo       = c.getAtivo();
        this.empresaId   = c.getEmpresa() != null ? c.getEmpresa().getId() : null;
    }
}