package com.pulseapi.integration.domino.parser;

import com.pulseapi.integration.domino.dto.DominoProductCountResponse;

import java.nio.charset.StandardCharsets;

public final class DominoProductCountParser {

    private static final byte ESC = 0x1B;
    private static final byte EOT = 0x04;

    private DominoProductCountParser() {
    }

    public static DominoProductCountResponse parse(byte[] resposta) {
        if (resposta == null || resposta.length < 6) {
            throw new IllegalArgumentException(
                    "Resposta do contador vazia ou incompleta."
            );
        }

        if (resposta[0] != ESC) {
            throw new IllegalArgumentException(
                    "Resposta do contador não começa com ESC."
            );
        }

        if (resposta[resposta.length - 1] != EOT) {
            throw new IllegalArgumentException(
                    "Resposta do contador não termina com EOT."
            );
        }

        String conteudo = new String(
                resposta,
                1,
                resposta.length - 2,
                StandardCharsets.US_ASCII
        );

        // Formato esperado:
        // T1 + quantidade
        // Exemplo: T10000000025

        if (!conteudo.startsWith("T1")) {
            throw new IllegalArgumentException(
                    "A resposta não pertence ao contador 1: " + conteudo
            );
        }

        String quantidadeTexto = conteudo.substring(2);

        if (quantidadeTexto.isBlank()
                || !quantidadeTexto.chars().allMatch(Character::isDigit)) {
            throw new IllegalArgumentException(
                    "Quantidade inválida no contador: " + quantidadeTexto
            );
        }

        return new DominoProductCountResponse(
                1,
                Long.parseLong(quantidadeTexto)
        );
    }
}