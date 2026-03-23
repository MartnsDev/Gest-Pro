package br.com.gestpro.infra.security;

import br.com.gestpro.infra.filter.JwtAuthenticationFilter;
import br.com.gestpro.infra.filter.OAuth2LoginSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Configurações de Base: CORS, CSRF e Stateless
                .cors().and()
                .csrf().disable()
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 2. O segredo para parar o redirect 302: Tratar erro como 401 em vez de redirecionar para login
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Não autorizado");
                        })
                )

                // 3. Regras de Permissão (Ordem importa: do mais específico para o mais genérico)
                .authorizeHttpRequests(auth -> auth
                        // Permite OPTIONS para o pre-flight do CORS
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // Rotas Públicas (Documentação, Auth e Webhooks)
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/h2-console/**").permitAll()
                        .requestMatchers("/api/auth/esqueceu-senha", "/api/auth/redefinir-senha").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/auth/login", "/auth/cadastro").permitAll()
                        .requestMatchers("/auth/**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/payments/webhook", "/api/payments/create-checkout-session").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()

                        // Todo o restante das APIs exige autenticação
                        .anyRequest().authenticated()
                )

                // 4. Configurações Adicionais e OAuth2
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureUrl(oAuth2LoginSuccessHandler.getFrontendUrl() + "/auth/login?error=oauth2")
                );

        // 5. Registra o filtro JWT antes do filtro de usuário/senha padrão
        http.addFilterBefore(jwtAuthenticationFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
