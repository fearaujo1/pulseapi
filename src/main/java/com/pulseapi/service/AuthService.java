package com.pulseapi.service;

import com.pulseapi.dto.auth.LoginRequestDTO;
import com.pulseapi.dto.auth.LoginResponseDTO;
import com.pulseapi.entity.Usuario;
import com.pulseapi.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha());

        Authentication authentication = authenticationManager.authenticate(authToken);

        Usuario usuario = (Usuario) authentication.getPrincipal();

        String mensagem = usuario.getPrimeiroAcesso()
                ? "Primeiro acesso. Usuário deve alterar a senha."
                : "Login realizado com sucesso.";

        return new LoginResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getPrimeiroAcesso(),
                mensagem
        );
    }
}
