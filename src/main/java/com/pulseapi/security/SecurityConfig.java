package com.pulseapi.security;

import com.pulseapi.repository.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import jakarta.servlet.http.HttpServletResponse;
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    public SecurityConfig(
            SecurityFilter securityFilter
    ) {
        this.securityFilter =
                securityFilter;
    }

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {
        CorsConfiguration config =
                new CorsConfiguration();

        config.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );

        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        config.setAllowedHeaders(
                List.of("*")
        );

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {
        http
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )
                .csrf(csrf ->
                        csrf.disable()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .authorizeHttpRequests(auth ->
                        auth
                                /*
                                 * Somente estas rotas podem
                                 * ser utilizadas sem token.
                                 */
                                .requestMatchers(
                                        "/auth/login",
                                        "/setup/status",
                                        "/setup/inicial",
                                        "/ws",
                                        "/ws/**"
                                )
                                .permitAll()

                                /*
                                 * Libera as requisições
                                 * de verificação do CORS.
                                 */
                                .requestMatchers(
                                        org.springframework.http.HttpMethod.OPTIONS,
                                        "/**"
                                )
                                .permitAll()

                                /*
                                 * Todas as demais rotas
                                 * exigem autenticação.
                                 */
                                .anyRequest()
                                .authenticated()
                )
                .exceptionHandling(exception ->
                        exception
                                .authenticationEntryPoint(
                                        (
                                                request,
                                                response,
                                                authenticationException
                                        ) -> {
                                            response.setStatus(
                                                    HttpServletResponse
                                                            .SC_UNAUTHORIZED
                                            );

                                            response.setContentType(
                                                    "application/problem+json"
                                            );

                                            response.setCharacterEncoding(
                                                    "UTF-8"
                                            );

                                            response.getWriter().write(
                                                    """
                                                    {
                                                      "title": "Não autenticado",
                                                      "status": 401,
                                                      "detail": "É necessário possuir uma sessão válida para acessar este recurso."
                                                    }
                                                    """
                                            );
                                        }
                                )
                                .accessDeniedHandler(
                                        (
                                                request,
                                                response,
                                                accessDeniedException
                                        ) -> {
                                            response.setStatus(
                                                    HttpServletResponse
                                                            .SC_FORBIDDEN
                                            );

                                            response.setContentType(
                                                    "application/problem+json"
                                            );

                                            response.setCharacterEncoding(
                                                    "UTF-8"
                                            );

                                            response.getWriter().write(
                                                    """
                                                    {
                                                      "title": "Acesso negado",
                                                      "status": 403,
                                                      "detail": "Você não possui permissão para acessar este recurso."
                                                    }
                                                    """
                                            );
                                        }
                                )
                )
                .addFilterBefore(
                        securityFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(
            UsuarioRepository usuarioRepository
    ) {
        return username ->
                usuarioRepository
                        .findByEmail(username)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "Usuário não encontrado."
                                )
                        );
    }

    @Bean
    public AuthenticationProvider
    authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        authProvider.setPasswordEncoder(
                passwordEncoder
        );

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}