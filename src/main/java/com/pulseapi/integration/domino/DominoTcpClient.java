package com.pulseapi.integration.domino;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;

// Essa classe só sabe conectar, enviar e receber bytes e fechar conexão
public class DominoTcpClient {

    private static final int CONNECTION_TIMEOUT_MS = 3000;
    private static final int READ_TIMEOUT_MS = 3000;

    public byte[] enviar(String host, int porta, byte[] comando) throws IOException {
        try (Socket socket = new Socket()) {
            socket.connect(
                    new InetSocketAddress(host, porta),
                    CONNECTION_TIMEOUT_MS
            );

            socket.setSoTimeout(READ_TIMEOUT_MS);

            OutputStream output = socket.getOutputStream();
            InputStream input = socket.getInputStream();

            output.write(comando);
            output.flush();

            return DominoResponseReader.ler(input);
        }
    }
}
