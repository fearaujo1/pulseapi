package com.pulseapi.integration.domino.dto;

public record DominoFifoSendResponse(
        boolean sucesso,
        String dadosEnviados,
        int tamanhoBytes,
        String mensagem
) {
}