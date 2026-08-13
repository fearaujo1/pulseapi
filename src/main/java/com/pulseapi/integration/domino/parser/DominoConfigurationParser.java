package com.pulseapi.integration.domino.parser;

import com.pulseapi.integration.domino.dto.DominoConfigurationResponse;

import java.nio.charset.StandardCharsets;
import java.util.List;

public final class DominoConfigurationParser {

    private static final byte ESC = 0x1B;
    private static final byte EOT = 0x04;

    private DominoConfigurationParser() {
    }

    public static DominoConfigurationResponse parse(byte[] resposta) {
        validarEstrutura(resposta);

        String conteudo = new String(
                resposta,
                1,
                resposta.length - 2,
                StandardCharsets.US_ASCII
        );

        // Exemplo:
        // B1010000002552550007H0

        if (!conteudo.startsWith("B")) {
            throw new IllegalArgumentException(
                    "A resposta não pertence ao comando de configuração: " + conteudo
            );
        }

        if (conteudo.length() != 22) {
            throw new IllegalArgumentException(
                    "Resposta de configuração com tamanho inválido: " + conteudo
            );
        }

        int quantidadeJatos = converterInteiro(
                conteudo.substring(1, 2),
                "quantidade de jatos"
        );

        List<Integer> configuracoesJatos = List.of(
                converterInteiro(conteudo.substring(2, 4), "configuração do jato 1"),
                converterInteiro(conteudo.substring(4, 6), "configuração do jato 2"),
                converterInteiro(conteudo.substring(6, 8), "configuração do jato 3"),
                converterInteiro(conteudo.substring(8, 10), "configuração do jato 4")
        );

        int maximoLayouts = converterInteiro(
                conteudo.substring(10, 13),
                "máximo de layouts"
        );

        int tamanhoMaximoLayout = converterInteiro(
                conteudo.substring(13, 16),
                "tamanho máximo do layout"
        );

        String codigoFormatoBarras = conteudo.substring(16, 18);
        String codigoBaudRate = conteudo.substring(18, 20);
        String controleFluxo = conteudo.substring(20, 21);

        int comandosAplicacao = converterInteiro(
                conteudo.substring(21, 22),
                "comandos de aplicação"
        );

        return new DominoConfigurationResponse(
                quantidadeJatos,
                configuracoesJatos,
                maximoLayouts,
                tamanhoMaximoLayout,
                interpretarFormatoCodigoBarras(codigoFormatoBarras),
                interpretarBaudRate(codigoBaudRate),
                interpretarControleFluxo(controleFluxo),
                comandosAplicacao
        );
    }

    private static void validarEstrutura(byte[] resposta) {
        if (resposta == null || resposta.length < 4) {
            throw new IllegalArgumentException(
                    "Resposta vazia ou incompleta."
            );
        }

        if (resposta[0] != ESC) {
            throw new IllegalArgumentException(
                    "Resposta não começa com ESC."
            );
        }

        if (resposta[resposta.length - 1] != EOT) {
            throw new IllegalArgumentException(
                    "Resposta não termina com EOT."
            );
        }
    }

    private static int converterInteiro(String valor, String nomeCampo) {
        if (!valor.chars().allMatch(Character::isDigit)) {
            throw new IllegalArgumentException(
                    "Valor inválido para " + nomeCampo + ": " + valor
            );
        }

        return Integer.parseInt(valor);
    }

    private static String interpretarFormatoCodigoBarras(String codigo) {
        return switch (codigo) {
            case "00" -> "Nenhum";
            case "01" -> "Code 39";
            case "02" -> "Interleaved 2 of 5";
            case "04" -> "EAN/UPC";
            default -> "Desconhecido (" + codigo + ")";
        };
    }

    private static String interpretarBaudRate(String codigo) {
        return switch (codigo) {
            case "00" -> "75";
            case "01" -> "150";
            case "02" -> "300";
            case "03" -> "600";
            case "04" -> "1200";
            case "05" -> "2400";
            case "06" -> "4800";
            case "07" -> "9600";
            case "08" -> "19200";
            case "09" -> "110";
            case "10" -> "38400";
            case "11" -> "57600";
            case "12" -> "115200";
            default -> "Desconhecido (" + codigo + ")";
        };
    }

    private static String interpretarControleFluxo(String codigo) {
        return switch (codigo) {
            case "H" -> "RTS/CTS";
            case "S" -> "XON/XOFF";
            default -> "Desconhecido (" + codigo + ")";
        };
    }
}