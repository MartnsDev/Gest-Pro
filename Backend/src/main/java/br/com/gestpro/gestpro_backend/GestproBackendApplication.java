package br.com.gestpro.gestpro_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "br.com.gestpro.gestpro_backend")
@EnableJpaRepositories(basePackages = "br.com.gestpro.gestpro_backend.domain.repository")
@EntityScan(basePackages = "br.com.gestpro.gestpro_backend.domain.model")
@EnableScheduling
public class GestproBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestproBackendApplication.class, args);
    }

}
