package com.pulseapi.dto.websocket;

import java.time.LocalDateTime;

public record AtualizacaoTempoRealDTO(
        String tipo,
        Long recursoId,
        LocalDateTime ocorridoEm
) {
}