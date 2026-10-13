package com.pulseapi.event;

import java.time.LocalDateTime;

public record DashboardAtualizadoEvent(
        String tipo,
        Long recursoId,
        LocalDateTime ocorridoEm
) {

    public static DashboardAtualizadoEvent criar(
            String tipo,
            Long recursoId
    ) {
        return new DashboardAtualizadoEvent(
                tipo,
                recursoId,
                LocalDateTime.now()
        );
    }
}