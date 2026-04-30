package com.pulseapi.service;

import com.pulseapi.dto.auth.LoginRequestDTO;
import com.pulseapi.dto.auth.LoginResponseDTO;
import com.pulseapi.entity.Usuario;
import com.pulseapi.repository.UsuarioRepository;
import com.pulseapi.security.TokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.pulseapi.dto.auth.PrimeiroAcessoRequestDTO;
import com.pulseapi.exception.BusinessException;
import com.pulseapi.util.SenhaValidator;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       TokenService tokenService,
                       UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getSenha());

        Authentication authentication = authenticationManager.authenticate(authToken);

        Usuario usuario = (Usuario) authentication.getPrincipal();

        String token = tokenService.gerarToken(usuario);

        String mensagem = usuario.getPrimeiroAcesso()
                ? "Primeiro acesso. Usuário deve alterar a senha."
                : "Login realizado com sucesso.";

        return new LoginResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getPrimeiroAcesso(),
                token,
                mensagem
        );
    }

    public void trocarSenhaPrimeiroAcesso(String email, PrimeiroAcessoRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));

        if (!usuario.getPrimeiroAcesso()) {
            throw new BusinessException("Este usuário não está em primeiro acesso.");
        }

        if (!dto.getNovaSenha().equals(dto.getConfirmarSenha())) {
            throw new BusinessException("A senha e a confirmação não conferem");
        }

        SenhaValidator.validarSenhaForte(dto.getNovaSenha());

        if (passwordEncoder.matches(dto.getNovaSenha(), usuario.getSenhaHash())) {
            throw new BusinessException("A nova senha não pode ser igual à senha temporária.");
        }

        usuario.setSenhaHash(passwordEncoder.encode(dto.getNovaSenha()));
        usuario.setPrimeiroAcesso(false);

        usuarioRepository.save(usuario);
    }
}
