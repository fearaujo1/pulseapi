package com.pulseapi.integration.domino.parser;

import com.pulseapi.integration.domino.dto.DominoLiquidLevelsResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DominoLiquidLevelsParserTest {

    @Test
    void deveInterpretarNiveisDeTintaEMakeup() {
        byte[] resposta = {
                0x1B,
                0x79,
                '0', '0', '6',
                '0', '0', '3',
                0x04
        };

        DominoLiquidLevelsResponse resultado =
                DominoLiquidLevelsParser.parse(
                        resposta
                );

        assertEquals(
                "006",
                resultado.tinta().codigo()
        );

        assertEquals(
                75,
                resultado.tinta()
                        .percentualMinimo()
        );

        assertEquals(
                87,
                resultado.tinta()
                        .percentualMaximo()
        );

        assertEquals(
                81.0,
                resultado.tinta()
                        .percentualEstimado()
        );

        assertTrue(
                resultado.tinta()
                        .sensorConectado()
        );

        assertEquals(
                "003",
                resultado.makeup().codigo()
        );

        assertEquals(
                38,
                resultado.makeup()
                        .percentualMinimo()
        );

        assertEquals(
                49,
                resultado.makeup()
                        .percentualMaximo()
        );

        assertEquals(
                43.5,
                resultado.makeup()
                        .percentualEstimado()
        );
    }

    @Test
    void deveIdentificarSensorDesconectado() {
        byte[] resposta = {
                0x1B,
                0x79,
                '0', '2', '1',
                '0', '0', '8',
                0x04
        };

        DominoLiquidLevelsResponse resultado =
                DominoLiquidLevelsParser.parse(
                        resposta
                );

        assertFalse(
                resultado.tinta()
                        .sensorConectado()
        );

        assertNull(
                resultado.tinta()
                        .percentualMinimo()
        );

        assertNull(
                resultado.tinta()
                        .percentualMaximo()
        );

        assertNull(
                resultado.tinta()
                        .percentualEstimado()
        );

        assertEquals(
                "Sensor de tinta desconectado",
                resultado.tinta()
                        .descricao()
        );

        assertEquals(
                100.0,
                resultado.makeup()
                        .percentualEstimado()
        );
    }

    @Test
    void deveRecusarRespostaComComandoIncorreto() {
        byte[] resposta = {
                0x1B,
                0x31,
                '0', '0', '6',
                '0', '0', '3',
                0x04
        };

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                DominoLiquidLevelsParser
                                        .parse(resposta)
                );

        assertTrue(
                exception.getMessage()
                        .contains(
                                "não pertence ao comando"
                        )
        );
    }

    @Test
    void deveRecusarCodigoDeNivelDesconhecido() {
        byte[] resposta = {
                0x1B,
                0x79,
                '9', '9', '9',
                '0', '0', '3',
                0x04
        };

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () ->
                                DominoLiquidLevelsParser
                                        .parse(resposta)
                );

        assertTrue(
                exception.getMessage()
                        .contains(
                                "Código de nível de tinta desconhecido"
                        )
        );
    }
}