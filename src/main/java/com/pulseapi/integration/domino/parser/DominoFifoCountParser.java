package com.pulseapi.integration.domino.parser;

import com.pulseapi.integration.domino.dto.DominoFifoCountResponse;

public class DominoFifoCountParser {

    private static final byte ESC = 0x1B;
    private static final byte EOT = 0x04;

    private DominoFifoCountParser() {}

    public static DominoFifoCountResponse parse(byte[] resposta) {
        if (resposta == null || resposta.length != 6) {
            throw new IllegalArgumentException(
                    "Resposta FIFO inválida ou com tamanho inesperado."
            );
        }

        if (resposta[0] != ESC || resposta[1] != 0x7E || resposta[2] != 0x50) {
            throw new IllegalArgumentException(
                    "A resposta não pertence ao comando de consulta FIFO."
            );
        }

        if (resposta[5] != EOT) {
            throw new IllegalArgumentException(
                    "A resposta FIFO não termina com EOT."
            );
        }

        int byteMaisSignificativo = resposta[3] & 0xFF;
        int byteMenosSignificativo = resposta[4] & 0xFF;

        int quantidade = (byteMaisSignificativo << 8)
                | byteMenosSignificativo;

        return new DominoFifoCountResponse(quantidade);
    }
}
