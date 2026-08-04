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
                    host,
                    porta,
                    DominoCommands.consultarConfiguracao()
            );

            System.out.println("HEX recebido: " + bytesParaHex(resposta));
            System.out.println("ASCII recebido: " + bytesParaAsciiLegivel(resposta));

            /*
            DominoStatusResponse status =
                    DominoStatusParser.parse(resposta);

            System.out.println("Código: " + status.codigoStatus());
            System.out.println("Jato: " + status.jato());
            System.out.println("Horário: " + status.horarioAlteracao());
             */

            DominoConfigurationResponse configuracao = DominoConfigurationParser.parse(resposta);

            System.out.println();
            System.out.println("Configuração interpretada: ");
            System.out.println(
                    "Quantidade de jatos: " + configuracao.quantidadeJatos()
            );
            System.out.println(
                    "Configurações dos jatos: " + configuracao.configuracoesJatos()
            );
            System.out.println(
                    "Máximo de layouts: " + configuracao.maximoLayouts()
            );
            System.out.println(
                    "Tamanho máximo do layout: " + configuracao.tamanhoMaximoLayout()
            );
            System.out.println(
                    "Formato de código de barras: " + configuracao.formatoCodigoBarras()
            );
            System.out.println(
                    "Baud rate serial: " + configuracao.baudRateSerial()
            );
            System.out.println(
                    "Controle de fluxo serial: " + configuracao.controleFluxoSerial()
            );
            System.out.println(
                    "Comandos de aplicação: " + configuracao.comandosAplicacao()
            );

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