package com.pulseapi.integration.domino.client;
//Pastas responsável por abrir socket TCP e enviar comando.

import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.util.Arrays;

@Component
public class CodenetClient {

    public byte[] send(String host, int port, int timeoutMs, byte[] command) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            socket.setSoTimeout(timeoutMs);

            OutputStream out = socket.getOutputStream();
            InputStream in = socket.getInputStream();

            //envia comando
            out.write(command);
            out.flush();

            //pequena pausa
            Thread.sleep(100);

            byte[] buffer = new byte[512];
            int bytesRead;

            try {
                bytesRead = in.read(buffer);
            } catch (Exception e) {
                // não recebeu resposta (normal em alguns casos)
                return new byte[]{};
            }

            if (bytesRead == -1) {
                return new byte[]{};
            }

            return Arrays.copyOf(buffer, bytesRead);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao comunicar com a impressora Domino: " + e.getMessage(), e);
        }
    }

    public boolean testConnection(String host, int port, int timeoutMs) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
