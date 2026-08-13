package com.pulseapi.integration.domino.parser;

import com.pulseapi.integration.domino.dto.DominoLayoutOnlineResponse;
import java.nio.charset.StandardCharsets;

public class DominoLayoutOnlineParser {

    private static final byte ESC = 0x1B;
    private static final byte EOT = 0x04;

    private DominoLayoutOnlineParser() {}

    public static DominoLayoutOnlineResponse parse(byte[] resposta) {
        if (resposta == null || resposta.length < 7) {
            throw new IllegalArgumentException(
                    "Resposta do layout online vazia ou incompleta."
            );
        }

        if (resposta[0] != ESC) {
            throw new IllegalArgumentException(
                    "Resposta não começar com ESC."
            );
        }

        if (resposta[resposta.length - 1] != EOT) {
            throw new IllegalArgumentException(
                    "Resposta não termina com EOT."
            );
        }

        String conteudo = new String(
                resposta,
                1,
                resposta.length - 2,
                StandardCharsets.US_ASCII
        );

        // Formato esperado:
        // ON1 + tamanho com 2 dígitos + nome
        // Exemplo: ON110TESTE_FIFO

        if (!conteudo.startsWith("ON1")) {
            throw new IllegalArgumentException(
                    "A resposta não pertence à consulta de layout online: "
                    + conteudo
            );
        }

        if (conteudo.length() < 5) {
            throw new IllegalArgumentException(
                    "Resposta de layout online inválida: " + conteudo
            );
        }

        String comprimentoTexto = conteudo.substring(3, 5);

        if (!comprimentoTexto.matches("\\d{2}")) {
            throw new IllegalArgumentException(
                    "Comprimento do nome do layout inválido."
            );
        }

        int comprimento = Integer.parseInt(comprimentoTexto);

        if (conteudo.length() != 5 + comprimento) {
            throw new IllegalArgumentException(
                    "O tamanho informado não corresponde ao nome retornado."
            );
        }

        String nome = comprimento == 0
                ? ""
                : conteudo.substring(5);

        return new DominoLayoutOnlineResponse(
                nome,
                comprimento,
                comprimento > 0
        );
    }
}











