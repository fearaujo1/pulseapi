package com.pulseapi.integration.domino.service;

import com.pulseapi.integration.domino.DominoCommands;
import com.pulseapi.integration.domino.DominoTcpClient;
import com.pulseapi.integration.domino.dto.DominoConfigurationResponse;
import com.pulseapi.integration.domino.dto.DominoFifoCountResponse;
import com.pulseapi.integration.domino.dto.DominoIdentityResponse;
import com.pulseapi.integration.domino.dto.DominoStatusResponse;
import com.pulseapi.integration.domino.exception.DominoCommunicationException;
import com.pulseapi.integration.domino.parser.DominoConfigurationParser;
import com.pulseapi.integration.domino.parser.DominoFifoCountParser;
import com.pulseapi.integration.domino.parser.DominoIdentityParser;
import com.pulseapi.integration.domino.parser.DominoStatusParser;
import org.springframework.stereotype.Service;
import com.pulseapi.integration.domino.dto.DominoFifoSendResponse;
import java.nio.charset.StandardCharsets;
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
                    "CONSULTAR_STATUS_ATUAL",
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
                    "CONSULTAR_CONFIGURACAO",
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
                    "CONSULTAR_IDENTIDADE",
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

    public DominoFifoCountResponse consultarQuantidadeFifo(String host, int porta) {
        try {
            byte[] resposta = dominoTcpClient.enviar(
                    host,
                    porta,
                    "CONSULTAR_QUANTIDADE_FIFO",
                    DominoCommands.consultarQuantidadeItensFifoTcp()
            );

            return DominoFifoCountParser.parse(resposta);
        } catch (IOException | IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "Não foi possível consutlar a fila FIFO da impressora Domino.",
                    e
            );
        }
    }

    public DominoFifoSendResponse enviarDadosFifo(
            String host,
            int porta,
            String dados
    ) {
        try {
            byte[] respostaLimpeza = dominoTcpClient.enviar(
                    host,
                    porta,
                    "LIMPAR_FIFO_TCP",
                    DominoCommands.limparFifoTcp()
            );

            validarAck(respostaLimpeza, "limpeza do FIFO");

            byte[] respostaEnvio = dominoTcpClient.enviar(
                    host,
                    porta,
                    "ENVIAR_DADOS_FIFO",
                    DominoCommands.enviarDadosFifo(dados)
            );

            validarAck(respostaEnvio, "envio ao FIFO");


            int tamanho = dados.getBytes(
                    StandardCharsets.US_ASCII
            ).length;

            return new DominoFifoSendResponse(
                    true,
                    dados,
                    tamanho,
                    "Dados enviados ao FIFO com sucesso."
            );
        } catch (IOException | IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "Não foi possível enviar dados ao FIFO da impressora Domino: "
                    + e.getMessage()
            );
        }
    }

    private void validarAck(byte[] resposta, String operacao) {
        if (resposta == null || resposta.length == 0) {
            throw new IllegalArgumentException(
                    "A impressora não respondeu durante a " + operacao + "."
            );
        }

        int primeiroByte = resposta[0] & 0xFF;

        if (primeiroByte == 0x06) {
            return;
        }

        if (primeiroByte == 0x15) {
            String codigo = resposta.length >= 4
                   ? new String(
                            resposta,
                            1,
                            3,
                            StandardCharsets.US_ASCII
                   )
                   : "desconhecido";

            throw new IllegalArgumentException(
                    "A impressora recusou a operação. Código NAK: " + codigo
            );
        }

        throw new IllegalArgumentException(
                "Resposta inesperada da impressora durante a " + operacao + "."
        );
    }

    public DominoFifoSendResponse adicionarDadosFifo(
            String host,
            int porta,
            String dados
    ) {
        try {
            byte[] resposta = dominoTcpClient.enviar(
                    host,
                    porta,
                    "ADICIONAR_DADOS_FIFO",
                    DominoCommands.enviarDadosFifo(dados)
            );

            validarAck(resposta, "envio ao FIFO");

            int tamanho = dados.getBytes(
                    StandardCharsets.US_ASCII
            ).length;

            return new DominoFifoSendResponse(
                    true,
                    dados,
                    tamanho,
                    "Dados adicionados ao FIFO com sucesso."
            );

        } catch (IOException | IllegalArgumentException e) {
            throw new DominoCommunicationException(
                    "Não foi possível adicionar dados ao FIFO: "
                            + e.getMessage(),
                    e
            );
        }
    }
}
