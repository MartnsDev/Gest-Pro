package br.com.gestpro.infra.security;

import br.com.gestpro.infra.filter.JwtAuthenticationFilter;
import br.com.gestpro.infra.filter.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS usando o bean injetado, CSRF desabilitado, sessão stateless
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 2. Retorna 401 em vez de redirecionar para login
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(
                                        jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED,
                                        "Não autorizado"
                                )
                        )
                )

                // 3. Regras de permissão
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/h2-console/**").permitAll()
                        .requestMatchers("/api/auth/esqueceu-senha", "/api/auth/redefinir-senha").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/cadastro").permitAll()
                        .requestMatchers("/auth/**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/payments/webhook", "/api/payments/create-checkout-session").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        .anyRequest().authenticated()
                )

                // 4. Headers e OAuth2
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin()))
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureUrl(oAuth2LoginSuccessHandler.getFrontendUrl()
                                + "/auth/login?error=oauth2")
                );

        // 5. Filtro JWT
        http.addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}