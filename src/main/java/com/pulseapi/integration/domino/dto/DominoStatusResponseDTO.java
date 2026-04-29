package com.pulseapi.integration.domino.dto;

public class DominoStatusResponseDTO {

    private String command;
    private String statusGroup;
    private String statusData;
    private String rawHex;
    private String rawAscii;

    public DominoStatusResponseDTO(String command, String statusGroup, String statusData, String rawHex, String rawAscii) {
        this.command = command;
        this.statusGroup = statusGroup;
        this.statusData = statusData;
        this.rawHex = rawHex;
        this.rawAscii = rawAscii;
    }

    public String getCommand() {
        return command;
    }

    public String getStatusGroup() {
        return statusGroup;
    }

    public String getStatusData() {
        return statusData;
    }

    public String getRawHex() {
        return rawHex;
    }

    public String getRawAscii() {
        return rawAscii;
    }
}