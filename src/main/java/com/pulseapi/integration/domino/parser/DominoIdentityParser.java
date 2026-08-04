package com.pulseapi.integration.domino.parser;

import com.pulseapi.integration.domino.dto.DominoIdentityResponse;

import java.nio.charset.StandardCharsets;

public final class DominoIdentityParser {

    private static final byte ESC = 0x1B;
    private static final byte EOT = 0x04;

    private DominoIdentityParser() {
    }

    public static DominoIdentityResponse parse(byte[] resposta) {
        validarEstrutura(resposta);

        String conteudo = new String(
                resposta,
                1,
                resposta.length - 2,
                StandardCharsets.US_ASCII
        );

        // Exemplo recebido:
        // A00560670600

        if (!conteudo.startsWith("A")) {
            throw new IllegalArgumentException(
                    "A resposta não pertence ao comando de identidade: " + conteudo
            );
        }

        if (conteudo.length() != 12) {
            throw new IllegalArgumentException(
                    "Resposta de identidade com tamanho inválido: " + conteudo
            );
        }

        String tipoCodigo = conteudo.substring(1, 3);
        String softwarePartNumber = conteudo.substring(3, 8);
        String softwareIssue = conteudo.substring(8, 10);
        String codenetId = conteudo.substring(10, 12);

        return new DominoIdentityResponse(
                tipoCodigo,
                interpretarTipo(tipoCodigo),
                softwarePartNumber,
                softwareIssue,
                codenetId
        );
    }

    private static void validarEstrutura(byte[] resposta) {
        if (resposta == null || resposta.length < 4) {
            throw new IllegalArgumentException("Resposta vazia ou incompleta.");
        }

        if (resposta[0] != ESC) {
            throw new IllegalArgumentException("Resposta não começa com ESC.");
        }

        if (resposta[resposta.length - 1] != EOT) {
            throw new IllegalArgumentException("Resposta não termina com EOT.");
        }
    }

    private static String interpretarTipo(String codigo) {
        return switch (codigo) {
            case "00" -> "Codebox";
            case "01" -> "Solo";
            case "02" -> "Solo Twin Head";
            case "03" -> "A300";
            case "20" -> "Macrojet";
            case "21" -> "Casecoder";
            case "22" -> "A-Series Plus A100";
            case "23" -> "A-Series Plus A300";
            case "24" -> "A-Series Plus Duo";
            case "30" -> "Ax-Series";
            case "40" -> "Jx-Series";
            default -> "Desconhecido (" + codigo + ")";
        };
    }
}