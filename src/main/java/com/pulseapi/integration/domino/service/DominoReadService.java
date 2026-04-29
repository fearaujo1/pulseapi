package com.pulseapi.integration.domino.service;
// Pasta responsável pelas regras da integração

import com.pulseapi.integration.domino.client.CodenetClient;
import com.pulseapi.integration.domino.dto.*;
import com.pulseapi.integration.domino.parser.CodenetResponseParser;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

@Service
public class DominoReadService {
    private static final byte ESC = 0x1B;
    private static final byte EOT = 0x04;
    private static final byte QUERY = 0x3F;

    private final CodenetClient codenetClient;
    private final CodenetResponseParser responseParser;

    public DominoReadService(CodenetClient codenetClient, CodenetResponseParser responseParser) {
        this.codenetClient = codenetClient;
        this.responseParser = responseParser;
    }

    public DominoConnectionTestResponseDTO testarConexao(String ip, int porta, int timeout) {
        boolean connected = codenetClient.testConnection(ip, porta, timeout);
        return new DominoConnectionTestResponseDTO(connected, ip, porta, timeout);
    }

    public DominoIdentityResponseDTO buscarIdentidade(String ip, int porta, int timeout) {
        byte[] command = new byte[]{ESC, 0x41, QUERY, EOT}; // ESC A ? EOT

        byte[] response = codenetClient.send(ip, porta, timeout, command);

        String rawHex = responseParser.toHex(response);
        String rawAscii = responseParser.toAscii(response);
        String cleanAscii = responseParser.cleanAscii(response);

        // Esperado: A + AA + BBBBB + CC + DD
        // Exemplo: A00560670600
        if (cleanAscii.length() < 12 || cleanAscii.charAt(0) != 'A') {
            return new DominoIdentityResponseDTO(
                    "DESCONHECIDO",
                    "",
                    "",
                    "",
                    rawHex,
                    rawAscii
            );
        }

        String printerType = cleanAscii.substring(1, 3);
        String firmwarePart = cleanAscii.substring(3, 8);
        String firmwareIssue = cleanAscii.substring(8, 10);
        String codenetIdentity = cleanAscii.substring(10, 12);

        return new DominoIdentityResponseDTO(
                printerType,
                firmwarePart,
                firmwareIssue,
                codenetIdentity,
                rawHex,
                rawAscii
        );
    }

    public DominoStatusResponseDTO buscarStatus(String ip, int porta, int timeout) {
        byte[] command = new byte[]{ESC, 0x31, QUERY, EOT}; // ESC 1 ? EOT

        byte[] response = codenetClient.send(ip, porta, timeout, command);

        String rawHex = responseParser.toHex(response);
        String rawAscii = responseParser.toAscii(response);
        String cleanAscii = responseParser.cleanAscii(response);

        // Exemplo esperado: 1H20010000
        if (cleanAscii.length() < 3 || cleanAscii.charAt(0) != '1') {
            return new DominoStatusResponseDTO(
                    "DESCONHECIDO",
                    "",
                    "",
                    rawHex,
                    rawAscii
            );
        }

        String commandResponse = cleanAscii.substring(0, 1);
        String statusGroup = cleanAscii.substring(1, 2);
        String statusData = cleanAscii.substring(2);

        return new DominoStatusResponseDTO(
                commandResponse,
                statusGroup,
                statusData,
                rawHex,
                rawAscii
        );
    }

    public DominoCurrentStatusResponseDTO buscarStatusAtual(String ip, int porta, int timeout) {
        byte[] command = new byte[]{ESC, 0x4F, 0x31, QUERY, EOT}; // ESC O1 ? EOT

        byte[] response = codenetClient.send(ip, porta, timeout, command);

        String rawHex = responseParser.toHex(response);
        String rawAscii = responseParser.toAscii(response);
        String cleanAscii = responseParser.cleanAscii(response);

        // Exemplo esperado: O100904
        if (cleanAscii.length() < 3 || !cleanAscii.startsWith("O1")) {
            return new DominoCurrentStatusResponseDTO(
                    "DESCONHECIDO",
                    "",
                    rawHex,
                    rawAscii
            );
        }

        String commandResponse = cleanAscii.substring(0, 2);
        String statusData = cleanAscii.substring(2);

        return new DominoCurrentStatusResponseDTO(
                commandResponse,
                statusData,
                rawHex,
                rawAscii
        );
    }

    public DominoAlertResponseDTO buscarAlertas(String ip, int porta, int timeout) {
        byte[] command = new byte[]{ESC, 0x4F, 0x32, QUERY, EOT}; // ESC O2 ? EOT

        byte[] response = codenetClient.send(ip, porta, timeout, command);

        String rawHex = responseParser.toHex(response);
        String rawAscii = responseParser.toAscii(response);
        String cleanAscii = responseParser.cleanAscii(response);

        if (cleanAscii.length() < 3 || !cleanAscii.startsWith("O2")) {
            return new DominoAlertResponseDTO(
                    "DESCONHECIDO",
                    "",
                    false,
                    rawHex,
                    rawAscii
            );
        }

        String commandResponse = cleanAscii.substring(0, 2);
        String alertData = cleanAscii.substring(2);

        boolean hasAlert = !alertData.matches("0+");

        return new DominoAlertResponseDTO(
                commandResponse,
                alertData,
                hasAlert,
                rawHex,
                rawAscii
        );
    }

    private DominoRawResponseDTO enviarEConverter(String ip, int porta, int timeout, byte[] command) {
        byte[] response = codenetClient.send(ip, porta, timeout, command);

        if (response == null || response.length == 0) {
            return new DominoRawResponseDTO(false, false, "SEM RESPOSTA", "");
        }

        return new DominoRawResponseDTO(
                responseParser.isAck(response),
                responseParser.isNak(response),
                responseParser.toHex(response),
                responseParser.toAscii(response)
        );
    }

    public DominoRawResponseDTO imprimirTexto(String ip, int porta, int timeout, String texto) {

        byte[] payload = texto.getBytes(StandardCharsets.US_ASCII);

        ByteArrayOutputStream command = new ByteArrayOutputStream();

        command.write(ESC);
        command.write(0x4F); // O
        command.write(0x45); // E (send data)

        for (byte b : payload) {
            command.write(b);
        }

        command.write(EOT);

        byte[] response = codenetClient.send(ip, porta, timeout, command.toByteArray());

        return new DominoRawResponseDTO(
                responseParser.isAck(response),
                responseParser.isNak(response),
                responseParser.toHex(response),
                responseParser.toAscii(response)
        );
    }
}
