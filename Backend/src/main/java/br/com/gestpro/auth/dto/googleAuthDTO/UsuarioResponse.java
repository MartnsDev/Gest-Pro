package br.com.gestpro.auth.dto.googleAuthDTO;

import br.com.gestpro.auth.StatusAcesso;
import lombok.Data;

@Data
public class UsuarioResponse {
    private String nome;
    private String email;
    private String foto;
    private StatusAcesso statusAcesso; // agora é enum


    public UsuarioResponse(String nome, String email, String foto, StatusAcesso statusAcesso) {
        this.nome = nome;
        this.email = email;
        this.foto = foto;
        this.statusAcesso = statusAcesso;
    }

}