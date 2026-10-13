package com.pulseapi.security;

import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter
        extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public SecurityFilter(
            TokenService tokenService,
            UsuarioRepository usuarioRepository
    ) {
        this.tokenService = tokenService;
        this.usuarioRepository =
                usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token =
                recuperarToken(request);

        if (
                token == null ||
                        SecurityContextHolder
                                .getContext()
                                .getAuthentication() != null
        ) {
            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        String email =
                tokenService.validarToken(token);

        if (email == null) {
            /*
             * Não autenticamos tokens inválidos.
             * O Spring Security produzirá o 401.
             */
            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        Usuario usuario =
                usuarioRepository
                        .findByEmail(email)
                        .orElse(null);

        /*
         * Impede a utilização de token antigo
         * por usuário removido ou inativado.
         */
        if (
                usuario == null ||
                        !usuario.isEnabled()
        ) {
            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        /*
         * Durante o primeiro acesso, o usuário
         * pode somente consultar sua sessão e
         * efetuar a troca obrigatória da senha.
         */
        if (
                Boolean.TRUE.equals(
                        usuario.getPrimeiroAcesso()
                )
                        && !rotaPermitidaNoPrimeiroAcesso(
                        request
                )
        ) {
            responderPrimeiroAcessoPendente(
                    response
            );

            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getAuthorities()
                );

        SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);

        filterChain.doFilter(
                request,
                response
        );
    }

    private boolean rotaPermitidaNoPrimeiroAcesso(
            HttpServletRequest request
    ) {
        String metodo =
                request.getMethod();

        String rota =
                request.getRequestURI();

        if (
                "POST".equalsIgnoreCase(metodo)
                        && "/auth/login".equals(rota)
        ) {
            return true;
        }

        if (
                "GET".equalsIgnoreCase(metodo)
                        && "/setup/status".equals(rota)
        ) {
            return true;
        }

        if (
                "GET".equalsIgnoreCase(metodo)
                        && "/auth/me".equals(rota)
        ) {
            return true;
        }

        if (
                "PATCH".equalsIgnoreCase(metodo)
                        && "/auth/primeiro-acesso".equals(rota)
        ) {
            return true;
        }

        /*
         * Requisições OPTIONS são utilizadas
         * pelo navegador para verificar o CORS.
         */
        return "OPTIONS".equalsIgnoreCase(metodo);
    }

    private void responderPrimeiroAcessoPendente(
            HttpServletResponse response
    ) throws IOException {
        response.setStatus(
                HttpServletResponse.SC_FORBIDDEN
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
                  "title": "Troca de senha obrigatória",
                  "status": 403,
                  "detail": "Altere sua senha temporária antes de acessar o sistema."
                }
                """
        );
    }

    private String recuperarToken(
            HttpServletRequest request
    ) {
        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        if (
                authHeader == null ||
                        !authHeader.startsWith("Bearer ")
        ) {
            return null;
        }

        String token =
                authHeader
                        .substring(7)
                        .trim();

        return token.isBlank()
                ? null
                : token;
    }
}