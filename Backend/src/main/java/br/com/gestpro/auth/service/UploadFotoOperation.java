package br.com.gestpro.auth.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class UploadFotoOperation {

    /**
     * Salva o arquivo enviado em uma pasta local e retorna o caminho salvo.
     *
     * @param foto MultipartFile enviado pelo cliente.
     * @return Caminho completo do arquivo salvo.
     * @throws IOException Caso ocorra erro ao salvar o arquivo.
     */
    @Transactional
    public String salvarFoto(MultipartFile foto) throws IOException {
        if (foto == null || foto.isEmpty()) {
            return null; // evita NullPointer ou salvar arquivo vazio
        }

        // Gera um nome único para o arquivo
        String nomeArquivo = System.currentTimeMillis() + "_" + foto.getOriginalFilename();

        // Define o caminho do diretório
        Path caminho = Paths.get("uploads", nomeArquivo);

        // Cria diretórios se ainda não existirem
        Files.createDirectories(caminho.getParent());

        // Salva o arquivo
        Files.write(caminho, foto.getBytes());

        // Retorna o caminho salvo (você pode retornar apenas o nome se preferir)
        return caminho.toString();
    }
}
