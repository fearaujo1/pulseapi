package com.pulseapi.integration.domino.teste;

public record DominoStatusResponse(
        String codigoStatus,
        int jato,
        String horarioAlteracao
) {
}