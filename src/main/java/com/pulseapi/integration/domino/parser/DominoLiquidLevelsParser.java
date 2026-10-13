package com.pulseapi.integration.domino.parser;

import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.dto.DominoLiquidLevelsResponse;
import com.pulseapi.integration.domino.dto.NivelLiquidoResponse;

import java.nio.charset.StandardCharsets;
import java.util.Map;

public final class DominoLiquidLevelsParser {

    private static final int TAMANHO_RESPOSTA = 9;

    private static final Map<String, FaixaNivel>
            FAIXAS = Map.of(
            "000", new FaixaNivel(0, 12),
            "001", new FaixaNivel(13, 24),
            "002", new FaixaNivel(25, 37),
            "003", new FaixaNivel(38, 49),
            "004", new FaixaNivel(50, 62),
            "005", new FaixaNivel(63, 74),
            "006", new FaixaNivel(75, 87),
            "007", new FaixaNivel(88, 99),
            "008", new FaixaNivel(100, 100)
    );

    private DominoLiquidLevelsParser() {
    }

    public static DominoLiquidLevelsResponse parse(
            byte[] resposta
    ) {
        validarResposta(resposta);

        String codigoTinta =
                new String(
                        resposta,
                        2,
                        3,
                        StandardCharsets.US_ASCII
                );

        String codigoMakeup =
                new String(
                        resposta,
                        5,
                        3,
                        StandardCharsets.US_ASCII
                );

        return new DominoLiquidLevelsResponse(
                converterNivel(
                        codigoTinta,
                        "tinta"
                ),
                converterNivel(
                        codigoMakeup,
                        "make-up"
                )
        );
    }

    private static void validarResposta(
            byte[] resposta
    ) {
        if (
                resposta == null ||
                        resposta.length == 0
        ) {
            throw new IllegalArgumentException(
                    "A resposta está vazia."
            );
        }

        int primeiroByte =
                resposta[0] & 0xFF;

        if (primeiroByte == DominoCommands.NAK) {
            String codigoNak =
                    resposta.length >= 4
                            ? new String(
                            resposta,
                            1,
                            3,
                            StandardCharsets.US_ASCII
                    )
                            : "desconhecido";

            throw new IllegalArgumentException(
                    "A impressora recusou a consulta. "
                            + "Código NAK: "
                            + codigoNak
            );
        }

        if (resposta.length != TAMANHO_RESPOSTA) {
            throw new IllegalArgumentException(
                    "Tamanho inválido. Esperado: "
                            + TAMANHO_RESPOSTA
                            + " bytes. Recebido: "
                            + resposta.length
                            + " bytes."
            );
        }

        if (resposta[0] != DominoCommands.ESC) {
            throw new IllegalArgumentException(
                    "A resposta não inicia com ESC."
            );
        }

        if (resposta[1] != 0x79) {
            throw new IllegalArgumentException(
                    "A resposta não pertence ao comando "
                            + "de níveis líquidos."
            );
        }

        if (
                resposta[resposta.length - 1]
                        != DominoCommands.EOT
        ) {
            throw new IllegalArgumentException(
                    "A resposta não termina com EOT."
            );
        }
    }

    private static NivelLiquidoResponse converterNivel(
            String codigo,
            String nomeLiquido
    ) {
        if ("021".equals(codigo)) {
            return new NivelLiquidoResponse(
                    codigo,
                    null,
                    null,
                    null,
                    "Sensor de " + nomeLiquido
                            + " desconectado",
                    false
            );
        }

        FaixaNivel faixa =
                FAIXAS.get(codigo);

        if (faixa == null) {
            throw new IllegalArgumentException(
                    "Código de nível de "
                            + nomeLiquido
                            + " desconhecido: "
                            + codigo
            );
        }

        double percentualEstimado =
                (
                        faixa.percentualMinimo()
                                + faixa.percentualMaximo()
                ) / 2.0;

        String descricao;

        if (
                faixa.percentualMinimo()
                        == faixa.percentualMaximo()
        ) {
            descricao =
                    faixa.percentualMinimo() + "%";
        } else {
            descricao =
                    faixa.percentualMinimo()
                            + "% a "
                            + faixa.percentualMaximo()
                            + "%";
        }

        return new NivelLiquidoResponse(
                codigo,
                faixa.percentualMinimo(),
                faixa.percentualMaximo(),
                percentualEstimado,
                descricao,
                true
        );
    }

    private record FaixaNivel(

            int percentualMinimo,

            int percentualMaximo

    ) {
    }
}