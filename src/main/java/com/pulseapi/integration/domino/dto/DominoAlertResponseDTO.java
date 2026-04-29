package com.pulseapi.integration.domino.dto;

public class DominoAlertResponseDTO {

    private String command;
    private String alertData;
    private boolean hasAlert;
    private String rawHex;
    private String rawAscii;

    public DominoAlertResponseDTO(String command, String alertData, boolean hasAlert, String rawHex, String rawAscii) {
        this.command = command;
        this.alertData = alertData;
        this.hasAlert = hasAlert;
        this.rawHex = rawHex;
        this.rawAscii = rawAscii;
    }

    public String getCommand() {
        return command;
    }

    public String getAlertData() {
        return alertData;
    }

    public boolean isHasAlert() {
        return hasAlert;
    }

    public String getRawHex() {
        return rawHex;
    }

    public String getRawAscii() {
        return rawAscii;
    }
}