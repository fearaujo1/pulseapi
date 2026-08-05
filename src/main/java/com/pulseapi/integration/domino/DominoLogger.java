package com.pulseapi.integration.domino;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class DominoLogger {

    private static final Logger log =
            LoggerFactory.getLogger(DominoLogger.class);

    private DominoLogger() {
    }

    public static void logEnvio(
            String nomeComando,
            String ip,
            int porta,
            byte[] bytes
    ) {
        log.info("========================================");
        log.info("DOMINO COMMAND : {}", nomeComando);
        log.info("DESTINO        : {}:{}", ip, porta);
        log.info("ENVIO HEX      : {}", bytesParaHex(bytes));
        log.info("ENVIO ASCII    : {}", bytesParaAscii(bytes));
    }

    public static void logResposta(
            String nomeComando,
            byte[] bytes
    ) {
        log.info("RESPOSTA COMANDO: {}", nomeComando);
        log.info("RESPOSTA HEX    : {}", bytesParaHex(bytes));
        log.info("RESPOSTA ASCII  : {}", bytesParaAscii(bytes));
        log.info("========================================");
    }

    private static String bytesParaHex(byte[] bytes) {

        StringBuilder sb = new StringBuilder();

        for (byte b : bytes) {
            sb.append(String.format("%02X ", b & 0xFF));
        }

        return sb.toString().trim();
    }

    private static String bytesParaAscii(byte[] bytes) {

        StringBuilder sb = new StringBuilder();

        for (byte b : bytes) {

            int valor = b & 0xFF;

            switch (valor) {

                case 0x1B -> sb.append("<ESC>");
                case 0x04 -> sb.append("<EOT>");
                case 0x06 -> sb.append("<ACK>");
                case 0x15 -> sb.append("<NAK>");

                default -> {

                    if (valor >= 32 && valor <= 126) {
                        sb.append((char) valor);
                    } else {
                        sb.append(String.format("<0x%02X>", valor));
                    }

                }

            }

        }

        return sb.toString();
    }

}