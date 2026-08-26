package com.pulseapi.integration.domino.monitoring;

public record DominoMonitoringEndpoint(
        Long equipamentoId,
        String nome,
        String host,
        int porta
) {
}