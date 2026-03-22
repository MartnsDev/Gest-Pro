package br.com.gestpro.auth.dto;

import br.com.gestpro.auth.model.Usuario;
import lombok.Builder;
import lombok.Data;

/**
 * Response do endpoint GET /api/usuario
 * Inclui fotoUpload para o frontend priorizar sobre foto Google.
 */
@Data @Builder
public class UsuarioResponse {
    private String nome;
    private String email;
    private String foto;          // foto Google (URL completa)
    private String fotoUpload;    // foto de upload (/uploads/fotos/uuid.jpg)
    private String tipoPlano;
    private String statusAcesso;
    private String expiracaoPlano;

    public static UsuarioResponse from(Usuario u) {
        String expiracao = null;
        if (u.getDataAssinaturaPlus() != null && u.getTipoPlano() != null) {
            expiracao = u.getDataAssinaturaPlus()
                    .plusDays(u.getTipoPlano().getDuracaoDiasPadrao())
                    .toLocalDate().toString();
        } else if (u.getDataPrimeiroLogin() != null && u.getTipoPlano() != null) {
            expiracao = u.getDataPrimeiroLogin()
                    .plusDays(u.getTipoPlano().getDuracaoDiasPadrao())
                    .toLocalDate().toString();
        }

        return UsuarioResponse.builder()
                .nome(u.getNome())
                .email(u.getEmail())
                .foto(u.getFoto())                // campo foto_google
                .fotoUpload(u.getFotoUpload())    // campo foto_upload
                .tipoPlano(u.getTipoPlano() != null ? u.getTipoPlano().name() : "EXPERIMENTAL")
                .statusAcesso(u.getStatusAcesso() != null ? u.getStatusAcesso().name() : "ATIVO")
                .expiracaoPlano(expiracao)
                .build();
    }
}