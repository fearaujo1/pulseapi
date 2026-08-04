package com.pulseapi.integration.domino;

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
}
