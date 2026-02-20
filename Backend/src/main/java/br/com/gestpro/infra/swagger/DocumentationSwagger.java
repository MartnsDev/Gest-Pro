package br.com.gestpro.infra.swagger;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DocumentationSwagger { // <--- Nome da classe

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("GestPro API")
                        .version("1.0")
                        .description("API para o sistema de gestão de lojas GestPro — desenvolvida com Spring Boot e Spring Security (JWT).")
                        .contact(new Contact()
                                .name("GestPro - Matheus Martins (MartnsDev)")
                                .email("gestprosuporte@gmail.com"))
                        .license(new License()
                                .name("Uso Restrito - Propriedade de Matheus Martins (MartnsDev)")
                                .url("https://github.com/MartnsDev/GestPro"))
                )
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        )
                )
                // Tags principais da documentação
                .addTagsItem(new Tag().name("Autenticação").description("Endpoints de login, cadastro e tokens"))
                .addTagsItem(new Tag().name("Usuário").description("Operações relacionadas ao usuário"))
                .addTagsItem(new Tag().name("Planos").description("Controle de acesso e tipo de plano"));
    }
}
