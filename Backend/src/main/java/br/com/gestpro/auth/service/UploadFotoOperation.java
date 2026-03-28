package br.com.gestpro.auth.service;

import br.com.gestpro.infra.exception.ApiException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class UploadFotoOperation {

    private final Cloudinary cloudinary;

    /**
     * Faz upload da foto para o Cloudinary e retorna a URL pública permanente.
     * Substitui qualquer foto anterior do mesmo usuário automaticamente (overwrite=true).
     *
     * @param foto           MultipartFile enviado pelo cliente
     * @param emailUsuario   E-mail do usuário (usado como public_id único)
     * @return URL HTTPS permanente da imagem no Cloudinary
     */
    public String salvarFoto(MultipartFile foto, String emailUsuario) throws IOException {
        if (foto == null || foto.isEmpty()) {
            return null;
        }

        // Valida tipo MIME
        String contentType = foto.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException(
                    "Arquivo deve ser uma imagem (JPG, PNG ou WebP)",
                    HttpStatus.BAD_REQUEST,
                    "/api/v1/configuracoes/perfil/foto"
            );
        }

        // Valida tamanho — máx 5MB
        if (foto.getSize() > 5L * 1024 * 1024) {
            throw new ApiException(
                    "A imagem deve ter no máximo 5MB",
                    HttpStatus.BAD_REQUEST,
                    "/api/v1/configuracoes/perfil/foto"
            );
        }

        // Public ID único por usuário — sobrescreve foto anterior automaticamente
        String publicId = "gestpro/fotos/usuario_"
                + emailUsuario.replace("@", "_at_").replace(".", "_");

        log.info("Fazendo upload de foto para Cloudinary | publicId={}", publicId);

        @SuppressWarnings("unchecked")
        Map<String, Object> resultado = cloudinary.uploader().upload(
                foto.getBytes(),
                ObjectUtils.asMap(
                        "public_id",      publicId,
                        "overwrite",      true,
                        "invalidate",     true,        // invalida CDN cache da foto antiga
                        "folder",         "",          // pasta já está no public_id
                        "transformation", ObjectUtils.asMap(
                                "width",   200,
                                "height",  200,
                                "crop",    "fill",
                                "gravity", "face",     // centraliza no rosto automaticamente
                                "quality", "auto",
                                "fetch_format", "auto" // entrega webp quando suportado
                        )
                )
        );

        String url = (String) resultado.get("secure_url");
        log.info("Upload concluído | url={}", url);
        return url;
    }

    /**
     * Remove a foto do Cloudinary.
     * Chamado quando o usuário quer remover a foto de perfil.
     */
    public void removerFoto(String emailUsuario) {
        String publicId = "gestpro/fotos/usuario_"
                + emailUsuario.replace("@", "_at_").replace(".", "_");
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));
            log.info("Foto removida do Cloudinary | publicId={}", publicId);
        } catch (Exception e) {
            log.warn("Não foi possível remover foto do Cloudinary | publicId={} | erro={}", publicId, e.getMessage());
        }
    }
}