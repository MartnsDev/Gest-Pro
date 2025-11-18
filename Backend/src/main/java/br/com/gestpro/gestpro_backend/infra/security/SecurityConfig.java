package br.com.gestpro.gestpro_backend.infra.security;

import br.com.gestpro.gestpro_backend.infra.filter.JwtAuthenticationFilter;
import br.com.gestpro.gestpro_backend.infra.filter.OAuth2LoginSuccessHandler;
import br.com.gestpro.gestpro_backend.infra.util.backups.GoogleAuthService;
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
    private final GoogleAuthService googleAuthService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomOAuth2UserService customOAuth2UserService,
                          GoogleAuthService googleAuthService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.googleAuthService = googleAuthService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors().and()
                .csrf().disable()
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api-docs/**", "/swagger-ui/**", "/h2-console/**").permitAll()//Documentação do projeto e H2(Banco de dados para testes)
                        .requestMatchers("/api/auth/esqueceu-senha", "/api/auth/redefinir-senha").permitAll()//Redefinir senha do usuario
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/cadastro").permitAll() //Login ou Cadastro com o meu Banco de Dados
                        .requestMatchers("/api/dashboard/**").authenticated()
                        .requestMatchers("/auth/**", "/oauth2/**").permitAll()//Login ou Cadastro com o Google
                        .requestMatchers("/api/usuario").authenticated()
                        .anyRequest().authenticated()
                )
                //Configuração do login com o Google e redirecionamento falha, o do sucesso está no filter
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(new OAuth2LoginSuccessHandler(googleAuthService))
                        .failureUrl("http://localhost:3000/") // Redirecionamento após falha no login
                );

        //COnfiguração dos filters, qual vem primeiro e qual vem depois
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    //Criptografar as senhas salvas no banco de dados para segurança do usuario caso aja vazamentos de informações ou algo do tipo.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

