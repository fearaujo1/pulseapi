package com.pulseapi.integration.domino.dto;

public record DominoLayoutOnlineResponse(
        String nome,
        int comprimento,
        boolean layoutSelecionado
) {
}