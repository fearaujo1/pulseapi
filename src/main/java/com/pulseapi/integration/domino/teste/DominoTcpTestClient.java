package com.pulseapi.integration.domino.teste;

import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.DominoTcpClient;
import com.pulseapi.integration.domino.dto.DominoConfigurationResponse;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.parser.DominoStatusParser;
import com.pulseapi.integration.domino.parser.DominoConfigurationParser;

public class DominoTcpTestClient {

    public static void main(String[] args) {
        String host = "127.0.0.1";
        int porta = 7000;

        DominoTcpClient client = new DominoTcpClient();

        try {
            byte[] resposta = client.enviar(
                    "127.0.0.1",
                    7000,
                    "CONSULTAR_ATUALIZACAO_MONITOR",
                    DominoCommands.consultarAtualizacaoMonitorLayout()
            );

            System.out.println("HEX: " + bytesParaHex(resposta));
            System.out.println("ASCII: " + bytesParaAsciiLegivel(resposta));
        } catch (Exception e) {
            System.err.println("Erro na comunicação: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static String bytesParaHex(byte[] bytes) {
        StringBuilder resultado = new StringBuilder();

        for (byte valor : bytes) {
            resultado.append(String.format("%02X ", valor & 0xFF));
        }

        return resultado.toString().trim();
    }

    private static String bytesParaAsciiLegivel(byte[] bytes) {
        StringBuilder resultado = new StringBuilder();

        for (byte valor : bytes) {
            int unsigned = valor & 0xFF;

            switch (unsigned) {
                case 0x1B -> resultado.append("<ESC>");
                case 0x04 -> resultado.append("<EOT>");
                case 0x06 -> resultado.append("<ACK>");
                case 0x15 -> resultado.append("<NAK>");
                default -> {
                    if (unsigned >= 32 && unsigned <= 126) {
                        resultado.append((char) unsigned);
                    } else {
                        resultado.append(
                                String.format("<0x%02X>", unsigned)
                        );
                    }
                }
            }
        }

        return resultado.toString();
    }
}