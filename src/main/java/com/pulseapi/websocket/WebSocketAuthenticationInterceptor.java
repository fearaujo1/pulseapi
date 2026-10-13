package com.pulseapi.websocket;

import com.pulseapi.entity.usuario.Usuario;
import com.pulseapi.repository.UsuarioRepository;
import com.pulseapi.security.TokenService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthenticationInterceptor
        implements ChannelInterceptor {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public WebSocketAuthenticationInterceptor(
            TokenService tokenService,
            UsuarioRepository usuarioRepository
    ) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public Message<?> preSend(
            Message<?> message,
            MessageChannel channel
    ) {
        /*
         * Recupera o accessor original da mensagem.
         *
         * Não utilize StompHeaderAccessor.wrap(message),
         * pois ele cria outro accessor e a autenticação
         * pode não permanecer associada à sessão STOMP.
         */
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(
                        message,
                        StompHeaderAccessor.class
                );

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(
                accessor.getCommand()
        )) {
            autenticar(accessor);
        }

        /*
         * Não é necessário validar novamente no SUBSCRIBE.
         *
         * Uma sessão STOMP somente chega ao SUBSCRIBE depois
         * de passar pelo CONNECT, no qual o token é validado
         * e o usuário é associado à sessão.
         */
        return message;
    }

    private void autenticar(
            StompHeaderAccessor accessor
    ) {
        String authorization =
                accessor.getFirstNativeHeader(
                        "Authorization"
                );

        if (authorization == null
                || !authorization.startsWith("Bearer ")) {

            throw new BadCredentialsException(
                    "Token não informado na conexão WebSocket."
            );
        }

        String token =
                authorization.substring(7).trim();

        if (token.isBlank()) {
            throw new BadCredentialsException(
                    "Token não informado na conexão WebSocket."
            );
        }

        String email =
                tokenService.validarToken(token);

        if (email == null || email.isBlank()) {
            throw new BadCredentialsException(
                    "Token inválido ou expirado."
            );
        }

        Usuario usuario =
                usuarioRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new BadCredentialsException(
                                        "Usuário não encontrado."
                                )
                        );

        if (!usuario.isEnabled()) {
            throw new BadCredentialsException(
                    "Usuário inativo."
            );
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        usuario.getAuthorities()
                );

        /*
         * Associa a autenticação à sessão STOMP.
         * O Spring reutilizará esse usuário nos próximos frames.
         */
        accessor.setUser(authentication);
    }
}