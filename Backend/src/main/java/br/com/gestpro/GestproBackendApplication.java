package br.com.gestpro;

import org.springframework.boot.SpringApplication;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestproBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestproBackendApplication.class, args);
    }

}
