package com.pulseapi.integration.domino.teste;

import com.pulseapi.integration.domino.dto.DominoStatusResponse;

import java.nio.charset.StandardCharsets;

public class DominoStatusParser {

    private static final byte ESC = 0x1B;
    private static final byte EOT = 0x04;

    private DominoStatusParser() {
    }

    public static DominoStatusResponse parse(byte[] resposta) {
        validarEstrutura(resposta);

        String conteudo = new String(
                resposta,
                1,
                resposta.length - 2,
                StandardCharsets.US_ASCII
        );

        // Conteúdo esperado sem ESC e EOT:
        // 1C29911954
        if (conteudo.length() != 10) {
            throw new IllegalArgumentException(
                    "Resposta de status com tamanho inválido: " + conteudo
            );
        }

        if (conteudo.charAt(0) != '1') {
            throw new IllegalArgumentException(
                    "A resposta não pertence ao comando de status: " + conteudo
            );
        }

        String codigoStatus = conteudo.substring(2, 5);
        String jatoTexto = conteudo.substring(5, 6);
        String horarioBruto = conteudo.substring(6, 10);

        if (!codigoStatus.matches("\\d{3}")) {
            throw new IllegalArgumentException(
                    "Código de status inválido: " + codigoStatus
            );
        }

        if (!horarioBruto.matches("\\d{4}")) {
            throw new IllegalArgumentException(
                    "Horário inválido: " + horarioBruto
            );
        }

        String hora = horarioBruto.substring(0, 2);
        String minuto = horarioBruto.substring(2, 4);

        validarHorario(hora, minuto);

        return new DominoStatusResponse(
                codigoStatus,
                Integer.parseInt(jatoTexto),
                hora + ":" + minuto
        );
    }

    private static void validarEstrutura(byte[] resposta) {
        if (resposta == null || resposta.length < 4) {
            throw new IllegalArgumentException("Resposta vazia ou incompleta.");
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


    private static void validarHorario(String hora, String minuto) {
        int horaNumero = Integer.parseInt(hora);
        int minutoNumero = Integer.parseInt(minuto);

        if (horaNumero < 0 || horaNumero > 23) {
            throw new IllegalArgumentException(
                    "Hora fora do intervalo válido: " + hora
            );
        }

        if (minutoNumero < 0 || minutoNumero > 59) {
            throw new IllegalArgumentException(
                    "Minuto fora do intervalo válido: " + minuto
            );
        }
    }
}