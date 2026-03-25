package br.com.gestpro.infra.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2); // Mínimo de threads
        executor.setMaxPoolSize(5);  // Máximo de threads (bom para não estourar a RAM da Railway)
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("GestProAsync-");
        executor.initialize();
        return executor;
    }
}