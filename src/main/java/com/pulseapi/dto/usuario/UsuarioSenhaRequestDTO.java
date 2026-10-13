package com.pulseapi.dto.usuario;

import jakarta.validation.constraints.NotBlank;

public record UsuarioSenhaRequestDTO(

        @NotBlank(message = "A nova senha é obrigatória.")
        String novaSenha,

        @NotBlank(message = "A confirmação da senha é obrigatória.")
        String confirmarSenha

) {
}