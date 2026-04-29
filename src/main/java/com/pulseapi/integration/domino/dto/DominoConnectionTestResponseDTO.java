package com.pulseapi.integration.domino.dto;


import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class DominoConnectionTestResponseDTO {

    private boolean connected;
    private String ip;
    private int port;
    private int timeout;

    public DominoConnectionTestResponseDTO() {}

    public DominoConnectionTestResponseDTO(boolean connected, String ip, int port, int timeout) {
        this.connected = connected;
        this.ip = ip;
        this.port = port;
        this.timeout = timeout;
    }

}
