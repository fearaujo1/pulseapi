package com.pulseapi.event;

import java.time.LocalDateTime;

public record EquipamentoDesconectadoEvent(
        Long equipamentoId,
        String equipamentoNome,
        LocalDateTime ocorridoEm
) {
}