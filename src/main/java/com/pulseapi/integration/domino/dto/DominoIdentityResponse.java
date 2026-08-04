package com.pulseapi.integration.domino.dto;

public record DominoIdentityResponse(
        String tipoCodigo,
        String tipoDescricao,
        String softwarePartNumber,
        String softwareIssue,
        String codenetId
) {
}