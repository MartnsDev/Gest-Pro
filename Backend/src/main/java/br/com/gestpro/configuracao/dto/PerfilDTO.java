package br.com.gestpro.configuracao.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class PerfilDTO {
    private Long    id;
    private String  nome;
    private String  email;
    private String  fotoUrl;
    private String  tipoPlano;
    private int     diasRestantes;
    private String  statusAcesso;
    private String  dataAssinatura;
    private boolean emailConfirmado;
}