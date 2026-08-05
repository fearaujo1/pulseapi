package com.pulseapi.integration.domino;

import java.nio.charset.StandardCharsets;

public class DominoCommands {

    public static final byte ESC = 0x1B;
    public static final byte EOT = 0x04;
    public static final byte QUERY = 0x3F;

    private DominoCommands() {}

    public static byte[] consultarIdentidade() {
        return new byte[] {
                ESC,
                0x41, // A
                QUERY,
                EOT
        };
    }

    public static byte[] consultarStatusAtual () {
        return new byte[] {
                ESC,
                0x31, // 1
                0x43, // C
                QUERY,
                EOT
        };
    }

    public static byte[] consultarConfiguracao() {
        return new byte[] {
                ESC,
                0x42,
                QUERY,
                EOT
        };
    }

    public static byte[] consultarQuantidadeItensFifoTcp() {
        return new byte[] {
                ESC,
                0x7E, // ~
                0x50, // P
                0x30, // 0 = Ethernet/TCP
                QUERY,
                EOT
        };
    }

    public static byte[] limparFifoTcp() {
        return new byte[] {
                ESC,
                0x4F, // O
                0x45, // E
                0x30, // 0
                0x30, // 0
                0x30, // 0
                0x30, // 0 = comando de limpeza
                0x30, // 0 = fila TCP
                EOT
        };
    }

    public static byte[] enviarDadosFifo(String dados) {
        if (dados == null || dados.isBlank()) {
            throw new IllegalArgumentException(
                    "Os dados do FIFO não podem estar vazios."
            );
        }

        byte[] dadosBytes = dados.getBytes(StandardCharsets.US_ASCII);

        if (dadosBytes.length > 1024) {
            throw new IllegalArgumentException(
                    "Os dados do FIFO não podem ultrapassar 1024 bytes."
            );
        }

        String tamanho = String.format("%04d", dadosBytes.length);
        byte[] tamanhoBytes = tamanho.getBytes(StandardCharsets.US_ASCII);

        byte[] comando = new byte[
            1 + 2 + 4 + dadosBytes.length + 1
        ];

        int indice = 0;

        comando[indice++] = ESC;
        comando[indice++] = 0x4F; // O
        comando[indice++] = 0x45; // E

        for (byte valor : tamanhoBytes) {
            comando[indice++] = valor;
        }

        for  (byte valor : dadosBytes) {
            comando[indice++] = valor;
        }

        comando[indice] = EOT;

        return comando;
    }

    public static byte[] consultarAtualizacaoMonitorLayout() {
        return new byte[]{
                ESC,
                0x7E, // ~
                0x45, // E
                QUERY,
                EOT
        };
    }

    public static byte[] ativarAtualizacaoMonitorLayout() {
        return new byte[]{
                ESC,
                0x7E, // ~
                0x45, // E
                0x31, // 1 = ativar
                EOT
        };
    }
}
