package com.pulseapi.integration.domino.parser;
//Pasta responsável por interpretar resposta.

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;

@Component
public class CodenetResponseParser {

    public boolean isAck(byte[] response) {
        return response != null && response.length > 0 && response[0] == 0x06;
    }

    public boolean isNak(byte[] response) {
        return response != null && response.length > 0 && response[0] == 0x15;
    }

    public String toHex(byte[] response) {
        if (response == null || response.length == 0) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        for (byte b : response) {
            sb.append(String.format("%02X ", b));
        }
        return sb.toString().trim();
    }

    public String toAscii(byte[] response) {
        if (response == null || response.length == 0) {
            return "";
        }
        return new String(response, StandardCharsets.US_ASCII);
    }

    public String cleanAscii(byte[] response) {
        if (response == null || response.length == 0) {
            return "";
        }

        StringBuilder sb = new StringBuilder();

        for (byte b : response) {
            if (b >= 32 && b <= 126) {
                sb.append((char) b);
            }
        }

        return sb.toString();
    }
}
