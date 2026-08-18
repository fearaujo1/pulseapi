package com.pulseapi.dto.configuracao;

import java.time.LocalTime;

public record TurnoResponseDTO(
        Long id,
        String nome,
        LocalTime horaInicio,
        LocalTime horaFim,
        Boolean ativo
) {
}