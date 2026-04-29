package com.pulseapi.integration.domino.dto;

public class DominoIdentityResponseDTO {

    private String printerType;
    private String firmwarePart;
    private String firmwareIssue;
    private String codenetIdentity;
    private String rawHex;
    private String rawAscii;

    public DominoIdentityResponseDTO() {
    }

    public DominoIdentityResponseDTO(
            String printerType,
            String firmwarePart,
            String firmwareIssue,
            String codenetIdentity,
            String rawHex,
            String rawAscii
    ) {
        this.printerType = printerType;
        this.firmwarePart = firmwarePart;
        this.firmwareIssue = firmwareIssue;
        this.codenetIdentity = codenetIdentity;
        this.rawHex = rawHex;
        this.rawAscii = rawAscii;
    }

    public String getPrinterType() {
        return printerType;
    }

    public String getFirmwarePart() {
        return firmwarePart;
    }

    public String getFirmwareIssue() {
        return firmwareIssue;
    }

    public String getCodenetIdentity() {
        return codenetIdentity;
    }

    public String getRawHex() {
        return rawHex;
    }

    public String getRawAscii() {
        return rawAscii;
    }
}