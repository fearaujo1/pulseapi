package com.pulseapi.event;

public record ProducaoIniciadaEvent(
        Long producaoId,
        Long equipamentoId
) {
}