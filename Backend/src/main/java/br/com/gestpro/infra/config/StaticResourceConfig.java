package br.com.gestpro.infra.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

        /**
         * Serve arquivos de uploads (fotos de perfil, etc.) diretamente pelo backend.
         * Ex: GET http://localhost:8080/uploads/fotos/uuid.jpg
         * → arquivo em: <projeto>/uploads/fotos/uuid.jpg
         */
        @Override
        public void addResourceHandlers(ResourceHandlerRegistry registry) {
            Path uploadDir = Paths.get("uploads").toAbsolutePath();
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:" + uploadDir + "/");
        }
}