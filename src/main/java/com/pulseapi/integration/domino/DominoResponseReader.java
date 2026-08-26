package com.pulseapi.integration.domino;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

// Essa classe fica responsável apenas por ler resposta terminada em EOT, ACK ou NAK
public class DominoResponseReader {

    private DominoResponseReader() {}

    public static byte[] ler(InputStream input) throws IOException {
        ByteArrayOutputStream resposta =  new ByteArrayOutputStream();

        while (true) {
            int valor = input.read();

            if (valor == -1) {
                break;
            }

            resposta.write(valor);

            if (valor == DominoCommands.EOT) {
                break;
            }

            if (valor == DominoCommands.ACK) {
                break;
            }

            if (valor == DominoCommands.NAK) {
                while (resposta.size() < 4) {
                    int proximo = input.read();

                    if (proximo == -1) {
                        break;
                    }

                    resposta.write(proximo);
                }

                break;
            }
        }

        return resposta.toByteArray();
    }
}
