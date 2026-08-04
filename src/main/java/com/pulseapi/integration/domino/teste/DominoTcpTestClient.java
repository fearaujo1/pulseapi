package com.pulseapi.integration.domino.teste;

import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.DominoTcpClient;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.parser.DominoStatusParser;

public class DominoTcpTestClient {

    public static void main(String[] args) {
        String host = "127.0.0.1";
        int porta = 7000;

        DominoTcpClient client = new DominoTcpClient();

        try {
            byte[] resposta = client.enviar(
                    host,
                    porta,
                    DominoCommands.consultarStatusAtual()
            );

            DominoStatusResponse status =
                    DominoStatusParser.parse(resposta);

            System.out.println("Código: " + status.codigoStatus());
            System.out.println("Jato: " + status.jato());
            System.out.println("Horário: " + status.horarioAlteracao());

        } catch (Exception e) {
            System.err.println("Erro na comunicação: " + e.getMessage());
            e.printStackTrace();
        }
    }
}