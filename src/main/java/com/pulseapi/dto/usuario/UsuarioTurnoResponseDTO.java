package com.pulseapi.dto.usuario;

import java.time.LocalTime;

public record UsuarioTurnoResponseDTO(
        Long id,
        String nome,
        LocalTime horaInicio,
        LocalTime horaFim,
        Boolean ativo
) {
}
