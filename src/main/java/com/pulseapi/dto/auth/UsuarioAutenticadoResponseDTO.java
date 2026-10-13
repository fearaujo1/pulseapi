package com.pulseapi.dto.auth;

public record UsuarioAutenticadoResponseDTO(
        Long id,
        String nome,
        String email,
        String perfil,
        Boolean primeiroAcesso
) {
}