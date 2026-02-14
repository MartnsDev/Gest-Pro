package br.com.gestpro.gestpro_backend.infra.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * ObjectMapper dedicado ao Redis
     * Sem typing global
     * Suporte a java.time
     */
    @Bean
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    /**
     * Configuração base de cache
     */
    @Bean
    public RedisCacheConfiguration defaultCacheConfig(ObjectMapper redisObjectMapper) {

        GenericJackson2JsonRedisSerializer valueSerializer =
                new GenericJackson2JsonRedisSerializer(redisObjectMapper);

        return RedisCacheConfiguration.defaultCacheConfig()
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(new StringRedisSerializer())
                )
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair
                                .fromSerializer(valueSerializer)
                )
                .entryTtl(Duration.ofMinutes(30)); // padrão
    }

    /**
     * CacheManager com TTL específico por cache
     */
    @Bean
    public RedisCacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            RedisCacheConfiguration defaultCacheConfig
    ) {

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        // Dashboard muda rápido
        cacheConfigs.put(
                "visao:vendas-semana",
                defaultCacheConfig.entryTtl(Duration.ofMinutes(5))
        );

        cacheConfigs.put(
                "visao:estoque-zerado",
                defaultCacheConfig.entryTtl(Duration.ofMinutes(5))
        );

        // Plano do usuário muda pouco
        cacheConfigs.put(
                "visao:plano-usuario",
                defaultCacheConfig.entryTtl(Duration.ofHours(1))
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultCacheConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }
}
