package com.pulseapi.integration.domino.dto;

public record DominoStatusResponse(
        String codigoStatus,
        int jato,
        String horarioAlteracao,
        String descricao,
        String severidade
) {
}