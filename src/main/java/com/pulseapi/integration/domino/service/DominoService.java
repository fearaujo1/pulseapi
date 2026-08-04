package com.pulseapi.integration.domino.service;

import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.DominoTcpClient;
import com.pulseapi.integration.domino.dto.DominoConfigurationResponse;
import com.pulseapi.integration.domino.dto.DominoIdentityResponse;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.exception.DominoCommunicationException;
import com.pulseapi.integration.domino.parser.DominoConfigurationParser;
import com.pulseapi.integration.domino.parser.DominoIdentityParser;
import com.pulseapi.integration.domino.parser.DominoStatusParser;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class DominoService {

    private final DominoTcpClient dominoTcpClient;

    public DominoService(DominoTcpClient dominoTcpClient) {
        this.dominoTcpClient = dominoTcpClient;
    }

    public DominoStatusResponse consultarStatus(String host, int porta) {
        try {
            byte[] resposta = dominoTcpClient.enviar(
                    host,
                    porta,
                    DominoCommands.consultarStatusAtual()
            );

            return DominoStatusParser.parse(resposta);

        } catch (IOException e) {
            throw new DominoCommunicationException(
                    "Não foi possível consultar o status da impressora Domino.",
                    e
            );
        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma respota de status inválida: " + e.getMessage(),
                    e
            );
        }
    }

    public DominoConfigurationResponse consultarConfiguracao(
            String host,
            int porta
    ) {
        try {
            byte[] resposta = dominoTcpClient.enviar(
                    host,
                    porta,
                    DominoCommands.consultarConfiguracao()
            );

            return DominoConfigurationParser.parse(resposta);

        } catch (IOException e) {
            throw new DominoCommunicationException(
                    "Não foi possível consultar a configuração da impressora Domino.",
                    e
            );
        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma configuração inválida: "
                            + e.getMessage(),
                    e
            );
        }
    }

    public DominoIdentityResponse consultarIdentidade(String host, int porta) {
        try {
            byte[] resposta = dominoTcpClient.enviar(
                    host,
                    porta,
                    DominoCommands.consultarIdentidade()
            );

            return DominoIdentityParser.parse(resposta);

        } catch (IOException e) {
            throw new DominoCommunicationException(
                    "Não foi possível consultar a identidade da impressora Domino.",
                    e
            );
        } catch (IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "A impressora retornou uma identidade inválida: "
                            + e.getMessage(),
                    e
            );
        }
    }
}
